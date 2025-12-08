// backend/src/routes/admin.routes.js

import express from "express";

// FIXED — removed trailing space + corrected import
import { addMemberSchema as assignTeamSchema } from "../validators/team.validator.js";

import authMiddleware from "../middleware/AuthMiddleware.js";
import roleMiddleware from "../middleware/RoleMiddleware.js";
import validateSchema from "../middleware/ValidateMiddleware.js";

import { updateUserSchema } from "../validators/user.validator.js";
import { createTaskSchema } from "../validators/task.validator.js";

import adminController from "../controllers/admin.controller.js";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authMiddleware, roleMiddleware("admin"));

// ---------------------------
// User Management
// ---------------------------
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);

router.put(
  "/users/:id",
  validateSchema(updateUserSchema),
  adminController.updateUser
);

router.delete("/users/:id", adminController.deleteUser);

// ---------------------------
// Task Management
// ---------------------------
router.get("/users/:id/tasks", adminController.getUserTasks);

router.post(
  "/tasks",
  validateSchema(createTaskSchema),
  adminController.createTaskForUser
);

router.delete("/tasks/:taskId", adminController.deleteTask);

// ---------------------------
// Role Management
// ---------------------------
router.put("/users/:id/promote", adminController.promoteUserToManager);

router.put("/users/:id/demote", adminController.demoteUserToNormal);

// ---------------------------
// Team Assignment
// ---------------------------
router.post(
  "/users/:id/assign-team",
  validateSchema(assignTeamSchema),  // uses addMemberSchema
  adminController.assignUserToTeam
);

// NO VALIDATION NEEDED — body is empty
router.post(
  "/users/:id/remove-team",
  adminController.removeUserFromTeam
);

export default router;
