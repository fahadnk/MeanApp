// backend/src/middleware/ErrorMiddleware.js

// Global error-handling middleware for Express
// This must be defined *after* all routes and other middleware
function errorHandler(err, req, res, next) {
  // Log the full stack trace of the error (useful for debugging)
  console.error(err.stack);

  // Determine status code:
  // - If the error object has a custom statusCode property, use that
  // - Otherwise default to 500 (Internal Server Error)
  const statusCode = err.statusCode || 500;

  // Send a JSON response with:
  // - message: a user-friendly error message
  // - error: the actual error message (could be hidden in production for security)
  res.status(statusCode).json({
    message: "Something went wrong!",
    error: err.message,
  });
}

// Export the middleware so it can be plugged into app.js
module.exports = errorHandler;
