// ------------------------------------------------------------
// TeamRepository.js
// Repository layer for Team entity
// ------------------------------------------------------------
//  - Encapsulates all MongoDB operations related to the "Team" model
//  - Ensures separation of concerns (Controller → Service → Repository)
//  - Provides reusable and testable database operations
// ------------------------------------------------------------

// Import Team Mongoose model
import Team from "../models/team.model.js";

// Import mongoose for ObjectId validation
import mongoose from "mongoose";

class TeamRepository {

  // ------------------------------------------------------------
  // Create a new team document
  // ------------------------------------------------------------
  async create(data) {
    const team = new Team(data);     // Create a new Team instance with provided data
    return await team.save();        // Save the team to the database
  }

  // ------------------------------------------------------------
  // Find a team by its MongoDB ObjectId
  // - Validates ID before querying
  // - Populates manager & members fields
  // ------------------------------------------------------------
  async findById(id) {
    // If id is not a valid ObjectId, return null instead of throwing an error
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    // Query the database for a team by ID
    return await Team.findById(id)
      .populate("manager", "name email role")   // Populate manager details
      .populate("members", "name email role")    // Populate members details
      .lean()                                    // Convert Mongo document into plain JS object
      .exec();                                   // Execute query
  }

  // ------------------------------------------------------------
  // Find a team by its name
  // ------------------------------------------------------------
  async findByName(name) {
    return await Team.findOne({ name })
      .lean()
      .exec();
  }

  // ------------------------------------------------------------
  // Add a member to a team
  // - $addToSet ensures no duplicates
  // - new: true returns updated document
  // ------------------------------------------------------------
  async addMember(teamId, userId) {
    return await Team.findByIdAndUpdate(
      teamId,
      { $addToSet: { members: userId } },        // Add user only if not already a member
      { new: true }                              // Return updated team document
    )
      .populate("members", "name email role")     // Populate updated member list
      .lean()
      .exec();
  }

  // ------------------------------------------------------------
  // Remove a member from a team
  // - $pull removes the user from members array
  // ------------------------------------------------------------
  async removeMember(teamId, userId) {
    return await Team.findByIdAndUpdate(
      teamId,
      { $pull: { members: userId } },            // Remove specified user
      { new: true }
    )
      .populate("members", "name email role")
      .lean()
      .exec();
  }

  // ------------------------------------------------------------
  // Update team information
  // - runValidators applies schema validation for updates
  // ------------------------------------------------------------
  async update(teamId, data) {
    return await Team.findByIdAndUpdate(
      teamId,
      data,                                      // The new data for update
      { new: true, runValidators: true }         // Return updated document & validate fields
    )
      .lean()
      .exec();
  }

  // ------------------------------------------------------------
  // Delete a team by ID
  // ------------------------------------------------------------
  async delete(teamId) {
    return await Team.findByIdAndDelete(teamId)
      .lean()
      .exec();
  }

  // ------------------------------------------------------------
  // Get paginated list of all teams
  // - Supports pagination using page & limit
  // - Returns total count + total pages
  // ------------------------------------------------------------
  async getAll({ page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;            // Calculate number of documents to skip

    // Execute both queries in parallel for performance
    const [data, total] = await Promise.all([
      Team.find()
        .populate("manager", "name email role")
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),

      Team.countDocuments()                     // Total number of teams (without pagination)
    ]);

    // Return formatted pagination response
    return {
      data,
      pagination: {
        total,                                   // Total documents in Team collection
        page,                                    // Current page number
        limit,                                   // Documents per page
        totalPages: Math.ceil(total / limit),    // Total pages available
      },
    };
  }
}

// ------------------------------------------------------------
// Export a single instance (Singleton)
// Ensures repository usage stays consistent across app
// ------------------------------------------------------------
export default new TeamRepository();
