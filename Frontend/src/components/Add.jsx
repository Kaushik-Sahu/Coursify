import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';
import { Notification } from '../ui/Notification';
import { Button } from '../ui/button';
import { Cross } from '../icons/Cross';
import { Add } from '../icons/Add'; 

/**
 * Presentational component for the Add/Edit Course modal.
 * Renders the form fields and action buttons using a React Portal.
 * @param {object} props - The properties passed from the parent AddCourse component.
 * @param {function} props.setIsVisible - Function to control the modal's visibility.
 * @param {string} props.titleText - The title to display at the top of the modal (e.g., "Add Course").
 * @param {function} props.handlePublish - Function to call when Publish/Save as Draft buttons are clicked.
 * @param {React.RefObject} props.titleRef - Ref for the course title input.
 * @param {React.RefObject} props.descriptionRef - Ref for the course description input.
 * @param {React.RefObject} props.priceRef - Ref for the course price input.
 * @param {React.RefObject} props.imageRef - Ref for the course image URL input.
 */
const Modal = (props) => {
    return createPortal(
        <div className='fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50' onClick={() => props.setIsVisible(false)}>
            <div className='bg-white w-60 sm:w-96 rounded-3xl flex flex-col p-8 relative' onClick={(e) => e.stopPropagation()}>
                <div 
                    className='absolute top-4 right-4 cursor-pointer hover:scale-110 transition' 
                    onClick={() => props.setIsVisible(false)}
                >
                    <Cross />
                </div>
                
                <div className='font-mono subpixel-antialiased text-4xl font-bold text-center w-full mb-7'>
                    {props.titleText}
                </div>
                <div className="flex flex-col justify-center h-full">
                    <input ref={props.titleRef} type="text" placeholder='Title' className='w-full h-10 my-2 border border-gray-300 rounded-lg pl-2 focus:outline-none focus:border-blue-500'/>
                    <input ref={props.descriptionRef} type="text" placeholder='Description' className='w-full h-10 my-2 border border-gray-300 rounded-lg pl-2 focus:outline-none focus:border-blue-500'/>
                    <input ref={props.priceRef} type="number" placeholder='Price' className='w-full h-10 my-2 border border-gray-300 rounded-lg pl-2 focus:outline-none focus:border-blue-500'/>
                    <input ref={props.imageRef} type="text" placeholder='Image' className='w-full h-10 my-2 border border-gray-300 rounded-lg pl-2 focus:outline-none focus:border-blue-500'/>
                    
                    {/* Buttons to handle 'Publish' and 'Save as Draft' actions */}
                    <Button onClick={() => {props.handlePublish(true); props.setIsVisible(false);}} variant="S-3">Publish</Button>
                    <Button onClick={() => {props.handlePublish(false); props.setIsVisible(false);}} variant="S-3">Save as Draft</Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

/**
 * The main logic component for adding a new course.
 * It manages the modal's visibility, form input refs, and handles the API call to create a course.
 * @param {object} props - The properties for the AddCourse component.
 * @param {function} props.setCourses - Function to update the list of courses in the parent component.
 */
const AddCourse = (props) => {
    const [isVisible, setIsVisible] = useState(false);
    const titleRef = useRef(null);
    const descriptionRef = useRef(null);
    const priceRef = useRef(null);
    const imageRef = useRef(null);
    const [notification, setNotification] = useState({ message: '', type: '' });

    /**
     * Handles the API call to add a new course.
     * @param {boolean} isPublished - True if the course should be published immediately, false to save as draft.
     */
    async function handleAddCourse(isPublished) {
        const title = titleRef.current.value;
        const description = descriptionRef.current.value;
        const price = priceRef.current.value;
        const image = imageRef.current.value;

        try {
            const apiResponse = await api.post(
                `/admin/courses`, 
                { title, description, price, image, published: isPublished }
            );

            if (apiResponse.status === 200) {
                setNotification({ message: "Course created successfully", type: 'success' });
                // After successful creation, fetch updated courses to refresh the list.
                const updatedCourses = await api.get(`/admin/courses`);
                props.setCourses(updatedCourses.data.courses);
            }
        } catch (error) {
            setNotification({ message: "Failed to create course", type: 'error' });
            console.error("Course creation error:", error);
        }
        
        setIsVisible(false);
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    }

    return (
        <div className='w-fit h-fit m-5'>
            <Button
                variant="primary"
                onClick={() => setIsVisible(true)}
                Start={Add}
            >
                ADD
            </Button>
            
            {isVisible && (
                <Modal 
                    titleText="Add Course"
                    handlePublish={handleAddCourse}
                    titleRef={titleRef}
                    descriptionRef={descriptionRef}
                    priceRef={priceRef}
                    imageRef={imageRef}
                    setIsVisible={setIsVisible}
                />
            )}

            <Notification message={notification.message} type={notification.type} />
        </div>
    );
};

export default AddCourse;
