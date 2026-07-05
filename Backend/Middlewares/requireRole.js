const ErrorHandler = require('../utils/ErrorHandler');

/**
 * Middleware to enforce Role-Based Access Control (RBAC).
 * It checks if the user's role (attached to req.userRole by authMiddleware)
 * is included in the allowed roles array.
 * 
 * @param {string[]} allowedRoles - Array of roles allowed to access the route.
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.userRole || !allowedRoles.includes(req.userRole)) {
            return next(new ErrorHandler(403, `Forbidden: You do not have the required permissions. Allowed roles: ${allowedRoles.join(', ')}`));
        }
        next();
    };
};

module.exports = requireRole;
