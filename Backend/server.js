const express = require('express');
const dotenv = require("dotenv");
const cors = require('cors');
const { connectDB } = require('./database/db');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const errorMiddleware = require('./Middlewares/error');
const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();

// Use environment variable for CORS origin for flexibility
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

connectDB();

app.use('/admin', adminRoutes);
app.use('/users', userRoutes);

// Centralized Error Handling Middleware - MUST be after all routes
app.use(errorMiddleware);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
