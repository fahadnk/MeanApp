// Import the User model (Mongoose schema for 'users' collection)
const User = require("../models/user.model");

// Repository Pattern for User entity
// Encapsulates all direct database operations related to Users
class UserRepository {
  // Create a new user document in MongoDB
  // 'userData' should be an object matching the User schema
  async create(userData) {
    return await User.create(userData);
  }

  // Find a single user by their email
  // Returns null if no user is found
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  // Find a user by their MongoDB ObjectId
  async findById(id) {
    return await User.findById(id);
  }

  // Retrieve all users from the database
  async getAll() {
    return await User.find();
  }

  // Update user data by ID
  // 'new: true' ensures the updated document is returned
  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  // Delete a user by ID
  async delete(id) {
    return await User.findByIdAndDelete(id);
  }
}

// Export a single instance of UserRepository (Singleton pattern)
// This ensures consistent usage across the app
module.exports = new UserRepository();
