from flask import Blueprint, render_template, request, redirect, url_for, flash, session, current_app
from app import db
from app.models.user import User
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
    if request.method == 'POST':
        username_or_email = request.form.get('username_or_email', '').strip()
        password = request.form.get('password')
        remember_me = request.form.get('remember_me') == 'on'
        
        if not username_or_email or not password:
            flash('Please provide both username/email and password.', 'error')
            return render_template('auth/login.html')
        
        # Check if database is disabled (Vercel environment)
        if current_app.config.get('DISABLE_DATABASE', False):
            flash('Authentication is not available in this deployment environment.', 'warning')
            return render_template('auth/login.html')
        
        # Find user by username or email
        user = User.query.filter(
            (User.username == username_or_email) | 
            (User.email == username_or_email)
        ).first()
        
        if user and user.is_active and user.check_password(password):
            # Successful login
            session['user_id'] = user.id
            session['username'] = user.username
            session.permanent = remember_me
            user.update_last_login()
            
            flash(f'Welcome back, {user.username}!', 'success')
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('main.home'))
        else:
            flash('Invalid username/email or password.', 'error')
    
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

@auth_bp.route('/profile')
def profile():
    if 'user_id' not in session:
        flash('Please log in to access your profile.', 'warning')
        return redirect(url_for('auth.login'))
    
    if current_app.config.get('DISABLE_DATABASE', False):
        flash('User profiles are not available in this deployment environment.', 'warning')
        return redirect(url_for('main.home'))
    
    user = User.query.get(session['user_id'])
    if not user:
        session.clear()
        flash('User not found. Please log in again.', 'error')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/profile.html', user=user)
