const mongoose = require("mongoose");

const agencySchema = new mongoose.Schema({
  agencyId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  verified: {
    type: Boolean,
    default: false, // Initially false until admin verifies
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
const bcrypt = require("bcryptjs");
agencySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
agencySchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Agency = mongoose.model("Agency", agencySchema);

module.exports = Agency;
