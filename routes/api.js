const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const Product = require("../models/product")
const Order = require("../models/order")
const Cart = require("../models/cart")
const { isAuthenticated } = require("../middleware/auth")

// Get product by ID
router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    res.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    res.status(500).json({ error: "Failed to fetch product" })
  }
})

// Get all products
router.get("/products", async (req, res) => {
  try {
    const limit = Number.parseInt(req.query.limit) || 8
    const products = await Product.find({ stock: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(limit)

    res.json(products)
  } catch (error) {
    console.error("Error fetching featured products:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
})

// Get products by category
router.get("/products/category/:category", async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category }).sort({ createdAt: -1 })
    res.json(products)
  } catch (error) {
    console.error("Error fetching products by category:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
})

// Search products
router.get("/products/search/:term", async (req, res) => {
  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: req.params.term, $options: "i" } },
        { description: { $regex: req.params.term, $options: "i" } },
        { category: { $regex: req.params.term, $options: "i" } },
      ],
    }).sort({ createdAt: -1 })

    res.json(products)
  } catch (error) {
    console.error("Error searching products:", error)
    res.status(500).json({ error: "Failed to search products" })
  }
})

// Get order by ID
router.get("/orders/:id", isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    // Check if user is authorized to view this order
    if (req.session.user.role === "customer" && order.user.toString() !== req.session.user._id) {
      return res.status(403).json({ error: "Not authorized to view this order" })
    }

    res.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    res.status(500).json({ error: "Failed to fetch order" })
  }
})

// API route for adding product to cart
router.post("/cart/add", isAuthenticated, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body

    // Validate product exists
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      })
    }
    console.log(req.session.user._id);

    // Find or create cart for user
    let cart = await Cart.findOne({ user: req.session.user._id })

    if (!cart) {
      cart = new Cart({
        user: req.session.user._id,
        items: [],
      })
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex((item) => item.product.toString() === productId)

    if (existingItemIndex > -1) {
      // Update quantity if product already in cart
      cart.items[existingItemIndex].quantity += Number.parseInt(quantity)
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        name: product.name,
        price: product.price,
        quantity: Number.parseInt(quantity),
        image: product.image,
      })
    }

    await cart.save()

    res.json({
      success: true,
      message: "Product added to cart",
      cartCount: cart.totalItems,
    })
  } catch (error) {
    console.error("Error adding to cart:", error)
    res.status(500).json({ success: false, message: "Failed to add product to cart" })
  }
})

// API route for updating cart item quantity
router.put("/cart/update", isAuthenticated, async (req, res) => {
  try {
    const { productId, quantity } = req.body

    if (!productId || quantity === undefined) {
      return res.status(400).json({ success: false, message: "Product ID and quantity are required" })
    }

    // Find cart
    const cart = await Cart.findOne({ user: req.session.user._id })

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" })
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId)

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Item not found in cart" })
    }

    // Check if product is in stock
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      })
    }

    // Update quantity or remove if quantity is 0
    if (Number.parseInt(quantity) <= 0) {
      cart.items.splice(itemIndex, 1)
    } else {
      cart.items[itemIndex].quantity = Number.parseInt(quantity)
    }

    await cart.save()

    res.json({
      success: true,
      message: "Cart updated successfully",
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        totalItems: cart.totalItems,
      },
    })
  } catch (error) {
    console.error("Error updating cart:", error)
    res.status(500).json({ success: false, message: "Failed to update cart" })
  }
})

// API route for removing item from cart
router.delete("/cart/remove/:productId", isAuthenticated, async (req, res) => {
  try {
    const { productId } = req.params

    // Find cart
    const cart = await Cart.findOne({ user: req.session.user._id })

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" })
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId)

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Item not found in cart" })
    }

    // Remove item from cart
    cart.items.splice(itemIndex, 1)

    await cart.save()

    res.json({
      success: true,
      message: "Item removed from cart",
      cartCount: cart.totalItems,
    })
  } catch (error) {
    console.error("Error removing from cart:", error)
    res.status(500).json({ success: false, message: "Failed to remove item from cart" })
  }
})

// API route for clearing cart
router.delete("/cart/clear", isAuthenticated, async (req, res) => {
  try {
    // Find and update cart
    const cart = await Cart.findOne({ user: req.session.user._id })

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" })
    }

    cart.items = []
    await cart.save()

    res.json({
      success: true,
      message: "Cart cleared successfully",
    })
  } catch (error) {
    console.error("Error clearing cart:", error)
    res.status(500).json({ success: false, message: "Failed to clear cart" })
  }
})

// API route for getting cart count
router.get("/cart/count", isAuthenticated, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.session.user._id })

    const count = cart ? cart.totalItems : 0

    res.json({
      success: true,
      count,
    })
  } catch (error) {
    console.error("Error getting cart count:", error)
    res.status(500).json({ success: false, message: "Failed to get cart count" })
  }
})

// Generate placeholder images
router.get("/placeholder/:width/:height", (req, res) => {
  const { width, height } = req.params
  res.redirect(`https://via.placeholder.com/${width}x${height}`)
})

module.exports = router

