const express = require("express")
const router = express.Router()
const { isAuthenticated, isCustomer } = require("../middleware/auth")
const Product = require("../models/product")
const Order = require("../models/order")
const User = require("../models/user")
const Notification = require("../models/notification")

// Customer browsing page
router.get("/browsing", async (req, res) => {
  try {
    console.log("Session Data:", req.session);
    console.log("User Data:", req.session.user);
    console.log("User ID:", req.session.user ? req.session.user._id : "No user ID found");
    // Get all products with stock > 0
    const products = await Product.find({ stock: { $gt: 0 } })
      .populate("agency", "name")
      .sort({ createdAt: -1 })

    res.render("index", {
      page: "customer-browsing",
      title: "Browse Products",
      products,
      activeTab: "all",
      user: req.session.user || null,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    req.flash("error_msg", "Failed to load products")
    res.redirect("/")
  }
})

// Filter products by category
router.get("/browsing/:category", async (req, res) => {
  try {
    const { category } = req.params
    let products

    if (category === "all") {
      products = await Product.find({ stock: { $gt: 0 } })
        .populate("agency", "name")
        .sort({ createdAt: -1 })
    } else {
      products = await Product.find({ category, stock: { $gt: 0 } })
        .populate("agency", "name")
        .sort({ createdAt: -1 })
    }

    res.render("index", {
      page: "customer-browsing",
      title: "Browse Products",
      products,
      activeTab: category,
      user: req.session.user || null,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    req.flash("error_msg", "Failed to load products")
    res.redirect("/customer/browsing")
  }
})

// Search products
router.post("/search", async (req, res) => {
  try {
    const { searchTerm } = req.body

    const products = await Product.find({
      $and: [
        { stock: { $gt: 0 } },
        {
          $or: [
            { name: { $regex: searchTerm, $options: "i" } },
            { description: { $regex: searchTerm, $options: "i" } },
            { category: { $regex: searchTerm, $options: "i" } },
          ],
        },
      ],
    })
      .populate("agency", "name")
      .sort({ createdAt: -1 })

    res.render("index", {
      page: "customer-browsing",
      title: "Search Results",
      products,
      activeTab: "all",
      searchTerm,
      user: req.session.user || null,
    })
  } catch (error) {
    console.error("Error searching products:", error)
    req.flash("error_msg", "Failed to search products")
    res.redirect("/customer/browsing")
  }
})

// Product details
router.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("agency", "name")

    if (!product) {
      req.flash("error_msg", "Product not found")
      return res.redirect("/customer/browsing")
    }

    // Get related products (same category)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      stock: { $gt: 0 },
    }).limit(4)

    res.render("index", {
      page: "customer-product-details",
      title: product.name,
      product,
      relatedProducts,
      user: req.session.user || null,
    })
  } catch (error) {
    console.error("Error fetching product details:", error)
    req.flash("error_msg", "Failed to load product details")
    res.redirect("/customer/browsing")
  }
})

// Cart page
router.get("/cart", (req, res) => {
  res.render("index", {
    page: "customer-cart",
    title: "Shopping Cart",
    user: req.session.user || null,
  })
})

// Add to cart (AJAX)
router.post("/cart/add", (req, res) => {
  const { productId, name, price, image, quantity } = req.body

  // Initialize cart if it doesn't exist
  if (!req.session.cart) {
    req.session.cart = []
  }

  // Check if product already in cart
  const existingItemIndex = req.session.cart.findIndex((item) => item.productId === productId)

  if (existingItemIndex !== -1) {
    // Update quantity if product already in cart
    req.session.cart[existingItemIndex].quantity += Number.parseInt(quantity) || 1
  } else {
    // Add new product to cart
    req.session.cart.push({
      productId,
      name,
      price: Number.parseFloat(price),
      image,
      quantity: Number.parseInt(quantity) || 1,
    })
  }

  res.json({
    success: true,
    message: `${name} added to cart!`,
    cartCount: req.session.cart.reduce((total, item) => total + item.quantity, 0),
  })
})

// Update cart item quantity
router.post("/cart/update", (req, res) => {
  const { productId, quantity } = req.body

  if (!req.session.cart) {
    return res.json({ success: false, message: "Cart is empty" })
  }

  const itemIndex = req.session.cart.findIndex((item) => item.productId === productId)

  if (itemIndex === -1) {
    return res.json({ success: false, message: "Item not found in cart" })
  }

  req.session.cart[itemIndex].quantity = Number.parseInt(quantity)

  // Calculate cart totals
  const subtotal = req.session.cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const shipping = 5
  const total = subtotal + tax + shipping

  res.json({
    success: true,
    subtotal,
    tax,
    shipping,
    total,
    cartCount: req.session.cart.reduce((total, item) => total + item.quantity, 0),
  })
})

// Remove item from cart
router.post("/cart/remove", (req, res) => {
  const { productId } = req.body

  if (!req.session.cart) {
    return res.json({ success: false, message: "Cart is empty" })
  }

  req.session.cart = req.session.cart.filter((item) => item.productId !== productId)

  // Calculate cart totals
  const subtotal = req.session.cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const shipping = 5
  const total = subtotal + tax + shipping

  res.json({
    success: true,
    subtotal,
    tax,
    shipping,
    total,
    cartCount: req.session.cart.reduce((total, item) => total + item.quantity, 0),
  })
})

// Checkout page
router.get("/checkout", isAuthenticated, isCustomer, async (req, res) => {
  if (!req.session.cart || req.session.cart.length === 0) {
    req.flash("error_msg", "Your cart is empty")
    return res.redirect("/customer/cart")
  }

  try {
    // Get user info for pre-filling checkout form
    const user = await User.findById(req.session.user._id)

    // Calculate cart totals
    const subtotal = req.session.cart.reduce((total, item) => total + item.price * item.quantity, 0)
    const tax = subtotal * 0.1
    const shipping = 5
    const total = subtotal + tax + shipping

    res.render("index", {
      page: "customer-checkout",
      title: "Checkout",
      cart: req.session.cart,
      subtotal,
      tax,
      shipping,
      total,
      user,
    })
  } catch (error) {
    console.error("Error loading checkout page:", error)
    req.flash("error_msg", "Failed to load checkout page")
    res.redirect("/customer/cart")
  }
})

// Process order
// router.post("/place-order", isAuthenticated, isCustomer, async (req, res) => {
//   try {
//     if (!req.session.cart || req.session.cart.length === 0) {
//       req.flash("error_msg", "Your cart is empty")
//       return res.redirect("/customer/cart")
//     }

//     const { firstName, lastName, email, phone, address, city, state, zip, country, paymentMethod } = req.body

//     // Calculate order totals
//     const subtotal = req.session.cart.reduce((total, item) => total + item.price * item.quantity, 0)
//     const tax = subtotal * 0.1
//     const shipping = 5
//     const total = subtotal + tax + shipping

//     // Create order items and update product stock
//     const orderItems = []

//     for (const item of req.session.cart) {
//       // Get product to update stock
//       const product = await Product.findById(item.productId)

//       if (product) {
//         // Check if enough stock
//         if (product.stock < item.quantity) {
//           req.flash("error_msg", `Not enough stock for ${item.name}. Available: ${product.stock}`)
//           return res.redirect("/customer/checkout")
//         }

//         // Update product stock
//         product.stock -= item.quantity
//         await product.save()

//         // Add to order items
//         orderItems.push({
//           product: item.productId,
//           name: item.name,
//           price: item.price,
//           quantity: item.quantity,
//           image: item.image,
//         })
//       }
//     }

//     // Create new order
//     const newOrder = new Order({
//       user: req.session.user._id,
//       items: orderItems,
//       shippingAddress: {
//         firstName,
//         lastName,
//         address,
//         city,
//         state,
//         zip,
//         country,
//         phone,
//         email,
//       },
//       paymentMethod,
//       subtotal,
//       tax,
//       shipping,
//       totalAmount: total,
//       status: "pending",
//       timeline: [
//         {
//           status: "order-placed",
//           timestamp: Date.now(),
//           note: "Order placed successfully",
//         },
//       ],
//     })

//     await newOrder.save()

//     // Create notifications for agencies
//     const agencyIds = new Set()

//     for (const item of orderItems) {
//       const product = await Product.findById(item.product).populate("agency")
//       if (product && product.agency) {
//         agencyIds.add(product.agency._id.toString())
//       }
//     }

//     for (const agencyId of agencyIds) {
//       const notification = new Notification({
//         recipient: agencyId,
//         title: `New Order ${newOrder.orderId}`,
//         message: "You have received a new order",
//         type: "order",
//         relatedId: newOrder._id,
//         onModel: "Order",
//       })

//       await notification.save()
//     }

//     // Store order in session for confirmation page
//     req.session.lastOrder = {
//       orderId: newOrder.orderId,
//       orderDate: newOrder.createdAt,
//       items: req.session.cart,
//       shippingAddress: {
//         firstName,
//         lastName,
//         address,
//         city,
//         state,
//         zip,
//         country,
//         phone,
//         email,
//       },
//       paymentMethod,
//       subtotal,
//       tax,
//       shipping,
//       total,
//     }

//     // Clear cart
//     req.session.cart = []

//     res.redirect("/customer/order-confirmation")
//   } catch (error) {
//     console.error("Error placing order:", error)
//     req.flash("error_msg", "Failed to place order")
//     res.redirect("/customer/checkout")
//   }
// })

// // Order confirmation page
// router.get("/order-confirmation", isAuthenticated, isCustomer, (req, res) => {
//   if (!req.session.lastOrder) {
//     req.flash("error_msg", "No order found")
//     return res.redirect("/customer/browsing")
//   }

//   res.render("customer/order-confirmation", {
//     page: "customer-order-confirmation",
//     title: "Order Confirmation",
//     order: req.session.lastOrder,
//     user: req.session.user,
//   })
// })

router.post("/place-order", isAuthenticated, isCustomer, async (req, res) => {
  try {
    if (!req.session.cart || req.session.cart.length === 0) {
      req.flash("error_msg", "Your cart is empty");
      return res.redirect("/customer/cart");
    }

    const { firstName, lastName, email, phone, address, city, state, zip, country, paymentMethod } = req.body;

    // Calculate order totals
    const subtotal = req.session.cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const shipping = 5;
    const total = subtotal + tax + shipping;

    // Create order items and update product stock
    const orderItems = [];

    for (const item of req.session.cart) {
      const product = await Product.findById(item.productId);

      if (!product) {
        req.flash("error_msg", `Product ${item.name} not found.`);
        return res.redirect("/customer/checkout");
      }

      if (product.stock < item.quantity) {
        req.flash("error_msg", `Not enough stock for ${item.name}. Available: ${product.stock}`);
        return res.redirect("/customer/checkout");
      }

      // Update stock
      product.stock -= item.quantity;
      await product.save();

      // Add to order items
      orderItems.push({
        product: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      });
    }

    // Create new order
    const newOrder = new Order({
      user: req.session.user._id,
      orderNumber: "ORD" + Date.now().toString(),
      items: orderItems,
      shippingAddress: { firstName, lastName, address, city, state, zip, country, phone, email },
      paymentMethod,
      subtotal,
      tax,
      shipping,
      totalAmount: total,
      status: "pending",
      timeline: [
        {
          status: "order-placed",
          timestamp: Date.now(),
          note: "Order placed successfully",
        },
      ],
    });

    await newOrder.save();

    // Notify agencies about new order
    const agencyIds = new Set();

    for (const item of orderItems) {
      const product = await Product.findById(item.product).populate("agency");
      if (product && product.agency) {
        agencyIds.add(product.agency._id.toString());
      }
    }

    for (const agencyId of agencyIds) {
      const notification = new Notification({
        recipient: agencyId,
        title: `New Order ${newOrder.orderNumber}`,
        message: "You have received a new order",
        type: "order",
        relatedId: newOrder._id,
        onModel: "Order",
      });

      await notification.save();
    }

    // Store order details in session
    req.session.lastOrder = {
      orderNumber: newOrder.orderNumber, // Ensure orderNumber is stored correctly
      orderDate: newOrder.createdAt,
      items: req.session.cart,
      shippingAddress: { firstName, lastName, address, city, state, zip, country, phone, email },
      paymentMethod,
      subtotal,
      tax,
      shipping,
      total,
    };

    // Clear cart after order placement
    req.session.cart = [];

    res.redirect("/customer/order-confirmation");

  } catch (error) {
    console.error("Error placing order:", error);
    req.flash("error_msg", "Failed to place order");
    res.redirect("/customer/checkout");
  }
});

// Order Confirmation Page (GET request)
router.get("/order-confirmation", isAuthenticated, isCustomer, (req, res) => {
  if (!req.session.lastOrder) {
    req.flash("error_msg", "No order found");
    return res.redirect("/customer/browsing");
  }
  console.log("Last order session data:", req.session.lastOrder);

  res.render("customer/order-confirmation", {
    page: "customer-order-confirmation",
    title: "Order Confirmation",
    order: req.session.lastOrder,
    user: req.session.user,
    orderId: req.session.lastOrder.orderNumber,  // Corrected this to use session data
  });
});

// Customer dashboard
router.get("/dashboard", isAuthenticated, isCustomer, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id)

    res.render("customer/dashboard", {
      page: "dashboard",
      title: "Customer Dashboard",
      userInfo: user,
      user: req.session.user,
    })
  } catch (error) {
    console.error("Error fetching user data:", error)
    req.flash("error_msg", "Failed to load dashboard")
    res.redirect("/customer/browsing")
  }
})

// Update customer profile
router.post("/update-profile", isAuthenticated, isCustomer, async (req, res) => {
  try {
    const { name, email, phone } = req.body

    await User.findByIdAndUpdate(req.session.user._id, {
      name,
      email,
      phone,
    })

    // Update session data
    req.session.user.name = name
    req.session.user.email = email

    req.flash("success_msg", "Profile updated successfully")
    res.redirect("/customer/dashboard")
  } catch (error) {
    console.error("Error updating profile:", error)
    req.flash("error_msg", "Failed to update profile")
    res.redirect("/customer/dashboard")
  }
})

// Update shipping address
router.post("/update-address", isAuthenticated, isCustomer, async (req, res) => {
  try {
    const { address, city, state, zip, country } = req.body

    await User.findByIdAndUpdate(req.session.user._id, {
      address: {
        street: address,
        city,
        state,
        zipCode: zip,
        country,
      },
    })

    req.flash("success_msg", "Address updated successfully")
    res.redirect("/customer/dashboard")
  } catch (error) {
    console.error("Error updating address:", error)
    req.flash("error_msg", "Failed to update address")
    res.redirect("/customer/dashboard")
  }
})

// Update password
router.post("/update-password", isAuthenticated, isCustomer, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body

    // Validation
    if (newPassword !== confirmPassword) {
      req.flash("error_msg", "New passwords do not match")
      return res.redirect("/customer/dashboard")
    }

    if (newPassword.length < 6) {
      req.flash("error_msg", "Password should be at least 6 characters")
      return res.redirect("/customer/dashboard")
    }

    // Get user
    const user = await User.findById(req.session.user._id)

    // Check current password
    const isMatch = await user.comparePassword(currentPassword)

    if (!isMatch) {
      req.flash("error_msg", "Current password is incorrect")
      return res.redirect("/customer/dashboard")
    }

    // Update password
    user.password = newPassword
    await user.save()

    req.flash("success_msg", "Password updated successfully")
    res.redirect("/customer/dashboard")
  } catch (error) {
    console.error("Error updating password:", error)
    req.flash("error_msg", "Failed to update password")
    res.redirect("/customer/dashboard")
  }
})

// Orders page
router.get("/orders", isAuthenticated, isCustomer, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.session.user._id }).sort({ createdAt: -1 })

    res.render("customer/orders", {
      page: "customer-orders",
      title: "My Orders",
      orders,
      user: req.session.user,
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    req.flash("error_msg", "Failed to load orders")
    res.redirect("/customer/dashboard")
  }
})

// Order details
router.get("/orders/:id", isAuthenticated, isCustomer, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.session.user._id,
    }).populate("items.product")

    if (!order) {
      req.flash("error_msg", "Order not found")
      return res.redirect("/customer/orders")
    }

    res.render("customer/order-details", {
      page: "customer-order-details",
      title: `Order #${order.orderId}`,
      order,
      user: req.session.user,
    })
  } catch (error) {
    console.error("Error fetching order details:", error)
    req.flash("error_msg", "Failed to load order details")
    res.redirect("/customer/orders")
  }
})



// Support page
router.get("/support", (req, res) => {
  res.render("customer/support", {
    page: "customer-support",
    title: "Customer Support",
    user: req.session.user || null,
  })
})

// Submit support request
router.post("/support", isAuthenticated, isCustomer, (req, res) => {
  try {
    const { name, email, subject, message } = req.body

    // In a real app, this would save the support request to the database
    // and potentially send an email notification

    req.flash("success_msg", "Your support request has been submitted")
    res.redirect("/customer/support")
  } catch (error) {
    console.error("Error submitting support request:", error)
    req.flash("error_msg", "Failed to submit support request")
    res.redirect("/customer/support")
  }
})

module.exports = router
