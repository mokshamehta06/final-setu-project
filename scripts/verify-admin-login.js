const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
require('dotenv').config();

// MongoDB connection settings with defaults
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/setu_ecommerce";

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Verify admin login
const verifyAdminLogin = async () => {
  try {
    const email = "admin@example.com";
    const password = "password";
    
    // Find admin by email
    const admin = await User.findOne({ email });
    
    if (!admin) {
      console.log(`No user found with email: ${email}`);
      process.exit(1);
    }
    
    console.log(`User found: ${admin.email}, role: ${admin.role}`);
    
    // Test password directly with bcrypt
    const isMatchDirect = await bcrypt.compare(password, admin.password);
    console.log("Direct bcrypt comparison result:", isMatchDirect);
    
    // Test using the model method
    const isMatchMethod = await admin.comparePassword(password);
    console.log("Model method comparison result:", isMatchMethod);
    
    if (isMatchDirect && isMatchMethod) {
      console.log("✅ Admin login verification successful!");
      console.log("You can now log in with:");
      console.log("Email: admin@example.com");
      console.log("Password: password");
    } else {
      console.log("❌ Admin login verification failed.");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error verifying admin login:", error);
    process.exit(1);
  }
};

verifyAdminLogin();
