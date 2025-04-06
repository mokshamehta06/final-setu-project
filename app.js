const express = require("express")
const mongoose = require("mongoose")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const path = require("path")
const bcrypt = require("bcryptjs")
const flash = require("connect-flash")
const multer = require("multer")
const fs = require("fs")
require('dotenv').config();

// Import database connection
const connectDB = require("./config/db")


// Import routes
const authRoutes = require("./routes/auth")
const customerRoutes = require("./routes/customer")
const agencyRoutes = require("./routes/agency")
const apiRoutes = require("./routes/api")

// Import models
const User = require("./models/user")
const Product = require("./models/product")
const Order = require("./models/order")
const Notification = require("./models/notification")

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 3000

// MongoDB connection settings with defaults
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/setu_ecommerce"
const MONGODB_DB = process.env.MONGODB_DB || "setu_ecommerce"

// Connect to MongoD

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

//B


// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

// Set up EJS as the view engine
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "setu-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGODB_URI,
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
    },
  }),
)

// Flash messages
app.use(flash())

// Global variables middleware
app.use((req, res, next) => {
  res.locals.user = req.session.user || null
  res.locals.success_msg = req.flash("success_msg")
  res.locals.error_msg = req.flash("error_msg")
  next()
})

// Routes - IMPORTANT: Order matters here
app.use("/api", apiRoutes)
app.use("/agency", agencyRoutes)
app.use("/customer", customerRoutes)
app.use("/auth", authRoutes)

// Direct login routes for customer and agency
app.get("/customer/login", (req, res) => {
  res.render("auth/login", {
    title: "Customer Login",
    role: "customer",
    redirect: "/customer/browsing",
  })
})

app.get("/agency/login", (req, res) => {
  res.render("auth/login", {
    title: "Agency Login",
    role: "agency",
    redirect: "/agency/dashboard",
  })
})

// Direct register routes for customer and agency
app.get("/customer/register", (req, res) => {
  res.render("auth/register", {
    title: "Customer Registration",
    role: "customer",
  })
})

app.get("/agency/register", (req, res) => {
  res.render("auth/agency-register", {
    title: "Agency Registration",
    role: "agency",
  })
})

// Home route
app.get("/", async (req, res) => {
  try {
    // Get featured products
    const products = await Product.find({ stock: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(4)

    res.render("index", {
      page: "home",
      title: "SETU - E-commerce Platform",
      products,
    })
  } catch (error) {
    console.error("Error fetching products for homepage:", error)
    res.render("index", {
      page: "home",
      title: "SETU - E-commerce Platform",
    })
  }
})

// About route
app.get("/about", (req, res) => {
  res.render("index", {
    page: "about",
    title: "About SETU",
  })
})

// Solutions route
app.get("/solutions", (req, res) => {
  res.render("index", {
    page: "solutions",
    title: "SETU Solutions",
  })
})

// Support route
app.get("/support", (req, res) => {
  res.render("index", {
    page: "support",
    title: "SETU Support",
  })
})

// Contact route
app.get("/contact", (req, res) => {
  res.render("index", {
    page: "contact",
    title: "Contact SETU",
  })
})

// Terms route
app.get("/terms", (req, res) => {
  res.render("index", {
    page: "terms",
    title: "Terms of Service",
  })
})

// Privacy route
app.get("/privacy", (req, res) => {
  res.render("index", {
    page: "privacy",
    title: "Privacy Policy",
  })
})

// Initialize default products if none exist
const initializeProducts = async () => {
  try {
    const count = await Product.countDocuments()
    if (count === 0) {
      // First, create an agency user if none exists
      let agencyUser = await User.findOne({ role: "agency" })

      if (!agencyUser) {
        agencyUser = new User({
          name: "Demo Agency",
          email: "agency@example.com",
          password: await bcrypt.hash("password123", 10),
          role: "agency",
          isVerified: true,
        })

        await agencyUser.save()
        console.log("Default agency user created")
      }

      // const defaultProducts = [
      //   {
      //     name: "Seized Laptop",
      //     description: "Dell XPS 15, 16GB RAM, 512GB SSD, excellent condition. Seized from a customs operation.",
      //     category: "laptops",
      //     condition: "excellent",
      //     price: 850,
      //     image: "/api/placeholder/300/200",
      //     stock: 1,
      //     seizureProof: true,
      //     source: "customs",
      //     agency: agencyUser._id,
      //   },
      //   {
      //     name: "Refurbished Mobile",
      //     description: "iPhone 12, 128GB, excellent condition. Refurbished after being seized in a tax operation.",
      //     category: "mobile",
      //     condition: "good",
      //     price: 340,
      //     image: "/api/placeholder/300/200",
      //     stock: 3,
      //     seizureProof: true,
      //     source: "tax-authority",
      //     agency: agencyUser._id,
      //   },
      //   {
      //     name: "Seized Camera",
      //     description: "Canon EOS 5D Mark IV, 30.4MP, with 24-70mm lens. Seized from a bankruptcy auction.",
      //     category: "cameras",
      //     condition: "good",
      //     price: 520,
      //     image: "/api/placeholder/300/200",
      //     stock: 1,
      //     seizureProof: true,
      //     source: "bankruptcy",
      //     agency: agencyUser._id,
      //   },
      //   {
      //     name: "Wireless Headphones",
      //     description: "High-quality wireless headphones with noise cancellation",
      //     category: "electronics",
      //     condition: "excellent",
      //     price: 79.99,
      //     image: "/api/placeholder/300/200",
      //     stock: 5,
      //     isNew: true,
      //     agency: agencyUser._id,
      //   },
      //   {
      //     name: "Smart Watch",
      //     description: "Feature-rich smartwatch with health tracking",
      //     category: "electronics",
      //     condition: "excellent",
      //     price: 249.99,
      //     image: "/api/placeholder/300/200",
      //     stock: 2,
      //     isNew: true,
      //     agency: agencyUser._id,
      //   },
      //   {
      //     name: "Running Shoes",
      //     description: "Comfortable running shoes for all terrains",
      //     category: "clothing",
      //     condition: "good",
      //     price: 129.99,
      //     image: "/api/placeholder/300/200",
      //     stock: 3,
      //     isNew: false,
      //     agency: agencyUser._id,
      //   },
      //   {
      //     name: "Laptop Backpack",
      //     description: "Durable backpack with laptop compartment",
      //     category: "other",
      //     condition: "excellent",
      //     price: 59.99,
      //     image: "/api/placeholder/300/200",
      //     stock: 10,
      //     isNew: false,
      //     agency: agencyUser._id,
      //   },
      //   {
      //     name: "Coffee Maker",
      //     description: "Programmable coffee maker for perfect brew",
      //     category: "home",
      //     condition: "good",
      //     price: 89.99,
      //     image: "/api/placeholder/300/200",
      //     stock: 4,
      //     isNew: false,
      //     agency: agencyUser._id,
      //   },
      // ]

      // await Product.insertMany(defaultProducts)
      // console.log("Default products initialized")

      // Create some default orders
      const customerUser =
        (await User.findOne({ role: "customer" })) ||
        (await User.create({
          name: "Demo Customer",
          email: "customer@example.com",
          password: await bcrypt.hash("password123", 10),
          role: "customer",
        }))

      const products = await Product.find().limit(3)

      if (products.length > 0) {
        const order1 = new Order({
          user: customerUser._id,
          items: [
            {
              product: products[0]._id,
              name: products[0].name,
              quantity: 1,
              price: products[0].price,
              image: products[0].image,
            },
          ],
          subtotal: products[0].price,
          tax: products[0].price * 0.1,
          shipping: 5,
          totalAmount: products[0].price + products[0].price * 0.1 + 5,
          status: "pending",
          shippingAddress: {
            firstName: "Demo",
            lastName: "Customer",
            address: "123 Main St",
            city: "Anytown",
            state: "State",
            zip: "12345",
            country: "Country",
            phone: "555-123-4567",
            email: "customer@example.com",
          },
          paymentMethod: "credit-card",
          paymentStatus: "completed",
          timeline: [
            {
              status: "order-placed",
              note: "Order placed successfully",
            },
          ],
        })

        const order2 = new Order({
          user: customerUser._id,
          items: [
            {
              product: products[1]._id,
              name: products[1].name,
              quantity: 1,
              price: products[1].price,
              image: products[1].image,
            },
          ],
          subtotal: products[1].price,
          tax: products[1].price * 0.1,
          shipping: 5,
          totalAmount: products[1].price + products[1].price * 0.1 + 5,
          status: "shipped",
          shippingAddress: {
            firstName: "Demo",
            lastName: "Customer",
            address: "456 Oak St",
            city: "Othertown",
            state: "State",
            zip: "67890",
            country: "Country",
            phone: "555-123-4567",
            email: "customer@example.com",
          },
          paymentMethod: "credit-card",
          paymentStatus: "completed",
          timeline: [
            {
              status: "order-placed",
              note: "Order placed successfully",
            },
            {
              status: "processing",
              note: "Order is being processed",
            },
            {
              status: "shipped",
              note: "Order has been shipped",
            },
          ],
        })

        const order3 = new Order({
          user: customerUser._id,
          items: [
            {
              product: products[2]._id,
              name: products[2].name,
              quantity: 1,
              price: products[2].price,
              image: products[2].image,
            },
          ],
          subtotal: products[2].price,
          tax: products[2].price * 0.1,
          shipping: 5,
          totalAmount: products[2].price + products[2].price * 0.1 + 5,
          status: "delivered",
          shippingAddress: {
            firstName: "Demo",
            lastName: "Customer",
            address: "789 Pine St",
            city: "Sometown",
            state: "State",
            zip: "13579",
            country: "Country",
            phone: "555-123-4567",
            email: "customer@example.com",
          },
          paymentMethod: "credit-card",
          paymentStatus: "completed",
          timeline: [
            {
              status: "order-placed",
              note: "Order placed successfully",
            },
            {
              status: "processing",
              note: "Order is being processed",
            },
            {
              status: "shipped",
              note: "Order has been shipped",
            },
            {
              status: "delivered",
              note: "Order has been delivered",
            },
          ],
        })

        await Promise.all([order1.save(), order2.save(), order3.save()])
        console.log("Default orders initialized")

        // Create notifications
        const notification1 = new Notification({
          recipient: agencyUser._id,
          title: `New Order ${order1.orderId}`,
          message: "You have received a new order",
          type: "order",
          relatedId: order1._id,
          onModel: "Order",
        })

        const notification2 = new Notification({
          recipient: agencyUser._id,
          title: "Your license verification completed",
          message: "Your agency license has been verified successfully",
          type: "verification",
        })

        const notification3 = new Notification({
          recipient: agencyUser._id,
          title: "Your profile was updated successfully",
          message: "Your agency profile information has been updated",
          type: "system",
        })

        await Promise.all([notification1.save(), notification2.save(), notification3.save()])
        console.log("Default notifications initialized")
      }
    }
  } catch (error) {
    console.error("Error initializing products:", error)
    console.log("Continuing without initializing products.")
  }
}

// Create uploads directory if it doesn't exist
const createUploadsDirectory = () => {
  const dirs = ["public/uploads", "public/uploads/products", "public/uploads/documents"]

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`Created directory: ${dir}`)
    }
  })
}

// Start the server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)
  try {
    createUploadsDirectory()
    await initializeProducts()
  } catch (error) {
    console.error("Error during startup:", error)
  }
})

