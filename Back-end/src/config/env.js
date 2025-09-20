// Import dotenv to load environment variables from a .env file into process.env
import dotenv from "dotenv";

class Config {
  constructor() {
    // If an instance of Config already exists, return that instance (Singleton pattern)
    if (Config.instance) {
      return Config.instance;
    }

    // Load environment variables from the .env file into process.env
    dotenv.config();

    // Application port (defaults to 5000 if PORT is not defined in .env)
    this.port = process.env.PORT || 5000;

    // MongoDB connection string (defaults to local DB if MONGO_URI is not defined)
    this.mongoURI = process.env.MONGO_URI || "mongodb+srv://Fahadnk:Pwd5022710@products.gdgl6uq.mongodb.net/";

    // Current environment (development, production, or test). Defaults to "development"
    this.nodeEnv = process.env.NODE_ENV || "development";

    // Store the instance so future calls return the same object (enforces Singleton)
    Config.instance = this;
  }

  // Static method to get the Config instance (ensures only one instance is ever created)
  static getInstance() {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }
}

// Export a single Config instance so it can be imported anywhere in the app
export default Config.getInstance();
