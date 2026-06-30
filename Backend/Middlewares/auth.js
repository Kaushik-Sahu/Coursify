const jwt = require('jsonwebtoken');
const ErrorHandler = require('../utils/ErrorHandler');

/**
 * Middleware to authenticate requests by validating a JWT access token.
 * It checks for a 'Bearer' token in the Authorization header, verifies it,
 * and attaches the decoded user ID to the request object for subsequent handlers.
 */

const authMiddleware = (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return next(new ErrorHandler(401, "Unauthorized: No token provided"));
    }

    const token = authorization.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Attach user ID and role to the request for use in protected routes.
        req.userId = decoded.id;
        req.userRole = decoded.role;

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new ErrorHandler(401, 'Unauthorized: Access token has expired'));
        }

        // For other errors (e.g., malformed token), return a generic invalid token error.
        return next(new ErrorHandler(401, "Unauthorized: Invalid token"));
    }
};

module.exports = authMiddleware;