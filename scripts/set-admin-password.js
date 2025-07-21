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

// Set a hardcoded password for the admin
const setAdminPassword = async () => {
  try {
    // Find admin user
    const admin = await User.findOne({ email: "admin@example.com" });
    
    if (!admin) {
      console.log("No admin user found with email: admin@example.com");
      process.exit(1);
    }
    
    // Set a hardcoded password hash (this is for 'admin123')
    const hardcodedHash = '$2a$10$JdJQQr5wIhNPE9CXRgYnHO7ZRt0yJ.Y9w3n8F7nRbCRk8.EB43MAi';
    
    // Update the admin's password directly in the database
    await User.updateOne(
      { _id: admin._id },
      { $set: { password: hardcodedHash } }
    );
    
    console.log("Admin password has been set to a hardcoded value.");
    console.log("Email: admin@example.com");
    console.log("Password: admin123");
    
    process.exit(0);
  } catch (error) {
    console.error("Error setting admin password:", error);
    process.exit(1);
  }
};

setAdminPassword();
