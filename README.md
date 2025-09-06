# Coursify - Course Selling Platform

> **Note:** This project is currently a work in progress.

Coursify is a full-stack web application built with the MERN stack, designed to be a platform for buying and selling online courses. It features a robust authentication system, separate dashboards for users and admins, and a clean, modern user interface.

## Features

- **Advanced Authentication:** Implements a secure authentication mechanism using an **Access and Refresh Token** strategy. This enhances security by using short-lived access tokens for API requests and long-lived refresh tokens to obtain new access tokens without requiring users to log in repeatedly, providing a seamless user experience.
- **Client-Side Routing:** Utilizes **React Router** to create a smooth, single-page application (SPA) experience. This allows for fast navigation between different sections of the application without a full page reload.
- **Protected Routes:** Implements **React Protected Routing** to restrict access to specific routes based on user authentication status and roles (e.g., admin-only dashboards). This ensures that sensitive parts of the application are only accessible to authorized users.
- **Responsive Design:** Built with a mobile-first approach using Tailwind CSS, ensuring the application is fully responsive and provides a seamless experience on all devices, from desktops to mobile phones.
- **OTP Verification:** Employs email-based OTP verification for new user sign-ups to ensure valid user registration.
- **Role-based Access Control:** Differentiated access and functionalities for regular users and administrators.
- **Admin Panel:** A dedicated interface for administrators to add, view, and manage courses.
- **User Dashboard:** A section for registered users to view their purchased courses.

## Future Enhancements

- **Dynamic and Informative Home Page:** Transform the current static welcome page into a rich, engaging landing page with components such as:
  - A hero section with a strong call-to-action.
  - A list of featured or top-rated courses.
  - Testimonials from students.
  - A brief "How it Works" section.
- **Payment Gateway Integration:** Implement Stripe or a similar service to handle course purchases.
- **Detailed Course Pages:** Individual pages for each course with detailed descriptions, syllabi, and instructor information.
- **Advanced Search & Filtering:** Allow users to search for courses by category, price, and other criteria.
- **User Profile Management:** Enable users to view and update their profile information.
- **Course Content Delivery:** Functionality for instructors to upload and manage course materials (videos, articles, quizzes).

## Tech Stack

- **Frontend:**
  - **React.js:** For building the user interface.
  - **React Router:** For handling client-side routing.
  - **Recoil:** A state management library for React. Chosen for its simplicity and minimal API, making it easy to manage shared state across components.
  - **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **Backend:**
  - **Node.js & Express.js:** For building the RESTful API.
  - **MongoDB & Mongoose:** As the database and Object Data Modeling (ODM) library.
  - **Zod:** A TypeScript-first schema declaration and validation library. Used to ensure the correctness of incoming data to the API, preventing invalid data from being processed.
- **Authentication:**
  - **JSON Web Tokens (JWT):** For creating access and refresh tokens.
  - **bcrypt:** For hashing user passwords before storing them.
- **Email Service:** **Nodemailer** for sending OTP and other transactional emails.
- **Development/Build Tool:** **Vite** for a fast frontend development experience.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js and npm (or yarn)
- MongoDB (local installation or a cloud service like MongoDB Atlas)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/Kaushik-Sahu/Coursify.git
    cd Coursify
    ```

2.  **Set up the Backend:**
    ```sh
    cd Backend
    npm install
    ```
    - Create a `.env` file in the `Backend` directory by copying the `.env.example`.
    - Fill in the required environment variables:
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
      
    - Start the backend server:
      ```sh
      npm run dev
      ```
    - The server will be running on `http://localhost:3000`.

3.  **Set up the Frontend:**
    ```sh
    cd ../Frontend
    npm install
    ```
    - Start the frontend development server:
      ```sh
      npm run dev
      ```
    - The application will be accessible at `http://localhost:5173` (or another port if 5173 is in use).

## Contact

Kaushik Sahu - [LinkedIn](www.linkedin.com/in/kaushik-sahu)

Project Link: [https://github.com/Kaushik-Sahu/Coursify](https://github.com/Kaushik-Sahu/Coursify)