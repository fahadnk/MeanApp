// backend/src/middleware/ValidationMiddleware.js

// --------------------------------------------------------
// Import Dependencies
// --------------------------------------------------------
// Import `validationResult` from express-validator
// - It collects and formats validation errors defined in route validators
import { validationResult } from "express-validator";

// --------------------------------------------------------
// Validation Middleware
// --------------------------------------------------------
// Purpose:
// - Ensures that requests meet validation rules before reaching controllers.
// - Prevents invalid data from propagating deeper into the system.
// --------------------------------------------------------
function validateRequest(req, res, next) {
  // Run validation checks and gather any errors for this request
  const errors = validationResult(req);

  // --------------------------------------------------------
  // Handle Validation Errors
  // --------------------------------------------------------
  // If validation errors exist:
  // - Stop further execution
  // - Respond with 400 Bad Request
  // - Send back an array of error details for client awareness
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // --------------------------------------------------------
  // If no validation errors:
  // - Move to the next middleware or route handler
  // --------------------------------------------------------
  next();
}

// --------------------------------------------------------
// Export Middleware
// --------------------------------------------------------
// Export as default so it can be imported like:
// import validateRequest from "../middleware/ValidationMiddleware.js";
export default validateRequest;
