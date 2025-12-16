import express from "express";

import {
  assignTeamSchema,
  removeTeamSchema
} from "../validators/team.validator.js";

import authMiddleware from "../middleware/AuthMiddleware.js";
import roleMiddleware from "../middleware/RoleMiddleware.js";
import validateSchema from "../middleware/ValidateMiddleware.js";

import { updateUserSchema, createUserByAdminSchema } from "../validators/user.validator.js";
import { createTaskSchema } from "../validators/task.validator.js";

import adminController from "../controllers/admin.controller.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("admin"));

// Users
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);

router.put(
  "/users/:id",
  validateSchema(updateUserSchema),
  adminController.updateUser
);

router.delete("/users/:id", adminController.deleteUser);

// Tasks
router.get("/users/:id/tasks", adminController.getUserTasks);

router.post(
  "/tasks",
  validateSchema(createTaskSchema),
  adminController.createTaskForUser
);

router.delete("/tasks/:taskId", adminController.deleteTask);

// Role management
router.put("/users/:id/promote", adminController.promoteUserToManager);
router.put("/users/:id/demote", adminController.demoteUserToNormal);

// Assign team
router.post(
  "/users/:id/assign-team",
  validateSchema(assignTeamSchema),
  adminController.assignUserToTeam
);

// Remove team
router.post(
  "/users/:id/remove-team",
  validateSchema(removeTeamSchema),
  adminController.removeUserFromTeam
);

router.post(
  "/user",
  validateSchema(createUserByAdminSchema),   // <-- use admin create-user schema
  adminController.createUser        // <-- call controller function
);

router.get("/dashboard/task-stats", adminController.getDashboardTaskStats);
router.get("/dashboard/user-stats", adminController.getDashboardUserStats);
router.get("/dashboard/managers", adminController.getDashboardManagers);
router.get("/dashboard/teams", adminController.getDashboardTeams);

export default router;
