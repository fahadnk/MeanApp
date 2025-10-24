// -------------------------------------------------------------
// backend/src/repositories/task.repository.js
// -------------------------------------------------------------
// 🧩 This file defines the TaskRepository class.
// It encapsulates all database operations related to tasks.
// By isolating DB logic here, controllers/services remain cleaner
// and focused on business logic (Repository Pattern).
// -------------------------------------------------------------


// -------------------------------------------------------------
// 📦 Import Dependencies
// -------------------------------------------------------------

// Import the Task Mongoose model
import Task from "../models/task.model.js";

// Import mongoose for ObjectId validation and aggregations
import mongoose from "mongoose";


// -------------------------------------------------------------
// 🧠 Task Repository
// -------------------------------------------------------------
class TaskRepository {

  // ---------------------------------------------------------
  // 🟢 Create a new Task
  // ---------------------------------------------------------
  async create(taskData) {
    try {
      // Create a new Task instance using Mongoose's model
      const task = new Task(taskData);

      // Save the document to the database
      // `.save()` is preferred over `Task.create()` in Mongoose v7+
      // because it gives you better control and middleware support
      return await task.save();

    } catch (error) {
      // Log for debugging and rethrow as a custom message
      console.error("❌ [TaskRepository.create] Error:", error);
      throw new Error("Failed to create task: " + error.message);
    }
  }


  // ---------------------------------------------------------
  // 🔍 Find a Task by ID
  // ---------------------------------------------------------
  async findById(id) {
    // Validate ObjectId to prevent invalid DB queries
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    // Query DB and also populate relational fields
    return await Task.findById(id)
      .populate("assignedTo", "name email role") // Include only specific fields from user
      .populate("createdBy", "name email role")
      .lean()   // Converts Mongoose document → plain JS object for better performance
      .exec();  // Executes the query immediately
  }


  // ---------------------------------------------------------
  // 📋 Get All Tasks (with filters and pagination)
  // ---------------------------------------------------------
  async getAll({
    page = 1,        // default page = 1
    limit = 10,      // default items per page = 10
    search = "",     // search keyword (optional)
    status,          // optional filter
    priority,        // optional filter
    assignedTo,      // optional filter
  } = {}) {

    // Initialize MongoDB query object
    const query = {};

    // Search filter (case-insensitive)
    // Matches either title OR description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Conditional filters for status/priority/assignedTo
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    // Pagination skip amount
    const skip = (page - 1) * limit;

    // Use Promise.all for performance: fetch tasks + count in parallel
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email role")
        .skip(skip)                // skip previous pages
        .limit(limit)              // limit per page
        .sort({ createdAt: -1 })   // newest first
        .lean()
        .exec(),
      Task.countDocuments(query),  // total task count for pagination metadata
    ]);

    // Return both tasks and pagination info
    return {
      data: tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }


  // ---------------------------------------------------------
  // 👤 Get Tasks by a specific User
  // ---------------------------------------------------------
  async findByUser(userId, queryOptions = {}) {
    // Validate userId before querying
    if (!mongoose.Types.ObjectId.isValid(userId))
      return { data: [], pagination: {} };

    // Reuse getAll() but with a fixed "assignedTo" filter
    return await this.getAll({ ...queryOptions, assignedTo: userId });
  }


  // ---------------------------------------------------------
  // ✏️ Update Task by ID
  // ---------------------------------------------------------
  async update(id, updateData) {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    // Update document and return the new one
    // runValidators ensures schema rules still apply
    return await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .lean()
      .exec();
  }


  // ---------------------------------------------------------
  // 🗑️ Delete Task by ID
  // ---------------------------------------------------------
  async delete(id) {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    // Find and remove the document
    return await Task.findByIdAndDelete(id).lean().exec();
  }


  // ---------------------------------------------------------
  // 📊 Count Tasks Per User (for admin dashboards)
  // ---------------------------------------------------------
  async countTasksByUser() {
    // MongoDB aggregation pipeline
    // Groups tasks by assigned user and counts how many each has
    return await Task.aggregate([
      // Step 1: Group by assigned user
      { $group: { _id: "$assignedTo", totalTasks: { $sum: 1 } } },

      // Step 2: Lookup user details from 'users' collection
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },

      // Step 3: Convert user array → single object
      { $unwind: "$user" },

      // Step 4: Project only useful fields
      { $project: { _id: 0, user: "$user.name", totalTasks: 1 } },
    ]);
  }


  // ---------------------------------------------------------
  // 📈 Count Tasks Per Status (e.g., Pending, Completed)
  // ---------------------------------------------------------
  async countTasksByStatus() {
    // Simple aggregation to count tasks grouped by status
    return await Task.aggregate([
      { $group: { _id: "$status", total: { $sum: 1 } } },
      { $project: { status: "$_id", total: 1, _id: 0 } },
    ]);
  }
}


// -------------------------------------------------------------
// 🧩 Export Singleton Instance
// -------------------------------------------------------------
// Exporting a single instance (not the class) ensures a shared
// repository across your application (singleton pattern).
export default new TaskRepository();
