// -------------------------------------------
// Import Dependencies
// -------------------------------------------

// Mongoose model representing the 'users' collection
import User from "../models/user.model.js";

// bcryptjs for hashing and comparing passwords securely
import bcrypt from "bcryptjs";

// -------------------------------------------
// Repository Pattern for User Entity
// -------------------------------------------
// This class encapsulates all data-access logic related to the User model.
// It acts as a single source of truth for database operations.
// Business logic should *never* directly access the database — it should
// always go through this repository layer.
class UserRepository {
  // -------------------------------------------
  // Create a New User
  // -------------------------------------------
  // 1. Hashes the password before saving to the database.
  // 2. Creates and persists a new User document.
  // 3. Returns the saved user instance (including Mongo _id).
  //
  // Example:
  //   await userRepository.create({ name, email, password })
  // -------------------------------------------
  async create(userData) {
    // Ensure password hashing before saving
    if (userData.password) {
      const saltRounds = 10;
      userData.password = await bcrypt.hash(userData.password, saltRounds);
    }

    // Create and save user in MongoDB
    const user = new User(userData);
    await user.save();

    return user;
  }

  // -------------------------------------------
  // Find User by Email
  // -------------------------------------------
  // Returns the user document matching the given email.
  // Returns null if no user is found.
  //
  // Example:
  //   const user = await userRepository.findByEmail("test@example.com");
  // -------------------------------------------
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  // -------------------------------------------
  // Find User by ID
  // -------------------------------------------
  // Returns a user by their MongoDB ObjectId.
  //
  // Example:
  //   const user = await userRepository.findById("64abc123...");
  // -------------------------------------------
  async findById(id) {
    return await User.findById(id);
  }

  // -------------------------------------------
  // Retrieve All Users
  // -------------------------------------------
  // Fetches all user documents.
  //
  // Example:
  //   const users = await userRepository.getAll();
  // -------------------------------------------
  async getAll() {
    return await User.find();
  }

  // -------------------------------------------
  // Find Users by Team ID
  // -------------------------------------------
  // Returns all users assigned to a specific team.
  // If teamId is null or not provided, returns users with no team assigned.
  //
  // Example:
  //   const teamUsers = await userRepository.findByTeam("64def456...");
  // -------------------------------------------
  async findByTeam(teamId) {
    return await User.find({ team: teamId });
  }

  // -------------------------------------------
  // Update User by ID
  // -------------------------------------------
  // Finds a user by ID and updates the specified fields.
  // If a new password is provided, it is re-hashed before update.
  // Also supports updating role (e.g., promote/demote) and team assignment.
  //
  // Example:
  //   await userRepository.update("64abc123...", { role: "manager", team: "64xyz..." });
  // -------------------------------------------
  async update(id, updateData) {
    // Re-hash password if user updates it
    if (updateData.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    // Update and return the new document
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  // -------------------------------------------
  // Delete User by ID
  // -------------------------------------------
  // Permanently removes the user document.
  //
  // Example:
  //   await userRepository.delete("64abc123...");
  // -------------------------------------------
  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  // -------------------------------------------
  // Validate Password
  // -------------------------------------------
  // Compares a plain-text password with the stored hashed password.
  // Returns true if the passwords match, false otherwise.
  //
  // Example:
  //   const isValid = await userRepository.validatePassword("plain", user.password);
  // -------------------------------------------
  async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async updatePassword(userId, hashedPassword) {
    return User.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
        mustResetPassword: false   // ⭐ turn off reset requirement
      },
      { new: true }
    ).select("-password");
  }
}

// -------------------------------------------
// Export Singleton Instance
// -------------------------------------------
// Ensures a single shared instance of the repository across the app.
// This helps maintain consistent DB behavior and improves testability.
const userRepository = new UserRepository();
export default userRepository;