// backend/src/config/Logger.js

// -------------------------
// Import Winston logger components
// -------------------------
import winston from "winston";

// Destructure required functions from winston
const { createLogger, format, transports } = winston;

// -------------------------
// Custom Log Format
// -------------------------
// Define how logs should look when printed
// - timestamp → when the log was created
// - level → log severity (info, error, warn, debug, etc.)
// - message → the actual log message
// - correlationId → optional field (useful for tracking requests)
// Example output: [2025-09-23T10:00:00Z] [INFO] [12345]: User logged in
const logFormat = format.printf(({ level, message, timestamp, correlationId }) => {
  return `[${timestamp}] [${level.toUpperCase()}] [${correlationId || "N/A"}]: ${message}`;
});

// -------------------------
// Winston Logger Instance
// -------------------------
// Create a new Winston logger with multiple transports (outputs)
const logger = createLogger({
  level: "info", // Default logging level (everything at 'info' and above will be logged)

  // Format: combine multiple formats
  format: format.combine(
    format.timestamp(), // Adds ISO timestamp to each log
    format.json(),      // Ensures logs are structured as JSON (machine-readable)
    logFormat           // Apply our custom format for human readability
  ),

  // Transports: define where logs should go
  transports: [
    new transports.Console(), // Print logs to console (useful during development)
    new transports.File({ filename: "logs/error.log", level: "error" }), // Save only error-level logs
    new transports.File({ filename: "logs/combined.log" }),              // Save all logs (info + errors)
  ],
});

// -------------------------
// Export logger instance
// -------------------------
// Export the logger so it can be used in controllers, services, and middlewares
export default logger;
