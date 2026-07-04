const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Verification, signupSchema } = require("../database/db");
const { sendOTP } = require("../Middlewares/otp");
const { generateTokens } = require("../utils/token");
const ErrorHandler = require("../utils/ErrorHandler");

/**
 * A factory function that creates a set of authentication handlers for a specific user model.
 * This pattern allows reusing the same authentication logic for different types of users (e.g., 'user', 'admin').
 */
const createAuthHandlers = (Model, userType) => {

   
    // Handles user signup. Validates input, checks for existing users, and sends an OTP for verification.
    
    const signup = async (req, res, next) => {
        const parsed = signupSchema.safeParse(req.body);
        if (!parsed.success) {
            return next(new ErrorHandler(400, "Invalid input format"));
        }

        const { username, password, email } = parsed.data;

        try {
            const existingUser = await Model.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                return next(new ErrorHandler(400, `${userType} with this username or email already exists`));
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await sendOTP(email, username, hashedPassword);

            res.status(200).json({
                message: "Verification email sent successfully"
            });
        } catch (err) {
            next(err); // Pass error to the global error handler
        }
    };

 
     // Verifies a user's OTP, creates the user record, and issues authentication tokens.

    const verify = async (req, res, next) => {
        const { email, otp } = req.body;
        try {
            // Find the corresponding OTP and user data in the temporary verification collection.
            const verification = await Verification.findOne({ email, code: otp });
            if (!verification) {
                return next(new ErrorHandler(400, "Invalid or expired OTP"));
            }

            // If OTP is valid, create the permanent user record.
            const { username, password } = verification;
            const user = await Model.create({ username, password, email });

            // Clean up the verification collection by removing the used OTP.
            await Verification.deleteOne({ email, code: otp });

            const { accessToken, refreshToken } = generateTokens(user);
            user.refreshToken = refreshToken;
            await user.save();

            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 30 * 24 * 60 * 60 * 1000 });

            res.status(201).json({
                message: `${userType} created successfully`,
                accessToken
            });
        } catch (err) {
            // Handle cases where the user might already exist due to a race condition.
            if (err.code === 11000) {
                return next(new ErrorHandler(400, `${userType} with this username or email already exists`));
            }
            next(err);
        }
    };

   
     // Handles user login. Validates credentials and issues authentication tokens.
    
    const login = async (req, res, next) => {
        const { username, password } = req.body;
        try {
            // Find user by username or email. Explicitly include the password and refreshToken fields, which are excluded by default.
            const user = await Model.findOne({ $or: [{ username }, { email: username }] }).select('+password +refreshToken');
            if (!user) {
                return next(new ErrorHandler(401, "Invalid credentials"));
            }

            if (user.blocked) {
                return next(new ErrorHandler(403, "Your account has been suspended."));
            }

            // If the user signed up via Google and has no password, they can't use password login.
            if (!user.password) {
                return next(new ErrorHandler(401, "This account uses Google Sign-In. Please log in with Google."));
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return next(new ErrorHandler(401, "Invalid credentials"));
            }

            const { accessToken, refreshToken } = generateTokens(user);
            user.refreshToken = refreshToken;
            await user.save();

            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 30 * 24 * 60 * 60 * 1000 });

            res.status(200).json({
                message: "Logged in successfully",
                accessToken
            });
        } catch (err) {
            next(err);
        }
    };


     // Refreshes a user's access token using a valid refresh token.
    
    const refresh = async (req, res, next) => {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return next(new ErrorHandler(401, "Authentication error: No refresh token provided"));
        }

        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            
            const user = await Model.findById(decoded.id);
            // Ensure the token belongs to the user and hasn't been invalidated.
            if (!user || user.refreshToken !== refreshToken) {
                return next(new ErrorHandler(403, "Forbidden: Invalid or expired refresh token"));
            }

            if (user.blocked) {
                return next(new ErrorHandler(403, "Forbidden: Your account has been suspended."));
            }

            const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
            user.refreshToken = newRefreshToken;
            await user.save();

            res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 30 * 24 * 60 * 60 * 1000 });

            res.json({ accessToken });
        } catch (err) {
            next(new ErrorHandler(403, "Forbidden: Invalid refresh token"));
        }
    };

   
    // Handles user logout. Clears the refresh token from the database and the client-side cookie.
     
    const logout = async (req, res, next) => {
        const { refreshToken } = req.cookies;
        try {
            if (refreshToken) {
                // Invalidate the refresh token on the server side for enhanced security.
                await Model.updateOne({ refreshToken }, { $set: { refreshToken: null } });
            }
            res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'strict' });
            res.status(200).json({ message: `${userType} logged out successfully` });
        } catch (err) {
            next(err);
        }
    };

    const forgotPassword = async (req, res, next) => {
        try {
            const { email } = req.body;
            if (!email) return next(new ErrorHandler(400, "Email is required"));

            const user = await Model.findOne({ email });
            if (!user) {
                return next(new ErrorHandler(404, "No account found with this email"));
            }

            const { sendPasswordResetOTP } = require('../Middlewares/otp');
            await sendPasswordResetOTP(email);

            res.status(200).json({ message: "Password reset OTP sent to your email" });
        } catch (err) {
            next(err);
        }
    };

    const resetPassword = async (req, res, next) => {
        try {
            const { email, otp, newPassword } = req.body;
            if (!email || !otp || !newPassword) {
                return next(new ErrorHandler(400, "Email, OTP, and new password are required"));
            }

            const { PasswordReset } = require('../database/db');
            const resetDoc = await PasswordReset.findOne({ email, code: otp });

            if (!resetDoc) {
                return next(new ErrorHandler(400, "Invalid or expired OTP"));
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await Model.updateOne({ email }, { $set: { password: hashedPassword } });
            await PasswordReset.deleteOne({ _id: resetDoc._id });

            res.status(200).json({ message: "Password has been reset successfully" });
        } catch (err) {
            next(err);
        }
    };

    const updatePreferences = async (req, res, next) => {
        try {
            const { emailNotif, pushNotif } = req.body;
            if (emailNotif === undefined && pushNotif === undefined) {
                return res.status(400).json({ error: "No preferences provided to update" });
            }

            const updateFields = {};
            if (emailNotif !== undefined) updateFields.emailNotif = emailNotif;
            if (pushNotif !== undefined) updateFields.pushNotif = pushNotif;

            const user = await Model.findByIdAndUpdate(
                req.userId,
                { $set: updateFields },
                { new: true }
            );

            if (!user) {
                return next(new ErrorHandler(404, "User not found"));
            }

            res.status(200).json({ message: "Preferences updated successfully", user });
        } catch (err) {
            next(err);
        }
    };

    return { signup, verify, login, refresh, logout, forgotPassword, resetPassword, updatePreferences };
};

module.exports = { createAuthHandlers };