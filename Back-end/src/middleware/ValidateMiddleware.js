// backend/src/middleware/ValidateMiddleware.js

// ---------------------------------------------------
// Import Response Helpers
// ---------------------------------------------------
// We use your global standardized API helpers.
// - `error()` ensures consistent error formatting.
// - `success()` is not needed here since this middleware 
//    never sends successful responses — it only validates.
//    But we import both for consistency with your other files.
import { error, success } from "../utils/response.js";

/**
 * --------------------------------------------------------
 * Joi Validation Middleware
 * --------------------------------------------------------
 * Purpose:
 * - Validate incoming request bodies using Joi schemas.
 * - Prevent invalid or malicious data from reaching controllers.
 * - Automatically sanitizes input (removes unknown fields).
 *
 * How it works:
 * - Accepts a Joi schema.
 * - Validates req.body.
 * - If invalid → returns 400 with detailed error list.
 * - If valid → replaces req.body with sanitized data.
 *
 * Usage:
 *   router.post(
 *     "/register",
 *     validateSchema(registerSchema),
 *     authController.register
 *   );
 *
 * @param {Object} schema - Joi validation schema
 * @returns Express middleware function
 */
export default function validateSchema(schema) {
  return (req, res, next) => {

    // --------------------------------------------------------
    // Step 1: Validate request body using the provided schema
    // --------------------------------------------------------
    // Options:
    //  - abortEarly: false → return all errors, not just first
    //  - stripUnknown: true → remove fields not defined in schema
    const { error: validationError, value: validatedBody } = schema.validate(
      req.body,
      {
        abortEarly: false,
        stripUnknown: true,
      }
    );

    // --------------------------------------------------------
    // Step 2: If validation fails → return formatted error response
    // --------------------------------------------------------
    if (validationError) {
      return error(
        res,
        "Validation failed",
        400,
        validationError.details.map((d) => d.message) // detailed error list
      );
    }

    // --------------------------------------------------------
    // Step 3: Replace req.body with validated/sanitized data
    // --------------------------------------------------------
    req.body = validatedBody;

    // --------------------------------------------------------
    // Step 4: Continue to next middleware or controller
    // --------------------------------------------------------
    next();
  };
}
