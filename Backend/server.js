const express = require('express');
const dotenv = require("dotenv");
const cors = require('cors');
const { connectDB } = require('./database/db');
const { seedRootSuperAdmin } = require('./database/seed');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const superAdminRoutes = require('./routes/superAdmin');
const authGoogleRoutes = require('./routes/authGoogle');
const notificationRoutes = require('./routes/notifications');
const errorMiddleware = require('./Middlewares/error');
const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();

// Dynamic CORS config to support multiple local and production origins
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        
        const isLocal = origin.startsWith('http://localhost:') || 
                        origin.startsWith('http://127.0.0.1:') || 
                        origin.startsWith('https://localhost:') || 
                        origin.startsWith('https://127.0.0.1:');
                        
        if (allowedOrigins.includes(origin) || isLocal) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/admin', adminRoutes);
app.use('/users', userRoutes);
app.use('/superadmin', superAdminRoutes);
app.use('/auth/google', authGoogleRoutes);
app.use('/notifications', notificationRoutes);

// Centralized Error Handling Middleware - MUST be after all routes
app.use(errorMiddleware);

const port = process.env.PORT || 3000;

/**
 * Starts the server: connects to DB, seeds root superadmin, then listens.
 */
const startServer = async () => {
    await connectDB();
    await seedRootSuperAdmin();

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

startServer();
