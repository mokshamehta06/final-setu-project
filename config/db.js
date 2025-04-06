const mongoose = require("mongoose")

// Default MongoDB connection string and database name
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/setu_ecommerce"
const MONGODB_DB = process.env.MONGODB_DB || "setu_ecommerce"

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log(`MongoDB Connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB

