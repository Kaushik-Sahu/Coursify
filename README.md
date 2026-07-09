# Coursify - Course Selling Platform

Coursify is a full-stack, comprehensive web application built with the MERN stack designed to facilitate buying, selling, and managing online courses. It features a robust multi-role authentication system, dedicated dashboards for Students, Creators (Admins), and a Global SuperAdmin, alongside a clean, responsive, and modern user interface.

## 🌟 Key Features

- **Multi-Role Dashboards:** Distinct experiences and panels tailored for Students (view and learn), Creators/Admins (build and manage), and the SuperAdmin (platform oversight and moderation).
- **Advanced Authentication:** 
  - **Google OAuth 2.0:** One-click secure sign-in for seamless onboarding.
  - **Custom JWT Strategy:** Short-lived access tokens coupled with long-lived HTTP-only refresh tokens for an optimal balance of security and UX.
- **Robust Media Delivery:** Native integration with **Cloudinary** for scalable, secure image (thumbnail) and high-quality video content delivery, including automatic cleanup when courses are deleted.
- **Modern Course Viewer:** A dedicated, distraction-free "Theater Mode" for students to consume video content, distinctly separated from the course preview/sales pages.
- **Content Moderation:** Built-in reporting system allowing users to flag inappropriate content, giving the SuperAdmin the power to block videos or ban bad actors.
- **Dynamic UI & Notifications:** Sleek, micro-animated interface utilizing Tailwind CSS and glassmorphism, paired with real-time, unintrusive `sonner` toast notifications.

## 🚀 Tech Stack

### Frontend
- **React.js + Vite:** Fast, modern UI development.
- **React Router:** Seamless client-side routing and protected routes.
- **Recoil:** Lightweight and efficient global state management.
- **Tailwind CSS + Lucide React:** Utility-first styling with beautiful iconography.
- **Sonner:** High-performance, customizable toast notifications.

### Backend
- **Node.js & Express.js:** Scalable RESTful API architecture.
- **MongoDB & Mongoose:** Flexible schema-based NoSQL database for structured data.
- **Cloudinary SDK:** Direct cloud integration for handling heavy media assets.
- **Zod:** TypeScript-first schema declaration and rigorous data validation.
- **JWT & bcrypt:** Industry-standard security, hashing, and session management.

## 🛠 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18+)
- MongoDB (local installation or MongoDB Atlas URI)
- Cloudinary Account (for media uploads)
- Google Cloud Console Project (for OAuth Client ID)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Kaushik-Sahu/Coursify.git
    cd Coursify
    ```

2.  **Set up the Backend:**
    ```bash
    cd Backend
    npm install
    ```
    - Create a `.env` file in the `Backend` directory:
      ```env
      PORT=3000
      MONGO_URI="your_mongodb_connection_string"
      
      JWT_SECRET="Your_JWT_secret"
      ACCESS_TOKEN_SECRET="Your_access_token_secret"
      REFRESH_TOKEN_SECRET="Your_refresh_token_secret"
      ACCESS_TOKEN_EXPIRATION="20m"
      REFRESH_TOKEN_EXPIRATION="30d"
      
      GOOGLE_CLIENT_ID="your_google_client_id"
      
      CLOUDINARY_CLOUD_NAME="your_cloud_name"
      CLOUDINARY_API_KEY="your_api_key"
      CLOUDINARY_API_SECRET="your_api_secret"
      ```
    - Start the backend server:
      ```bash
      npm run dev
      ```

3.  **Set up the Frontend:**
    ```bash
    cd ../Frontend
    npm install
    ```
    - Create a `.env` file in the `Frontend` directory:
      ```env
      VITE_GOOGLE_CLIENT_ID="your_google_client_id"
      VITE_API_URL="http://localhost:3000/api/v1"
      ```
    - Start the frontend development server:
      ```bash
      npm run dev
      ```
    - The application will be accessible at `http://localhost:5173`.

## 🤝 Contact

Kaushik Sahu - [LinkedIn](https://www.linkedin.com/in/kaushik-sahu)

Project Link: [https://github.com/Kaushik-Sahu/Coursify](https://github.com/Kaushik-Sahu/Coursify)