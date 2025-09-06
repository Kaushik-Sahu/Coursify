/**
 * @fileoverview This file defines the main application routes using React Router.
 * It sets up public routes, and protected routes for users and administrators.
 */

import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import { Courses } from "../pages/Courses";
import { Purchased } from "../pages/Purchased";
import { Yours } from "../pages/YourCourses.jsx";
import { AdminCourse } from "../pages/AdminCourse";
import { UserCourse } from "../pages/UserCourse";
import ProtectedRoute from "./ProtectedRoute";

/**
 * Defines the application's routing structure.
 * All routes are wrapped within a `<Routes>` component from `react-router-dom`.
 */
const AppRoutes = () => (
    <Routes>
        {/* Public Routes */}

        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />

        {/* Route for displaying a single course's details, accessible publicly */}

        <Route path="/course/:courseId" element={<UserCourse />} />

        {/* User Protected Routes */}
        {/* Routes accessible only to authenticated users. */}

        <Route path="/purchased" element={<ProtectedRoute><Purchased /></ProtectedRoute>} />

        {/* Admin Protected Routes */}
        {/* Routes accessible only to authenticated administrators. */}

        <Route path="/admin/your-courses" element={<ProtectedRoute><Yours /></ProtectedRoute>} />
        <Route path="/admin/course/:courseId" element={<ProtectedRoute><AdminCourse /></ProtectedRoute>} />

        {/* Placeholder for course content page, accessible only to admins for now */}

        <Route path="/admin/course/:courseId/content" element={<ProtectedRoute><div>Course Content Page</div></ProtectedRoute>} />
    </Routes>
);

export default AppRoutes;
