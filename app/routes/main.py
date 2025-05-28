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
