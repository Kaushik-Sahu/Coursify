/**
 * @fileoverview This file defines the Purchased page component.
 * It displays a list of courses that the logged-in user has purchased.
 */

import { useState, useEffect } from 'react';
import api from '../api';
import { Card } from '../ui/Card';
import { useNavigate } from 'react-router-dom';

/**
 * The Purchased page component.
 * Fetches and displays courses purchased by the current user.
 */
export function Purchased() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
       
         //Fetches the list of purchased courses from the backend API.
     
        const fetchPurchasedCourses = async () => {
            try {
                const response = await api.get(`/users/purchasedCourses`);
                setCourses(response.data.purchasedCourses || []); // Ensure courses is always an array
            } catch (err) {
                setError("Failed to fetch purchased courses.");
                console.error("Error fetching purchased courses:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPurchasedCourses();
    }, []); // Empty dependency array ensures this effect runs only once on mount

    if (loading) {
        return <div className='text-center m-6'>Loading purchased courses...</div>;
    }

    if (error) {
        return <div className='text-center text-red-500 m-6'>{error}</div>;
    }

    return (
        <div className='min-h-screen bg-transparent pb-12 animate-fade-in'>
            {/* Header section with gradient */}
            <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 py-12 px-4 sm:px-6 lg:px-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-purple-50/20 to-transparent"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <h1 className='text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl tracking-tight'>
                        My <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Purchased Courses</span>
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Access your enrolled learning paths, track your progress, and continue studying anytime.
                    </p>
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {courses.length > 0 ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full justify-items-stretch'>
                        {courses.map(course => (
                            <Card
                                key={course._id}
                                title={course.title}
                                imageLink={course.image}
                                price={course.price}
                                buttons={[
                                    {
                                        text: 'View Details',
                                        onClick: () => navigate(`/course/${course._id}`, { state: { course, preview: true } })
                                    },
                                    {
                                        text: 'Start Learning',
                                        onClick: () => navigate(`/course/${course._id}`, { state: { course } })
                                    }
                                ]}
                            />
                        ))}
                    </div>
                ) : (
                    <div className='flex flex-col items-center justify-center mt-20 p-12 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto'>
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
                            <span className="text-3xl">🎓</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No purchased courses</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-center mb-6">You haven't enrolled in any courses yet. Browse our selection and start learning today!</p>
                        <button 
                            onClick={() => navigate('/courses')}
                            className="bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-indigo-505 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 cursor-pointer border-0"
                        >
                            Explore Courses
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}