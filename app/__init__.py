from flask import Flask, session
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_mail import Mail
from flask_login import LoginManager
from config import config
import os

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
mail = Mail()
login_manager = LoginManager()


def create_app(config_name=None):
    app = Flask(__name__)

    # Load configuration
    config_name = config_name or os.environ.get("FLASK_CONFIG", "default")
    app.config.from_object(config[config_name])

    # Initialize Flask-Login
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"
    login_manager.login_message = "Please log in to access this page."
    login_manager.login_message_category = "warning"

    # User loader callback
    @login_manager.user_loader
    def load_user(user_id):
        if app.config.get("DISABLE_DATABASE", False):
            return None
        try:
            from app.models.user import User

            return User.query.get(int(user_id))
        except:
            return None

    # Initialize extensions only if database is not disabled
    if not app.config.get("DISABLE_DATABASE", False):
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
    if not app.config.get("DISABLE_DATABASE", False):
        from app.models import Contact, User, PasswordResetToken

    # Register blueprints
    from app.routes import register_blueprints

    register_blueprints(app)

    # Create database tables only in non-Vercel environments
    with app.app_context():
        if not app.config.get("DISABLE_DATABASE", False):
            try:
                db.create_all()

                # Create default admin user if it doesn't exist
                from app.models.user import User
                from app.models.email_verification import EmailVerification

                admin_user = User.query.filter_by(username="admin").first()
                if not admin_user:
                    admin_user = User(
                        username="admin",
                        email="admin@example.com",
                        is_admin=True,
                        active=True,
                    )
                    admin_user.set_password("admin123")  # Change this in production!
                    db.session.add(admin_user)
                    db.session.commit()

                    # Create verified email verification for admin
                    admin_verification = EmailVerification(
                        user_id=admin_user.id, email=admin_user.email
                    )
                    # Add to session first
                    db.session.add(admin_verification)
                    db.session.commit()

                    # Now mark as verified
                    admin_verification.verify()

                    app.logger.info(
                        "Default admin user created: admin/admin123 (email verified)"
                    )
                else:
                    # Ensure existing admin has verified email
                    if not EmailVerification.is_email_verified(
                        admin_user.id, admin_user.email
                    ):
                        admin_verification = EmailVerification(
                            user_id=admin_user.id, email=admin_user.email
                        )
                        # Add to session first
                        db.session.add(admin_verification)
                        db.session.commit()

                        # Now mark as verified
                        admin_verification.verify()
                        app.logger.info("Admin email verification created and verified")

            except Exception as e:
                app.logger.warning(f"Database initialization failed: {e}")

        # Add current year and date to template context
        @app.context_processor
        def inject_current_date():
            from datetime import datetime

            current_date = datetime.now()

            # Remove current_user injection since Flask-Login handles it
            return {"current_year": current_date.year, "current_date": current_date}

    # Make hCaptcha available in templates
    from app.utils.hcaptcha_utils import hcaptcha, is_hcaptcha_enabled

    app.jinja_env.globals.update(
        hcaptcha=hcaptcha, hcaptcha_enabled=is_hcaptcha_enabled
    )

    return app
