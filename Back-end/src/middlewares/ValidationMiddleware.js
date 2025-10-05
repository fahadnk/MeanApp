// backend/src/middleware/ValidationMiddleware.js

// Import the helper function from express-validator
// `validationResult` collects validation errors defined in route validators
const { validationResult } = require("express-validator");

// Middleware to check if request validation passed
function validateRequest(req, res, next) {
  // Run validation checks and gather any errors for this request
  const errors = validationResult(req);

  // If validation errors exist, stop here and return a 400 Bad Request
  // `errors.array()` returns an array of all validation error details
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // If no validation errors, continue to the next middleware or route handler
  next();
}

// Export the middleware to be reused in routes
module.exports = validateRequest;
