/**
 * @fileoverview This file defines the Courses page component.
 * It displays a list of all available courses and allows users to purchase them.
 */

import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import { toast } from 'sonner';
import { useSetRecoilState } from 'recoil';
import { sidebarState } from '../store/atoms';


/**
 * The Courses page component.
 * Fetches and displays a list of courses, and handles course purchase actions.
 * Integrates search functionality by listening to the URL's query parameters.
 */
export function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';
    const setOpen = useSetRecoilState(sidebarState);

    const isLoggedIn = () => !!localStorage.getItem('accessToken');

    useEffect(() => {
        /**
         * Fetches the list of available courses from the backend API,
         * filtering by search query if present.
         */
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/users/courses`, {
                    params: { search: searchQuery }
                });
                setCourses(response.data.courses || []); // Ensure courses is always an array
                setError(null);
            } catch (err) {
                setError("Failed to fetch courses.");
                console.error("Error fetching courses:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [searchQuery]); // Run effect on mount and whenever search query changes

    /**
     * Handles the purchase action for a specific course.
     */
    const handlePurchase = async (courseId) => {
        if (!isLoggedIn()) {
            toast.error('Please sign in to purchase a course.');
            setOpen(true);
            return;
        }
        try {
            await api.post(`/users/courses/${courseId}`);
            toast.success('Course purchased successfully!');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to purchase course.';
            toast.error(errorMsg);
            console.error("Error purchasing course:", err);
        } finally {
            
        }
    };

    const handleViewDetails = (courseId, course) => {
        if (!isLoggedIn()) {
            toast.error('Please sign in to view course details.');
            setOpen(true);
            return;
        }
        navigate(`/course/${courseId}`, { state: { course, preview: true } });
    };

    if (loading) {
        return <div className='text-center m-6'>Loading...</div>;
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
                        Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Courses</span>
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Find the perfect course to enhance your skills and advance your career. Expert-led instruction for all levels.
                    </p>
                </div>
            </div>
            
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {courses.length > 0 ? (
                    <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8 w-full justify-items-stretch'>
                        {courses.map(course => (
                            <Card 
                                key={course._id}
                                title={course.title} 
                                imageLink={course.image}
                                price={course.price}
                                creatorName={course.creator?.username}
                                buttons={
                                    course.isPurchased ? [
                                        {
                                            text: 'View Details',
                                            onClick: () => handleViewDetails(course._id, course)
                                        },
                                        {
                                            text: 'Start Learning',
                                            onClick: () => {
                                                if (!isLoggedIn()) {
                                                    toast.error('Please sign in to access course content.');
                                                    setOpen(true);
                                                    return;
                                                }
                                                navigate(`/course/${course._id}`, { state: { course } });
                                            }
                                        }
                                    ] : [
                                        {
                                            text: 'View Details',
                                            onClick: () => handleViewDetails(course._id, course)
                                        },
                                        {
                                            text: 'Purchase Now',
                                            onClick: () => handlePurchase(course._id)
                                        }
                                    ]
                                }
                            />
                        ))}
                    </div>
                ) : (
                    <div className='flex flex-col items-center justify-center mt-20 p-12 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto'>
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
                            <span className="text-3xl">📚</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No courses available yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-center">Check back soon for new learning opportunities.</p>
                    </div>
                )}
            </div>
            
        </div>
    );
}
