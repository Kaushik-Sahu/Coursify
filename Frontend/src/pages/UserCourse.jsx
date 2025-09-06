/**
 * @fileoverview This file defines the UserCourse page component.
 * It displays the detailed view of a single course for a user.
 * This component expects course data to be passed via `location.state`.
 */

import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * The UserCourse page component.
 * Displays the details of a single course. It relies on course data being passed
 * through React Router's `location.state`.
 */
export function UserCourse() {
    const location = useLocation();
    const { course } = location.state || {};

    if (!course) {
        return <div className="text-center m-6">Course not found.</div>;
    }

    return (
        <div className="p-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 mt-3">{course.title}</h1>
            <img src={course.image} alt={course.title} className='rounded-lg object-cover w-full' />
            <p className="mt-4">{course.description}</p>
            <p className="mt-4 font-bold">Price:  ₹{course.price}</p>
        </div>
    );
}