from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_mail import Mail
from config import config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
mail = Mail()

def create_app(config_name=None):
    app = Flask(__name__)
    
    # Load configuration
    if config_name is None:
        config_name = 'development'
    
    app.config.from_object(config[config_name])

    # Initialize extensions only if database is not disabled
    if not app.config.get('DISABLE_DATABASE', False):
        db.init_app(app)
        migrate.init_app(app, db)
    else:
        # Initialize a dummy db for compatibility
        db.init_app(app)
    
    # Initialize Flask-Mail
    mail.init_app(app)

    # Import models to ensure they are registered with SQLAlchemy
    if not app.config.get('DISABLE_DATABASE', False):
        from app.models import Contact, User, PasswordResetToken

    # Register blueprints
    from app.routes import register_blueprints
    register_blueprints(app)

    # Create database tables only in non-Vercel environments
    with app.app_context():
        if not app.config.get('DISABLE_DATABASE', False):
            try:
                db.create_all()
            except Exception as e:
                app.logger.warning(f"Database initialization failed: {e}")

        # Add current year to template context
        @app.context_processor
        def inject_current_year():
            from datetime import datetime
            return {'current_year': datetime.now().year}

    return app
