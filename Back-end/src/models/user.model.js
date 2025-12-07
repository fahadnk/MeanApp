// backend/src/models/User.js

// -------------------------
// Import mongoose to define and interact with MongoDB collections
// -------------------------
import mongoose from "mongoose";

// -------------------------
// Define the User schema according to the latest requirements
// -------------------------
const userSchema = new mongoose.Schema(
  {
    // Full name of the user - required and whitespace will be trimmed
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Email address - must be unique across all users, stored in lowercase for consistency
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true, // extra safety: remove leading/trailing spaces
    },

    // Hashed password - required field (never store plain text in production)
    password: {
      type: String,
      required: true,
    },

    // User role - restricted to only allowed values: "admin", "user", or "manager"
    // Defaults to "user" if not provided during creation
    role: {
      type: String,
      enum: ["admin", "user", "manager"],
      default: "user",
    },

    // Reference to a Team document (ObjectId from "Team" collection)
    // Can be null if user is not assigned to any team yet
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",         // Populates with Team data when using .populate('team')
      default: null,
    },

    // Array of notifications for the user (e
    // Useful for in-app alerts, task assignments, mentions, etc.
    notifications: [
      {
        message: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        read: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    // Automatically add `createdAt` and `updatedAt` timestamps to every user document
    timestamps: true,
  }
);

// -------------------------
// Create and export the Mongoose model
// Collection name will be "users" (lowercased + pluralized) in MongoDB
// -------------------------
const User = mongoose.model("User", userSchema);

// -------------------------
// Export the model for use in controllers, services, middlewares, etc.
// -------------------------
export default User;