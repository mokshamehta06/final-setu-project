// const Cart = require("../models/cart")
// const Product = require("../models/product")

// // Handle getting the cart for a user
// exports.getCart = async (userId) => {
//   try {
//     let cart = await Cart.findOne({ user: userId })

//     if (!cart) {
//       // Create a new cart if one doesn't exist
//       cart = new Cart({
//         user: userId,
//         items: [],
//         totalAmount: 0,
//         totalItems: 0,
//       })
//       await cart.save()
//     }

//     return cart
//   } catch (error) {
//     console.error("Error getting cart:", error)
//     throw new Error("Failed to get cart")
//   }
// }

// // Add an item to the cart
// exports.addToCart = async (userId, productId, quantity) => {
//   try {
//     // Find the product
//     const product = await Product.findById(productId)
//     if (!product) {
//       throw new Error("Product not found")
//     }

//     // Check if product is in stock
//     if (product.stock < quantity) {
//       throw new Error(`Only ${product.stock} items available in stock`)
//     }

//     // Find or create user's cart
//     let cart = await Cart.findOne({ user: userId })
//     if (!cart) {
//       cart = new Cart({
//         user: userId,
//         items: [],
//       })
//     }

//     // Check if product already in cart
//     const existingItem = cart.items.find((item) => item.product.toString() === productId.toString())

//     if (existingItem) {
//       // Update quantity if product already in cart
//       existingItem.quantity += Number.parseInt(quantity)
//     } else {
//       // Add new product to cart
//       cart.items.push({
//         product: productId,
//         name: product.name,
//         price: product.price,
//         quantity: Number.parseInt(quantity),
//         image: product.image || "/img/product-placeholder.jpg",
//       })
//     }

//     await cart.save()
//     return cart
//   } catch (error) {
//     console.error("Error adding to cart:", error)
//     throw error
//   }
// }

// // Update cart item quantity
// exports.updateCartItem = async (userId, productId, quantity) => {
//   try {
//     const cart = await Cart.findOne({ user: userId })

//     if (!cart) {
//       throw new Error("Cart not found")
//     }

//     // Find the item in the cart
//     const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId.toString())

//     if (itemIndex === -1) {
//       throw new Error("Item not found in cart")
//     }

//     // Check if product is in stock
//     const product = await Product.findById(productId)
//     if (!product) {
//       throw new Error("Product not found")
//     }

//     if (product.stock < quantity) {
//       throw new Error(`Only ${product.stock} items available in stock`)
//     }

//     // Update quantity or remove if quantity is 0
//     if (Number.parseInt(quantity) <= 0) {
//       cart.items.splice(itemIndex, 1)
//     } else {
//       cart.items[itemIndex].quantity = Number.parseInt(quantity)
//     }

//     await cart.save()
//     return cart
//   } catch (error) {
//     console.error("Error updating cart:", error)
//     throw error
//   }
// }

// // Remove item from cart
// exports.removeCartItem = async (userId, productId) => {
//   try {
//     const cart = await Cart.findOne({ user: userId })

//     if (!cart) {
//       throw new Error("Cart not found")
//     }

//     // Find the item in the cart
//     const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId.toString())

//     if (itemIndex === -1) {
//       throw new Error("Item not found in cart")
//     }

//     // Remove item from cart
//     cart.items.splice(itemIndex, 1)
//     await cart.save()

//     return cart
//   } catch (error) {
//     console.error("Error removing from cart:", error)
//     throw error
//   }
// }

// // Clear cart
// exports.clearCart = async (userId) => {
//   try {
//     const cart = await Cart.findOne({ user: userId })

//     if (!cart) {
//       throw new Error("Cart not found")
//     }

//     cart.items = []
//     await cart.save()

//     return cart
//   } catch (error) {
//     console.error("Error clearing cart:", error)
//     throw error
//   }
// }

