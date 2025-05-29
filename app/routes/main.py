from flask import Blueprint, render_template

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def home():
    """Home page route."""
    return render_template('home.html')

@main_bp.route('/about')
def about():
    """About page route."""
    return render_template('about.html')

# Policy Pages
@main_bp.route('/privacy-policy')
def privacy_policy():
    """Privacy Policy page route."""
    return render_template('policy-pages/privacy-policy.html')

@main_bp.route('/terms-of-service')
def terms_of_service():
    """Terms of Service page route."""
    return render_template('policy-pages/terms-of-service.html')

@main_bp.route('/cookie-policy')
def cookie_policy():
    """Cookie Policy page route."""
    return render_template('policy-pages/cookie-policy.html')
