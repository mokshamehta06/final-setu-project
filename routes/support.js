const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Support page route
router.get('/', (req, res) => {
  res.render('support', {
    title: 'Support',
    page: 'support',
    success_msg: req.flash('success_msg'),
    error_msg: req.flash('error_msg'),
    layout: false
  });
});

// Contact page route
router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact Us',
    page: 'contact',
    success_msg: req.flash('success_msg'),
    error_msg: req.flash('error_msg'),
    layout: false
  });
});

// Handle support contact form submission
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Log the form submission for debugging
    console.log('Support form submission:', { name, email, subject, message });

    // In a production environment, you would send an email here
    // For now, we'll just simulate a successful submission

    // Create a transporter object (for actual email sending)
    /*
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'support@setu.com',
      subject: `Support Request: ${subject}`,
      html: `
        <h2>New Support Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });
    */

    // Set success message
    req.flash('success_msg', 'Your message has been sent. We will get back to you soon!');
    res.redirect('/support');

  } catch (error) {
    console.error('Support form error:', error);
    req.flash('error_msg', 'There was an error sending your message. Please try again.');
    res.redirect('/support');
  }
});

// Handle contact form submission
router.post('/contact/submit', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, subject, message } = req.body;

    // Log the form submission for debugging
    console.log('Contact form submission:', { firstName, lastName, email, phone, subject, message });

    // In a production environment, you would send an email here
    // For now, we'll just simulate a successful submission

    // Set success message
    req.flash('success_msg', 'Your message has been sent. We will get back to you soon!');
    res.redirect('/support/contact');

  } catch (error) {
    console.error('Contact form error:', error);
    req.flash('error_msg', 'There was an error sending your message. Please try again.');
    res.redirect('/support/contact');
  }
});

module.exports = router;
