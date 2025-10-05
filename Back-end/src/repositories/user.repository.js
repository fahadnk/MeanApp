// backend/src/repositories/user.repository.js

// -------------------------
// Import the User model (Mongoose schema for 'users' collection)
// -------------------------
import User from "../models/user.model.js";

// -------------------------
// Repository Pattern for User entity
// Encapsulates all direct database operations related to Users
// -------------------------
class UserRepository {
  // -------------------------
  // Create a new user document in MongoDB
  // 'userData' should be an object matching the User schema
  // Example: userRepository.create({ name, email, password })
  // -------------------------
  async create(userData) {
    return await User.create(userData);
  }

  // -------------------------
  // Find a single user by their email
  // Returns null if no user is found
  // Example: userRepository.findByEmail("test@example.com")
  // -------------------------
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  // -------------------------
  // Find a user by their MongoDB ObjectId
  // Example: userRepository.findById("64abc123...")
  // -------------------------
  async findById(id) {
    return await User.findById(id);
  }

  // -------------------------
  // Retrieve all users from the database
  // Example: userRepository.getAll()
  // -------------------------
  async getAll() {
    return await User.find();
  }

  // -------------------------
  // Update user data by ID
  // 'new: true' ensures the updated document is returned
  // Example: userRepository.update("64abc123...", { name: "Updated Name" })
  // -------------------------
  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  // -------------------------
  // Delete a user by ID
  // Example: userRepository.delete("64abc123...")
  // -------------------------
  async delete(id) {
    return await User.findByIdAndDelete(id);
  }
}

// -------------------------
// Export a single instance of UserRepository (Singleton pattern)
// Keeps database logic consistent across the app
// -------------------------
const userRepository = new UserRepository();
export default userRepository;
