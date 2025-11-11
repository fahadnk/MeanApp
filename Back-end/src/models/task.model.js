// backend/src/models/Task.js

// -------------------------
// Import mongoose to define the schema and interact with MongoDB
// -------------------------
import mongoose from "mongoose";

// -------------------------
// Define the Task schema (structure of documents inside the 'tasks' collection)
// -------------------------
const taskSchema = new mongoose.Schema(
  {
    // 'title' field: required short text for the task name
    title: { type: String, required: true },

    // 'description' field: optional longer text describing the task
    description: { type: String },

    // 'status' field: can only be one of 'todo', 'in-progress', or 'done'
    // defaults to 'todo' if not provided
    status: { 
      type: String, 
      enum: ["todo", "in-progress", "done"], 
      default: "todo" 
    },

    // 'priority' field: defines task urgency (low, medium, high)
    // defaults to 'medium'
    priority: { 
      type: String, 
      enum: ["low", "medium", "high"], 
      default: "medium" 
    },

    // 'assignedTo': references a User by their ObjectId
    // This allows populating with user details later (e.g., task assigned to John)
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // 'createdBy': references the User who created the task
    // This is required to track task ownership
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    dueDate: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => value >= new Date(),
        message: "Due date cannot be in the past",
      },
    },
  },
  {
    // Automatically adds 'createdAt' and 'updatedAt' timestamps
    timestamps: true,
  }
);

// -------------------------
// Create a Mongoose model from the schema
// 'Task' will map to the 'tasks' collection in MongoDB
// -------------------------
const Task = mongoose.model("Task", taskSchema);

// -------------------------
// Export the model to use it in controllers, services, or repositories
// -------------------------
export default Task;
