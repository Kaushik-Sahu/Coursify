const express = require('express');
const dotenv = require("dotenv");
const cors = require('cors');
const { connectDB } = require('./database/db');
const { seedRootSuperAdmin } = require('./database/seed');
const adminRoutes = require('./routes/admin');
const contentRoutes = require('./routes/content');
const userRoutes = require('./routes/user');
const superAdminRoutes = require('./routes/superAdmin');
const authGoogleRoutes = require('./routes/authGoogle');
const notificationRoutes = require('./routes/notifications');
const errorMiddleware = require('./Middlewares/error');
const cookieParser = require('cookie-parser');
const { startCleanupJob } = require('./jobs/cleanupTemp');

dotenv.config();
const app = express();

// Dynamic CORS config to support multiple local and production origins
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173'
].filter(Boolean).map(url => url.replace(/\/+$/, ''));

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        
        const normalizedOrigin = origin.replace(/\/+$/, '');
        const isLocal = normalizedOrigin.startsWith('http://localhost:') || 
                        normalizedOrigin.startsWith('http://127.0.0.1:') || 
                        normalizedOrigin.startsWith('https://localhost:') || 
                        normalizedOrigin.startsWith('https://127.0.0.1:');
                        
        if (allowedOrigins.includes(normalizedOrigin) || isLocal) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Ensure database connection and seeding are complete before handling requests (crucial for serverless cold-starts)
let seeded = false;
app.use(async (req, res, next) => {
    try {
        await connectDB();
        if (!seeded) {
            await seedRootSuperAdmin();
            seeded = true;
        }
        next();
    } catch (error) {
        next(error);
    }
});

app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin', contentRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/superadmin', superAdminRoutes);
app.use('/api/v1/auth/google', authGoogleRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Centralized Error Handling Middleware - MUST be after all routes
app.use(errorMiddleware);

const port = process.env.PORT || 3000;

/**
 * Starts the server: connects to DB, seeds root superadmin,
 * starts the temp cleanup job, then listens (if not in serverless environment).
 */
const startServer = async () => {
    await connectDB();
    await seedRootSuperAdmin();
    startCleanupJob();

    // In a serverless environment (like Vercel), we don't start the listener.
    if (process.env.NODE_ENV !== 'production') {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
};

startServer();

// Export the app instance for Vercel serverless functions
module.exports = app;

