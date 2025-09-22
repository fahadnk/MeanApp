// Import the Task model (Mongoose schema for 'tasks' collection)
const Task = require("../models/task.model");

// Repository Pattern for Task entity
// Encapsulates all direct database operations related to Tasks
class TaskRepository {
  // Create a new task document in MongoDB
  // 'taskData' should follow the Task schema (title, description, etc.)
  async create(taskData) {
    return await Task.create(taskData);
  }

  // Find a task by its MongoDB ObjectId
  // Also populates 'assignedTo' and 'createdBy' fields with User details
  async findById(id) {
    return await Task.findById(id).populate("assignedTo createdBy");
  }

  // Retrieve all tasks from the database
  // Populates user references for readability
  async getAll() {
    return await Task.find().populate("assignedTo createdBy");
  }

  // Find all tasks assigned to a specific user (by userId)
  // Populates both 'assignedTo' and 'createdBy' for richer data
  async findByUser(userId) {
    return await Task.find({ assignedTo: userId }).populate("assignedTo createdBy");
  }

  // Update a task by ID
  // 'new: true' ensures the returned document is the updated one
  async update(id, updateData) {
    return await Task.findByIdAndUpdate(id, updateData, { new: true });
  }

  // Delete a task by ID
  async delete(id) {
    return await Task.findByIdAndDelete(id);
  }
}

// Export a single instance of TaskRepository (Singleton pattern)
// Keeps database logic consistent across the app
module.exports = new TaskRepository();
