def register_blueprints(app):
    """Register all application blueprints."""
    
    # Import blueprints
    from app.routes.main import main
    from app.routes.contact import contact
    
    # Register blueprints
    app.register_blueprint(main)
    app.register_blueprint(contact)
