const mongoose = require("mongoose")

// Define order schema
const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      quantity: Number,
      image: String,
    },
  ],
  shippingAddress: {
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    phone: String,
    email: String,
  },
  paymentMethod: {
    type: String,
    enum: ["credit-card", "paypal", "apple-pay", "paytm", "other", "Cash on Delivery"],
    default: "credit-card",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  timeline: [
    {
      status: { type: String, enum: ["order-placed", "processing", "shipped", "delivered", "cancelled"] },
      timestamp: { type: Date, default: Date.now },
      note: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Middleware to update `updatedAt` before saving
orderSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

// Generate a unique order number before saving
orderSchema.pre("validate", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments()
    this.orderNumber = `ORD-${Date.now()}-${count + 1}`
  }
  next()
})

const Order = mongoose.model("Order", orderSchema)

module.exports = Order
