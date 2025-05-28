from flask import current_app

def register_blueprints(app):
    """Register all blueprints with the Flask app."""
    
    # Import and register main blueprint
    try:
        from .main import main_bp
        app.register_blueprint(main_bp)
    except ImportError as e:
        app.logger.warning(f"Could not import main blueprint: {e}")
    
    # Import and register contact blueprint
    try:
        from .contact import contact_bp
        app.register_blueprint(contact_bp)
    except ImportError as e:
        app.logger.warning(f"Could not import contact blueprint: {e}")
    
    # Import and register auth blueprint
    try:
        from .auth import auth_bp
        app.register_blueprint(auth_bp)
    except ImportError as e:
        app.logger.warning(f"Could not import auth blueprint: {e}")
    
    # Import and register password reset blueprint
    try:
        from .password_reset import password_reset_bp
        app.register_blueprint(password_reset_bp)
    except ImportError as e:
        app.logger.warning(f"Could not import password_reset blueprint: {e}")
    
    # Import and register profile blueprint
    try:
        from .profile import profile_bp
        app.register_blueprint(profile_bp)
    except ImportError as e:
        app.logger.warning(f"Could not import profile blueprint: {e}")
