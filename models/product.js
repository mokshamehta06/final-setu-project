const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["electronics", "mobile", "laptops", "cameras", "jewelry", "clothing", "home", "other"],
  },
  condition: {
    type: String,
    required: true,
    enum: ["excellent", "good", "fair", "poor"],
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
    default: "/api/placeholder/300/200",
  },
  stock: {
    type: Number,
    required: true,
    default: 1,
    min: 0,
  },
  seizureProof: {
    type: Boolean,
    default: false,
  },
  source: {
    type: String,
    enum: ["law-enforcement", "customs", "tax-authority", "bankruptcy", "other"],
    default: "other",
  },
  isNew: {
    type: Boolean,
    default: false,
  },
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",//User
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field before saving
productSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model("Product", productSchema)

