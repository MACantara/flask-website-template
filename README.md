# Flask Website Template

A modern Flask-based website template featuring Home, About, and Contact pages with responsive design using Tailwind CSS and Bootstrap Icons.

## Features

- Flask factory pattern architecture
- Responsive design with Tailwind CSS
- Bootstrap Icons integration
- SQLite database
- Contact form functionality
- **Three-way theme system (Light/Dark/System)**
- Accessible and user-friendly interface

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
Edit the `.env` file with your configuration values.

### 6. Initialize Database
```bash
flask db init
flask db migrate -m "Initial migration"
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
├── app/                        // Main application package
│   ├── models/                 // Database models
│   │   ├── __init__.py         // Import all models
│   │   └── contact.py          // Contact model
│   ├── routes/                 // Application routes
│   │   ├── __init__.py         // Register all blueprints
│   │   ├── contact.py          // Contact page route
│   │   └── main.py             // Main page route
│   ├── static/                 // Static files
│   │   ├── css/                // CSS styles
│   │   │   ├── about.css       // About page styles
│   │   │   ├── contact.css     // Contact page styles
│   │   │   ├── home.css        // Home page styles
│   │   │   └── main.css        // Base styles
│   │   ├── images/             // Images
│   │   ├── js/                 // JavaScript files
│   │   │   ├── about.js        // About page scripts
│   │   │   ├── contact.js      // Contact page scripts
│   │   │   ├── home.js         // Home page scripts
│   │   │   └── main.js         // Base scripts
│   ├── __init__.py             // Application factory
│   └── templates/              // HTML templates
│       ├── about.html          // About page template
│       ├── base.html           // Base template
│       ├── contact.html        // Contact page template
│       └── home.html           // Home page template
├── /instance                   // Instance folder for database
│   └── app.db                  // If using SQLite Database
├── .env.template               // Environment variables template
├── .gitignore                  // Git ignore file
├── config.py                   // Configuration file
├── README.md                   // This file
├── requirements.txt            // Dependencies
└── run.py                      // Entry point for the application
```

## Technologies Used

- Python Flask
- SQLite Database
- Tailwind CSS
- Bootstrap Icons
- HTML5/CSS3/JavaScript

## Deployment

### Vercel Deployment

This template is configured for easy deployment on Vercel with automatic database handling.

#### Features in Vercel Deployment:
- **Serverless Function**: Runs as a Vercel serverless function
- **Database Disabled**: SQLite database creation is automatically disabled
- **Contact Form**: Still functional but logs submissions instead of storing in database
- **Environment Variables**: Configure via Vercel dashboard

#### Deploy to Vercel:

1. **Fork/Clone the repository** to your GitHub account

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the Flask app

3. **Environment Variables** (Optional):
   Set these in your Vercel project settings:
   ```
   SECRET_KEY=your-production-secret-key
   MAIL_SERVER=your-mail-server
   MAIL_USERNAME=your-email
   MAIL_PASSWORD=your-email-password
   ```

4. **Deploy**:
   - Click "Deploy" in Vercel
   - Your app will be available at `https://your-project.vercel.app`

#### Local vs Vercel Differences:
- **Local**: Full SQLite database functionality with contact form storage
- **Vercel**: Contact form submissions are logged but not stored in database
- **Automatic Detection**: The app automatically detects Vercel environment

### Traditional Hosting

For traditional hosting with full database functionality, follow the standard setup instructions above.