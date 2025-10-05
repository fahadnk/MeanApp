// backend/src/middleware/LoggerMiddleware.js

// -------------------------
// Import Dependencies
// -------------------------

// Morgan → HTTP request logger middleware for Express
import morgan from "morgan";

// Winston logger instance (our centralized logging system)
import logger from "../config/logger.js";


// -------------------------
// Morgan Custom Stream
// -------------------------
// By default, Morgan logs directly to the console.
// Instead, we define a custom "stream" object so Morgan can
// forward its logs to Winston. Winston can then format them,
// tag with correlation IDs, and save them to files.
const stream = {
  // Morgan calls this "write" method with each log line.
  // Example message: "GET /api/tasks 200 135 - 12 ms"
  write: (message) => logger.info(message.trim()), // trim → remove newline
};


// -------------------------
// Morgan Middleware Instance
// -------------------------
// Format string tells Morgan what details to log:
// - :method → HTTP method (GET, POST, etc.)
// - :url → requested URL
// - :status → response status code (200, 404, etc.)
// - :res[content-length] → response size in bytes
// - :response-time ms → time taken to handle request
//
// Example log output: "POST /api/auth/login 201 45 - 23 ms"
const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream } // redirect Morgan output into Winston
);


// -------------------------
// Export Middleware
// -------------------------
// Express will use this middleware to log every request.
// Usage: app.use(requestLogger);
export default requestLogger;
