/**
 * @fileoverview This file defines the Courses page component.
 * It displays a list of all available courses and allows users to purchase them.
 */

import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Notification } from '../ui/Notification';

/**
 * The Courses page component.
 * Fetches and displays a list of courses, and handles course purchase actions.
 */
export function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const navigate = useNavigate();

    useEffect(() => {
        /**
         * Fetches the list of available courses from the backend API.
         */
        const fetchCourses = async () => {
            try {
                const response = await api.get(`/users/courses`);
                setCourses(response.data.courses || []); // Ensure courses is always an array
            } catch (err) {
                setError("Failed to fetch courses.");
                console.error("Error fetching courses:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []); // Empty dependency array ensures this effect runs only once on mount

    /**
     * Handles the purchase action for a specific course.
     */
    const handlePurchase = async (courseId) => {
        try {
            await api.post(`/users/courses/${courseId}`);
            setNotification({ message: 'Course purchased successfully!', type: 'success' });
        } catch (err) {
            setNotification({ message: 'Failed to purchase course.', type: 'error' });
            console.error("Error purchasing course:", err);
        } finally {
            // Clear the notification message after 3 seconds.
            setTimeout(() => setNotification({ message: '', type: '' }), 3000);
        }
    };

    if (loading) {
        return <div className='text-center m-6'>Loading...</div>;
    }

    if (error) {
        return <div className='text-center text-red-500 m-6'>{error}</div>;
    }

    return (
        <div className='px-4 py-8 animate-fade-in'>
            <h1 className='text-3xl font-bold text-center mb-8'>Courses</h1>
            
            <div className='max-w-7xl mx-auto'>
                {courses.length > 0 ? (
                    <div className='flex flex-wrap justify-center gap-6'>
                        {courses.map(course => (
                            <Card 
                                key={course._id}
                                title={course.title} 
                                imageLink={course.image}
                                price={course.price}
                                buttons={[
                                    {
                                        text: 'Details',
                                        onClick: () => navigate(`/course/${course._id}`, { state: { course } })
                                    },
                                    {
                                        text: 'Purchase',
                                        onClick: () => handlePurchase(course._id)
                                    }
                                ]}
                            />
                        ))}
                    </div>
                ) : (
                    <div className='text-xl text-center text-gray-500 mt-16'>No courses found.</div>
                )}
            </div>
            <Notification message={notification.message} type={notification.type} />
        </div>
    );
}
