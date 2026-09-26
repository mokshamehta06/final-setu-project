const mongoose = require("mongoose")

// Default MongoDB connection string and database name
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/setu_ecommerce"
const MONGODB_DB = process.env.MONGODB_DB || "setu_ecommerce"

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })

    console.log(`MongoDB Connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error(`\n❌ Error connecting to MongoDB: ${error.message}`)
    console.error(`💡 Current MONGODB_URI: ${MONGODB_URI}`)
    console.error("👉 Please ensure MongoDB is running or provide a valid MONGODB_URI (e.g., MongoDB Atlas) in your .env file.\n")
    throw error
  }
}

module.exports = connectDB

