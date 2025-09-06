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
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-center m-6">Purchased Courses</h1>
            {courses.length > 0 ? (
                <div className='flex flex-wrap justify-center gap-6'>
                    {courses.map(course => (
                        <Card
                            key={course._id}
                            title={course.title}
                            imageLink={course.image}
                            buttons={[
                                {
                                    text: 'View Content',
                                    onClick: () => navigate(`/course/${course._id}/content`, { state: { course } }) // Placeholder for content page
                                }
                            ]}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center">No purchased courses yet.</p>
            )}
        </div>
    );
}