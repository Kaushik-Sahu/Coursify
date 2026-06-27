/**
 * @fileoverview This file defines the YourCourses page component.
 * It displays a list of courses created by the logged-in administrator.
 * It also integrates the AddCourse component for creating new courses.
 */

import AddCourse from "../components/Add";
import { useState ,useEffect} from "react";
import api from "../api";
import { Card } from "../ui/Card";
import { useNavigate } from "react-router-dom";

/**
 * The YourCourses page component.
 * Fetches and displays courses created by the current admin, and provides an option to add new courses.
 */
export function Yours() {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        /**
         * Fetches the list of courses created by the logged-in admin from the backend API.
         */
        const fetchCourses = async () => {
            try {
                const response = await api.get(`/admin/courses`);
                setCourses(response.data.courses || []); // Ensure courses is always an array
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to fetch courses:", err);
                setError("Error: Unable to fetch courses");
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, []); // Empty dependency array ensures this effect runs only once on mount

    if (isLoading) {
        return <div className='text-3xl font-semibold font-mono text-center m-6'>Loading...</div>;
    }

    if (error) {
        return (
            <div>
                <div className='text-2xl font-semibold font-mono text-center m-6'>Your Courses</div>
                <AddCourse />
                <div className='text-3xl font-semibold font-mono text-center m-6 text-red-500'>{error}</div>
            </div>
        );
    }
    
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(c => c.published).length;
    const draftCourses = courses.filter(c => !c.published).length;

    return (
        <div className='min-h-screen bg-transparent pb-12 animate-fade-in'>
            {/* Header section with gradient */}
            <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 py-12 px-4 sm:px-6 lg:px-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-purple-50/20 to-transparent"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <h1 className='text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl tracking-tight'>
                        Creator Hub <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">/ Course Builder</span>
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Manage your published courses, drafts, and quickly create new interactive content for your students.
                    </p>
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Stats & Actions Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8 items-center">
                    {/* Glassmorphic Stats Counters */}
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-center h-28">
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Courses</span>
                        <span className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{totalCourses}</span>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-center h-28">
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">Published</span>
                        <span className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{publishedCourses}</span>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-center h-28">
                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Drafts</span>
                        <span className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{draftCourses}</span>
                    </div>

                    {/* Add Course Modal Trigger container */}
                    <div className="flex justify-start md:justify-end items-center h-28">
                        <AddCourse setCourses={setCourses} />
                    </div>
                </div>

                {/* Course Grid */}
                {courses.length > 0 ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full justify-items-stretch'>
                        {courses.map(course => (
                            <Card
                                key={course._id}
                                title={course.title}
                                imageLink={course.image}
                                price={course.price}
                                badge={course.published ? '🟢 Live' : '🟠 Draft'}
                                buttons={[
                                    {
                                        text: 'Manage / Edit',
                                        onClick: () => navigate(`/admin/course/${course._id}`, { state: { course } })
                                    },
                                    {
                                        text: 'Content',
                                        onClick: () => navigate(`/admin/course/${course._id}/content`, { state: { course } })
                                    }
                                ]}
                            />
                        ))}
                    </div>
                ) : (
                    <div className='flex flex-col items-center justify-center mt-20 p-12 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto'>
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
                            <span className="text-3xl">👨‍💻</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No courses built yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-center">Use the button above to create your first learning course and share it with the world.</p>
                    </div>
                )}
            </div>
        </div>
    );
}