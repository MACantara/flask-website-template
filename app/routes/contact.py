from flask import Blueprint, render_template, request, flash, redirect, url_for, current_app
from app import db
from app.models.contact import Contact

contact = Blueprint('contact', __name__)

@contact.route('/contact', methods=['GET', 'POST'])
def contact_page():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        subject = request.form.get('subject')
        message = request.form.get('message')

        # Validate form data
        if not all([name, email, subject, message]):
            flash('Please fill in all fields.', 'error')
            return render_template('contact.html')

        # Only save to database if not disabled
        if not current_app.config.get('DISABLE_DATABASE', False):
            try:
                contact_message = Contact(
                    name=name,
                    email=email,
                    subject=subject,
                    message=message
                )
                db.session.add(contact_message)
                db.session.commit()
                flash('Thank you for your message! We\'ll get back to you soon.', 'success')
            except Exception as e:
                current_app.logger.error(f"Database error: {e}")
                flash('There was an error submitting your message. Please try again.', 'error')
        else:
            # In Vercel deployment, just show success message
            current_app.logger.info(f"Contact form submitted: {name} <{email}> - {subject}")
            flash('Thank you for your message! (Note: Database storage is disabled in this deployment)', 'success')

        return redirect(url_for('contact.contact_page'))

    return render_template('contact.html', title='Contact')
