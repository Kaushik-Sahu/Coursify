import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';

import { Button } from '../ui/button';
import { Cross } from '../icons/Cross';
import { Add } from '../icons/Add';
import { ImagePlus, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

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
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image must be less than 10MB');
            
            return;
        }

        setIsUploadingImage(true);
        try {
            const sigResponse = await api.post('/admin/upload-signature', { resourceType: 'image' });
            const { signature, timestamp, api_key, cloud_name, folder } = sigResponse.data;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', api_key);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('folder', folder);
            formData.append('type', 'authenticated');

            const cloudinaryResponse = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (props.imageRef && props.imageRef.current) {
                props.imageRef.current.value = cloudinaryResponse.data.secure_url;
            }
            toast.success('Thumbnail uploaded!');
            
        } catch (err) {
            console.error(err);
            toast.error('Failed to upload thumbnail');
            
        } finally {
            setIsUploadingImage(false);
        }
    };

    return createPortal(
        <div className='fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in' onClick={() => props.setIsVisible(false)}>
            <div className='glassmorphism bg-white/95 dark:bg-slate-900/95 w-[90%] sm:w-[28rem] rounded-[2.5rem] flex flex-col p-8 relative shadow-2xl border border-white/50 dark:border-slate-800' onClick={(e) => e.stopPropagation()}>
                <div
                    className='absolute top-6 right-6 cursor-pointer hover:scale-110 transition p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350'
                    onClick={() => props.setIsVisible(false)}
                >
                    <Cross />
                </div>

                <div className='text-3xl font-bold text-center w-full mb-2 text-slate-800 dark:text-white tracking-tight'>
                    {props.titleText}
                </div>
                <p className='text-sm text-slate-500 dark:text-slate-400 text-center mb-6'>Fill in the course details below. You can publish instantly or save as a draft.</p>

                <div className="flex flex-col gap-4 text-left">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Course Title</label>
                        <input ref={props.titleRef} type="text" placeholder='e.g. Master React & Tailwind' className='w-full h-12 mt-1 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600' />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Description</label>
                        <input ref={props.descriptionRef} type="text" placeholder='e.g. Learn modern components...' className='w-full h-12 mt-1 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/50 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600' />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Price (₹)</label>
                            <input ref={props.priceRef} type="number" placeholder='e.g. 49' className='w-full h-12 mt-1 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600' />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Course Thumbnail</label>
                            <div className="mt-1 flex flex-col sm:flex-row items-center gap-3">
                                <div className="flex-grow w-full">
                                    <input ref={props.imageRef} type="text" placeholder='https://... or upload ->' className='w-full h-12 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600' />
                                </div>
                                <div className="relative shrink-0 w-full sm:w-auto">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={isUploadingImage}
                                    />
                                    <button type="button" disabled={isUploadingImage} className={`w-full h-12 px-5 flex items-center justify-center gap-2 rounded-xl font-semibold transition-all ${isUploadingImage ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800'} cursor-pointer border-0`}>
                                        {isUploadingImage ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
                                        {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        <button
                            onClick={() => { props.handlePublish(true); props.setIsVisible(false); }}
                            className="w-full h-12 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 active:scale-[0.98] border-0 cursor-pointer"
                        >
                            Publish Immediately
                        </button>
                        <button
                            onClick={() => { props.handlePublish(false); props.setIsVisible(false); }}
                            className="w-full h-12 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors active:scale-[0.98] border-0 cursor-pointer"
                        >
                            Save as Draft
                        </button>
                    </div>
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

            if (apiResponse.status === 200 || apiResponse.status === 201) {
                toast.success("Course created successfully");
                // After successful creation, fetch updated courses to refresh the list.
                const updatedCourses = await api.get(`/admin/courses`);
                props.setCourses(updatedCourses.data.courses);
            }
        } catch (error) {
            toast.error("Failed to create course");
            console.error("Course creation error:", error);
        }

        setIsVisible(false);
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
        </div>
    );
};

export default AddCourse;
