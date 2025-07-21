const express = require('express');
const router = express.Router();
const User = require('../models/user');
const crypto = require('crypto');
const Token = require('../models/token');
const { sendEmail } = require('../utils/emailSender');

// Customer forgot password page - direct HTML response
router.get('/customer/forgot-password', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Forgot Password - Customer | SETU</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8f9fa;
          color: #333;
          line-height: 1.6;
        }
        
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 2rem;
        }
        
        .card {
          width: 100%;
          max-width: 450px;
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .logo-section {
          display: flex;
          justify-content: center;
          padding: 2rem 0;
          background-color: #f8f9fa;
        }
        
        .logo {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: #333;
        }
        
        .logo-icon {
          width: 40px;
          height: 40px;
          background-color: #4a6cf7;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-right: 10px;
        }
        
        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .content {
          padding: 2rem;
        }
        
        .header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #333;
        }
        
        .description {
          color: #6c757d;
          font-size: 0.9rem;
        }
        
        .form {
          margin-bottom: 1.5rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }
        
        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }
        
        .form-input:focus {
          border-color: #4a6cf7;
          outline: none;
        }
        
        .btn-primary {
          display: block;
          width: 100%;
          padding: 0.75rem;
          background-color: #4a6cf7;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .btn-primary:hover {
          background-color: #3a5bd9;
        }
        
        .footer {
          text-align: center;
          margin-top: 1.5rem;
        }
        
        .footer-text {
          color: #6c757d;
          font-size: 0.9rem;
        }
        
        .footer-link {
          color: #4a6cf7;
          text-decoration: none;
          font-weight: 500;
        }
        
        .footer-link:hover {
          text-decoration: underline;
        }
        
        .alert {
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 5px;
        }
        
        .alert-danger {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }
        
        .alert-success {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo-section">
            <a href="/" class="logo">
              <div class="logo-icon">
                <i class="fas fa-shopping-bag"></i>
              </div>
              <span class="logo-text">SETU</span>
            </a>
          </div>

          <div class="content">
            <div class="header">
              <h1 class="title">Forgot Password</h1>
              <p class="description">Enter your email to receive a password reset link</p>
            </div>

            <form action="/password/forgot-password" method="POST" class="form">
              <div class="form-group">
                <label for="email" class="form-label">Email</label>
                <input id="email" name="email" type="email" class="form-input" placeholder="Enter your email" required>
              </div>

              <input type="hidden" name="userType" value="customer">

              <button type="submit" class="btn-primary">Send Reset Link</button>
            </form>

            <div class="footer">
              <p class="footer-text">
                Remember your password?
                <a href="/auth/customer/login" class="footer-link">Back to Login</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  res.send(html);
});

// Agency forgot password page - direct HTML response
router.get('/agency/forgot-password', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Forgot Password - Agency | SETU</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8f9fa;
          color: #333;
          line-height: 1.6;
        }
        
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 2rem;
        }
        
        .card {
          width: 100%;
          max-width: 450px;
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .logo-section {
          display: flex;
          justify-content: center;
          padding: 2rem 0;
          background-color: #f8f9fa;
        }
        
        .logo {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: #333;
        }
        
        .logo-icon {
          width: 40px;
          height: 40px;
          background-color: #4a6cf7;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-right: 10px;
        }
        
        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .content {
          padding: 2rem;
        }
        
        .header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #333;
        }
        
        .description {
          color: #6c757d;
          font-size: 0.9rem;
        }
        
        .form {
          margin-bottom: 1.5rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }
        
        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }
        
        .form-input:focus {
          border-color: #4a6cf7;
          outline: none;
        }
        
        .btn-primary {
          display: block;
          width: 100%;
          padding: 0.75rem;
          background-color: #4a6cf7;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .btn-primary:hover {
          background-color: #3a5bd9;
        }
        
        .footer {
          text-align: center;
          margin-top: 1.5rem;
        }
        
        .footer-text {
          color: #6c757d;
          font-size: 0.9rem;
        }
        
        .footer-link {
          color: #4a6cf7;
          text-decoration: none;
          font-weight: 500;
        }
        
        .footer-link:hover {
          text-decoration: underline;
        }
        
        .alert {
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 5px;
        }
        
        .alert-danger {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }
        
        .alert-success {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo-section">
            <a href="/" class="logo">
              <div class="logo-icon">
                <i class="fas fa-building"></i>
              </div>
              <span class="logo-text">SETU</span>
            </a>
          </div>

          <div class="content">
            <div class="header">
              <h1 class="title">Forgot Password</h1>
              <p class="description">Enter your email to receive a password reset link</p>
            </div>

            <form action="/password/forgot-password" method="POST" class="form">
              <div class="form-group">
                <label for="email" class="form-label">Email</label>
                <input id="email" name="email" type="email" class="form-input" placeholder="Enter your email" required>
              </div>

              <input type="hidden" name="userType" value="agency">

              <button type="submit" class="btn-primary">Send Reset Link</button>
            </form>

            <div class="footer">
              <p class="footer-text">
                Remember your password?
                <a href="/auth/agency/login" class="footer-link">Back to Login</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  res.send(html);
});

// Reset password page - direct HTML response
router.get('/reset-password/:token', async (req, res) => {
  try {
    // Find the token
    const token = await Token.findOne({
      token: req.params.token,
      type: 'passwordReset'
    });
    
    if (!token) {
      return res.send(`
        <div style="text-align: center; margin-top: 50px;">
          <h1>Invalid or expired token</h1>
          <p>The password reset link is invalid or has expired.</p>
          <a href="/">Go to Home</a>
        </div>
      `);
    }
    
    // Find the user
    const user = await User.findById(token.userId);
    
    if (!user) {
      return res.send(`
        <div style="text-align: center; margin-top: 50px;">
          <h1>User not found</h1>
          <p>The user associated with this reset link could not be found.</p>
          <a href="/">Go to Home</a>
        </div>
      `);
    }
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password | SETU</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f9fa;
            color: #333;
            line-height: 1.6;
          }
          
          .container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 2rem;
          }
          
          .card {
            width: 100%;
            max-width: 450px;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          
          .logo-section {
            display: flex;
            justify-content: center;
            padding: 2rem 0;
            background-color: #f8f9fa;
          }
          
          .logo {
            display: flex;
            align-items: center;
            text-decoration: none;
            color: #333;
          }
          
          .logo-icon {
            width: 40px;
            height: 40px;
            background-color: #4a6cf7;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            margin-right: 10px;
          }
          
          .logo-text {
            font-size: 1.5rem;
            font-weight: 700;
          }
          
          .content {
            padding: 2rem;
          }
          
          .header {
            text-align: center;
            margin-bottom: 2rem;
          }
          
          .title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: #333;
          }
          
          .description {
            color: #6c757d;
            font-size: 0.9rem;
          }
          
          .form {
            margin-bottom: 1.5rem;
          }
          
          .form-group {
            margin-bottom: 1.5rem;
          }
          
          .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #333;
          }
          
          .form-input {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1rem;
            transition: border-color 0.3s;
          }
          
          .form-input:focus {
            border-color: #4a6cf7;
            outline: none;
          }
          
          .btn-primary {
            display: block;
            width: 100%;
            padding: 0.75rem;
            background-color: #4a6cf7;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.3s;
          }
          
          .btn-primary:hover {
            background-color: #3a5bd9;
          }
          
          .footer {
            text-align: center;
            margin-top: 1.5rem;
          }
          
          .footer-text {
            color: #6c757d;
            font-size: 0.9rem;
          }
          
          .footer-link {
            color: #4a6cf7;
            text-decoration: none;
            font-weight: 500;
          }
          
          .footer-link:hover {
            text-decoration: underline;
          }
          
          .alert {
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 5px;
          }
          
          .alert-danger {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
          }
          
          .alert-success {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
          }
          
          /* Password strength indicator */
          .password-strength {
            height: 4px;
            margin-top: 0.5rem;
            border-radius: 2px;
            transition: all 0.3s ease;
          }
          
          .password-strength.weak {
            background-color: #dc3545;
            width: 33%;
          }
          
          .password-strength.medium {
            background-color: #ffc107;
            width: 66%;
          }
          
          .password-strength.strong {
            background-color: #28a745;
            width: 100%;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo-section">
              <a href="/" class="logo">
                <div class="logo-icon">
                  <i class="fas fa-lock"></i>
                </div>
                <span class="logo-text">SETU</span>
              </a>
            </div>

            <div class="content">
              <div class="header">
                <h1 class="title">Reset Password</h1>
                <p class="description">Create a new password for your account</p>
              </div>

              <form action="/password/reset-password" method="POST" class="form" id="resetForm">
                <div class="form-group">
                  <label for="password" class="form-label">New Password</label>
                  <input id="password" name="password" type="password" class="form-input" placeholder="Enter new password" required>
                  <div class="password-strength"></div>
                </div>

                <div class="form-group">
                  <label for="confirmPassword" class="form-label">Confirm Password</label>
                  <input id="confirmPassword" name="confirmPassword" type="password" class="form-input" placeholder="Confirm new password" required>
                </div>

                <input type="hidden" name="token" value="${req.params.token}">

                <button type="submit" class="btn-primary">Reset Password</button>
              </form>

              <div class="footer">
                <p class="footer-text">
                  Remember your password?
                  <a href="/auth/${user.role}/login" class="footer-link">Back to Login</a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <script>
          // Password strength indicator
          const passwordInput = document.getElementById('password');
          const strengthIndicator = document.querySelector('.password-strength');
          
          passwordInput.addEventListener('input', function() {
            const password = this.value;
            
            if (password.length === 0) {
              strengthIndicator.className = 'password-strength';
              return;
            }
            
            // Check password strength
            let strength = 0;
            
            // Length check
            if (password.length >= 8) strength += 1;
            
            // Complexity checks
            if (/[A-Z]/.test(password)) strength += 1;
            if (/[0-9]/.test(password)) strength += 1;
            if (/[^A-Za-z0-9]/.test(password)) strength += 1;
            
            // Update indicator
            if (strength <= 2) {
              strengthIndicator.className = 'password-strength weak';
            } else if (strength === 3) {
              strengthIndicator.className = 'password-strength medium';
            } else {
              strengthIndicator.className = 'password-strength strong';
            }
          });
          
          // Password match validation
          const confirmInput = document.getElementById('confirmPassword');
          const form = document.getElementById('resetForm');
          
          form.addEventListener('submit', function(e) {
            if (passwordInput.value !== confirmInput.value) {
              e.preventDefault();
              alert('Passwords do not match!');
            }
          });
        </script>
      </body>
      </html>
    `;
    
    res.send(html);
    
  } catch (error) {
    console.error('Reset password page error:', error);
    res.send(`
      <div style="text-align: center; margin-top: 50px;">
        <h1>Error</h1>
        <p>An error occurred. Please try again.</p>
        <a href="/">Go to Home</a>
      </div>
    `);
  }
});

// Forgot Password Process
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, userType } = req.body;
    
    // Find user by email and role
    const user = await User.findOne({ email, role: userType });
    
    if (!user) {
      return res.send(`
        <div style="text-align: center; margin-top: 50px;">
          <h1>Account Not Found</h1>
          <p>No account with that email address exists.</p>
          <a href="/password/${userType}/forgot-password">Go Back</a>
        </div>
      `);
    }
    
    // Delete any existing tokens for this user
    await Token.deleteMany({ userId: user._id, type: 'passwordReset' });
    
    // Create a new token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Save the token to the database
    await new Token({
      userId: user._id,
      token: resetToken,
      type: 'passwordReset'
    }).save();
    
    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/password/reset-password/${resetToken}`;
    
    // Create email content
    const emailContent = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    
    // Send email
    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: emailContent
    });
    
    if (!emailResult.success) {
      return res.send(`
        <div style="text-align: center; margin-top: 50px;">
          <h1>Email Sending Failed</h1>
          <p>Failed to send password reset email. Please try again.</p>
          <a href="/password/${userType}/forgot-password">Go Back</a>
        </div>
      `);
    }
    
    return res.send(`
      <div style="text-align: center; margin-top: 50px;">
        <h1>Reset Link Sent</h1>
        <p>A password reset link has been sent to your email.</p>
        <p>Please check your inbox and follow the instructions to reset your password.</p>
        <a href="/auth/${userType}/login">Back to Login</a>
      </div>
    `);
    
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.send(`
      <div style="text-align: center; margin-top: 50px;">
        <h1>Error</h1>
        <p>An error occurred. Please try again.</p>
        <a href="/password/${req.body.userType}/forgot-password">Go Back</a>
      </div>
    `);
  }
});

// Reset Password Process
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    
    // Validate passwords
    if (password !== confirmPassword) {
      return res.send(`
        <div style="text-align: center; margin-top: 50px;">
          <h1>Passwords Do Not Match</h1>
          <p>The passwords you entered do not match.</p>
          <a href="/password/reset-password/${token}">Go Back</a>
        </div>
      `);
    }
    
    if (password.length < 6) {
      return res.send(`
        <div style="text-align: center; margin-top: 50px;">
          <h1>Password Too Short</h1>
          <p>Password should be at least 6 characters.</p>
          <a href="/password/reset-password/${token}">Go Back</a>
        </div>
      `);
    }
    
    // Find the token
    const resetToken = await Token.findOne({ 
      token,
      type: 'passwordReset'
    });
    
    if (!resetToken) {
      return res.send(`
        <div style="text-align: center; margin-top: 50px;">
          <h1>Invalid or Expired Token</h1>
          <p>The password reset link is invalid or has expired.</p>
          <a href="/">Go to Home</a>
        </div>
      `);
    }
    
    // Find the user
    const user = await User.findById(resetToken.userId);
    
    if (!user) {
      return res.send(`
        <div style="text-align: center; margin-top: 50px;">
          <h1>User Not Found</h1>
          <p>The user associated with this reset link could not be found.</p>
          <a href="/">Go to Home</a>
        </div>
      `);
    }
    
    // Update the password
    user.password = password;
    await user.save();
    
    // Delete the token
    await Token.deleteOne({ _id: resetToken._id });
    
    return res.send(`
      <div style="text-align: center; margin-top: 50px;">
        <h1>Password Reset Successful</h1>
        <p>Your password has been reset successfully.</p>
        <p>You can now log in with your new password.</p>
        <a href="/auth/${user.role}/login">Go to Login</a>
      </div>
    `);
    
  } catch (error) {
    console.error('Reset password error:', error);
    return res.send(`
      <div style="text-align: center; margin-top: 50px;">
        <h1>Error</h1>
        <p>An error occurred. Please try again.</p>
        <a href="/">Go to Home</a>
      </div>
    `);
  }
});

module.exports = router;
