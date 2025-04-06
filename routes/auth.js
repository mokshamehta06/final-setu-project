const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

// Customer login page
router.get('/customer/login', (req, res) => {
  res.render('index', { 
    page: 'customer-login',
    title: 'Customer Login'
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
    title: 'Customer Registration'
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
        email
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
        email
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
    title: 'Agency Login'
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
    title: 'Agency Registration'
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
        position
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
        position
      });
    }
    
    // Create new user
    const newUser = new User({
      name: `${firstName} ${lastName}`,
      email,
      password,
      role: 'agency',
      phone,
      agencyDetails: {
        agencyName,
        businessType,
        businessDescription,
        website,
        position
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