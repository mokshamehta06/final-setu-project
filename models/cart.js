const mongoose = require("mongoose")

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    image: {
      type: String,
      default: "/api/placeholder/300/200",
    },
  },
  { _id: false },
)

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

// Pre-save hook to calculate totals
cartSchema.pre("save", function (next) {
  // Calculate total items
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0)

  // Calculate total amount
  this.totalAmount = this.items.reduce((total, item) => total + item.price * item.quantity, 0)

  next()
})

const Cart = mongoose.model("Cart", cartSchema)

module.exports = Cart

