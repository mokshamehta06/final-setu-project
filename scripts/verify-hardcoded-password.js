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

// Verify the hardcoded password
const verifyHardcodedPassword = async () => {
  try {
    // Find admin user
    const admin = await User.findOne({ email: "admin@example.com" });
    
    if (!admin) {
      console.log("No admin user found with email: admin@example.com");
      process.exit(1);
    }
    
    console.log("Admin user found:", admin.email);
    console.log("Current password hash:", admin.password);
    
    // Test with bcrypt.compare
    const password = "admin123";
    const isMatch = await bcrypt.compare(password, admin.password);
    
    console.log("Password verification result:", isMatch ? "Success ✅" : "Failed ❌");
    
    if (isMatch) {
      console.log("\nYou can now log in with:");
      console.log("Email: admin@example.com");
      console.log("Password: admin123");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error verifying password:", error);
    process.exit(1);
  }
};

verifyHardcodedPassword();
