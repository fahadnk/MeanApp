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
    const normalizedEmail = email.trim().toLowerCase();

    const user = await userRepository.findByEmail(normalizedEmail);
    if (!user) throw new Error("Invalid email or password.");

    const isValid = await userRepository.validatePassword(password, user.password);
    if (!isValid) throw new Error("Invalid email or password.");

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT secret not configured.");
    }

    // ⭐ IMPORTANT: handle undefined safely
    const mustResetPassword = user.mustResetPassword === true;

    // ⛔ STOP login flow if reset required
    if (mustResetPassword) {
      return {
        success: true,
        mustResetPassword: true,
        message: "Password reset required before continuing.",
      };
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return {
      success: true,
      token,
      user: userDTO(user),
      mustResetPassword: false,
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

  async resetPasswordByEmail(email, password) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    // 🔐 Only admin-created users
    if (!user.mustResetPassword) {
      throw new Error("Password reset not required");
    }

    // 🔑 Hash password
    const hashedPassword = await userRepository.hashPassword(password, 10);

    // 🗄 Update via repository
    const updatedUser =
      await userRepository.updatePasswordByEmail(email, hashedPassword);

    return userDTO(updatedUser);
  }

  async resetPasswordWithToken(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const isMatch = await userRepository.validatePassword(currentPassword, user.password);
    if (!isMatch) throw new Error("Current password is incorrect");

    user.password = await userRepository.hashPassword(newPassword, 10);
    await user.save();

    return { id: user._id };
  }
// update profile picture
  async updateProfilePictureService(userId, file) {
    if (!file) throw new Error('No file uploaded');

    // Convert to Base64
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const updatedUser = await userRepository.updateProfilePicture(userId, base64Image);

    if (!updatedUser) throw new Error('User not found');

    return updatedUser;
  }
// get profile picture
  async getProfilePictureService(userId) {
    const user = await userRepository.getProfilePicture(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      success: true,
      profilePicture: user.profilePicture,
      name: user.name,
      email: user.email
    };
  }


}

// -----------------------------------------------------------------------------
// Export Singleton Instance
// -----------------------------------------------------------------------------
const userService = new UserService();
export default userService;
