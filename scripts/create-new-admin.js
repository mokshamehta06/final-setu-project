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

// Create a new admin user
const createNewAdmin = async () => {
  try {
    // Delete existing admin
    await User.deleteOne({ email: "admin@example.com" });
    console.log("Deleted existing admin user");
    
    // Create a simple password hash directly
    const hashedPassword = await bcrypt.hash("admin123", 10);
    console.log("Created password hash:", hashedPassword);
    
    // Create new admin user
    const adminUser = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      isVerified: true
    });
    
    // Save without using pre-save hooks
    const savedAdmin = await adminUser.save();
    console.log("New admin user created:", savedAdmin.email);
    
    // Verify the password
    const isMatch = await bcrypt.compare("admin123", savedAdmin.password);
    console.log("Password verification:", isMatch ? "Success" : "Failed");
    
    console.log("\nAdmin Login Credentials:");
    console.log("Email: admin@example.com");
    console.log("Password: admin123");
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating new admin user:", error);
    process.exit(1);
  }
};

createNewAdmin();
