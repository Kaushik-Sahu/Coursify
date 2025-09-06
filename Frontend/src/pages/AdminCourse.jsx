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
    <div className="p-8 relative animate-fade-in">
      <div className="absolute top-4 left-4 cursor-pointer" onClick={() => navigate('/admin/your-courses')}>
        <Back />
      </div>
      <h1 className="text-3xl font-bold mb-6 mt-3">Edit Course</h1>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          readOnly={!isEditing}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          readOnly={!isEditing}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Price:</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          readOnly={!isEditing}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Image Link:</label>
        <input
          type="text"
          value={imageLink}
          onChange={(e) => setImageLink(e.target.value)}
          readOnly={!isEditing}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          disabled={!isEditing}
          className="mr-2 leading-tight"
        />
        <label className="text-gray-700 text-sm font-bold">Published</label>
      </div>

      <div className="flex gap-4">
        {!isEditing ? (
          <Button variant="primary" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        ) : (
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        )}
        <Button variant="danger" onClick={handleDelete}>
            Delete
        </Button>
      </div>
      <Notification message={notification.message} type={notification.type} />
    </div>
  );
}
