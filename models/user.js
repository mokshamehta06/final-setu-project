// const mongoose = require("mongoose")
// const bcrypt = require("bcrypt")

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//     lowercase: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   role: {
//     type: String,
//     enum: ["customer", "agency", "admin"],
//     default: "customer",
//   },
//   isVerified: {
//     type: Boolean,
//     default: false,
//   },
//   phone: {
//     type: String,
//   },
//   address: {
//     street: String,
//     city: String,
//     state: String,
//     zipCode: String,
//     country: String,
//   },
//   agencyDetails: {
//     agencyName: String,
//     businessType: String,
//     businessDescription: String,
//     website: String,
//     position: String,
//   },
//   preferences: {
//     emailNotifications: {
//       type: Boolean,
//       default: true,
//     },
//     smsNotifications: {
//       type: Boolean,
//       default: false,
//     },
//     productUpdates: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },
// })

// // Hash password before saving
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     return next()
//   }

//   try {
//     const salt = await bcrypt.genSalt(10)
//     this.password = await bcrypt.hash(this.password, salt)
//     next()
//   } catch (error) {
//     next(error)
//   }
// })

// // Update the updatedAt field before saving
// userSchema.pre("save", function (next) {
//   this.updatedAt = Date.now()
//   next()
// })

// // Method to compare password
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   try {
//     return await bcrypt.compare(candidatePassword, this.password)
//   } catch (error) {
//     throw new Error(error)
//   }
// }

// module.exports = mongoose.model("User", userSchema)

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["customer", "agency", "admin"],
    default: "admin",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
  },
  addresses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address", // Reference to an Address model
    },
  ],
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // Assuming wishlist items are products
    },
  ],
  agencyDetails: {
    agencyName: String,
    businessType: String,
    businessDescription: String,
    website: String,
    position: String,
  },
  documents: {
    businessRegistration: {
      path: String,
      uploadedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
    },
    taxId: {
      path: String,
      uploadedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
    },
    identityProof: {
      path: String,
      uploadedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
    },
    addressProof: {
      path: String,
      uploadedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
    }
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    smsNotifications: {
      type: Boolean,
      default: false,
    },
    productUpdates: {
      type: Boolean,
      default: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update the updatedAt field before saving
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = mongoose.model("User", userSchema);
