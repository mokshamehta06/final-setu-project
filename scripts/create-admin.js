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

// Create admin user
const createAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ role: "admin" });
    
    if (adminExists) {
      console.log("Admin user already exists:", adminExists.email);
      console.log("If you need to reset the password, please update the user directly in the database.");
      process.exit(0);
    }
    
    // Create new admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const adminUser = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      isVerified: true
    });
    
    await adminUser.save();
    
    console.log("Admin user created successfully!");
    console.log("Email: admin@example.com");
    console.log("Password: admin123");
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
};

createAdmin();
