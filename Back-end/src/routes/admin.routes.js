// backend/src/routes/admin.routes.js

// -------------------------
// 1️⃣ Import Express
// -------------------------
import express from "express";
// ^ Express is used to create modular route handlers (Router instances).


// -------------------------
// 2️⃣ Import Middlewares
// -------------------------
import authMiddleware from "../middleware/AuthMiddleware.js";
// ^ Middleware to check if a user is logged in (authenticated).

import roleMiddleware from "../middleware/RoleMiddleware.js";
// ^ Middleware to check user roles (e.g., admin, manager, etc).


// -------------------------
// 3️⃣ Import Controller
// -------------------------
import adminController from "../controllers/admin.controller.js";
// ^ Contains all the logic for admin-specific routes (CRUD for users, tasks).


// -------------------------
// 4️⃣ Create Router Instance
// -------------------------
const router = express.Router();
// ^ Create a modular router instance to define admin routes separately.


// -------------------------
// 5️⃣ Apply Global Middleware for All Admin Routes
// -------------------------
// Any route defined below will automatically:
// 1) Require authentication (authMiddleware)
// 2) Require "admin" role (roleMiddleware("admin"))
router.use(authMiddleware, roleMiddleware("admin"));
// ^ Ensures only logged-in admins can access any route below.


// ---------------------------
// 6️⃣ User Management Routes
// ---------------------------

// GET /admin/users
// Fetch all users in the system
router.get("/users", adminController.getAllUsers);

// GET /admin/users/:id
// Fetch a single user by their ID
router.get("/users/:id", adminController.getUserById);

// PUT /admin/users/:id
// Update user details by ID
router.put("/users/:id", adminController.updateUser);

// DELETE /admin/users/:id
// Remove a user permanently by ID
router.delete("/users/:id", adminController.deleteUser);


// ---------------------------
// 7️⃣ Task Management for Users
// ---------------------------

// GET /admin/users/:id/tasks
// Get all tasks assigned to a specific user
router.get("/users/:id/tasks", adminController.getUserTasks);

// POST /admin/tasks
// Create a new task and assign it to a user
router.post("/tasks", adminController.createTaskForUser);

// DELETE /admin/tasks/:taskId
// Delete a task by its unique ID
router.delete("/tasks/:taskId", adminController.deleteTask);


// -------------------------
// 8️⃣ Export Router
// -------------------------
export default router;
// ^ Makes this router available to import in main app.js
//   Typically mounted as app.use("/admin", adminRoutes)
