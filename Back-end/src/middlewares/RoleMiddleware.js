// backend/src/middleware/RoleMiddleware.js

/**
 * Middleware to restrict access based on user roles
 * @param {string|string[]} allowedRoles - Role or list of roles allowed to access the route
 */
function roleMiddleware(allowedRoles) {
  // Normalize allowedRoles into an array
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    // Ensure user info is available (set by AuthMiddleware)
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user context" });
    }

    // Check if user's role is in allowedRoles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }

    // If authorized → move to next middleware/handler
    next();
  };
}

module.exports = roleMiddleware;
