from flask import Blueprint, render_template, request, redirect, url_for, flash, session, current_app
from app import db
from app.models.user import User
from app.models.login_attempt import LoginAttempt
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
            # Successful login - record success and clear any failed attempts
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
            
            flash('Account created successfully! Please log in.', 'success')
            return redirect(url_for('auth.login'))
            
        except HashingError:
            flash('Error creating account. Please try again.', 'error')
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Signup error: {e}")
            flash('Error creating account. Please try again.', 'error')
    
    return render_template('auth/signup.html')

@auth_bp.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out successfully.', 'success')
    return redirect(url_for('main.home'))
