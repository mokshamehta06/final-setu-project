const express = require("express")
const router = express.Router()
const { isAuthenticated, isAgency } = require("../middleware/auth")
const User = require("../models/user")
const Product = require("../models/product")
const Order = require("../models/order")
const Notification = require("../models/notification")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Set up multer for product image uploads
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/products")
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})

const upload = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)

    if (extname && mimetype) {
      return cb(null, true)
    } else {
      cb(new Error("Only image files are allowed!"))
    }
  },
})

// Set up multer for document uploads
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create directory if it doesn't exist
    const dir = "public/uploads/documents"
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})

const documentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx|jpg|jpeg|png/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

    if (extname) {
      return cb(null, true)
    } else {
      cb(new Error("Only PDF, DOC, DOCX, JPG, JPEG, or PNG files are allowed!"))
    }
  },
})

// Agency dashboard
router.get("/dashboard", isAuthenticated, isAgency, async (req, res) => {
  try {
    console.log("Session Data:", req.session);
console.log("User Data:", req.session.user);
console.log("User ID:", req.session.user ? req.session.user._id : "No user ID found");

    const user = await User.findById(req.session.user._id)

    // Get product count
    const productCount = await Product.countDocuments({ agency: req.session.user._id })

    // Get recent products
    const recentProducts = await Product.find({ agency: req.session.user._id }).sort({ createdAt: -1 }).limit(6)

    // Get agency products IDs
    const productIds = recentProducts.map((product) => product._id)

    // Get orders containing agency products
    const orders = await Order.find({
      "items.product": { $in: productIds },
    }).sort({ createdAt: -1 })

    // Get order count
    const orderCount = orders.length

    // Get recent orders
    const recentOrders = orders.slice(0, 3)

    // Calculate revenue
    const revenue = orders.reduce((total, order) => {
      // Filter order items to only include this agency's products
      const agencyItems = order.items.filter((item) => productIds.includes(item.product))

      // Sum up the revenue from these items
      const orderRevenue = agencyItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

      return total + orderRevenue
    }, 0)

    // Get notification count
    const notificationCount = await Notification.countDocuments({
      recipient: req.session.user._id,
      read: false,
    })

    res.render("agency/dashboard", {
      page: "dashboard",
      title: "Agency Dashboard",
      user: user, // Pass the full user object with isVerified property
      productCount,
      orderCount,
      revenue,
      recentProducts,
      recentOrders,
      notificationCount,
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    req.flash("error_msg", "Failed to load dashboard")
    res.redirect("/")
  }
})

// Products management
router.get("/products", isAuthenticated, isAgency, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id)
    const products = await Product.find({ agency: req.session.user._id }).sort({ createdAt: -1 })

    // Get notification count
    const notificationCount = await Notification.countDocuments({
      recipient: req.session.user._id,
      read: false,
    })

    res.render("agency/products", {
      page: "products",
      title: "Manage Products",
      products,
      user: user, // Pass the full user object
      notificationCount,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    req.flash("error_msg", "Failed to load products")
    res.redirect("/agency/dashboard")
  }
})

// Add product form
router.get("/products/add", isAuthenticated, isAgency, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id)

    // Check if agency is verified
    if (!user.isVerified) {
      req.flash("error_msg", "Your agency needs to be verified before adding products")
      return res.redirect("/agency/verification")
    }

    res.render("agency/add-product", {
      page: "products",
      title: "Add New Product",
      user: user,
    })
  } catch (error) {
    console.error("Error loading add product page:", error)
    req.flash("error_msg", "Failed to load add product page")
    res.redirect("/agency/products")
  }
})

// Add product process
router.post("/products/add", isAuthenticated, isAgency, upload.single("image"), async (req, res) => {
  try {
    console.log('product-add-route-hit-on-agency-side');

    // Check if agency is verified
    const user = await User.findById(req.session.user._id)
    if (!user.isVerified) {
      req.flash("error_msg", "Your agency needs to be verified before adding products")
      return res.redirect("/agency/verification")
    }

    const { name, description, category, condition, price, stock, seizureProof, source } = req.body

    // Validation
    if (!name || !description || !category || !price) {
      req.flash("error_msg", "Please fill in all required fields")
      return res.redirect("/agency/products/add")
    }

    // Create new product
    const newProduct = new Product({
      name,
      description,
      category,
      condition,
      price: Number.parseFloat(price),
      stock: Number.parseInt(stock) || 1,
      agency: req.session.user._id, // req.session.user._id
      seizureProof: seizureProof === "on",
      source: source || "other",
      isNew: true,
    })

    // If image was uploaded, set the image path
    if (req.file) {
      newProduct.image = `/uploads/products/${req.file.filename}`
    }

    await newProduct.save()

    // Create notification for admin
    const adminUsers = await User.find({ role: "admin" })
    if (adminUsers.length > 0) {
      const notification = new Notification({
        recipient: adminUsers[0]._id,
        title: "New Product Added",
        message: `${req.session.user.name} added a new product: ${name}`,
        type: "product",
        relatedId: newProduct._id,
        onModel: "Product",
      })

      await notification.save()
    }

    req.flash("success_msg", "Product added successfully")
    res.redirect("/agency/products")
  } catch (error) {
    console.error("Error adding product:", error)
    req.flash("error_msg", "Failed to add product")
    res.redirect("/agency/products/add")
  }
})

// Edit product form
router.get("/products/edit/:id", isAuthenticated, isAgency, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      agency: req.session.user._id,
    })

    if (!product) {
      req.flash("error_msg", "Product not found")
      return res.redirect("/agency/products")
    }

    res.render("agency/edit-product", {
      page: "products",
      title: "Edit Product",
      product,
      user: req.session.user,
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    req.flash("error_msg", "Failed to load product")
    res.redirect("/agency/products")
  }
})

// Update product
router.post("/products/edit/:id", isAuthenticated, isAgency, upload.single("image"), async (req, res) => {
  try {
    const { name, description, category, condition, price, stock, seizureProof, source } = req.body

    // Validation
    if (!name || !description || !category || !price) {
      req.flash("error_msg", "Please fill in all required fields")
      return res.redirect(`/agency/products/edit/${req.params.id}`)
    }

    // Find product
    const product = await Product.findOne({
      _id: req.params.id,
      agency: req.session.user._id,
    })

    if (!product) {
      req.flash("error_msg", "Product not found")
      return res.redirect("/agency/products")
    }

    // Update product
    product.name = name
    product.description = description
    product.category = category
    product.condition = condition
    product.price = Number.parseFloat(price)
    product.stock = Number.parseInt(stock) || 1
    product.seizureProof = seizureProof === "on"
    product.source = source || "other"

    // If image was uploaded, update the image path
    if (req.file) {
      // Delete old image if it exists and is not the default
      if (product.image && product.image !== "/api/placeholder/300/200" && fs.existsSync(`public${product.image}`)) {
        fs.unlinkSync(`public${product.image}`)
      }

      product.image = `/uploads/products/${req.file.filename}`
    }

    await product.save()

    req.flash("success_msg", "Product updated successfully")
    res.redirect("/agency/products")
  } catch (error) {
    console.error("Error updating product:", error)
    req.flash("error_msg", "Failed to update product")
    res.redirect(`/agency/products/edit/${req.params.id}`)
  }
})

// Delete product
router.post("/products/delete/:id", isAuthenticated, isAgency, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      agency: req.session.user._id,
    })

    if (!product) {
      req.flash("error_msg", "Product not found")
      return res.redirect("/agency/products")
    }

    // Delete product image if it's not the default
    if (product.image && product.image !== "/api/placeholder/300/200" && fs.existsSync(`public${product.image}`)) {
      fs.unlinkSync(`public${product.image}`)
    }

    await Product.deleteOne({ _id: req.params.id })

    req.flash("success_msg", "Product deleted successfully")
    res.redirect("/agency/products")
  } catch (error) {
    console.error("Error deleting product:", error)
    req.flash("error_msg", "Failed to delete product")
    res.redirect("/agency/products")
  }
})

// Orders management
router.get("/orders", isAuthenticated, isAgency, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id)
    // Find orders that contain products from this agency
    const agencyProducts = await Product.find({ agency: req.session.user._id })
    const productIds = agencyProducts.map((product) => product._id)

    const orders = await Order.find({
      "items.product": { $in: productIds },
    }).sort({ createdAt: -1 })

    // Get notification count
    const notificationCount = await Notification.countDocuments({
      recipient: req.session.user._id,
      read: false,
    })

    res.render("agency/orders", {
      page: "orders",
      title: "Manage Orders",
      orders,
      user: user,
      notificationCount,
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    req.flash("error_msg", "Failed to load orders")
    res.redirect("/agency/dashboard")
  }
})

// Order details
router.get("/orders/:id", isAuthenticated, isAgency, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id)
    const order = await Order.findById(req.params.id).populate("user").populate("items.product")

    if (!order) {
      req.flash("error_msg", "Order not found")
      return res.redirect("/agency/orders")
    }

    // Check if order contains products from this agency
    const agencyProducts = await Product.find({ agency: req.session.user._id })
    const productIds = agencyProducts.map((product) => product._id.toString())

    const agencyItems = order.items.filter((item) => item.product && productIds.includes(item.product._id.toString()))

    if (agencyItems.length === 0) {
      req.flash("error_msg", "No products from your agency in this order")
      return res.redirect("/agency/orders")
    }

    // Get notification count
    const notificationCount = await Notification.countDocuments({
      recipient: req.session.user._id,
      read: false,
    })

    res.render("agency/order-details", {
      page: "orders",
      title: `Order #${order.orderId}`,
      order,
      agencyItems,
      user: user,
      notificationCount,
    })
  } catch (error) {
    console.error("Error fetching order details:", error)
    req.flash("error_msg", "Failed to load order details")
    res.redirect("/agency/orders")
  }
})

// Update order status
router.post("/orders/:id/status", isAuthenticated, isAgency, async (req, res) => {
  try {
    const { status, note } = req.body

    const order = await Order.findById(req.params.id)

    if (!order) {
      req.flash("error_msg", "Order not found")
      return res.redirect("/agency/orders")
    }

    // Update order status
    order.status = status

    // Add timeline entry
    order.timeline.push({
      status: status,
      timestamp: Date.now(),
      note: note || `Order status updated to ${status}`,
    })

    await order.save()

    // Create notification for customer
    const notification = new Notification({
      recipient: order.user,
      title: `Order ${order.orderId} Updated`,
      message: `Your order status has been updated to: ${status}`,
      type: "order",
      relatedId: order._id,
      onModel: "Order",
    })

    await notification.save()

    req.flash("success_msg", "Order status updated successfully")
    res.redirect(`/agency/orders/${order._id}`)
  } catch (error) {
    console.error("Error updating order status:", error)
    req.flash("error_msg", "Failed to update order status")
    res.redirect(`/agency/orders/${req.params.id}`)
  }
})

// Verification page
router.get("/verification", isAuthenticated, isAgency, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id)

    // Get notification count
    const notificationCount = await Notification.countDocuments({
      recipient: req.session.user._id,
      read: false,
    })

    res.render("agency/verification", {
      page: "verification",
      title: "Agency Verification",
      user: user, // Pass the full user object with documents
      notificationCount,
    })
  } catch (error) {
    console.error("Error fetching verification data:", error)
    req.flash("error_msg", "Failed to load verification page")
    res.redirect("/agency/dashboard")
  }
})

// Upload verification document
router.post("/verification/upload", isAuthenticated, isAgency, documentUpload.single("document"), async (req, res) => {
  try {
    const { documentType } = req.body

    if (!req.file) {
      req.flash("error_msg", "Please select a file to upload")
      return res.redirect("/agency/verification")
    }

    // Validate document type
    const validTypes = ["businessRegistration", "taxId", "identityProof", "addressProof"]
    if (!validTypes.includes(documentType)) {
      req.flash("error_msg", "Invalid document type")
      return res.redirect("/agency/verification")
    }

    // Get user
    const user = await User.findById(req.session.user._id)

    // Initialize documents object if it doesn't exist
    if (!user.documents) {
      user.documents = {}
    }

    // Set document path and status
    user.documents[documentType] = {
      path: `/uploads/documents/${req.file.filename}`,
      uploadedAt: new Date(),
      status: "pending"
    }

    await user.save()

    // Create notification for admin
    const adminUsers = await User.find({ role: "admin" })
    if (adminUsers.length > 0) {
      const notification = new Notification({
        recipient: adminUsers[0]._id,
        title: "New Document Uploaded",
        message: `${user.name} uploaded a new document for verification: ${documentType}`,
        type: "verification",
        relatedId: user._id,
        onModel: "User",
      })

      await notification.save()
    }

    req.flash("success_msg", "Document uploaded successfully and pending approval")
    res.redirect("/agency/verification")
  } catch (error) {
    console.error("Error uploading document:", error)
    req.flash("error_msg", "Failed to upload document")
    res.redirect("/agency/verification")
  }
})

// Settings page
router.get("/settings", isAuthenticated, isAgency, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id)

    // Get notification count
    const notificationCount = await Notification.countDocuments({
      recipient: req.session.user._id,
      read: false,
    })

    res.render("agency/settings", {
      page: "settings",
      title: "Agency Settings",
      user: user,
      notificationCount,
    })
  } catch (error) {
    console.error("Error fetching settings data:", error)
    req.flash("error_msg", "Failed to load settings page")
    res.redirect("/agency/dashboard")
  }
})

// Update agency profile
router.post("/settings/profile", isAuthenticated, isAgency, async (req, res) => {
  try {
    const { name, email, phone, agencyName, businessType, businessDescription, website } = req.body

    // Update user
    await User.findByIdAndUpdate(req.session.user._id, {
      name,
      email,
      phone,
      agencyDetails: {
        agencyName,
        businessType,
        businessDescription,
        website,
      },
    })

    // Update session data
    req.session.user.name = name
    req.session.user.email = email

    req.flash("success_msg", "Profile updated successfully")
    res.redirect("/agency/settings")
  } catch (error) {
    console.error("Error updating profile:", error)
    req.flash("error_msg", "Failed to update profile")
    res.redirect("/agency/settings")
  }
})

// Update password
router.post("/settings/password", isAuthenticated, isAgency, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body

    // Validation
    if (newPassword !== confirmPassword) {
      req.flash("error_msg", "New passwords do not match")
      return res.redirect("/agency/settings")
    }

    if (newPassword.length < 6) {
      req.flash("error_msg", "Password should be at least 6 characters")
      return res.redirect("/agency/settings")
    }

    // Get user
    const user = await User.findById(req.session.user._id)

    // Check current password
    const isMatch = await user.comparePassword(currentPassword)

    if (!isMatch) {
      req.flash("error_msg", "Current password is incorrect")
      return res.redirect("/agency/settings")
    }

    // Update password
    user.password = newPassword
    await user.save()

    req.flash("success_msg", "Password updated successfully")
    res.redirect("/agency/settings")
  } catch (error) {
    console.error("Error updating password:", error)
    req.flash("error_msg", "Failed to update password")
    res.redirect("/agency/settings")
  }
})

// Support page
router.get("/support", isAuthenticated, isAgency, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id)

    // Get notification count
    const notificationCount = await Notification.countDocuments({
      recipient: req.session.user._id,
      read: false,
    })

    res.render("agency/support", {
      page: "support",
      title: "Agency Support",
      user: user,
      notificationCount,
    })
  } catch (error) {
    console.error("Error fetching support data:", error)
    req.flash("error_msg", "Failed to load support page")
    res.redirect("/agency/dashboard")
  }
})

// Agency orders route
router.get('/orders', isAuthenticated, isAgency, async (req, res) => {
  try {
    const agencyId = req.session.user._id;

    // Find all orders that contain products from this agency
    const orders = await Order.aggregate([
      {
        $match: {
          'items.agency': mongoose.Types.ObjectId(agencyId)
        }
      },
      {
        $addFields: {
          // Filter items to only include those from this agency
          agencyItems: {
            $filter: {
              input: '$items',
              as: 'item',
              cond: { $eq: ['$$item.agency', mongoose.Types.ObjectId(agencyId)] }
            }
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    // Get customer details for each order
    for (let order of orders) {
      order.customer = await User.findById(order.user, 'name email');
    }

    res.render('agency/orders', {
      title: 'Agency Orders',
      page: 'orders',
      orders
    });
  } catch (error) {
    console.error('Error loading agency orders:', error);
    req.flash('error_msg', 'Failed to load orders');
    res.redirect('/agency/dashboard');
  }
});

// Agency order details route
router.get('/orders/:id', isAuthenticated, isAgency, async (req, res) => {
  try {
    const agencyId = req.session.user._id;
    const orderId = req.params.id;

    // Find the order and filter items to only show this agency's products
    const order = await Order.findById(orderId);

    if (!order) {
      req.flash('error_msg', 'Order not found');
      return res.redirect('/agency/orders');
    }

    // Check if this order contains any products from this agency
    const agencyItems = order.items.filter(item =>
      item.agency && item.agency.toString() === agencyId.toString()
    );

    if (agencyItems.length === 0) {
      req.flash('error_msg', 'You do not have permission to view this order');
      return res.redirect('/agency/orders');
    }

    // Get customer details
    const customer = await User.findById(order.user, 'name email phone');

    // Create a modified order object with only this agency's items
    const agencyOrder = {
      ...order.toObject(),
      items: agencyItems,
      customer
    };

    res.render('agency/order-details', {
      title: `Order #${order.orderId}`,
      page: 'orders',
      order: agencyOrder
    });
  } catch (error) {
    console.error('Error loading order details:', error);
    req.flash('error_msg', 'Failed to load order details');
    res.redirect('/agency/orders');
  }
});

// Update order status route
router.post('/orders/:id/update-status', isAuthenticated, isAgency, async (req, res) => {
  try {
    const { status, note } = req.body;
    const orderId = req.params.id;
    const agencyId = req.session.user._id;

    const order = await Order.findById(orderId);

    if (!order) {
      req.flash('error_msg', 'Order not found');
      return res.redirect('/agency/orders');
    }

    // Check if this order contains any products from this agency
    const hasAgencyItems = order.items.some(item =>
      item.agency && item.agency.toString() === agencyId.toString()
    );

    if (!hasAgencyItems) {
      req.flash('error_msg', 'You do not have permission to update this order');
      return res.redirect('/agency/orders');
    }

    // Update order status
    order.status = status;

    // Add to timeline
    order.timeline.push({
      status,
      timestamp: Date.now(),
      note: note || `Order status updated to ${status}`
    });

    await order.save();

    // Create notification for customer
    const notification = new Notification({
      recipient: order.user,
      recipientType: 'customer',
      type: 'order-update',
      title: 'Order Status Updated',
      message: `Your order #${order.orderId} status has been updated to ${status}`,
      data: {
        orderId: order.orderId,
        orderObjectId: order._id
      },
      read: false
    });

    await notification.save();

    req.flash('success_msg', 'Order status updated successfully');
    res.redirect(`/agency/orders/${orderId}`);
  } catch (error) {
    console.error('Error updating order status:', error);
    req.flash('error_msg', 'Failed to update order status');
    res.redirect('/agency/orders');
  }
});

// Submit support request
router.post("/support", isAuthenticated, isAgency, async (req, res) => {
  try {
    const { subject, message } = req.body

    // In a real app, this would save the support request to the database
    // and potentially send an email notification

    req.flash("success_msg", "Your support request has been submitted")
    res.redirect("/agency/support")
  } catch (error) {
    console.error("Error submitting support request:", error)
    req.flash("error_msg", "Failed to submit support request")
    res.redirect("/agency/support")
  }
})

// Get notifications
router.get("/notifications", isAuthenticated, isAgency, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.session.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(10)

    res.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({ error: "Failed to fetch notifications" })
  }
})

// Mark all notifications as read
router.post("/notifications/read-all", isAuthenticated, isAgency, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.session.user._id, read: false }, { $set: { read: true } })

    res.json({ success: true })
  } catch (error) {
    console.error("Error marking notifications as read:", error)
    res.status(500).json({ error: "Failed to mark notifications as read" })
  }
})

module.exports = router

