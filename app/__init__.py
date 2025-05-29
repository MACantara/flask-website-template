from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_mail import Mail
from config import config
import os

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
mail = Mail()

def create_app(config_name=None):
    app = Flask(__name__)
    
    # Load configuration
    config_name = config_name or os.environ.get('FLASK_CONFIG', 'default')
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

    # Initialize hCaptcha
    from app.utils.hcaptcha_utils import init_hcaptcha
    init_hcaptcha(app)

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
                
                # Create default admin user if it doesn't exist
                from app.models.user import User
                admin_user = User.query.filter_by(username='admin').first()
                if not admin_user:
                    admin_user = User(
                        username='admin',
                        email='admin@example.com',
                        is_admin=True,
                        is_active=True
                    )
                    admin_user.set_password('admin123')  # Change this in production!
                    db.session.add(admin_user)
                    db.session.commit()
                    app.logger.info("Default admin user created: admin/admin123")
                    
            except Exception as e:
                app.logger.warning(f"Database initialization failed: {e}")

        # Add current year and date to template context
        @app.context_processor
        def inject_current_date():
            from datetime import datetime
            current_date = datetime.now()
            return {
                'current_year': current_date.year,
                'current_date': current_date
            }

    # Make hCaptcha available in templates
    from app.utils.hcaptcha_utils import hcaptcha, is_hcaptcha_enabled
    app.jinja_env.globals.update(hcaptcha=hcaptcha, hcaptcha_enabled=is_hcaptcha_enabled)
    
    return app
