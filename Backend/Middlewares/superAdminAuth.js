/**
 * @fileoverview Middleware to authorize requests as coming from a SuperAdmin.
 * Verifies the JWT access token and confirms the decoded user ID exists
 * in the SuperAdmin collection. No role field in the JWT is required —
 * since superadmin uses dedicated endpoints, DB-level verification is sufficient.
 */

const jwt = require('jsonwebtoken');
const { SuperAdmin } = require('../database/db');
const ErrorHandler = require('../utils/ErrorHandler');

/**
 * SuperAdmin authorization middleware.
 * 1. Extracts and verifies the JWT from the Authorization header.
 * 2. Checks that the decoded user ID exists in the SuperAdmin collection.
 * 3. Attaches req.userId on success.
 * 4. Returns 401/403 on failure.
 */
const superAdminAuth = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return next(new ErrorHandler(401, 'Unauthorized: No token provided'));
    }

    const token = authorization.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Verify the user actually exists in the SuperAdmin collection.
        // This prevents use of stale tokens after account deletion.
        const superAdmin = await SuperAdmin.findById(decoded.id);
        if (!superAdmin) {
            return next(new ErrorHandler(403, 'Forbidden: SuperAdmin access required'));
        }

        req.userId = decoded.id;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new ErrorHandler(401, 'Unauthorized: Access token has expired'));
        }
        return next(new ErrorHandler(401, 'Unauthorized: Invalid token'));
    }
};

module.exports = superAdminAuth;
