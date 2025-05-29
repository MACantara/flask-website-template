# Flask Website Template

A modern Flask-based website template featuring Home, About, and Contact pages with responsive design using Tailwind CSS and Bootstrap Icons.

## Features

- Flask factory pattern architecture
- Responsive design with Tailwind CSS
- Bootstrap Icons integration
- SQLite database
- Contact form functionality with email notifications
- Complete Authentication System (Login/Signup/Password Reset/Profile Management)
- Advanced Security Features (Account Lockout, IP-based Rate Limiting, Session Management)
- Three-way theme system (Light/Dark/System)
- Accessible and user-friendly interface
- Legal Compliance Pages with 14-day change notice period
- Comprehensive Admin Panel with user management and system monitoring

## Admin Panel

This template includes a powerful admin panel for site management:

### 🛡️ Admin Features
- **User Management**: View, activate/deactivate users, grant/revoke admin privileges
- **System Monitoring**: Dashboard with real-time statistics and activity logs
- **Security Logs**: Monitor login attempts, account lockouts, and security events
- **Email Verification Tracking**: Monitor email verification status and history
- **Contact Form Management**: View and manage contact form submissions
- **Data Cleanup Tools**: Automated cleanup of old logs and expired tokens

### 📊 Admin Dashboard
- **Real-time Statistics**: Total users, active accounts, recent registrations
- **Activity Monitoring**: Recent login attempts, failed logins, security events
- **User Analytics**: Registration trends, verification rates, account status
- **Quick Actions**: Cleanup tools, user management shortcuts

### 🔐 Admin Access
- **Default Admin Account**: username: `admin`, password: `admin123` (change in production!)
- **Role-based Access**: Admin-only routes with decorator protection
- **Security Features**: IP-based lockout protection, session management

### 📋 Log Management
- **Login Attempts**: Monitor successful and failed login attempts with IP tracking
- **User Registrations**: Track new account creation and verification status
- **Email Verifications**: Monitor email verification requests and completion
- **Contact Submissions**: View contact form submissions and responses
- **Automated Cleanup**: Remove old logs and expired tokens automatically

### 🎯 Admin Routes
- `/admin/` - Main dashboard with statistics and recent activity
- `/admin/users` - User management with search and filtering
- `/admin/user/<id>` - Detailed user information and activity history
- `/admin/logs` - System logs with pagination and filtering
- `/admin/cleanup` - Database cleanup and maintenance tools

## Legal Compliance

This template includes comprehensive legal policy pages that comply with Philippine laws and international standards:

### 📋 Policy Pages
- **Privacy Policy**: Compliant with RA 10173 (Data Privacy Act of 2012)
- **Terms of Service**: Comprehensive user agreement with Philippine law governance
- **Cookie Policy**: Detailed explanation of cookie usage and user controls

### ⏰ Policy Change Management
- **14-Day Notice Period**: All policy changes take effect 14 days after posting
- **Automatic Date Management**: Policy effective dates are automatically calculated
- **Version Control**: Clear versioning with "Last Updated" and "Effective Date" tracking
- **Centralized Date Configuration**: DRY approach with helper function for consistent dates

### 🗓️ Policy Date Configuration
The application automatically manages policy dates through a centralized helper function:
- **Date Updated**: When the policy was last modified
- **Date Effective**: Automatically set to 14 days after the update date
- **Easy Maintenance**: Single function to update all policy dates consistently

```python
# Example: Centralized policy date management
def get_policy_dates():
    date_updated = datetime(2025, 5, 29)  # Update this when policies change
    date_effective = date_updated + timedelta(days=14)  # Automatic calculation
    return date_updated, date_effective
```

This approach ensures legal compliance by giving users adequate notice of any policy changes, allowing them time to review and decide whether to continue using the service.

## Authentication System

This template includes a complete user authentication system with advanced security features:

### 🔐 User Authentication
- **User Registration**: Secure signup with username and email
- **User Login**: Login with username or email
- **Password Security**: Argon2 password hashing for maximum security
- **Session Management**: Secure session handling with remember me option
- **User Profiles**: Basic user profile pages

### 🔑 Password Management
- **Password Reset**: Email-based password reset functionality
- **Secure Tokens**: Time-limited reset tokens (1 hour expiration)
- **Email Integration**: Flask-Mail integration with Gmail SMTP support
- **Password Validation**: Strong password requirements

### 🛡️ Advanced Security Features
- **Account Lockout**: IP-based rate limiting to prevent brute force attacks
- **Configurable Attempts**: Customizable maximum login attempts (default: 5)
- **Lockout Duration**: Configurable lockout time (default: 15 minutes)
- **Real-time Feedback**: Shows remaining attempts and lockout time
- **IP Tracking**: Tracks failed attempts by IP address to prevent circumvention
- **User Agent Logging**: Records browser/device information for security analysis
- **Automatic Cleanup**: Built-in cleanup for old login attempt records

### 🔒 Security Implementation Details
- **Argon2 Hashing**: Industry-standard password hashing
- **CSRF Protection**: Built-in CSRF protection with Flask-WTF
- **Secure Sessions**: HTTPOnly and SameSite cookie settings
- **Input Validation**: Comprehensive form validation
- **Error Handling**: Secure error handling that doesn't leak information
- **Proxy Support**: Proper IP detection behind reverse proxies (X-Forwarded-For, X-Real-IP)

### 📧 Email Configuration
The system supports email functionality for password resets and contact form notifications:
- Gmail SMTP integration
- HTML and plain text email templates
- Reply-to functionality for contact form emails
- Configurable email settings via environment variables

## Theme System

This template includes a sophisticated theme system that offers three distinct modes:

### 🌞 Light Mode
- Clean, bright interface with light colors
- Optimized for daytime use and well-lit environments
- High contrast for excellent readability

### 🌙 Dark Mode
- Modern dark interface that reduces eye strain
- Perfect for low-light environments and night usage
- Elegant dark color scheme throughout the application

### 🔄 System Mode (Auto)
- Automatically follows your operating system's theme preference
- Seamlessly switches between light and dark based on system settings
- Updates in real-time when system theme changes

### Theme Features
- **Persistent Settings**: Your theme preference is saved in browser localStorage
- **Dropdown Selection**: Easy theme switching via dropdown menu in navigation
- **Mobile Support**: Theme selector available on both desktop and mobile
- **Smooth Transitions**: All theme changes include smooth CSS transitions
- **FOUC Prevention**: Theme is applied immediately on page load to prevent flash of unstyled content
- **Real-time Updates**: System theme changes are detected and applied automatically

### Theme Implementation
The theme system uses:
- CSS custom properties for color variables
- Tailwind CSS dark mode classes
- JavaScript for theme detection and switching
- localStorage for preference persistence
- `prefers-color-scheme` media query for system theme detection

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd flask-website-template
```

### 2. Create Virtual Environment
```bash
python -m venv venv
```

### 3. Activate Virtual Environment
**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Environment Setup
```bash
copy .env.template .env
```
Edit the `.env` file with your configuration values, especially:
- Email configuration for password reset functionality
- Database URL for local development

### 6. Initialize Database
```bash
flask db init
flask db migrate -m "Initial migration with authentication and login attempts"
flask db upgrade
```

### 7. Run the Application
```bash
python run.py
```

Visit `http://localhost:5000` to view the website.

## Project Structure

```
flask-website-template/
├── app/                                                    // Main application package
│   ├── models/                                             // Database models
│   │   ├── __init__.py                                     // Import all database models
│   │   ├── contact.py                                      // Contact form submission model
│   │   ├── email_verification.py                           // Email verification model
│   │   ├── login_attempt.py                                // Login attempt tracking model
│   │   └── user.py                                         // User and PasswordResetToken models
│   ├── routes/                                             // Application routes
│   │   ├── __init__.py                                     // Register all blueprints
│   │   ├── admin.py                                        // Admin panel routes and user management
│   │   ├── auth.py                                         // Authentication routes with lockout
│   │   ├── contact.py                                      // Contact page route with email notifications
│   │   ├── email_verification.py                           // Email verification handling
│   │   ├── login_attempts.py                               // Login attempt tracking utilities
│   │   ├── logs.py                                         // Admin logs management
│   │   ├── main.py                                         // Main page routes and policy pages
│   │   ├── password_reset.py                               // Password reset routes
│   │   └── profile.py                                      // User profile management
│   ├── static/                                             // Static files
│   │   ├── css/                                            // CSS styles
│   │   │   ├── about.css                                   // About page specific styles
│   │   │   ├── contact.css                                 // Contact page specific styles
│   │   │   ├── home.css                                    // Home page specific styles
│   │   │   └── main.css                                    // Main stylesheet with animations and toast styles
│   │   ├── images/                                         // Images directory
│   │   └── js/                                             // JavaScript files
│   │       ├── components/                                 // JavaScript components
│   │       │   └── toast.js                                // Toast notification system
│   │       ├── utils/                                      // Utility JavaScript modules
│   │       │   ├── pagination/                             // Pagination utility modules
│   │       │   │   ├── controls.js                         // Pagination controls (buttons, selectors)
│   │       │   │   ├── core.js                             // Core pagination functionality
│   │       │   │   ├── interactions.js                     // User interactions and event handling
│   │       │   │   └── mobile.js                           // Mobile-specific pagination components
│   │       │   ├── theme/                                  // Theme management modules
│   │       │   │   ├── theme-initializator.js              // Theme initialization
│   │       │   │   └── theme-manager.js                    // Theme switching logic
│   │       │   ├── dropdown-toggle.js                      // Dropdown functionality
│   │       │   └── pagination.js                           // Main pagination entry point
│   │       ├── about.js                                    // About page functionality
│   │       ├── admin.js                                    // Admin panel functionality
│   │       ├── contact.js                                  // Contact page functionality
│   │       ├── home.js                                     // Home page functionality
│   │       ├── logs.js                                     // Admin logs functionality
│   │       └── main.js                                     // Main JavaScript with utilities
│   ├── templates/                                          // HTML templates
│   │   ├── admin/                                          // Admin panel templates
│   │   │   ├── dashboard.html                              // Admin dashboard
│   │   │   ├── logs.html                                   // System logs view
│   │   │   ├── user_detail.html                            // User detail page
│   │   │   └── users.html                                  // User management
│   │   ├── auth/                                           // Authentication templates
│   │   │   ├── login.html                                  // Login page
│   │   │   └── signup.html                                 // Registration page
│   │   ├── partials/                                       // Reusable template components
│   │   │   ├── admin/                                      // Admin-specific partials
│   │   │   │   ├── dashboard/                              // Dashboard components
│   │   │   │   │   ├── header.html                         // Dashboard header
│   │   │   │   │   ├── login_activity.html                 // Login activity widget
│   │   │   │   │   ├── quick_actions.html                  // Quick action buttons
│   │   │   │   │   ├── recent_users.html                   // Recent users widget
│   │   │   │   │   └── stats_cards.html                    // Statistics cards
│   │   │   │   ├── logs/                                   // Log management components
│   │   │   │   │   ├── empty_state.html                    // Empty state display
│   │   │   │   │   ├── filters.html                        // Log filtering controls
│   │   │   │   │   ├── header.html                         // Logs page header
│   │   │   │   │   ├── table.html                          // Logs table structure
│   │   │   │   │   └── table_row.html                      // Individual log row
│   │   │   │   ├── user-details/                           // User detail components
│   │   │   │   │   ├── activity_tabs.html                  // Activity tabs
│   │   │   │   │   ├── email_verifications_tab.html        // Email verification tab
│   │   │   │   │   ├── header.html                         // User detail header
│   │   │   │   │   ├── login_attempts_tab.html             // Login attempts tab
│   │   │   │   │   ├── user_actions.html                   // User action buttons
│   │   │   │   │   └── user_info.html                      // User information display
│   │   │   │   └── users/                                  // User management components
│   │   │   │       ├── empty_state.html                    // Empty state for user list
│   │   │   │       ├── filters.html                        // User filtering controls
│   │   │   │       ├── header.html                         // Users page header
│   │   │   │       ├── table.html                          // Users table structure
│   │   │   │       └── table_row.html                      // Individual user row
│   │   │   ├── shared/                                     // Shared components
│   │   │   │   └── pagination.html                         // Reusable pagination component
│   │   │   ├── footer.html                                 // Site footer
│   │   │   └── navbar.html                                 // Navigation with theme switcher
│   │   ├── password/                                       // Password reset templates
│   │   │   ├── forgot-password.html                        // Forgot password page
│   │   │   └── reset-password.html                         // Reset password page
│   │   ├── policy-pages/                                   // Legal policy templates
│   │   │   ├── cookie-policy.html                          // Cookie policy page
│   │   │   ├── privacy-policy.html                         // Privacy policy page
│   │   │   └── terms-of-service.html                       // Terms of service page
│   │   ├── profile/                                        // Profile management templates
│   │   │   ├── edit-profile.html                           // Edit profile form
│   │   │   └── profile.html                                // User profile page
│   │   ├── about.html                                      // About page template
│   │   ├── base.html                                       // Base template with toast notifications
│   │   ├── contact.html                                    // Contact page template
│   │   └── home.html                                       // Home page template
│   ├── utils/                                              // Utility modules
│   │   └── hcaptcha_utils.py                               // hCaptcha integration utilities
│   └── __init__.py                                         // Application factory
├── instance/                                               // Instance folder for database
│   └── app.db                                              // SQLite Database (if using local dev)
├── migrations/                                             // Database migration files
│   ├── versions/                                           // Migration version files
│   │   └── add_admin_field.py                              // Admin field migration
│   ├── alembic.ini                                         // Alembic configuration
│   ├── env.py                                              // Migration environment
│   ├── README                                              // Migration readme
│   └── script.py.mako                                      // Migration script template
├── .env.template                                           // Environment variables template
├── .gitignore                                              // Git ignore file
├── .vercelignore                                           // Vercel ignore file
├── config.py                                               // Configuration file with Vercel support
├── LICENSE                                                 // MIT License
├── README.md                                               // This file
├── requirements.txt                                        // Dependencies with auth packages
├── run.py                                                  // Entry point for the application
└── vercel.json                                             // Vercel deployment configuration
```

## Technologies Used

- Python Flask
- SQLite Database
- Flask-SQLAlchemy (ORM)
- Flask-Migrate (Database migrations)
- Flask-Mail (Email functionality)
- Argon2-cffi (Password hashing)
- Flask-WTF (Form handling and CSRF protection)
- Tailwind CSS
- Bootstrap Icons
- HTML5/CSS3/JavaScript

## Environment Variables

The application uses the following environment variables:

### Core Configuration
```bash
FLASK_APP=run.py
FLASK_ENV=development
DATABASE_URL=sqlite:///app.db
DEBUG=True
```

### Email Configuration
```bash
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### Security Settings
```bash
MAX_LOGIN_ATTEMPTS=5           # Maximum failed login attempts before lockout
LOGIN_LOCKOUT_MINUTES=15       # Duration of account lockout in minutes
PERMANENT_SESSION_LIFETIME=2592000  # Session lifetime in seconds (30 days)
```

### Application Settings
```bash
POSTS_PER_PAGE=10
UPLOAD_FOLDER=app/static/uploads
```

## Security Features

### Account Lockout System
- **IP-based Tracking**: Prevents attackers from switching accounts to bypass limits
- **Configurable Thresholds**: Administrators can adjust attempt limits and lockout duration
- **Real-time Feedback**: Users see remaining attempts and lockout countdown
- **Automatic Recovery**: Accounts unlock automatically after the specified time period
- **Database Logging**: All login attempts are logged for security analysis
- **Cleanup Mechanism**: Old login attempt records are automatically cleaned up

### Contact Form Security
- **Email Notifications**: Automatic notifications to administrators
- **Reply-to Headers**: Direct email replies go to the original sender
- **Input Validation**: Comprehensive validation of all form fields
- **Rate Limiting**: Could be extended to include rate limiting for contact submissions

## Deployment

### Vercel Deployment

This template is configured for easy deployment on Vercel with automatic database handling.

#### Features in Vercel Deployment:
- **Serverless Function**: Runs as a Vercel serverless function
- **Database Disabled**: SQLite database creation is automatically disabled
- **Authentication Disabled**: User authentication is disabled in Vercel environment
- **Contact Form**: Still functional but logs submissions instead of storing in database
- **Environment Variables**: Configure via Vercel dashboard

#### Security Considerations for Production:
- **HTTPS Required**: Enable HTTPS for secure cookie handling
- **Environment Variables**: Set all security-related variables in production
- **Database Migration**: Use PostgreSQL or MySQL for production deployments
- **Email Configuration**: Configure production email server
- **Session Security**: Enable secure cookie settings in production

#### Deploy to Vercel:

1. **Fork/Clone the repository** to your GitHub account

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the Flask app

3. **Environment Variables** (Optional):
   Set these in your Vercel project settings:
   ```
   MAIL_SERVER=smtp.gmail.com
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   ```

4. **Deploy**:
   - Click "Deploy" in Vercel
   - Your app will be available at `https://your-project.vercel.app`

#### Local vs Vercel Differences:
- **Local**: Full database functionality with authentication and contact form storage
- **Vercel**: Authentication disabled, contact form submissions logged only
- **Automatic Detection**: The app automatically detects Vercel environment

### Traditional Hosting

For traditional hosting with full database and authentication functionality:

1. Follow the standard setup instructions above
2. Configure your database (SQLite for development, PostgreSQL/MySQL for production)
3. Set up email configuration for password reset functionality
4. Configure HTTPS for secure cookie handling in production

## Email Setup for Password Reset

To enable password reset functionality:

1. **Gmail Setup**:
   - Enable 2-factor authentication on your Gmail account
   - Generate an app-specific password
   - Use the app password in your `.env` file

2. **Environment Variables**:
   ```bash
   MAIL_SERVER=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USE_TLS=true
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   ```

3. **Other Email Providers**:
   - Update `MAIL_SERVER` and `MAIL_PORT` accordingly
   - Ensure TLS/SSL settings match your provider

## Usage Examples

### Creating an Admin User
```python
from app import create_app, db
from app.models.user import User

app = create_app()
with app.app_context():
    admin = User(username='admin', email='admin@example.com')
    admin.set_password('secure_password')
    db.session.add(admin)
    db.session.commit()
```

### Monitoring Login Attempts
```python
from app.models.login_attempt import LoginAttempt

# Check failed attempts for an IP
failed_count = LoginAttempt.get_failed_attempts_count('192.168.1.1')

# Check if IP is locked
is_locked = LoginAttempt.is_ip_locked('192.168.1.1')

# Clean up old records (30+ days old)
cleaned = LoginAttempt.cleanup_old_attempts(days_old=30)
```

### Checking User Authentication in Templates
```html
{% if session.user_id %}
    <!-- Content for authenticated users -->
    <p>Welcome, {{ session.username }}!</p>
{% else %}
    <!-- Content for anonymous users -->
    <a href="{{ url_for('auth.login') }}">Login</a>
{% endif %}
```