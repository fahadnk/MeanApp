// Import mongoose for interacting with MongoDB
import mongoose from "mongoose";

// Import configuration values (like mongoURI) from env.js
import config from "./env.js";

class Database {
  constructor() {
    // If a Database instance already exists, return that (Singleton pattern)
    if (Database.instance) {
      return Database.instance;
    }

    // Otherwise, call the connect method
    this._connect();

    // Store this instance so it can be reused (ensures only one DB connection exists)
    Database.instance = this;
  }

  // Private method to establish a MongoDB connection
  _connect() {
    mongoose
      .connect(config.mongoURI, {
        useNewUrlParser: true,       // Avoids deprecation warning for MongoDB connection string
        useUnifiedTopology: true,    // Uses new MongoDB topology engine for better stability
        serverSelectionTimeoutMS: 30000, // 30 seconds timeout for server selection
        socketTimeoutMS: 45000,         // 45 seconds timeout for sockets
        connectTimeoutMS: 30000,        // 30 seconds timeout for initial connection
        maxPoolSize: 10,                // Maximum number of connections in pool
        minPoolSize: 2,                 // Minimum number of connections in pool
        retryWrites: true,              // Retry write operations
        w: 'majority'                   // Write concern
      })
      .then(() => console.log("✅ MongoDB connected"))   // Success message when DB connects
      .catch((err) => console.error("❌ MongoDB connection error:", err)); // Error handling if connection fails
  }
}

// Export a single instance of Database so the app reuses the same connection everywhere
export default new Database();