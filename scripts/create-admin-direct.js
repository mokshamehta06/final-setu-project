const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require('dotenv').config();

// MongoDB connection settings with defaults
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/setu_ecommerce";

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log("MongoDB connected");
  
  try {
    // Get the users collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Delete existing admin user
    await usersCollection.deleteOne({ email: "admin@example.com" });
    console.log("Deleted existing admin user");
    
    // Create a simple password hash
    const password = "admin123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Created password hash:", hashedPassword);
    
    // Create new admin user document
    const adminUser = {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert directly into the collection
    const result = await usersCollection.insertOne(adminUser);
    console.log("Admin user created with ID:", result.insertedId);
    
    // Verify the password
    const createdAdmin = await usersCollection.findOne({ email: "admin@example.com" });
    const isMatch = await bcrypt.compare(password, createdAdmin.password);
    console.log("Password verification:", isMatch ? "Success ✅" : "Failed ❌");
    
    console.log("\nAdmin Login Credentials:");
    console.log("Email: admin@example.com");
    console.log("Password: admin123");
    
    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    mongoose.connection.close();
  }
})
.catch(err => console.error("MongoDB connection error:", err));
