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
import AdminCourseContent from "../pages/AdminCourseContent";
import ProtectedRoute from "./ProtectedRoute";
import Profile from "../pages/Profile";
import SuperAdminDashboard from "../pages/SuperAdminDashboard";
import SuperAdminLogin from "../pages/SuperAdminLogin";
import SAUsersList from "../pages/SAUsersList";
import SAUserDetail from "../pages/SAUserDetail";
import SACreatorsList from "../pages/SACreatorsList";
import SACreatorDetail from "../pages/SACreatorDetail";

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

        {/* SuperAdmin Login — dedicated public page */}
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />

        {/* User Protected Routes */}
        {/* Routes accessible only to authenticated users. */}

        <Route path="/purchased" element={<ProtectedRoute><Purchased /></ProtectedRoute>} />

        {/* Admin Protected Routes */}
        {/* Routes accessible only to authenticated administrators. */}

        <Route path="/admin/your-courses" element={<ProtectedRoute><Yours /></ProtectedRoute>} />
        <Route path="/admin/course/:courseId" element={<ProtectedRoute><AdminCourse /></ProtectedRoute>} />

        {/* Course content manager page, accessible only to admins */}

        <Route path="/admin/course/:courseId/content" element={<ProtectedRoute><AdminCourseContent /></ProtectedRoute>} />

        {/* Common Protected Routes */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* SuperAdmin Protected Routes */}
        <Route path="/superadmin/dashboard" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
        
        {/* These routes map to the dashboard tabs */}
        <Route path="/superadmin/users" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
        <Route path="/superadmin/creators" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
        <Route path="/superadmin/reports" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />

        {/* Deep Management Routes (accessed via Sidebar) */}
        <Route path="/superadmin/manage/users" element={<ProtectedRoute><SAUsersList /></ProtectedRoute>} />
        <Route path="/superadmin/manage/users/:userId" element={<ProtectedRoute><SAUserDetail /></ProtectedRoute>} />
        <Route path="/superadmin/manage/creators" element={<ProtectedRoute><SACreatorsList /></ProtectedRoute>} />
        <Route path="/superadmin/manage/creators/:creatorId" element={<ProtectedRoute><SACreatorDetail /></ProtectedRoute>} />
    </Routes>
);

export default AppRoutes;

