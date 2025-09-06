/**
 * @fileoverview This file contains the Register component and its modal sub-component.
 * It handles user registration functionality, including state management for the modal,
 * user type selection (user/admin), and API interaction for signup and OTP verification.
 */

import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';
import { Button } from '../ui/button';
import { Cross } from '../icons/Cross';
import { Notification } from '../ui/Notification';
import { useSetRecoilState } from 'recoil';
import { userState } from '../store/atoms.js';
import OtpModal from './OtpModal';

/**
 * The presentational component for the registration modal.
 * Renders the modal content using a React Portal.
 * @param {object} props - The properties passed from the parent Register component.
 * @param {function} props.setIsVisible - Function to control the modal's visibility.
 * @param {function} props.handleRegister - The function to call when the signup button is clicked.
 * @param {React.RefObject} props.user - Ref for the username input.
 * @param {React.RefObject} props.email - Ref for the email input.
 * @param {React.RefObject} props.Password - Ref for the password input.
 * @param {function} props.settype - Function to set the user type (user or admin).
 * @param {'user' | 'admin'} props.type - The currently selected user type.
 */
const Page = (props) => {
    return createPortal(
        <div 
            className='fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50'
            onClick={() => props.setIsVisible(false)}
        >
            <div 
                className='bg-white w-67 sm:w-96 rounded-3xl flex flex-col p-8 relative'
                onClick={(e) => e.stopPropagation()}
            >
                <div 
                    className='absolute top-4 right-4 cursor-pointer hover:scale-110 transition' 
                    onClick={() => props.setIsVisible(false)}
                >
                    <Cross />
                </div>
                
                <div className='font-mono subpixel-antialiased text-4xl font-bold text-center w-full mb-7'>
                    Sign up
                </div>
                <div className="flex flex-col justify-center h-full">
                    {/* User type switcher */}
                    <div className='flex flex-row items-center justify-center gap-4'>
                        <div className={`flex items-center justify-center w-25 h-8 px-4 ${props.type === 'user' ? "bg-[#94a3b8]" : "bg-[#e4e4e7]"}  hover:bg-[#94a3b8] hover:scale-105 rounded-full cursor-pointer`} onClick={() => props.settype('user')}>User</div>
                        <div className={`flex items-center justify-center w-25 h-8 px-4 ${props.type === 'admin' ? "bg-[#94a3b8]" : "bg-[#e4e4e7]"}  hover:bg-[#94a3b8] hover:scale-105 rounded-full cursor-pointer`} onClick={() => props.settype('admin')}>Creator</div>
                    </div>
                    <input ref={props.user} type="text" placeholder='Username' className='w-full h-10 my-2 border border-gray-300 rounded-xl pl-2 focus:outline-none focus:border-blue-500'/>
                    <input ref={props.email} type="email" placeholder='Email' className='w-full h-10 my-2 border border-gray-300 rounded-xl pl-2 focus:outline-none focus:border-blue-500'/>
                    <input ref={props.Password} type="password" placeholder='Password' className='w-full h-10 my-2 border border-gray-300 rounded-xl pl-2 focus:outline-none focus:border-blue-500'/>
                    <Button onClick={props.handleRegister} variant="S-2">Sign up</Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

/**
 * The main logic component for the registration functionality.
 * It manages the state for modal visibility, user type, and notifications.
 * It also handles the signup API call and triggers the OTP verification modal.
 */
const Register = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
    const userRef = useRef(null);
    const passwordRef = useRef(null);
    const emailRef = useRef(null);
    const [email, setEmail] = useState(""); // State to hold email for OTP modal
    const [type, settype] = useState(localStorage.getItem("type") || "user");
    const [notification, setNotification] = useState({ message: '', type: '' });
    const setUser = useSetRecoilState(userState);

    const handleSetType = (newType) => {
        settype(newType);
        localStorage.setItem("type", newType);
    };

    /**
     * Handles the registration (signup) API call.
     * It sends user details to the backend and, on success, opens the OTP verification modal.
     */
    async function handleRegister() {
        const username = userRef.current.value;
        const password = passwordRef.current.value;
        const currentEmail = emailRef.current.value;
        setEmail(currentEmail); // Store email for OTP modal
        
        try {
            // Determine the API endpoint based on the selected user type.
            const url = type === 'user' ? `/users/signup` : `/admin/signup`;
            const apiResponse = await api.post(url, { username, password, email: currentEmail });
            
            if (apiResponse.status === 200) {
                setNotification({ message: "Verification email sent", type: 'success' });
                setIsVisible(false); // Close registration modal
                setIsOtpModalVisible(true); // Open OTP modal
            }
        } catch (error) {
            setNotification({ message: "Signup Failed", type: 'error' });
            console.error("Signup error:", error);
            // Clear stale auth data on failure.
            localStorage.removeItem("type");
            localStorage.removeItem("accessToken");
        }
        // Clear notification after a delay
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    }

    return (
        <div className='w-fit h-fit relative'>
            <Button 
                variant="primary" 
                onClick={() => setIsVisible(true)}
            >
                Signup
            </Button>
            
            {/* Render registration modal if visible */}
            {isVisible && <Page handleRegister={handleRegister} user={userRef} email={emailRef} Password={passwordRef} type={type} settype={handleSetType} setIsVisible={setIsVisible}/>}
            
            {/* Render OTP modal if visible */}
            {isOtpModalVisible && <OtpModal email={email} type={type} setIsVisible={setIsOtpModalVisible} setNotification={setNotification} setUser={setUser} />}
            
            {/* Render notification messages */}
            <Notification message={notification.message} type={notification.type} />
        </div>
    );
};

export default Register;