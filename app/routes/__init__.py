from .main import main_bp
from .contact import contact_bp
from .auth import auth_bp
from .password_reset import password_reset_bp

def register_blueprints(app):
    """Register all blueprints with the Flask app."""
    app.register_blueprint(main_bp)
    app.register_blueprint(contact_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(password_reset_bp)
