// -----------------------------------------------------------------------------
// 📦 User Service (src/services/user.service.js)
// -----------------------------------------------------------------------------
// Encapsulates business logic for user operations.
// Controllers call this layer; repositories handle direct DB access.
// This layer manages input validation, authentication logic, and response shaping.
// -----------------------------------------------------------------------------

import jwt from "jsonwebtoken";
import userRepository from "../repositories/user.repository.js";
import { userDTO } from "./dto.js";

class UserService {
  // ---------------------------------------------------------------------------
  // 🧾 Register a New User
  // ---------------------------------------------------------------------------
  // 1️⃣ Checks for existing user (email uniqueness).
  // 2️⃣ Delegates creation and password hashing to repository.
  // 3️⃣ Returns a safe DTO object excluding sensitive fields.
  async register(userData) {
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("Email is already registered.");
    }

    // Create new user (password hashing handled in repository)
    const newUser = await userRepository.create(userData);

    // Return sanitized user object
    return {
      success: true,
      message: "User registered successfully.",
      user: userDTO(newUser),
    };
  }

  // ---------------------------------------------------------------------------
  // 🔐 Login Existing User
  // ---------------------------------------------------------------------------
  // 1️⃣ Verifies the email exists.
  // 2️⃣ Uses repository’s password validation (bcrypt.compare inside).
  // 3️⃣ Generates a signed JWT for authentication.
  async login(email, password) {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error("Invalid email or password.");

    // Validate password via repository method
    const isPasswordValid = await userRepository.validatePassword(password, user.password);
    if (!isPasswordValid) throw new Error("Invalid email or password.");

    // Ensure environment JWT secret is configured
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT secret is missing in environment variables.");
    }

    // Generate JWT token (valid for 1 day)
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Return structured and safe response
    return {
      success: true,
      message: "Login successful.",
      token,
      user: userDTO(user),
    };
  }

  // ---------------------------------------------------------------------------
  // 👤 Get User by ID
  // ---------------------------------------------------------------------------
  // Fetches a single user from the database and returns a safe DTO.
  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) throw new Error("User not found.");

    return userDTO(user);
  }

  // ---------------------------------------------------------------------------
  // 📋 Get All Users
  // ---------------------------------------------------------------------------
  // Retrieves and sanitizes all users for safe API output.
  async getAllUsers() {
    const users = await userRepository.getAll();
    return users.map(userDTO);
  }

  // ---------------------------------------------------------------------------
  // ✏️ Update User by ID
  // ---------------------------------------------------------------------------
  // Business logic: Prevents direct password overwrite — handled by repository.
  async updateUser(id, data) {
    const updatedUser = await userRepository.update(id, data);
    if (!updatedUser) throw new Error("User not found.");

    return {
      success: true,
      message: "User updated successfully.",
      user: userDTO(updatedUser),
    };
  }

  // ---------------------------------------------------------------------------
  // ❌ Delete User by ID
  // ---------------------------------------------------------------------------
  // Removes the user from the system.
  async deleteUser(id) {
    const deleted = await userRepository.delete(id);
    if (!deleted) throw new Error("User not found or already deleted.");

    return {
      success: true,
      message: "User deleted successfully.",
    };
  }
}

// -----------------------------------------------------------------------------
// Export Singleton Instance
// -----------------------------------------------------------------------------
const userService = new UserService();
export default userService;
