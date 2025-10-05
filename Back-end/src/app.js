// -------------------------
// Import Dependencies
// -------------------------
import express from "express";            // Core framework to build APIs
import cors from "cors";                  // Middleware for Cross-Origin Resource Sharing
import helmet from "helmet";              // Middleware to set secure HTTP headers
import mongoSanitize from "express-mongo-sanitize"; // Prevent MongoDB operator injection
import xss from "xss-clean";              // Prevent Cross-Site Scripting (XSS) attacks
import morgan from "morgan";              // HTTP request logger middleware
import { v4 as uuidv4 } from "uuid";      // Generate unique correlation IDs

// Import modular route files
import healthRoutes from "./routes/health.routes.js"; 
import authRoutes from "./routes/auth.routes.js";     
import taskRoutes from "./routes/task.routes.js";     

// Import Global Error Handler & Logger
import errorMiddleware from "./middleware/ErrorMiddleware.js";
import logger from "./config/logger.js";   // Winston logger instance


// -------------------------
// Create Express App
// -------------------------
const app = express();


// -------------------------
// Correlation ID Middleware
// -------------------------
// Adds a unique request ID to each request for tracing in logs
app.use((req, res, next) => {
  req.id = uuidv4(); // attach correlation ID
  res.setHeader("X-Request-Id", req.id); // expose to clients
  next();
});


// -------------------------
// Global Middlewares
// -------------------------
app.use(express.json());      // Parse JSON bodies
app.use(cors());              // Enable CORS
app.use(helmet());            // Secure HTTP headers
app.use(mongoSanitize());     // Prevent MongoDB injection
app.use(xss());               // Prevent XSS attacks


// -------------------------
// Logging Middleware
// -------------------------
// Pipe morgan logs into winston instead of console
app.use(
  morgan(":method :url :status :response-time ms - :res[content-length]", {
    stream: {
      write: (message) => logger.http(`[${req?.id}] ${message.trim()}`), // log with correlation ID
    },
  })
);


// -------------------------
// Register Routes
// -------------------------
app.use("/api/health", healthRoutes); // Health check
app.use("/api/auth", authRoutes);     // Auth routes
app.use("/api/tasks", taskRoutes);    // Task routes


// -------------------------
// Global Error Handling
// -------------------------
app.use(errorMiddleware);


// -------------------------
// Export Application
// -------------------------
export default app;
