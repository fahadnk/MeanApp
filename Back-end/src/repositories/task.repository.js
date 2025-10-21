// backend/src/repositories/task.repository.js

// -------------------------
// 📦 Import Dependencies
// -------------------------
// The Task model represents the "tasks" collection in MongoDB.
// Mongoose handles data validation, schema mapping, and CRUD abstraction.
import Task from "../models/task.model.js";

// -------------------------
// 🧠 Task Repository
// -------------------------
// The Repository Pattern abstracts and centralizes all **data access logic**.
// This prevents business layers (services/controllers) from directly touching
// database methods — improving reusability, testability, and separation of concerns.
//
// 👉 Responsibilities:
//    - Interact directly with MongoDB using Mongoose.
//    - Handle query building, filtering, sorting, pagination, and aggregations.
//    - Return pure JS objects (via `.lean()`) ready for transformation by DTOs.
// -------------------------
class TaskRepository {
  // -------------------------
  // 🟢 Create a new Task
  // -------------------------
  // @param  {Object} taskData - Task input adhering to the Task schema.
  // @returns {Promise<Object>} Newly created task document.
  async create(taskData) {
    return await Task.create(taskData);
  }

  // -------------------------
  // 🔍 Find a Task by ID
  // -------------------------
  // @param  {String} id - MongoDB ObjectId of the task.
  // @returns {Promise<Object|null>} Task document (populated with user refs).
  async findById(id) {
    return await Task.findById(id)
      // Populate referenced user fields for richer response
      .populate("assignedTo createdBy")
      // `.lean()` returns a plain JS object, faster than Mongoose Documents
      // Ideal for read-heavy APIs and DTO mapping
      .lean();
  }

  // -------------------------
  // 📋 Get All Tasks (Advanced Query Support)
  // -------------------------
  // Supports multiple optional query features:
  // - Pagination (page & limit)
  // - Search (title or description, partial match)
  // - Filters (status, priority, assignedTo)
  // - Sorting (newest first)
  //
  // @param {Object} options
  // @returns {Promise<Object>} Paginated tasks with metadata.
  async getAll({
    page = 1,
    limit = 10,
    search = "",
    status,
    priority,
    assignedTo,
  }) {
    // -------------------------
    // 🧩 Build dynamic MongoDB query object
    // -------------------------
    const query = {};

    // Search filter (case-insensitive regex match)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Status and Priority filters (exact match)
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Optional restriction by user (non-admin users)
    if (assignedTo) query.assignedTo = assignedTo;

    // -------------------------
    // 📄 Pagination setup
    // -------------------------
    const skip = (page - 1) * limit;

    // -------------------------
    // 🧮 Execute queries in parallel
    // -------------------------
    // Promise.all improves performance by fetching results & count simultaneously.
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate("assignedTo createdBy")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }) // Newest first
        .lean(),
      Task.countDocuments(query),
    ]);

    // -------------------------
    // 📦 Return paginated structure
    // -------------------------
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

  // -------------------------
  // 👤 Get Tasks by Assigned User
  // -------------------------
  // Simply reuses the main `getAll` method but pre-fills assignedTo filter.
  // Promotes DRY (Don't Repeat Yourself) principle.
  async findByUser(userId, queryOptions = {}) {
    return await this.getAll({ ...queryOptions, assignedTo: userId });
  }

  // -------------------------
  // ✏️ Update Task by ID
  // -------------------------
  // @param  {String} id - Task ObjectId.
  // @param  {Object} updateData - Fields to update.
  // @returns {Promise<Object|null>} Updated task document.
  async update(id, updateData) {
    return await Task.findByIdAndUpdate(id, updateData, { new: true })
      .populate("assignedTo createdBy")
      .lean();
  }

  // -------------------------
  // 🗑️ Delete Task by ID
  // -------------------------
  // @param  {String} id - Task ObjectId.
  // @returns {Promise<Object|null>} Deleted task document.
  async delete(id) {
    return await Task.findByIdAndDelete(id);
  }

  // -------------------------
  // 📊 Aggregation: Count Tasks Per User
  // -------------------------
  // Uses MongoDB Aggregation Framework to group tasks by `assignedTo`.
  // Enriched with `$lookup` to fetch user details (join operation).
  // @returns {Promise<Array>} List of users with total assigned task count.
  async countTasksByUser() {
    return await Task.aggregate([
      // Group all tasks by user and count them
      { $group: { _id: "$assignedTo", totalTasks: { $sum: 1 } } },
      // Lookup user details from the users collection
      {
        $lookup: {
          from: "users", // Target collection name
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      // Flatten the joined array
      { $unwind: "$user" },
      // Project a cleaner structure for frontend use
      { $project: { _id: 0, user: "$user.name", totalTasks: 1 } },
    ]);
  }

  // -------------------------
  // 📈 Aggregation: Count Tasks Per Status
  // -------------------------
  // Groups tasks by their `status` field (e.g., pending, done, in-progress).
  // @returns {Promise<Array>} Status with count.
  async countTasksByStatus() {
    return await Task.aggregate([
      { $group: { _id: "$status", total: { $sum: 1 } } },
      // Rename fields for cleaner output
      { $project: { status: "$_id", total: 1, _id: 0 } },
    ]);
  }
}

// -------------------------
// 🧩 Export Singleton Instance
// -------------------------
// Exporting a single shared instance ensures the same repository logic
// is reused across services — consistent state, behavior, and optimization.
export default new TaskRepository();
