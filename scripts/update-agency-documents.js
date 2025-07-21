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

// Update agency users to have documents property
const updateAgencyDocuments = async () => {
  try {
    // Find all agency users without documents property
    const agencies = await User.find({ 
      role: "agency",
      $or: [
        { documents: { $exists: false } },
        { documents: null }
      ]
    });
    
    console.log(`Found ${agencies.length} agencies without documents property`);
    
    // Update each agency
    for (const agency of agencies) {
      agency.documents = {
        businessRegistration: { status: 'pending' },
        taxId: { status: 'pending' },
        identityProof: { status: 'pending' },
        addressProof: { status: 'pending' }
      };
      
      // Make sure status and isVerified are set
      if (!agency.status) {
        agency.status = 'pending';
      }
      
      if (agency.isVerified === undefined) {
        agency.isVerified = false;
      }
      
      await agency.save();
      console.log(`Updated agency: ${agency.email}`);
    }
    
    console.log("All agencies updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error updating agency documents:", error);
    process.exit(1);
  }
};

updateAgencyDocuments();
