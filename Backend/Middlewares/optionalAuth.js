const jwt = require('jsonwebtoken');

/**
 * Middleware to optionally authenticate requests by validating a JWT access token.
 * If a token is provided and valid, it attaches the decoded user ID and role.
 * If no token is provided or it is invalid, it simply proceeds to the next middleware without error.
 */
const optionalAuth = (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return next();
    }

    const token = authorization.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.userId = decoded.id;
        req.userRole = decoded.role;
    } catch (err) {
        // Ignore errors (e.g. expired or invalid token) and proceed as guest
    }
    
    next();
};

module.exports = optionalAuth;
