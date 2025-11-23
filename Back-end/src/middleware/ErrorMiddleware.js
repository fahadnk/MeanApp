// backend/src/middleware/ErrorMiddleware.js

// ---------------------------------------------------
// Global Error Handling Middleware for Express
// ---------------------------------------------------
// Note: This middleware must be registered *after* all routes
// and other middleware in app.js. Otherwise, it won’t catch errors.

import { error } from "../utils/response.js"; 
// Using your global API error formatter

function errorHandler(err, req, res, next) {
  // ---------------------------------------------------
  // Log error details
  // ---------------------------------------------------
  // Logs the full stack trace of the error.
  // In production, you may want to replace this with a logger like Winston.
  console.error(err.stack);

  // ---------------------------------------------------
  // Determine HTTP Status Code
  // ---------------------------------------------------
  // - If the error object contains a custom statusCode, use it
  // - Otherwise, default to 500 (Internal Server Error)
  const statusCode = err.statusCode || 500;

  // ---------------------------------------------------
  // Build JSON Error Response
  // ---------------------------------------------------
  // Using your standardized error() response helper,
  // which ensures consistent API responses across the whole backend.
  return error(res, err.message || "Something went wrong!", statusCode);
}


// ---------------------------------------------------
// Export Middleware
// ---------------------------------------------------
// Export as default so it can be easily imported in app.js
export default errorHandler;
