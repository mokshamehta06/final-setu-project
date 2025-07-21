const mongoose = require("mongoose");
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

// Ensure all agency users have proper verification status
const ensureAgencyVerification = async () => {
  try {
    // Find all agency users
    const agencies = await User.find({ role: "agency" });
    
    console.log(`Found ${agencies.length} agencies`);
    
    // Update each agency
    for (const agency of agencies) {
      // Initialize documents if not present
      if (!agency.documents) {
        agency.documents = {
          businessRegistration: { status: 'pending' },
          taxId: { status: 'pending' },
          identityProof: { status: 'pending' },
          addressProof: { status: 'pending' }
        };
      }
      
      // Make sure status is set
      if (!agency.status) {
        agency.status = 'pending';
      }
      
      // Set isVerified to false if not defined
      if (agency.isVerified === undefined) {
        agency.isVerified = false;
      }
      
      // Save changes
      await agency.save();
      console.log(`Updated agency: ${agency.email}`);
      console.log(`  Status: ${agency.status}`);
      console.log(`  Verified: ${agency.isVerified}`);
      console.log(`  Documents: ${Object.keys(agency.documents || {}).length}`);
    }
    
    console.log("All agencies updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error updating agency verification:", error);
    process.exit(1);
  }
};

ensureAgencyVerification();
