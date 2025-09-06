const { Verification } = require('../database/db');
const sendMail = require('../utils/mailer');
const otpTemplate = require('../utils/emailTemplate');


/**
 * Generates a random 6-digit One-Time Password (OTP).
 * @returns {string} The generated 6-digit OTP as a string.
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Orchestrates the OTP process: generates an OTP, sends it via email,
 * and stores it in the database for later verification.
 */
const sendOTP = async (email, username, password) => {
    try {
        const code = generateOTP();
        const emailHTML = otpTemplate(code);
        await sendMail(email, "Verification Code", emailHTML);
        // Store the OTP along with user details temporarily for verification.
        await Verification.create({ email, username, password, code });
    } catch (error) {
        console.error("Error in sendOTP process: ", error);
        // Propagate the error to be handled by the global error handler.
        throw error;
    }
};

/**
 * Middleware to verify an OTP provided by a user.
 * Note: This is not currently used in the main authentication flow but is available.
 */
const verifyOTP = async (req, res, next) => {
    try {
        const { email, code } = req.body;
        const verification = await Verification.findOne({ email, code });
        if (!verification) {
            return res.status(400).json({ error: "Invalid OTP" });
        }
        // Attach verification data to the request for potential use in subsequent handlers.
        req.verification = verification;
        next();
    } catch (error) {
        console.error("Error in verifyOTP middleware: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { sendOTP, verifyOTP };