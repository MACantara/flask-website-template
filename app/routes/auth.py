from flask import Blueprint, render_template, request, redirect, url_for, flash, session, current_app
from app import db
from app.models.user import User
from app.models.email_verification import EmailVerification
from app.routes.login_attempts import check_ip_lockout, record_login_attempt, get_remaining_attempts, is_lockout_triggered
from app.routes.email_verification import create_and_send_verification
from app.utils.hcaptcha_utils import verify_hcaptcha
from app.utils.password_validator import PasswordValidator
from argon2.exceptions import HashingError
import re

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

def is_valid_email(email):
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_valid_username(username):
    """Validate username format."""
    # Username must be 3-30 characters, alphanumeric and underscores only
    pattern = r'^[a-zA-Z0-9_]{3,30}$'
    return re.match(pattern, username) is not None

def is_valid_password(password, user_inputs=None):
    """Validate password strength using zxcvbn."""
    return PasswordValidator.validate_password(password, user_inputs or [])

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    # Check if IP is locked out
    locked_out, minutes_remaining = check_ip_lockout()
    if locked_out:
        return render_template('auth/login.html', locked_out=True, minutes_remaining=minutes_remaining)
    
    if request.method == 'POST':
        username_or_email = request.form.get('username_or_email', '').strip()
        password = request.form.get('password')
        remember_me = request.form.get('remember_me') == 'on'
        
        if not username_or_email or not password:
            flash('Please provide both username/email and password.', 'error')
            return render_template('auth/login.html')
        
        # Verify hCaptcha
        if not verify_hcaptcha():
            flash('Please complete the captcha verification.', 'error')
            return render_template('auth/login.html')
        
        # Check if database is disabled (Vercel environment)
        if current_app.config.get('DISABLE_DATABASE', False):
            flash('Authentication is not available in this deployment environment.', 'warning')
            return render_template('auth/login.html')
        
        # Double-check IP lockout before processing
        locked_out, minutes_remaining = check_ip_lockout()
        if locked_out:
            return render_template('auth/login.html', locked_out=True, minutes_remaining=minutes_remaining)
        
        # Find user by username or email
        user = User.query.filter(
            (User.username == username_or_email) | 
            (User.email == username_or_email)
        ).first()
        
        if user and user.is_active and user.check_password(password):
            # Check if email is verified
            if not EmailVerification.is_email_verified(user.id, user.email):
                record_login_attempt(username_or_email, success=False)
                return render_template('auth/login.html', show_resend_verification=True, user_email=user.email, user_id=user.id)
            
            # Successful login - record success
            record_login_attempt(username_or_email, success=True)
            
            session['user_id'] = user.id
            session['username'] = user.username
            session.permanent = remember_me
            user.update_last_login()
            
            flash(f'Welcome back, {user.username}!', 'success')
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('main.home'))
        else:
            # Failed login - record failure
            record_login_attempt(username_or_email, success=False)
            
            # Check if this failure causes a lockout
            if is_lockout_triggered():
                lockout_minutes = current_app.config.get('LOGIN_LOCKOUT_MINUTES', 15)
                return render_template('auth/login.html', locked_out=True, minutes_remaining=lockout_minutes)
            else:
                attempts_remaining = get_remaining_attempts()
                flash(f'Invalid username/email or password. {attempts_remaining} attempts remaining.', 'error')
    
    return render_template('auth/login.html')

@auth_bp.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        # Check if database is disabled (Vercel environment)
        if current_app.config.get('DISABLE_DATABASE', False):
            flash('User registration is not available in this deployment environment.', 'warning')
            return render_template('auth/signup.html')
        
        # Verify hCaptcha
        if not verify_hcaptcha():
            flash('Please complete the captcha verification.', 'error')
            return render_template('auth/signup.html')
        
        # Validation
        errors = []
        
        if not username:
            errors.append('Username is required.')
        elif not is_valid_username(username):
            errors.append('Username must be 3-30 characters long and contain only letters, numbers, and underscores.')
        elif User.query.filter_by(username=username).first():
            errors.append('Username already exists.')
        
        if not email:
            errors.append('Email is required.')
        elif not is_valid_email(email):
            errors.append('Please provide a valid email address.')
        elif User.query.filter_by(email=email).first():
            errors.append('Email already registered.')
        
        if not password:
            errors.append('Password is required.')
        else:
            # Use zxcvbn validation with user inputs
            user_inputs = [username, email.split('@')[0]] if email else [username]
            is_valid, password_errors, _ = PasswordValidator.validate_password(password, user_inputs)
            if not is_valid:
                errors.extend(password_errors)
        
        if password != confirm_password:
            errors.append('Passwords do not match.')
        
        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('auth/signup.html')
        
        try:
            # Create new user
            user = User(username=username, email=email)
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
            
            # Create verification and send email
            verification, email_sent = create_and_send_verification(user)
            
            if email_sent:
                flash('Account created successfully! Please check your email and click the verification link before logging in.', 'success')
            else:
                flash('Account created successfully! However, we could not send the verification email. Please contact support.', 'warning')
            
            return redirect(url_for('auth.login'))
            
        except HashingError:
            flash('Error creating account. Please try again.', 'error')
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Signup error: {e}")
            flash('Error creating account. Please try again.', 'error')
    
    return render_template('auth/signup.html')

@auth_bp.route('/verify-email/<token>')
def verify_email(token):
    """Handle email verification."""
    verification = EmailVerification.get_by_token(token)
    
    if not verification:
        flash('Invalid verification token.', 'error')
        return redirect(url_for('auth.login'))
    
    if verification.is_expired():
        flash('Verification token has expired. Please request a new one.', 'error')
        return redirect(url_for('auth.login'))
    
    if verification.is_verified:
        flash('Email address has already been verified. You can now log in.', 'info')
        return redirect(url_for('auth.login'))
    
    # Verify the email
    verification.verify()
    flash('Email address verified successfully! You can now log in.', 'success')
    return redirect(url_for('auth.login'))

@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    """Resend verification email."""
    user_id = request.form.get('user_id')
    user_email = request.form.get('user_email')
    
    if not user_id or not user_email:
        flash('Invalid request.', 'error')
        return redirect(url_for('auth.login'))
    
    user = User.query.get(user_id)
    if not user or user.email != user_email:
        flash('Invalid request.', 'error')
        return redirect(url_for('auth.login'))
    
    # Check if already verified
    if EmailVerification.is_email_verified(user.id, user.email):
        flash('Email address is already verified.', 'info')
        return redirect(url_for('auth.login'))
    
    # Create new verification
    verification = EmailVerification.create_verification(user.id, user.email)
    
    # Send verification email
    email_sent = send_verification_email(user, verification)
    
    if email_sent:
        flash('Verification email sent! Please check your email and click the verification link.', 'success')
    else:
        flash('Could not send verification email. Please try again later.', 'error')
    
    return redirect(url_for('auth.login'))

@auth_bp.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out successfully.', 'success')
    return redirect(url_for('main.home'))
