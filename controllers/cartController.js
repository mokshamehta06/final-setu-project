const Cart = require("../models/cart");
const Product = require("../models/product");

const cartController = {
  // ✅ Get user's cart (Create new cart if not exists)
  getCart: async (userId) => {
    try {
      let cart = await Cart.findOne({ user: userId }).populate("items.product");

      if (!cart) {
        cart = new Cart({
          user: userId,
          items: [],
          totalAmount: 0,
          totalItems: 0,
        });
        await cart.save();
      }

      return cart;
    } catch (error) {
      console.error("❌ Error getting cart:", error);
      throw new Error("Failed to get cart");
    }
  },

  // ✅ Add an item to the cart
  addToCart: async (userId, productId, quantity) => {
    try {
      const product = await Product.findById(productId);
      if (!product) throw new Error("Product not found");

      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({
          user: userId,
          items: [],
          totalAmount: 0,
          totalItems: 0,
        });
      }

      const existingItem = cart.items.find((item) => item.product.toString() === productId.toString());
      let newQuantity = Number.parseInt(quantity);
      if (existingItem) newQuantity += existingItem.quantity;

      if (product.stock < newQuantity) throw new Error(`Only ${product.stock} items available in stock`);

      if (existingItem) {
        existingItem.quantity += Number.parseInt(quantity);
      } else {
        cart.items.push({
          product: productId,
          name: product.name,
          price: product.price,
          quantity: Number.parseInt(quantity),
          image: product.image || "/img/product-placeholder.jpg",
        });
      }

      await cart.save();
      return cart;
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      throw error;
    }
  },

  // ✅ Update cart item quantity
  updateCartItem: async (userId, productId, quantity) => {
    try {
      const cart = await Cart.findOne({ user: userId });

      if (!cart) throw new Error("Cart not found");

      const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId.toString());
      if (itemIndex === -1) throw new Error("Item not found in cart");

      const product = await Product.findById(productId);
      if (!product) throw new Error("Product not found");

      if (product.stock < quantity) throw new Error(`Only ${product.stock} items available in stock`);

      if (Number.parseInt(quantity) <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = Number.parseInt(quantity);
      }

      await cart.save();
      return cart;
    } catch (error) {
      console.error("❌ Error updating cart:", error);
      throw error;
    }
  },

  // ✅ Remove item from cart
  removeCartItem: async (userId, productId) => {
    try {
      const cart = await Cart.findOne({ user: userId });

      if (!cart) throw new Error("Cart not found");

      const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId.toString());
      if (itemIndex === -1) throw new Error("Item not found in cart");

      cart.items.splice(itemIndex, 1);
      await cart.save();

      return cart;
    } catch (error) {
      console.error("❌ Error removing from cart:", error);
      throw error;
    }
  },

  // ✅ Clear the entire cart
  clearCart: async (userId) => {
    try {
      const cart = await Cart.findOne({ user: userId });

      if (!cart) throw new Error("Cart not found");

      cart.items = [];
      cart.totalAmount = 0;
      cart.totalItems = 0;
      await cart.save();

      return cart;
    } catch (error) {
      console.error("❌ Error clearing cart:", error);
      throw error;
    }
  }
};

// ✅ Correctly export the controller
module.exports = cartController;
