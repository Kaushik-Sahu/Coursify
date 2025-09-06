/**
 * Custom error class to handle operational errors with a status code.
 * @extends Error
 */
class ErrorHandler extends Error {
    /**
     * @param {number} statusCode - The HTTP status code for the error.
     * @param {string} message - The error message.
     */
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;

        // Capture the stack trace, excluding the constructor call from it.
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorHandler;