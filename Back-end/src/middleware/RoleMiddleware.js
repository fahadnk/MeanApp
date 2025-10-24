/**
 * --------------------------------------------------------
 * Role-Based Access Control (RBAC) Middleware
 * --------------------------------------------------------
 * Purpose:
 * - Restrict access to specific routes based on user roles.
 * - Ensures only authorized roles (e.g., admin, manager) 
 *   can access certain endpoints.
 * - Works together with `AuthMiddleware`, which attaches 
 *   the authenticated user's data (req.user) to the request.
 *
 * Example usage:
 *   router.get("/admin/dashboard", 
 *     authMiddleware, 
 *     roleMiddleware("admin"), 
 *     adminController.dashboard
 *   );
 *
 * @param {string|string[]} allowedRoles - The allowed role(s) for this route.
 *   Example:
 *     roleMiddleware("admin")               // only admin
 *     roleMiddleware(["admin", "manager"])  // admin or manager
 *
 * @returns {Function} Express middleware function
 */
function roleMiddleware(allowedRoles) {

  // --------------------------------------------------------
  // Step 1: Normalize the roles parameter
  // --------------------------------------------------------
  // "allowedRoles" can be a single string or an array of roles.
  // We ensure it is always an array for consistency.
  //
  // Example:
  //   - If passed "admin" → becomes ["admin"]
  //   - If passed ["admin", "manager"] → stays the same
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // --------------------------------------------------------
  // Step 2: Return the actual middleware function
  // --------------------------------------------------------
  // Express middlewares must return a function with 
  // the signature (req, res, next).
  // This returned function will run on each request 
  // that uses this middleware.
  return (req, res, next) => {

    // --------------------------------------------------------
    // Step 3: Check if user context exists (set by AuthMiddleware)
    // --------------------------------------------------------
    // "AuthMiddleware" should have already verified the JWT token
    // and attached the user object to req.user.
    //
    // If req.user is missing, it means authentication failed or 
    // the middleware was not applied before this one.
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized: No user context",
      });
    }

    // --------------------------------------------------------
    // Step 4: Check if the user's role is allowed
    // --------------------------------------------------------
    // Compare the user's role (req.user.role) with the allowed roles.
    // If the role is not found in the allowed list, reject the request.
    //
    // Example:
    //   allowedRoles = ["admin"]
    //   req.user.role = "user"
    //   → Access denied (403 Forbidden)
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: Insufficient role",
      });
    }

    // --------------------------------------------------------
    // Step 5: If all checks pass, continue to next middleware/handler
    // --------------------------------------------------------
    // The user is authenticated AND has a valid role.
    // Proceed to the next function (e.g., controller or another middleware).
    next();
  };
}


// --------------------------------------------------------
// Step 6: Export Middleware
// --------------------------------------------------------
// Export the middleware so it can be used in your routes.
//
// Example usage:
//   import roleMiddleware from "../middleware/RoleMiddleware.js";
//   router.get("/admin", authMiddleware, roleMiddleware("admin"), adminController.index);
export default roleMiddleware;
