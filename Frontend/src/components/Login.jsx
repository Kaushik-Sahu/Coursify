/**
 * @fileoverview This file contains the Login component and its modal sub-component.
 * It handles user login functionality, including state management for the modal,
 * user type selection (user/admin), and API interaction.
 */

import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';
import { Button } from '../ui/button';
import { Cross } from '../icons/Cross';
import { Notification } from '../ui/Notification';
import { useSetRecoilState } from 'recoil';
import { userState } from '../store/atoms.js';

/**
 * The presentational component for the login modal.
 * Renders the modal content using a React Portal.
 */
const Page = (props) => {
    // Render the modal in a portal to ensure it appears on top of all other content.
    return createPortal(
        <div className='fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50' onClick={() => props.setIsVisible(false)}>
            <div className='bg-white w-67 sm:w-96 rounded-3xl flex flex-col p-8 relative' onClick={(e) => e.stopPropagation()}>
                <div 
                    className='absolute top-4 right-4 cursor-pointer hover:scale-110 transition' 
                    onClick={() => props.setIsVisible(false)}
                >
                    <Cross />
                </div>
                
                <div className='font-mono subpixel-antialiased text-4xl font-bold text-center w-full mb-7'>
                    Login
                </div>
                <div className="flex flex-col justify-center h-full">
                    {/* User type switcher */}
                    <div className='flex flex-row items-center justify-center gap-4'>
                        <div className={`flex items-center justify-center w-25 h-8 px-4 ${props.type === 'user' ? "bg-[#94a3b8]" : "bg-[#e4e4e7]"}  hover:bg-[#94a3b8] hover:scale-105 rounded-full cursor-pointer`} onClick={() => props.settype('user')}>User</div>
                        <div className={`flex items-center justify-center w-25 h-8 px-4 ${props.type === 'admin' ? "bg-[#94a3b8]" : "bg-[#e4e4e7]"}  hover:bg-[#94a3b8] hover:scale-105 rounded-full cursor-pointer`} onClick={() => props.settype('admin')}>Creator</div>
                    </div>
                    <input ref={props.user} type="text" placeholder='Username or Email' className='w-full h-10 my-2 border border-gray-300 rounded-lg pl-2 focus:outline-none focus:border-blue-500'/>
                    <input ref={props.Password} type="password" placeholder='Password' className='w-full h-10 my-2 border border-gray-300 rounded-lg pl-2 focus:outline-none focus:border-blue-500'/>
                    <Button onClick={props.Login} variant="S-2">Login</Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

/**
 * The main logic component for the login functionality.
 * It manages the state for the modal visibility, user type, and notifications.
 */
const Login = () => {
    const [isVisible, setIsVisible] = useState(false);
    const userRef = useRef(null);
    const passwordRef = useRef(null);
    const [type, settype] = useState(localStorage.getItem("type") || "user");
    const [notification, setNotification] = useState({ message: '', type: '' });
    const setUser = useSetRecoilState(userState);

    const handleSetType = (newType) => {
        settype(newType);
        localStorage.setItem("type", newType);
    };

    /**
     * Handles the login API call.
     * It constructs the request based on the selected user type and handles success/error responses.
     */
    async function handleLogin() {
        const username = userRef.current.value;
        const password = passwordRef.current.value;
       try {
            // Determine the API endpoint based on the selected user type.
            const url = type === 'user' ? `/users/login` : `/admin/login`;
            const apiResponse = await api.post(url, {
                username,
                password
            });
            
            if (apiResponse.status === 200) {
                setNotification({ message: "Successfully Logged in", type: 'success' });
                localStorage.setItem("accessToken", apiResponse.data.accessToken);
                setUser(type); // Update global user state.
                localStorage.setItem("type", type);
            }
        } catch (error) {
            setNotification({ message: "Login Failed", type: 'error' });
            console.error("login error:", error);
            // Clear stale auth data on failure.
            localStorage.removeItem("type");
            localStorage.removeItem("accessToken");
        }
        
        setIsVisible(false);

        // Clear the notification message after 3 seconds.
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    }

    return (
        <div className='w-fit h-fit'>
            <Button 
                variant="primary" 
                onClick={() => setIsVisible(true)}
            >
                Login
            </Button>
            
            {isVisible && <Page Login={handleLogin} user={userRef} Password={passwordRef} settype={handleSetType} type={type} setIsVisible={setIsVisible}/>}

            <Notification message={notification.message} type={notification.type} />
        </div>
    );
};

export default Login;