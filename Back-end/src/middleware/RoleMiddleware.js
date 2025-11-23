// backend/src/middleware/RoleMiddleware.js

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

import { error } from "../utils/response.js"; 
// 🟦 use your global error formatter

function roleMiddleware(allowedRoles) {

  // --------------------------------------------------------
  // Step 1: Normalize the roles parameter
  // --------------------------------------------------------
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // --------------------------------------------------------
  // Step 2: Return the actual middleware function
  // --------------------------------------------------------
  return (req, res, next) => {

    // --------------------------------------------------------
    // Step 3: Check if user context exists (set by AuthMiddleware)
    // --------------------------------------------------------
    if (!req.user) {
      return error(res, "Unauthorized: No user context", 401);
    }

    // --------------------------------------------------------
    // Step 4: Check if the user's role is allowed
    // --------------------------------------------------------
    if (!roles.includes(req.user.role)) {
      return error(res, "Forbidden: Insufficient role", 403);
    }

    // --------------------------------------------------------
    // Step 5: If all checks pass, continue to next middleware/handler
    // --------------------------------------------------------
    next();
  };
}


// --------------------------------------------------------
// Step 6: Export Middleware
// --------------------------------------------------------
export default roleMiddleware;
