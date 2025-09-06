/**
 * @fileoverview This file defines the Home page component.
 * It serves as the landing page for the application, featuring a hero section.
 */

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * The Home page component.
 * Displays a hero section with a title, description, and calls-to-action.
 */
export function Home() {
  return (
    <div className="animate-fade-in">
      <main>
        <div className="relative px-6 lg:px-8">
          <div className="mx-auto max-w-3xl py-24 sm:py-32">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                Unlock Your Potential, One Course at a Time
              </h1>
              <p className="mt-6 text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
                Coursify is your gateway to a world of knowledge. Explore a diverse range of courses taught by industry experts and start your learning journey today.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  to="/courses"
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Browse Courses
                </Link>
                <Link to="/about" className="text-sm font-semibold leading-6 text-gray-900">
                  Learn more <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
