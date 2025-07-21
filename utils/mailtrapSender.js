const nodemailer = require('nodemailer');

// Create a transporter object for Mailtrap (for development/testing)
const createMailtrapTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: process.env.EMAIL_PORT || 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Create a transporter object for Gmail (for production)
const createGmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    secure: true
  });
};

// Select the appropriate transporter based on the environment
const transporter = process.env.EMAIL_SERVICE === 'smtp'
  ? createMailtrapTransporter()
  : createGmailTransporter();

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @returns {Promise} - Resolves with info about the sent email
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'your-email@gmail.com',
    to: options.to,
    subject: options.subject,
    html: options.html
  };

  try {
    // Always log email details for debugging purposes
    console.log('Email details:');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Content:', options.html);

    // For development or if no email credentials are set, just log the email
    if (process.env.NODE_ENV !== 'production') {
      console.log('Email not sent (development mode)');
      // Return success in development mode to allow testing
      return { success: true, message: 'Email logged (development mode)' };
    }

    // Send email in production
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return { success: true, message: 'Email sent successfully', info };
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return {
        success: false,
        message: 'Failed to send email',
        error: emailError
      };
    }
  } catch (error) {
    console.error('Error in email sending process:', error);
    return {
      success: false,
      message: 'Email process error',
      error
    };
  }
};

module.exports = { sendEmail };
