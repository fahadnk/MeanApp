// Import the mongoose library to interact with MongoDB
const mongoose = require("mongoose");

// Define a new schema for the User collection
// A schema in Mongoose defines the structure of the documents in a collection
const userSchema = new mongoose.Schema(
  {
    // 'name' field: required string, trims whitespace from both ends
    name: { type: String, required: true, trim: true },

    // 'email' field: required, unique (no duplicates allowed), stored in lowercase
    email: { type: String, required: true, unique: true, lowercase: true },

    // 'password' field: required string (in practice, should always be hashed)
    password: { type: String, required: true },

    // 'role' field: can only be either 'user' or 'admin'
    // defaults to 'user' if not specified
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  {
    // Adds 'createdAt' and 'updatedAt' fields automatically to each document
    timestamps: true,
  }
);

// Create the User model based on the schema
// The first argument 'User' will become the collection name 'users' in MongoDB
const User = mongoose.model("User", userSchema);

// Export the model so it can be used in other files (e.g., controllers, services)
module.exports = User;

