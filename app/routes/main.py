from flask import Blueprint, render_template
from datetime import datetime, timedelta

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
    # Set specific dates for privacy policy
    date_updated = datetime(2025, 5, 29)   # Date format: (YYYY, MM, DD)
    date_effective = date_updated + timedelta(days=14)  # 14 days after update
    return render_template('policy-pages/privacy-policy.html', 
                         date_updated=date_updated, 
                         date_effective=date_effective)

@main_bp.route('/terms-of-service')
def terms_of_service():
    """Terms of Service page route."""
    # Set specific dates for terms of service
    date_updated = datetime(2025, 5, 29)  # Date format: (YYYY, MM, DD)
    date_effective = date_updated + timedelta(days=14)  # 14 days after update
    return render_template('policy-pages/terms-of-service.html',
                         date_updated=date_updated,
                         date_effective=date_effective)

@main_bp.route('/cookie-policy')
def cookie_policy():
    """Cookie Policy page route."""
    # Set specific dates for cookie policy
    date_updated = datetime(2025, 5, 29)  # Date format: (YYYY, MM, DD)
    date_effective = date_updated + timedelta(days=14)  # 14 days after update
    return render_template('policy-pages/cookie-policy.html',
                         date_updated=date_updated,
                         date_effective=date_effective)
