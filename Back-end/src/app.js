// -------------------------
// Import Dependencies
// -------------------------

import express from "express";            // Core framework to build APIs
import cors from "cors";                  // Middleware for Cross-Origin Resource Sharing
import helmet from "helmet";              // Middleware to set secure HTTP headers
import mongoSanitize from "express-mongo-sanitize"; // Prevent MongoDB operator injection
import xss from "xss-clean";              // Prevent Cross-Site Scripting (XSS) attacks

// Import modular route files
import healthRoutes from "./routes/health.routes.js"; // Health check endpoints
import authRoutes from "./routes/auth.routes.js";     // Auth endpoints (register, login, profile)
import taskRoutes from "./routes/task.routes.js";     // Task CRUD endpoints

// Import Global Error Handler middleware
import errorMiddleware from "./middleware/ErrorMiddleware.js";


// -------------------------
// Create Express App
// -------------------------

// Initialize the Express application instance
const app = express();


// -------------------------
// Global Middlewares
// -------------------------

// Parse incoming JSON requests so `req.body` is automatically available as an object
app.use(express.json());

// Allow requests from other domains (frontend and backend can be on different hosts/ports)
app.use(cors());

// Add standard security headers to protect against well-known web vulnerabilities
app.use(helmet());

// Prevent malicious payloads that try to inject MongoDB operators like `$gt`, `$or`, etc.
app.use(mongoSanitize());

// Sanitize user input to prevent malicious HTML/JS from being executed (XSS attacks)
app.use(xss());


// -------------------------
// Register Routes
// -------------------------

// Health check endpoint → used to confirm server is running
// Example: GET http://localhost:5000/api/health
app.use("/api/health", healthRoutes);

// Authentication endpoints → register, login, and profile routes
app.use("/api/auth", authRoutes);

// Task endpoints → CRUD operations for tasks (protected by auth middleware later)
app.use("/api/tasks", taskRoutes);


// -------------------------
// Global Error Handling
// -------------------------

// Centralized error handling middleware
// Any error thrown inside routes/controllers will be caught here
// Ensures consistent error response structure
app.use(errorMiddleware);


// -------------------------
// Export Application
// -------------------------

// Export the Express app instance so it can be imported in server.js
// server.js is responsible for actually starting the server
export default app;
