const { MongoClient } = require('mongodb');

// Default MongoDB connection string and database name
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/setu_ecommerce';
const MONGODB_DB = process.env.MONGODB_DB || 'setu_ecommerce';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  // If we already have a connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // Create a new connection
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(MONGODB_DB);

    // Cache the connection
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Unable to connect to database');
  }
}

















































































































































































module.exports = { connectToDatabase };