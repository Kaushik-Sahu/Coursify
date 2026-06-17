/**
 * @fileoverview This file defines the ProtectedRoute component.
 * It acts as a wrapper for routes that require user authentication or specific roles.
 * If the user is not authenticated or authorized, they are redirected appropriately.
 */

import { Navigate, useLocation } from "react-router-dom";

/**
 * A component that protects routes based on user authentication and role.
 * - Unauthenticated users are redirected to the home page (or superadmin login for superadmin routes).
 * - Admin routes require 'admin' type, superadmin routes require 'superadmin' type.
 */
const ProtectedRoute = ({ children }) => {
    // Retrieve authentication token and user type from local storage.
    const token = localStorage.getItem("accessToken");
    const userType = localStorage.getItem("type");
    const location = useLocation();

    // SuperAdmin routes: redirect to /superadmin/login if not authenticated as superadmin.
    if (location.pathname.startsWith("/superadmin")) {
        if (!token || userType !== "superadmin") {
            return <Navigate to="/superadmin/login" state={{ from: location }} replace />;
        }
        return children;
    }

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

