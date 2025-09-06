# Coursify - Backend API

This directory contains the backend service for the Coursify platform. It is a RESTful API built with Node.js and Express, responsible for handling user authentication, course management, and data persistence.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose (ODM)
- **Authentication:** JSON Web Tokens (JWT) using an Access/Refresh token strategy.
- **Validation:** Zod for schema validation.
- **Email Service:** Nodemailer for sending OTP emails.
- **Dependencies:** `bcrypt` for password hashing, `cors` for resource sharing, `dotenv` for environment variables.

## Getting Started

To get the backend server running locally, follow these steps.

1.  **Navigate to the directory:**
    ```sh
    cd Backend
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in this directory and populate it with the necessary values. You can use the `.env.example` file as a template.

4.  **Start the server:**
    ```sh
    npm run dev
    ```
    The server will start on the port specified in your `.env` file (e.g., `http://localhost:3000`).

## Environment Variables

The following environment variables are required for the application to run:

```
JWT_SECRET="Your JWT secret"
PORT=3000
ACCESS_TOKEN_SECRET="Your access token secret"
REFRESH_TOKEN_SECRET="Your refresh token secret"
ACCESS_TOKEN_EXPIRATION="20m"
REFRESH_TOKEN_EXPIRATION="30d"
SMTP_HOST="your_smtp_host"
SMTP_PORT=your_smtp_port
SMTP_USER="your_smtp_username"
SMTP_PASS="your_smtp_password"
```

## API Endpoints

The API is structured into two main roles: `User` and `Admin`.

### User Routes (`/api/users`)

- `POST /signup`: Register a new user.
- `POST /verify`: Verify a new user's email with an OTP.
- `POST /login`: Log in a user and receive access/refresh tokens.
- `POST /logout`: Log out a user.
- `POST /refresh`: Obtain a new access token using a refresh token.
- `GET /courses`: Get a list of all available courses.
- `POST /courses/:courseId`: Purchase a course (requires authentication).
- `GET /purchasedCourses`: Get a list of courses purchased by the logged-in user (requires authentication).

### Admin Routes (`/api/admin`)

- `POST /signup`: Register a new admin.
- `POST /verify`: Verify a new admin's email with an OTP.
- `POST /login`: Log in an admin and receive access/refresh tokens.
- `POST /logout`: Log out an admin.
- `POST /refresh`: Obtain a new access token using a refresh token.
- `GET /courses`: Get all courses created by the logged-in admin (requires authentication).
- `POST /courses`: Create a new course (requires authentication).
- `PUT /courses/:courseId`: Update an existing course (requires authentication).
- `DELETE /courses/:courseId`: Delete a course (requires authentication).

## Folder Structure

```
Backend/
├── Controllers/    # Handles the logic for each route
├── database/       # Database connection setup
├── Middlewares/    # Express middlewares (e.g., auth)
├── routes/         # API route definitions
├── services/       # services (e.g., authService)
├── utils/          # Utility functions (e.g., mailer, tokens)
├── .env.example    # Example environment file
├── package.json
└── server.js       # Main server entry point
```
