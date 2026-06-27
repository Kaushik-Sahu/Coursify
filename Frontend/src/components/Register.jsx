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
import UsernameModal from './UsernameModal';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';

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
            className='fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in'
            onClick={() => props.setIsVisible(false)}
        >
            <div 
                className='glassmorphism bg-white/95 dark:bg-slate-900/95 w-[90%] sm:w-96 rounded-[2rem] flex flex-col p-8 relative shadow-2xl border border-white/50 dark:border-slate-850'
                onClick={(e) => e.stopPropagation()}
            >
                <div 
                    className='absolute top-4 right-4 cursor-pointer hover:scale-110 transition text-slate-600 dark:text-slate-400' 
                    onClick={() => props.setIsVisible(false)}
                >
                    <Cross />
                </div>
                
                <div className='text-3xl font-bold text-center w-full mb-8 text-slate-800 dark:text-white tracking-tight'>
                    Create Account
                </div>
                <div className="flex flex-col justify-center h-full">
                    {/* User type switcher */}
                    <div className='flex flex-row items-center justify-center gap-2 p-1 bg-slate-100/80 dark:bg-slate-950 rounded-full mb-6 w-full max-w-[240px] mx-auto'>
                        <div className={`flex items-center justify-center w-1/2 h-10 transition-all duration-300 ease-in-out font-medium rounded-full cursor-pointer ${props.type === 'user' ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`} onClick={() => props.settype('user')}>User</div>
                        <div className={`flex items-center justify-center w-1/2 h-10 transition-all duration-300 ease-in-out font-medium rounded-full cursor-pointer ${props.type === 'admin' ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`} onClick={() => props.settype('admin')}>Creator</div>
                    </div>
                    <input ref={props.user} type="text" placeholder='Username' className='w-full h-12 mb-4 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600'/>
                    <input ref={props.email} type="email" placeholder='Email' className='w-full h-12 mb-4 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600'/>
                    <input ref={props.Password} type="password" placeholder='Password' className='w-full h-12 mb-6 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600'/>
                    <button onClick={props.handleRegister} className="w-full h-12 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 active:scale-[0.98]">Sign up</button>
                    <div className="mt-4 flex justify-center">
                        <GoogleLogin
                            onSuccess={props.handleGoogleSuccess}
                            onError={() => toast.error('Google Signup Failed')}
                        />
                    </div>
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
    const [isUsernameModalVisible, setIsUsernameModalVisible] = useState(false);
    const [pendingGoogleToken, setPendingGoogleToken] = useState(null);
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
                toast.success("Verification email sent");
                setIsVisible(false); // Close registration modal
                setIsOtpModalVisible(true); // Open OTP modal
            }
        } catch (error) {
            toast.error("Signup Failed");
            console.error("Signup error:", error);
            // Clear stale auth data on failure.
            localStorage.removeItem("type");
            localStorage.removeItem("accessToken");
        }
    }

    async function handleGoogleSuccess(credentialResponse) {
        try {
            const apiResponse = await api.post('/auth/google', {
                token: credentialResponse.credential,
                role: type
            });
            if (apiResponse.status === 202 && apiResponse.data.requiresUsername) {
                setPendingGoogleToken(credentialResponse.credential);
                setIsVisible(false);
                setIsUsernameModalVisible(true);
            } else if (apiResponse.status === 200) {
                toast.success("Successfully Signed up with Google");
                localStorage.setItem("accessToken", apiResponse.data.accessToken);
                setUser(apiResponse.data.role);
                localStorage.setItem("type", apiResponse.data.role);
                setIsVisible(false);
            }
        } catch (error) {
            toast.error("Google Signup Failed");
            console.error(error);
        }
    }

    async function handleGoogleUsernameSubmit(username) {
        try {
            const apiResponse = await api.post('/auth/google', {
                token: pendingGoogleToken,
                role: type,
                username: username
            });
            if (apiResponse.status === 200) {
                toast.success("Successfully Signed up with Google");
                localStorage.setItem("accessToken", apiResponse.data.accessToken);
                setUser(apiResponse.data.role);
                localStorage.setItem("type", apiResponse.data.role);
                setIsUsernameModalVisible(false);
            }
        } catch (error) {
            toast.error("Google Signup Failed");
            console.error(error);
        }
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
            {isVisible && <Page handleRegister={handleRegister} user={userRef} email={emailRef} Password={passwordRef} type={type} settype={handleSetType} setIsVisible={setIsVisible} handleGoogleSuccess={handleGoogleSuccess}/>}
            
            {/* Render OTP modal if visible */}
            {isOtpModalVisible && <OtpModal email={email} type={type} setIsVisible={setIsOtpModalVisible} setNotification={setNotification} setUser={setUser} />}

            {/* Render Username Modal for Google Signup */}
            {isUsernameModalVisible && <UsernameModal setIsVisible={setIsUsernameModalVisible} onSubmit={handleGoogleUsernameSubmit} />}
        </div>
    );
};

export default Register;