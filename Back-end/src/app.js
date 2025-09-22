// -------------------------
// Import Dependencies
// -------------------------

// Import the Express framework to build our backend application.
// Express makes it easy to handle HTTP requests and responses.
import express from "express";

// Import the CORS (Cross-Origin Resource Sharing) middleware.
// This allows requests from a different domain (like frontend running on http://localhost:3000)
// to access this backend server (maybe running on http://localhost:5000).
import cors from "cors";

// Import the Helmet middleware.
// Helmet secures Express apps by setting various HTTP response headers (like disabling "X-Powered-By"),
// helping to protect against well-known web vulnerabilities (XSS, Clickjacking, etc.).
import helmet from "helmet";

// Import modular route files. Each of these files contains routes related to a specific feature/domain.
// This keeps the code organized and maintainable instead of putting all routes in one file.
import healthRoutes from "./routes/health.routes.js"; // Handles health-check routes
import authRoutes from "./routes/auth.routes.js";     // Handles authentication routes (register, login, profile)
import taskRoutes from "./routes/task.routes.js";     // Handles task CRUD operations (create, read, update, delete)


// -------------------------
// Create Express App
// -------------------------

// Create an instance of an Express application.
// This instance (app) will be used to define middlewares and routes.
const app = express();


// -------------------------
// Global Middlewares
// -------------------------

// Middleware to parse incoming requests with JSON payloads.
// Example: if client sends { "name": "John" }, we can access it using req.body.name.
app.use(express.json());

// Enable CORS globally for all routes.
// Without this, browsers will block API requests coming from different origins (domains/ports).
app.use(cors());

// Use Helmet middleware to automatically add security headers to responses.
// Example: removes "X-Powered-By" header, adds Content-Security-Policy, etc.
app.use(helmet());


// -------------------------
// Register Routes
// -------------------------

// Register the "health" routes under the "/api/health" prefix.
// Example: GET http://localhost:5000/api/health → returns a simple status message like { status: "OK" }.
app.use("/api/health", healthRoutes);

// Register the "auth" routes under the "/api/auth" prefix.
// Example: POST http://localhost:5000/api/auth/register → register new user.
//          POST http://localhost:5000/api/auth/login → user login.
app.use("/api/auth", authRoutes);

// Register the "task" routes under the "/api/tasks" prefix.
// Example: GET http://localhost:5000/api/tasks → get all tasks for a user.
//          POST http://localhost:5000/api/tasks → create new task.
//          PUT http://localhost:5000/api/tasks/:id → update task by ID.
//          DELETE http://localhost:5000/api/tasks/:id → delete task by ID.
app.use("/api/tasks", taskRoutes);


// -------------------------
// Export Application
// -------------------------

// Export the Express application instance so it can be imported in another file (like server.js).
// In server.js, we will import this app and start listening on a specific port.
export default app;
