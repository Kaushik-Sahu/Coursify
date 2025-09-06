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
    
    return (
        <div className="animate-fade-in"> {/* Added animate-fade-in class */}
            <div className='text-2xl font-semibold font-mono text-center m-6'>Your Courses</div>
            <AddCourse setCourses={setCourses} />

            {courses.length > 0 ? (
                <div className='flex flex-wrap justify-center gap-6'>
                    {courses.map(course => (
                        <Card
                            key={course._id}
                            title={course.title}
                            imageLink={course.image}
                            buttons={[
                                {
                                    text: 'Details',
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
                <div className='text-xl text-center text-gray-500 mt-8'>No courses found. Add a new one to get started!</div>
            )}
        </div>
    );
}