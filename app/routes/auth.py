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
            
            # Redirect to verification pending page instead of login
            if email_sent:
                return redirect(url_for('auth.verification_pending', 
                                      user_id=user.id, 
                                      user_email=user.email,
                                      email_sent='true'))
            else:
                return redirect(url_for('auth.verification_pending', 
                                      user_id=user.id, 
                                      user_email=user.email,
                                      email_sent='false'))
            
        except HashingError:
            flash('Error creating account. Please try again.', 'error')
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Signup error: {e}")
            flash('Error creating account. Please try again.', 'error')
    
    return render_template('auth/signup.html')

@auth_bp.route('/verification-pending')
def verification_pending():
    """Show verification pending page after signup."""
    user_id = request.args.get('user_id')
    user_email = request.args.get('user_email')
    email_sent = request.args.get('email_sent', 'true') == 'true'
    
    # Show appropriate flash message
    if email_sent:
        flash('Account created successfully! Please check your email and click the verification link before logging in.', 'success')
    else:
        flash('Account created successfully! However, we could not send the verification email. Please contact support.', 'warning')
    
    return render_template('auth/verification-pending.html', 
                         user_id=user_id, 
                         user_email=user_email,
                         email_sent=email_sent)

@auth_bp.route('/check-verification-status', methods=['POST'])
def check_verification_status():
    """Check if user's email has been verified (AJAX endpoint)."""
    data = request.get_json()
    user_id = data.get('user_id')
    user_email = data.get('user_email')
    
    if not user_id or not user_email:
        return {'verified': False, 'error': 'Invalid request'}
    
    try:
        # Check if email is verified
        is_verified = EmailVerification.is_email_verified(user_id, user_email)
        return {'verified': is_verified}
    except Exception as e:
        current_app.logger.error(f"Error checking verification status: {e}")
        return {'verified': False, 'error': 'Check failed'}

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
        flash('Email address is already verified. You can now log in.', 'info')
        return redirect(url_for('auth.login'))
    
    # Create new verification
    verification, email_sent = create_and_send_verification(user)
    
    if email_sent:
        flash('Verification email sent! Please check your email and click the verification link.', 'success')
    else:
        flash('Could not send verification email. Please try again later.', 'error')
    
    return redirect(url_for('auth.verification_pending', 
                          user_id=user.id, 
                          user_email=user.email))

@auth_bp.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out successfully.', 'success')
    return redirect(url_for('main.home'))
