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
        <div className="min-h-screen bg-transparent pt-10 pb-20 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">
                {/* Left Column: Course Image & Details */}
                <div className="flex-1">
                    <div className="bg-white dark:bg-slate-950 rounded-3xl p-2 shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
                        <img 
                            src={course.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop"} 
                            alt={course.title} 
                            className="rounded-2xl object-cover w-full max-h-[500px]" 
                        />
                    </div>
                    
                    <div className="glassmorphism bg-white/70 dark:bg-slate-900/50 rounded-[2rem] p-8 sm:p-12 shadow-md border border-white/60 dark:border-slate-800">
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">{course.title}</h1>
                        <div className="prose prose-lg prose-slate max-w-none">
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">About this course</h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                                {course.description || "No description provided for this course. Enroll now to discover the content inside."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sticky Purchase Card */}
                <div className="w-full lg:w-[400px]">
                    <div className="sticky top-24 bg-white dark:bg-slate-950 rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">₹{course.price}</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">One-time payment. Full lifetime access.</p>
                        
                        <div className="flex flex-col gap-4">
                            <button className="w-full bg-indigo-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer border-0">
                                Buy this course
                            </button>
                            <button className="w-full bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-lg py-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer border-0">
                                Add to Wishlist
                            </button>
                        </div>

                        <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">This course includes:</h4>
                            <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                                <li className="flex items-center gap-3">
                                    <span className="text-indigo-500">📺</span> High-quality video content
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-indigo-500">📱</span> Access on mobile and TV
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-indigo-500">🏆</span> Certificate of completion
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}