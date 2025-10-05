// backend/src/middleware/RoleMiddleware.js

/**
 * --------------------------------------------------------
 * Role-Based Access Control (RBAC) Middleware
 * --------------------------------------------------------
 * Purpose:
 * - Restrict access to certain routes based on user roles.
 * - Works in conjunction with `AuthMiddleware` which sets `req.user`.
 *
 * @param {string|string[]} allowedRoles - A single role (string) or list of roles (array) 
 *                                         that are allowed to access the route.
 * @returns {Function} Express middleware function
 */
function roleMiddleware(allowedRoles) {
  // --------------------------------------------------------
  // Normalize allowedRoles into an array
  // Example:
  //   "admin" → ["admin"]
  //   ["admin", "manager"] → ["admin", "manager"]
  // --------------------------------------------------------
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // Return the actual middleware function
  return (req, res, next) => {
    // --------------------------------------------------------
    // Ensure user context is available
    // `req.user` is populated by `AuthMiddleware` after JWT verification.
    // If it doesn't exist, it means the user is not authenticated.
    // --------------------------------------------------------
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user context" });
    }

    // --------------------------------------------------------
    // Role Check
    // Compare the role of the authenticated user with allowedRoles.
    // If not included, deny access.
    // --------------------------------------------------------
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }

    // --------------------------------------------------------
    // If the role check passes → continue to next handler
    // --------------------------------------------------------
    next();
  };
}

// --------------------------------------------------------
// Export Middleware
// --------------------------------------------------------
// Export as default so it can be imported like:
// import roleMiddleware from "../middleware/RoleMiddleware.js";
export default roleMiddleware;
