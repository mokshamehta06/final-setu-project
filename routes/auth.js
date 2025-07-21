const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailSender');
const Token = require('../models/token');

// Customer login page
router.get('/customer/login', (req, res) => {
  res.render('index', {
    page: 'customer-login',
    title: 'Customer Login',
    layout: false
  });
});

// Customer login process
router.post('/customer/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email, role: 'customer' });

    if (!user) {
      req.flash('error_msg', 'Invalid email or password');
      return res.redirect('/auth/customer/login');
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      req.flash('error_msg', 'Invalid email or password');
      return res.redirect('/auth/customer/login');
    }

    // Set user session
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.flash('success_msg', 'You are now logged in');
    res.redirect('/customer/browsing');

  } catch (error) {
    console.error('Login error:', error);
    req.flash('error_msg', 'An error occurred during login');
    res.redirect('/auth/customer/login');
  }
});

// Customer register page
router.get('/customer/register', (req, res) => {
  res.render('index', {
    page: 'customer-register',
    title: 'Customer Registration',
    layout: false
  });
});

// Customer register process
router.post('/customer/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    let errors = [];

    if (!name || !email || !password || !confirmPassword) {
      errors.push({ msg: 'Please fill in all fields' });
    }

    if (password !== confirmPassword) {
      errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
      errors.push({ msg: 'Password should be at least 6 characters' });
    }

    if (errors.length > 0) {
      return res.render('index', {
        page: 'customer-register',
        title: 'Customer Registration',
        errors,
        name,
        email,
        layout: false
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      errors.push({ msg: 'Email is already registered' });
      return res.render('index', {
        page: 'customer-register',
        title: 'Customer Registration',
        errors,
        name,
        email,
        layout: false
      });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      role: 'customer'
    });

    await newUser.save();

    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/auth/customer/login');

  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error_msg', 'An error occurred during registration');
    res.redirect('/auth/customer/register');
  }
});

// Agency login page
router.get('/agency/login', (req, res) => {
  res.render('index', {
    page: 'agency-login',
    title: 'Agency Login',
    layout: false
  });
});

// Agency login process

router.post('/agency/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email, role: 'agency' });

    if (!user) {
      req.flash('error_msg', 'Invalid email or password');
      return res.redirect('/auth/agency/login');
    }

    // Check if agency is approved
    // if (user.status !== "approved") {
    //   req.flash('error_msg', 'Your agency is not approved yet. Please wait for admin approval.');
    //   return res.redirect('/auth/agency/login');
    // }

    // Compare passwords
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      req.flash('error_msg', 'Invalid email or password');
      return res.redirect('/auth/agency/login');
    }

    // Set user session
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.flash('success_msg', 'You are now logged in');
    res.redirect('/agency/dashboard');

  } catch (error) {
    console.error('Login error:', error);
    req.flash('error_msg', 'An error occurred during login');
    res.redirect('/auth/agency/login');
  }
});



// router.post('/agency/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find user by email with role 'agency'
//     const user = await User.findOne({ email, role: 'agency' });

//     if (!user) {
//       req.flash('error_msg', 'Invalid email or password');
//       return res.redirect('/auth/agency/login');
//     }

//     // Check if the agency is approved by the admin
//     if (user.status !== "approved") {
//       req.flash('error_msg', 'Your account is not approved by the admin yet.');
//       return res.redirect('/auth/agency/login');
//     }

//     // Compare passwords
//     const isMatch = await user.comparePassword(password);

//     if (!isMatch) {
//       req.flash('error_msg', 'Invalid email or password');
//       return res.redirect('/auth/agency/login');
//     }

//     // Set user session
//     req.session.user = {
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role
//     };

//     req.flash('success_msg', 'You are now logged in');
//     res.redirect('/agency/dashboard');

//   } catch (error) {
//     console.error('Login error:', error);
//     req.flash('error_msg', 'An error occurred during login');
//     res.redirect('/auth/agency/login');
//   }
// });



// router.post('/agency/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find user by email
//     const user = await User.findOne({ email, role: 'agency' });

//     if (!user) {
//       req.flash('error_msg', 'Invalid email or password');
//       return res.redirect('/auth/agency/login');
//     }

//     // Compare passwords
//     const isMatch = await user.comparePassword(password);

//     if (!isMatch) {
//       req.flash('error_msg', 'Invalid email or password');
//       return res.redirect('/auth/agency/login');
//     }

//     // Set user session
//     req.session.user = {
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role
//     };

//     req.flash('success_msg', 'You are now logged in');
//     res.redirect('/agency/dashboard'); // res.render(agency/dashboard)


//   } catch (error) {
//     console.error('Login error:', error);
//     req.flash('error_msg', 'An error occurred during login');
//     res.redirect('/auth/agency/login');
//   }
// });

// Agency register page
router.get('/agency/register', (req, res) => {
  res.render('index', {
    page: 'agency-register',
    title: 'Agency Registration',
    layout: false
  });
});

// Agency register process
router.post('/agency/register', async (req, res) => {
  try {
    const {
      agencyName,
      businessType,
      businessDescription,
      website,
      phone,
      firstName,
      lastName,
      email,
      position,
      password,
      confirmPassword
    } = req.body;

    // Validation
    let errors = [];

    if (!agencyName || !businessType || !phone || !firstName || !lastName || !email || !position || !password || !confirmPassword) {
      errors.push({ msg: 'Please fill in all required fields' });
    }

    if (password !== confirmPassword) {
      errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
      errors.push({ msg: 'Password should be at least 6 characters' });
    }

    if (errors.length > 0) {
      return res.render('index', {
        page: 'agency-register',
        title: 'Agency Registration',
        errors,
        agencyName,
        businessType,
        businessDescription,
        website,
        phone,
        firstName,
        lastName,
        email,
        position,
        layout: false
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      errors.push({ msg: 'Email is already registered' });
      return res.render('index', {
        page: 'agency-register',
        title: 'Agency Registration',
        errors,
        agencyName,
        businessType,
        businessDescription,
        website,
        phone,
        firstName,
        lastName,
        email,
        position,
        layout: false
      });
    }

    // Create new user
    const newUser = new User({
      name: `${firstName} ${lastName}`,
      email,
      password,
      role: 'agency',
      phone,
      status: 'pending',
      isVerified: false,
      agencyDetails: {
        agencyName,
        businessType,
        businessDescription,
        website,
        position
      },
      documents: {
        businessRegistration: { status: 'pending' },
        taxId: { status: 'pending' },
        identityProof: { status: 'pending' },
        addressProof: { status: 'pending' }
      }
    });

    await newUser.save();

    req.flash('success_msg', 'Your agency registration has been submitted for review');
    res.redirect('/auth/agency/login');

  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error_msg', 'An error occurred during registration');
    res.redirect('/auth/agency/register');
  }
});

// Forgot Password Page - Customer
router.get('/customer/forgot-password', (req, res) => {
  res.render('auth/forgot-password', {
    page: 'forgot-password',
    title: 'Forgot Password',
    userType: 'customer',
    layout: false
  });
});

// Forgot Password Page - Agency
router.get('/agency/forgot-password', (req, res) => {
  res.render('auth/forgot-password', {
    page: 'forgot-password',
    title: 'Forgot Password',
    userType: 'agency',
    layout: false
  });
});

// Forgot Password Process
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, userType } = req.body;

    // Find user by email and role
    const user = await User.findOne({ email, role: userType });

    if (!user) {
      req.flash('error_msg', 'No account with that email address exists');
      return res.redirect(`/auth/${userType}/forgot-password`);
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
    const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;

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
      req.flash('error_msg', 'Failed to send password reset email. Please try again.');
      return res.redirect(`/auth/${userType}/forgot-password`);
    }

    req.flash('success_msg', 'A password reset link has been sent to your email');
    res.redirect(`/auth/${userType}/login`);

  } catch (error) {
    console.error('Forgot password error:', error);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect(`/auth/${req.body.userType}/forgot-password`);
  }
});

// Reset Password Page
router.get('/reset-password/:token', async (req, res) => {
  try {
    // Find the token
    const token = await Token.findOne({
      token: req.params.token,
      type: 'passwordReset'
    });

    if (!token) {
      req.flash('error_msg', 'Invalid or expired password reset token');
      return res.redirect('/');
    }

    // Find the user
    const user = await User.findById(token.userId);

    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/');
    }

    res.render('auth/reset-password', {
      page: 'reset-password',
      title: 'Reset Password',
      token: req.params.token,
      userType: user.role,
      layout: false
    });

  } catch (error) {
    console.error('Reset password page error:', error);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect('/');
  }
});

// Reset Password Process
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Validate passwords
    if (password !== confirmPassword) {
      req.flash('error_msg', 'Passwords do not match');
      return res.redirect(`/auth/reset-password/${token}`);
    }

    if (password.length < 6) {
      req.flash('error_msg', 'Password should be at least 6 characters');
      return res.redirect(`/auth/reset-password/${token}`);
    }

    // Find the token
    const resetToken = await Token.findOne({
      token,
      type: 'passwordReset'
    });

    if (!resetToken) {
      req.flash('error_msg', 'Invalid or expired password reset token');
      return res.redirect('/');
    }

    // Find the user
    const user = await User.findById(resetToken.userId);

    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/');
    }

    // Update the password
    user.password = password;
    await user.save();

    // Delete the token
    await Token.deleteOne({ _id: resetToken._id });

    req.flash('success_msg', 'Your password has been reset. You can now log in with your new password.');
    res.redirect(`/auth/${user.role}/login`);

  } catch (error) {
    console.error('Reset password error:', error);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect('/');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;