/**
 * @fileoverview This file defines the AdminCourse page component.
 * It allows administrators to view, edit, and delete specific course details.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { Button } from '../ui/button';
import { Back } from '../icons/Back';
import { Notification } from '../ui/Notification';

/**
 * The AdminCourse page component.
 * Displays and manages details for a single course, allowing admins to update or delete it.
 */
export function AdminCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // State for form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageLink, setImageLink] = useState('');
  const [published, setPublished] = useState(false);
 
  useEffect(() => {
    /**
     * Fetches course details from the API if not provided via location state.
     */
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/admin/courses/${courseId}`);
        const fetchedCourse = response.data.course;
        setCourse(fetchedCourse);
        setTitle(fetchedCourse.title);
        setDescription(fetchedCourse.description);
        setPrice(fetchedCourse.price);
        setImageLink(fetchedCourse.image);
        setPublished(fetchedCourse.published);
      } catch (err) {
        setError('Failed to fetch course details.');
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    };

    // Prioritize course data from location.state if available (e.g., navigated from a list).
    if (location.state && location.state.course) {
      const fetchedCourse = location.state.course;
      setCourse(fetchedCourse);
      setTitle(fetchedCourse.title);
      setDescription(fetchedCourse.description);
      setPrice(fetchedCourse.price);
      setImageLink(fetchedCourse.image);
      setPublished(fetchedCourse.published);
      setLoading(false);
    } else {
      // Fallback: if direct state is not available (e.g., direct URL access), fetch from API.
      fetchCourse();
    }
  }, [courseId, location.state]); // Depend on courseId and location.state

  /**
   * Handles saving updated course details to the backend.
   */
  const handleSave = async () => {
    try {
      await api.put(
        `/admin/courses/${courseId}`,
        {
          title,
          description,
          price: Number(price),
          image: imageLink,
          published,
        }
      );
      setNotification({ message: "Course updated successfully", type: 'success' });
      setIsEditing(false);
    } catch (err) {
      setNotification({ message: 'Failed to update course.', type: 'error' });
      console.error("Error updating course:", err);
    } finally {
      setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    }
  };

  /**
   * Handles deleting the current course from the backend.
   */
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this course?')) {
        try {
            await api.delete(`/admin/courses/${courseId}`);
            setNotification({ message: 'Course deleted successfully', type: 'success' });
            setTimeout(() => {
                navigate('/admin/your-courses'); // Redirect after successful deletion
            }, 2000);
        } catch (err) {
            setNotification({ message: 'Failed to delete course.', type: 'error' });
            console.error("Error deleting course:", err);
        } finally {
            setTimeout(() => setNotification({ message: '', type: '' }), 3000);
        }
    }
  };

  if (loading) {
    return <div className="text-center m-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 m-6">{error}</div>;
  }

  if (!course) {
    return <div className="text-center m-6">Course not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 animate-fade-in">
      {/* Header section with gradient */}
      <div className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-purple-50/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/your-courses')}
              className="p-2.5 bg-slate-100 hover:bg-slate-200/80 rounded-full transition text-slate-600 active:scale-95 cursor-pointer border-0"
            >
              <Back />
            </button>
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Course <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Settings & Customization</span>
              </h1>
              <p className="text-sm text-slate-500">Update course content, pricing, active publication states, or remove this course completely.</p>
            </div>
          </div>
          <button 
            onClick={handleDelete}
            className="hidden sm:block px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-full transition active:scale-95 border-0 cursor-pointer"
          >
            Delete Course
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Live Card Preview (4 cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-6 text-left">
            <div className="mb-3 text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Live Card Preview</div>
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden group transition-all duration-300 hover:shadow-2xl">
              <div className="relative h-48 sm:h-52 bg-slate-100 overflow-hidden">
                {imageLink ? (
                  <img 
                    src={imageLink} 
                    alt={title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    No image provided
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                  {published ? '🟢 Live' : '🟠 Draft'}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{title || 'Course Title'}</h3>
                  <span className="text-lg font-extrabold text-indigo-600">${price || '0.00'}</span>
                </div>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10 leading-relaxed">{description || 'No description provided yet.'}</p>
                <div className="w-full py-2.5 bg-indigo-50 text-indigo-600 font-semibold rounded-xl text-center text-sm">
                  Creator View
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Custom glassmorphic Editor Form (8 cols) */}
          <div className="lg:col-span-8 bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-200/60 shadow-md text-left">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span>📝</span> Course Details
            </h2>
            <div className="flex flex-col gap-6">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Course Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master React & Tailwind" 
                  className="w-full h-12 mt-1.5 border border-slate-200 bg-slate-50/50 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide an engaging description of what students will learn..." 
                  className="w-full h-32 mt-1.5 border border-slate-200 bg-slate-50/50 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Price (USD)</label>
                  <input 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 49" 
                    className="w-full h-12 mt-1.5 border border-slate-200 bg-slate-50/50 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Course Image URL</label>
                  <input 
                    type="text" 
                    value={imageLink} 
                    onChange={(e) => setImageLink(e.target.value)}
                    placeholder="https://images.unsplash.com/..." 
                    className="w-full h-12 mt-1.5 border border-slate-200 bg-slate-50/50 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                  />
                </div>
              </div>

              {/* Status active switch */}
              <div className="py-4 border-y border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-855">Public visibility</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-normal">When enabled, students can see and purchase this course publicly.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={published} 
                    onChange={(e) => setPublished(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <button 
                  onClick={handleSave} 
                  className="flex-grow h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98] border-0 cursor-pointer flex items-center justify-center"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => navigate('/admin/your-courses')}
                  className="px-6 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all active:scale-[0.98] border-0 cursor-pointer flex items-center justify-center"
                >
                  Discard
                </button>
                <button 
                  onClick={handleDelete}
                  className="sm:hidden h-12 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold transition-all active:scale-[0.98] border-0 cursor-pointer flex items-center justify-center"
                >
                  Delete Course
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Notification message={notification.message} type={notification.type} />
    </div>
  );
}
