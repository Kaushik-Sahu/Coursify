
/**
 * @fileoverview This file defines the database connection, Mongoose schemas, and models for the application.
 * It also includes Zod schemas for input validation.
 */

const mongoose = require('mongoose');
const z = require("zod");
const dotenv = require("dotenv");
dotenv.config();

const database = process.env.MONGO_URI;

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * Exits the application process if the connection fails.
 */
const connectDB = async () => {
    try {
        await mongoose.connect(database);
        console.log("Successfully connected to the database.");
    } catch (error) {
        console.error("FATAL: Failed to connect to the database", error);
        process.exit(1);
    }
};

// Zod schema for validating signup request bodies.
const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  email: z.string().email("Invalid email format")
});

// --- Mongoose Schemas ---

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true }, 
  password: { type: String, required: true, select: false },// The password field is selected as false by default in the schema to prevent it from being returned in queries.
  email: { type: String, required: true, unique: true, trim: true },
  
  // Array of ObjectIds referencing the courses the user has enrolled in.
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course' // This tells Mongoose to populate from the Course model.
    }
  ],

  // Stores the refresh token to validate sessions.
  refreshToken: { type: String, select: false }
});

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, select: false },
  email: { type: String, required: true, unique: true, trim: true },
  refreshToken: { type: String, select: false }
});

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    published: { type: Boolean, default: false },
    
    // ObjectId of the admin who created the course.
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }
});

// Create a compound index to ensure that a course title is unique per creator.
// This prevents an admin from creating two courses with the exact same title.

courseSchema.index({ title: 1, creator: 1 }, { unique: true });

/**
 * Schema for temporarily storing user data during OTP verification.
 * Documents in this collection have a Time-To-Live (TTL) index on `createdAt`,
 * causing them to be automatically deleted from the database after 2 minutes.
 */

const verificationSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Stores the hashed password temporarily.
    code: { type: String, required: true }, 
    createdAt: { type: Date, default: Date.now, expires: '2m' } // `expires: '2m'` creates a TTL index that automatically deletes the document after 2 minutes.
});


// --- Mongoose Models ---
const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Course = mongoose.model('Course', courseSchema);
const Verification = mongoose.model('Verification', verificationSchema);


module.exports = {
    connectDB,
    User,
    Admin,
    Course,
    Verification,
    signupSchema
};
