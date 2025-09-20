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
      })
      .then(() => console.log("✅ MongoDB connected"))   // Success message when DB connects
      .catch((err) => console.error("❌ MongoDB connection error:", err)); // Error handling if connection fails
  }
}

// Export a single instance of Database so the app reuses the same connection everywhere
export default new Database();
