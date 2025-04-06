console.log("Customer route file is loaded")
const express = require("express")
const router = express.Router()
const { isAuthenticated, isCustomer } = require("../middleware/auth")
const Product = require("../models/product")
// const Order = require("../models/order")
const User = require("../models/user")
const Notification = require("../models/notification")
const Order = require("../models/order");
const Address = require("../models/address");

console.log("Order Model:", Order)
console.log("Type of Order:", typeof Order) // Should be "function"



const cartController = require("../controllers/cartController")

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
// router.get("/cart", (req, res) => {
//   res.render("index", {
//     page: "customer-cart",
//     title: "Shopping Cart",
//     user: req.session.user || null,
//   })
// })
// router.get("/cart", (req, res) => {
//   res.render("index", {
//     page: "customer-cart",
//     title: "Shopping Cart",
//     user: req.session.user || null,
//     cart: req.session.cart || [], // Pass the cart data
//   });
// });

router.get("/cart", (req, res) => {
  const cart = req.session.cart || []; // Get cart from session
  if (!cart.length) {
    return res.render("index", {
      page: "customer-cart",
      title: "Shopping Cart",
      user: req.session.user || null,
      cart: [],
      subtotal: 0,
      tax: 0,
      total: 0
    });
  }

  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;  // Assuming 10% tax
  const shipping = 5;  // Flat ₹5 shipping fee
  const total = subtotal + tax + shipping;

  res.render("index", {
    page: "customer-cart",
    title: "Shopping Cart",
    user: req.session.user || null,
    cart,
    subtotal,
    tax,
    total
  });
});




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

// // Checkout page
// router.get("/checkout", isAuthenticated, isCustomer, async (req, res) => {
//   if (!req.session.cart || req.session.cart.length === 0) {
//     req.flash("error_msg", "Your cart is empty")
//     return res.redirect("/customer/cart")
//   }

//   try {
//     // Get user info for pre-filling checkout form
//     const user = await User.findById(req.session.user._id)

//     // Calculate cart totals
//     const subtotal = req.session.cart.reduce((total, item) => total + item.price * item.quantity, 0)
//     const tax = subtotal * 0.1
//     const shipping = 5
//     const total = subtotal + tax + shipping

//     res.render("index", {
//       page: "customer-checkout",
//       title: "Checkout",
//       cart: req.session.cart,
//       subtotal,
//       tax,
//       shipping,
//       total,
//       user,
//     })
//   } catch (error) {
//     console.error("Error loading checkout page:", error)
//     req.flash("error_msg", "Failed to load checkout page")
//     res.redirect("/customer/cart")
//   }
// })

// checkout
router.get("/checkout", isAuthenticated, isCustomer, async (req, res) => {
  try {
    console.log( `checkout : ${req.session.user._id}`);
    const userId = req.session.user._id;
    const cart = await cartController.getCart(userId);

    if (!cart || cart.items.length === 0) {
      req.flash("error_msg", "Your cart is empty")
      return res.redirect("/customer/cart")
    }

    // Get user info for pre-filling checkout form
    const user = await User.findById(userId)

    // Calculate shipping and tax
    const subtotal = cart.totalAmount
    const tax = subtotal * 0.1 // 10% tax
    const shipping = 50 // Fixed shipping cost
    const total = subtotal + tax + shipping

    res.render("customer/checkout", {
      title: "Checkout",
      page: "checkout",
      cart,
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
//       // Get product to update stock, and ensure 'agency' and 'condition' are populated
//       const product = await Product.findById(item.productId).populate('agency')  // Ensure 'agency' is populated

//       if (product) {
//         console.log(`Product Details: ${product.name}`);
//         console.log(`Agency: ${product.agency ? product.agency._id : 'None'}`);
//         console.log(`Condition: ${product.condition}`);

//         // Check if 'agency' and 'condition' are defined
//         if (!product.agency) {
//           console.error(`Missing agency for product ${product.name}`);
//           req.flash("error_msg", `Missing agency for product ${product.name}`);
//           return res.redirect("/customer/checkout");
//         }

//         if (!product.condition) {
//           console.error(`Missing condition for product ${product.name}`);
//           req.flash("error_msg", `Missing condition for product ${product.name}`);
//           return res.redirect("/customer/checkout");
//         }

//         // Check if enough stock
//         if (product.stock < item.quantity) {
//           req.flash("error_msg", `Not enough stock for ${item.name}. Available: ${product.stock}`)
//           return res.redirect("/customer/checkout")
//         }

//         // Update product stock
//         product.stock -= item.quantity
//         await product.save()

//         // Add to order items, include the agency reference and condition
//         orderItems.push({
//           product: item.productId,
//           name: item.name,
//           price: item.price,
//           quantity: item.quantity,
//           image: item.image,
//           agency: product.agency ? product.agency._id : null,  // Include agency (if exists)
//           condition: product.condition,  // Include condition
//         })
//       } else {
//         console.error(`Product not found for ID: ${item.productId}`);
//       }
//     }

//     const newOrder = new Order({
//       user: req.session.user._id,
//       orderNumber: "ORD" + Date.now().toString(),  // Ensure unique order number
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
//     });

//     await newOrder.save()

//     // Create notifications for agencies
//     const agencyIds = new Set()

//     for (const item of orderItems) {
//       if (item.agency) {
//         agencyIds.add(item.agency.toString())  // Ensure agency is added to notification list
//       }
//     }

//     for (const agencyId of agencyIds) {
//       const notification = new Notification({
//         recipient: agencyId,
//         title: `New Order ${newOrder.orderNumber}`,  // Update to orderNumber
//         message: "You have received a new order",
//         type: "order",
//         relatedId: newOrder._id,
//         onModel: "Order",
//       })

//       await notification.save()
//     }

//     // Store order in session for confirmation page
//     req.session.lastOrder = {
//       orderId: newOrder.orderNumber,  // Update to orderNumber
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


router.post("/place-order", isAuthenticated, isCustomer, async (req, res) => {
  try {
    if (!req.session.cart || req.session.cart.length === 0) {
      req.flash("error_msg", "Your cart is empty")
      return res.redirect("/customer/cart")
    }

    const { firstName, lastName, email, phone, address, city, state, zip, country, paymentMethod } = req.body

    // Calculate order totals
    const subtotal = req.session.cart.reduce((total, item) => total + item.price * item.quantity, 0)
    const tax = subtotal * 0.1
    const shipping = 5
    const total = subtotal + tax + shipping

    // Create order items and update product stock
    const orderItems = []

    for (const item of req.session.cart) {
      // Get product to update stock and ensure 'agency' is populated
      const product = await Product.findById(item.productId).populate('agency')

      if (product) {
        // Ensure product has agency and condition set
        if (!product.agency) {
          req.flash("error_msg", `Product ${product.name} does not have a valid agency.`)
          return res.redirect("/customer/checkout")
        }

        if (!product.condition) {
          req.flash("error_msg", `Product ${product.name} does not have a valid condition.`)
          return res.redirect("/customer/checkout")
        }

        // Check if enough stock
        if (product.stock < item.quantity) {
          req.flash("error_msg", `Not enough stock for ${item.name}. Available: ${product.stock}`)
          return res.redirect("/customer/checkout")
        }

        // Update product stock
        product.stock -= item.quantity
        await product.save()

        // Add to order items
        orderItems.push({
          product: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          agency: product.agency._id,  // Include the agency
          condition: product.condition,  // Include the condition
        })
      } else {
        req.flash("error_msg", `Product not found for ID: ${item.productId}`)
        return res.redirect("/customer/checkout")
      }
    }

    const newOrder = new Order({
      user: req.session.user._id,
      orderNumber: "ORD" + Date.now().toString(),
      items: orderItems,
      shippingAddress: {
        firstName,
        lastName,
        address,
        city,
        state,
        zip,
        country,
        phone,
        email,
      },
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
    })

    await newOrder.save()

    // Send notifications to agencies
    const agencyIds = new Set()

    for (const item of orderItems) {
      if (item.agency) {
        agencyIds.add(item.agency.toString())  // Ensure agency ID is unique
      }
    }

    for (const agencyId of agencyIds) {
      const notification = new Notification({
        recipient: agencyId,
        title: `New Order ${newOrder.orderNumber}`,
        message: "You have received a new order.",
        type: "order",
        relatedId: newOrder._id,
        onModel: "Order",
      })

      await notification.save()
    }

    // Store the order in session for confirmation page
    req.session.lastOrder = {
      orderId: newOrder.orderNumber,
      orderDate: newOrder.createdAt,
      items: req.session.cart,
      shippingAddress: {
        firstName,
        lastName,
        address,
        city,
        state,
        zip,
        country,
        phone,
        email,
      },
      paymentMethod,
      subtotal,
      tax,
      shipping,
      total,
    }

    // Clear cart after order
    req.session.cart = []

    res.redirect("/customer/order-confirmation")
  } catch (error) {
    console.error("Error placing order:", error)
    req.flash("error_msg", "Failed to place order")
    res.redirect("/customer/checkout")
  }
})



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

//     const newOrder = new Order({
//       user: req.session.user._id,
//       orderNumber: "ORD" + Date.now().toString(),  // Ensure unique order number
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
//     });
    

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

// Order confirmation page
// router.get("/order-confirmation", isAuthenticated, isCustomer, (req, res) => {

//   console.log("Last order session data:", req.session.lastOrder);


//   if (!req.session.lastOrder) {
//     req.flash("error_msg", "No order found")
//     return res.redirect("/customer/browsing")
//   }

//   res.render("customer/order-confirmation", {
//     page: "customer-order-confirmation", // order-confirmation?
//     title: "Order Confirmation",
//     // order: req.session.lastOrder,
//     user: req.session.user,
//     orderId: newOrder.orderNumber
//   })
// })

router.get("/order-confirmation", isAuthenticated, isCustomer, (req, res) => {
  if (!req.session.lastOrder) {
    req.flash("error_msg", "No order found");
    return res.redirect("/customer/browsing");
  }

  console.log("Last order session data:", req.session.lastOrder); // Debugging

  res.render("customer/order-confirmation", {
    page: "customer-order-confirmation",
    title: "Order Confirmation",
    order: req.session.lastOrder, // ✅ Use session data instead of newOrder
    user: req.session.user,
    orderId: req.session.lastOrder.orderNumber, // ✅ Ensure orderId is from session
  });
});




// Customer dashboard
// router.get("/dashboard", isAuthenticated, isCustomer, async (req, res) => {
//   try {
//     const user = await User.findById(req.session.user._id)
//     const recentOrders = await Order.find({ user: req.session.user._id })
//       .sort({ createdAt: -1 })
//       .limit(5)
//     const notifications = await Notification.find({ user: req.session.user._id })
//       .sort({ createdAt: -1 })
//       .limit(5)

//     const stats = {
//       totalOrders: await Order.countDocuments({ user: req.session.user._id }),
//       totalSpent: await Order.aggregate([
//         { $match: { user: req.session.user._id } },
//         { $group: { _id: null, total: { $sum: "$total" } } }
//       ]).then(result => result[0]?.total || 0),
//       wishlistItems: user.wishlist ? user.wishlist.length : 0
//     }

    

//     res.render("customer/dashboard", {
//       page: "customer-dashboard",
//       title: "Customer Dashboard",
//       user: req.session.user,
//       recentOrders,
//       notifications,
//       stats
//     })
//   } catch (error) {
//     console.error("Error fetching dashboard data:", error)
//     req.flash("error_msg", "Failed to load dashboard")
//     res.redirect("/")
//   }
// })

router.get("/dashboard", isAuthenticated, isCustomer, async (req, res) => {
  try {
    // Fetch user and populate wishlist (if it contains product references)
    const user = await User.findById(req.session.user._id)
      .populate("wishlist") // Ensure "wishlist" is referenced correctly in schema
      .lean();

    if (!user) {
      req.flash("error_msg", "User not found");
      return res.redirect("/");
    }

    // Fetch related data in parallel
    const [recentOrders, notifications, totalOrders, totalSpentResult] = await Promise.all([
      Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(5).lean(),
      Notification.find({ user: user._id }).sort({ createdAt: -1 }).limit(5).lean(),
      Order.countDocuments({ user: user._id }),
      Order.aggregate([
        { $match: { user: user._id } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ])
    ]);

    // Calculate total spent
    const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].total : 0;

    // Extract wishlist properly
    const wishlist = user.wishlist || []; // Ensure wishlist is always an array

    // Dashboard stats
    const stats = {
      totalOrders,
      totalSpent,
      wishlistItems: wishlist.length
    };

    // Ensure addresses are properly passed
    const addresses = user.addresses || [];

    // Render the dashboard
    res.render("customer/dashboard", {
      page: "customer-dashboard",
      title: "Customer Dashboard",
      user, // Pass the full user object
      recentOrders,
      notifications,
      stats,
      addresses,
      wishlist // <-- Ensure wishlist is explicitly passed
    });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    req.flash("error_msg", "Failed to load dashboard");
    res.redirect("/");
  }
});



// router.get("/dashboard", isAuthenticated, isCustomer, async (req, res) => {
//   try {
//     const user = await User.findById(req.session.user._id).populate("addresses");
    
//     if (!user) {
//       req.flash("error_msg", "User not found");
//       return res.redirect("/");
//     }

//     // Fetch recent orders
//     const recentOrders = await Order.find({ user: user._id })
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .lean();

//     // Fetch notifications
//     const notifications = await Notification.find({ user: user._id })
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .lean();

//     // Calculate user statistics
//     const totalOrders = await Order.countDocuments({ user: user._id });
//     const totalSpentResult = await Order.aggregate([
//       { $match: { user: user._id } },
//       { $group: { _id: null, total: { $sum: "$total" } } }
//     ]);
//     const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].total : 0;

//     const stats = {
//       totalOrders,
//       totalSpent,
//       wishlistItems: user.wishlist ? user.wishlist.length : 0
//     };

//     // Ensure addresses is passed
//     const addresses = user.addresses || [];

//     res.render("customer/dashboard", {
//       page: "customer-dashboard",
//       title: "Customer Dashboard",
//       user: req.session.user, // You might need to pass `user` instead of `req.session.user`
//       recentOrders,
//       notifications,
//       stats,
//       addresses
//     });
//   } catch (error) {
//     console.error("Error fetching dashboard data:", error);
//     req.flash("error_msg", "Failed to load dashboard");
//     res.redirect("/");
//   }
// });


// Wishlist page
router.get("/wishlist", isAuthenticated, isCustomer, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).populate('wishlist')
    
    res.render("customer/wishlist", {
      page: "customer-wishlist",
      title: "My Wishlist",
      user: req.session.user,
      wishlistItems: user.wishlist || []
    })
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    req.flash("error_msg", "Failed to load wishlist")
    res.redirect("/customer/dashboard")
  }
})

// Add to wishlist
router.post("/wishlist/add/:productId", isAuthenticated, isCustomer, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id)
    const productId = req.params.productId

    if (!user.wishlist) {
      user.wishlist = []
    }

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId)
      await user.save()
      req.flash("success_msg", "Product added to wishlist")
    } else {
      req.flash("info_msg", "Product already in wishlist")
    }

    res.redirect("back")
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    req.flash("error_msg", "Failed to add product to wishlist")
    res.redirect("back")
  }
})

// Remove from wishlist
router.post("/wishlist/remove/:productId", isAuthenticated, isCustomer, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id)
    const productId = req.params.productId

    if (user.wishlist) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId)
      await user.save()
      req.flash("success_msg", "Product removed from wishlist")
    }

    res.redirect("back")
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    req.flash("error_msg", "Failed to remove product from wishlist")
    res.redirect("back")
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


// Add this route to handle the cash on delivery checkout
router.post('/checkout/cash-on-delivery', isAuthenticated, isCustomer, async (req, res) => {
  try {

    const userId = req.session.user._id;
    console.log(`Working :${userId}`);
    const cart = await cartController.getCart(userId);
    
    if (!cart || cart.items.length === 0) {
      console.log("❌ Cart is empty, redirecting...");
      req.flash('error_msg', 'Your cart is empty');
      return res.redirect('/customer/cart');
    }
    
    const { 
      firstName, lastName, address, city, 
      state, zip, country, phone
    } = req.body;
    
    // Calculate order totals
    const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10; // 10% tax
    const shipping = 50; // Fixed shipping cost
    const total = subtotal + tax + shipping;
    
    // Create order items and update product stock
    const orderItems = [];
    
    for (const item of cart.items) {
      // Get product to update stock and agency info
      const product = await Product.findById(item.product);
      
      if (!product) {
        console.log(`❌ Product ${item.name} is unavailable, redirecting...`);
        req.flash('error_msg', `Product ${item.name} is no longer available`);
        return res.redirect('/customer/checkout');
      }
      
      // Check if enough stock
      if (product.stock < item.quantity) {
        console.log(`❌ Not enough stock for ${item.name}, redirecting...`);
        req.flash('error_msg', `Not enough stock for ${item.name}. Available: ${product.stock}`);
        return res.redirect('/customer/checkout');
      }
      
      // Update product stock
      product.stock -= item.quantity;
      await product.save();
      
      // Add to order items with agency information
      orderItems.push({
        product: item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        agency: product.agency // Store agency ID for filtering on agency side
      });
    }
    
    // Create new order
    const orderId = 'ORD' + Date.now().toString().substring(7);
    
    const newOrder = new Order({
      orderId: orderId,
      user: userId,
      items: orderItems,
      shippingAddress: {
        firstName,
        lastName,
        address,
        city,
        state,
        zip,
        country,
        phone
      },
      paymentMethod: 'Cash on Delivery',
      subtotal,
      tax,
      shipping,
      totalAmount: total,
      status: 'pending',
      timeline: [
        {
          status: 'order-placed',
          timestamp: Date.now(),
          note: 'Order placed successfully with Cash on Delivery'
        }
      ]
    });
    
    await newOrder.save();
    
    // Create notifications for agencies
    const agencyIds = [...new Set(orderItems.map(item => item.agency.toString()))];
    
    for (const agencyId of agencyIds) {
      const agencyItems = orderItems.filter(item => item.agency.toString() === agencyId);
      
      const notification = new Notification({
        recipient: agencyId,
        recipientType: 'agency',
        type: 'new-order',
        title: 'New Order Received',
        message: `You have received a new order (#${orderId}) with ${agencyItems.length} product(s)`,
        data: {
          orderId: orderId,
          orderObjectId: newOrder._id
        },
        read: false
      });
      
      await notification.save();
    }
    
    // Clear the cart after successful order
    await cartController.clearCart(userId);
    
    // Store order details in session for confirmation page
    req.session.lastOrder = {
      orderId: newOrder.orderId,
      id: newOrder._id,
      createdAt: newOrder.createdAt,
      items: orderItems,
      shippingAddress: {
        firstName,
        lastName,
        address,
        city,
        state,
        zip,
        country,
        phone
      },
      subtotal,
      tax,
      shipping,
      total,
      paymentMethod: 'Cash on Delivery'
    };
    console.log("✅ Order placed, redirecting to confirmation..."); 
    res.redirect('/customer/order-confirmation');
  } catch (error) {
    console.error('Error placing order:', error);
    req.flash('error_msg', 'Failed to place order');
    res.redirect('/customer/checkout');
  }
});

// Support page
router.get("/support", (req, res) => {
  res.render("customer/support", {
    page: "customer-support",
    title: "Customer Support",
    user: req.session.user || null,
  })
})

// Settings page
router.get("/settings", isAuthenticated, isCustomer, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id)
    
    res.render("customer/settings", {
      page: "customer-settings",
      title: "Account Settings",
      user: req.session.user
    })
  } catch (error) {
    console.error("Error fetching settings data:", error)
    req.flash("error_msg", "Failed to load settings page")
    res.redirect("/customer/dashboard")
  }
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
