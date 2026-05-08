/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management APIs
 */
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
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/users", adminController.getAllUsers);
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 */
router.get("/users/:id", adminController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Admin]
 */
router.put(
  "/users/:id",
  validateSchema(updateUserSchema),
  adminController.updateUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Admin]
 */
router.delete("/users/:id", adminController.deleteUser);

// Tasks
/**
 * @swagger
 * /api/users/{id}/tasks:
 *   get:
 *     summary: Get tasks of a user
 *     tags: [Admin]
 */
router.get("/users/:id/tasks", adminController.getUserTasks);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create task for user
 *     tags: [Admin]
 */
router.post(
  "/tasks",
  validateSchema(createTaskSchema),
  adminController.createTaskForUser
);

/**
 * @swagger
 * /api/tasks/{taskId}:
 *   delete:
 *     summary: Delete task
 *     tags: [Admin]
 */
router.delete("/tasks/:taskId", adminController.deleteTask);

// Role management
/**
 * @swagger
 * /api/users/{id}/promote:
 *   put:
 *     summary: Promote user to manager
 *     tags: [Admin]
 */
router.put("/users/:id/promote", adminController.promoteUserToManager);

/**
 * @swagger
 * /api/users/{id}/demote:
 *   put:
 *     summary: Demote user to normal
 *     tags: [Admin]
 */
router.put("/users/:id/demote", adminController.demoteUserToNormal);

// Remove team
/**
 * @swagger
 * /api/users/{id}/assign-team:
 *   post:
 *     summary: Assign user to team
 *     tags: [Admin]
 */
router.post(
  "/users/:id/assign-team",
  validateSchema(assignTeamSchema),
  adminController.assignUserToTeam
);

/**
 * @swagger
 * /api/users/{id}/remove-team:
 *   post:
 *     summary: Remove user from team
 *     tags: [Admin]
 */
router.post(
  "/users/:id/remove-team",
  validateSchema(removeTeamSchema),
  adminController.removeUserFromTeam
);

/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Create new user by admin
 *     tags: [Admin]
 */
router.post(
  "/user",
  validateSchema(createUserByAdminSchema),
  adminController.createUser
);

/**
 * @swagger
 * /api/dashboard/task-stats:
 *   get:
 *     summary: Get task stats
 *     tags: [Admin]
 */
router.get("/dashboard/task-stats", adminController.getDashboardTaskStats);

/**
 * @swagger
 * /api/dashboard/user-stats:
 *   get:
 *     summary: Get user stats
 *     tags: [Admin]
 */
router.get("/dashboard/user-stats", adminController.getDashboardUserStats);

/**
 * @swagger
 * /api/dashboard/managers:
 *   get:
 *     summary: Get managers list
 *     tags: [Admin]
 */
router.get("/dashboard/managers", adminController.getDashboardManagers);

/**
 * @swagger
 * /api/dashboard/teams:
 *   get:
 *     summary: Get teams list
 *     tags: [Admin]
 */
router.get("/dashboard/teams", adminController.getDashboardTeams);

export default router;
