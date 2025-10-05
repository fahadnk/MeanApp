// backend/src/middleware/ErrorMiddleware.js

// ---------------------------------------------------
// Global Error Handling Middleware for Express
// ---------------------------------------------------
// Note: This middleware must be registered *after* all routes
// and other middleware in app.js. Otherwise, it won’t catch errors.
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
  // - message: a generic, user-friendly error message
  // - error: detailed error message (useful for debugging,
  //          but in production you might hide this)
  res.status(statusCode).json({
    message: "Something went wrong!",
    error: err.message,
  });
}


// ---------------------------------------------------
// Export Middleware
// ---------------------------------------------------
// Export as default so it can be easily imported in app.js
export default errorHandler;
