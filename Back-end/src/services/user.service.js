// Import the UserRepository for database operations
import userRepository from "../repositories/user.repository";

// Import the DTO to ensure safe and consistent API responses
import { userDTO } from"./dto";

// Service Layer for Users
// Encapsulates business logic and orchestrates between repositories and controllers
class UserService {
  // Register a new user
  // Example of business logic: ensure no duplicate emails
  async register(userData) {
    // Check if the email is already taken
    const existing = await userRepository.findByEmail(userData.email);
    if (existing) throw new Error("Email already in use");

    // Create new user
    const user = await userRepository.create(userData);

    // Return only safe fields using DTO
    return userDTO(user);
  }

  // Fetch a single user by ID
  async getUserById(id) {
    const user = await userRepository.findById(id);
    return userDTO(user);
  }

  // Fetch all users
  async getAllUsers() {
    const users = await userRepository.getAll();

    // Map each user document into DTO format
    return users.map(userDTO);
  }

  // Update user data by ID
  async updateUser(id, data) {
    const updated = await userRepository.update(id, data);
    return userDTO(updated);
  }

  // Delete a user by ID
  async deleteUser(id) {
    return await userRepository.delete(id);
  }
}

// Export a single instance of UserService (Singleton pattern)
// Ensures consistent usage across controllers
const userService = new UserService();
export default userService;