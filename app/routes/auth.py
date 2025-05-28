from flask import Blueprint, render_template, request, redirect, url_for, flash, session, current_app
from flask_mail import Message
from app import db, mail
from app.models.user import User
from app.models.login_attempt import LoginAttempt
from app.models.email_verification import EmailVerification
from argon2.exceptions import HashingError
import re

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

def get_client_ip():
    """Get the real client IP address, considering proxies."""
    # Check for forwarded IP first (common in production with reverse proxies)
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
    elif request.headers.get('X-Real-IP'):
        return request.headers.get('X-Real-IP')
    else:
        return request.remote_addr

def is_valid_email(email):
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_valid_username(username):
    """Validate username format."""
    # Username must be 3-30 characters, alphanumeric and underscores only
    pattern = r'^[a-zA-Z0-9_]{3,30}$'
    return re.match(pattern, username) is not None

def is_valid_password(password):
    """Validate password strength."""
    # At least 8 characters, one uppercase, one lowercase, one digit
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    return True, "Password is valid"

def send_verification_email(user, verification):
    """Send email verification email to user."""
    if not current_app.config.get('MAIL_SERVER'):
        current_app.logger.warning("Email server not configured for verification")
        return False
    
    try:
        verification_url = url_for('auth.verify_email', token=verification.token, _external=True)
        
        msg = Message(
            subject='Verify Your Email Address - Flask Template',
            sender=current_app.config.get('MAIL_USERNAME'),
            recipients=[user.email]
        )
        
        msg.body = f"""Hello {user.username},

Thank you for registering with Flask Template! To complete your registration, please verify your email address by clicking the link below:

{verification_url}

This verification link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

Best regards,
Flask Template Team
"""
        
        msg.html = f"""
<html>
<body>
    <h2>Verify Your Email Address</h2>
    <p>Hello <strong>{user.username}</strong>,</p>
    
    <p>Thank you for registering with Flask Template! To complete your registration, please verify your email address by clicking the button below:</p>
    
    <p style="text-align: center; margin: 30px 0;">
        <a href="{verification_url}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Verify Email Address
        </a>
    </p>
    
    <p>Or copy and paste this link into your browser:</p>
    <p><a href="{verification_url}">{verification_url}</a></p>
    
    <p><small>This verification link will expire in 24 hours.</small></p>
    
    <p>If you didn't create an account, you can safely ignore this email.</p>
    
    <p>Best regards,<br>Flask Template Team</p>
</body>
</html>
"""
        
        mail.send(msg)
        return True
        
    except Exception as e:
        current_app.logger.error(f"Failed to send verification email: {e}")
        return False

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    client_ip = get_client_ip()
    
    # Check if IP is locked out
    if LoginAttempt.is_ip_locked(client_ip):
        remaining_time = LoginAttempt.get_lockout_time_remaining(client_ip)
        if remaining_time:
            minutes = int(remaining_time.total_seconds() / 60) + 1
            return render_template('auth/login.html', locked_out=True, minutes_remaining=minutes)
    
    if request.method == 'POST':
        username_or_email = request.form.get('username_or_email', '').strip()
        password = request.form.get('password')
        remember_me = request.form.get('remember_me') == 'on'
        user_agent = request.headers.get('User-Agent')
        
        if not username_or_email or not password:
            flash('Please provide both username/email and password.', 'error')
            return render_template('auth/login.html')
        
        # Check if database is disabled (Vercel environment)
        if current_app.config.get('DISABLE_DATABASE', False):
            flash('Authentication is not available in this deployment environment.', 'warning')
            return render_template('auth/login.html')
        
        # Double-check IP lockout before processing
        if LoginAttempt.is_ip_locked(client_ip):
            remaining_time = LoginAttempt.get_lockout_time_remaining(client_ip)
            if remaining_time:
                minutes = int(remaining_time.total_seconds() / 60) + 1
                return render_template('auth/login.html', locked_out=True, minutes_remaining=minutes)
        
        # Find user by username or email
        user = User.query.filter(
            (User.username == username_or_email) | 
            (User.email == username_or_email)
        ).first()
        
        if user and user.is_active and user.check_password(password):
            # Check if email is verified
            if not EmailVerification.is_email_verified(user.id, user.email):
                LoginAttempt.record_attempt(
                    ip_address=client_ip,
                    username_or_email=username_or_email,
                    success=False,
                    user_agent=user_agent
                )
                flash('Please verify your email address before logging in. Check your email for the verification link.', 'warning')
                return render_template('auth/login.html', show_resend_verification=True, user_email=user.email, user_id=user.id)
            
            # Successful login - record success
            LoginAttempt.record_attempt(
                ip_address=client_ip,
                username_or_email=username_or_email,
                success=True,
                user_agent=user_agent
            )
            
            session['user_id'] = user.id
            session['username'] = user.username
            session.permanent = remember_me
            user.update_last_login()
            
            flash(f'Welcome back, {user.username}!', 'success')
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('main.home'))
        else:
            # Failed login - record failure
            LoginAttempt.record_attempt(
                ip_address=client_ip,
                username_or_email=username_or_email,
                success=False,
                user_agent=user_agent
            )
            
            # Check if this failure causes a lockout
            failed_count = LoginAttempt.get_failed_attempts_count(client_ip)
            max_attempts = current_app.config.get('MAX_LOGIN_ATTEMPTS', 5)
            
            if failed_count >= max_attempts:
                lockout_minutes = current_app.config.get('LOGIN_LOCKOUT_MINUTES', 15)
                return render_template('auth/login.html', locked_out=True, minutes_remaining=lockout_minutes)
            else:
                attempts_remaining = max_attempts - failed_count
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
            is_valid, message = is_valid_password(password)
            if not is_valid:
                errors.append(message)
        
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
            
            # Create email verification
            verification = EmailVerification.create_verification(user.id, email)
            
            # Send verification email
            email_sent = send_verification_email(user, verification)
            
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
