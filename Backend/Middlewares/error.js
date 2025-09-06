const ErrorHandler = require('../utils/ErrorHandler');

/**
 * Express global error handling middleware.
 * This middleware catches all errors passed to `next(err)` and formats them into a consistent JSON response.
 */
const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // In a production environment, you might want to log errors to a dedicated service.
    console.error(`[ERROR] ${err.statusCode} - ${err.message}\n${err.stack}`);

    res.status(err.statusCode).json({
        success: false,
        error: err.message,
    });
};

module.exports = errorMiddleware;