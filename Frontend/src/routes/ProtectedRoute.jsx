/**
 * @fileoverview This file defines the ProtectedRoute component.
 * It acts as a wrapper for routes that require user authentication or specific roles.
 * If the user is not authenticated or authorized, they are redirected to the home page.
 */

import { Navigate, useLocation } from "react-router-dom";

/**
 * A component that protects routes based on user authentication and role.
 * If the user is not logged in, or if an admin route is accessed by a non-admin user,
 * the user is redirected to the home page.
 */
const ProtectedRoute = ({ children }) => {
    // Retrieve authentication token and user type from local storage.
    const token = localStorage.getItem("accessToken");
    const userType = localStorage.getItem("type");
    const location = useLocation();

    // If no access token is found, redirect to the home page.
    if (!token) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Implement basic role-based protection for admin routes.
    // If the current path starts with '/admin' and the user is not an admin, redirect.
    if (location.pathname.startsWith("/admin") && userType !== "admin") {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // If authenticated and authorized, render the child components (the protected route).
    return children;
};

export default ProtectedRoute;
