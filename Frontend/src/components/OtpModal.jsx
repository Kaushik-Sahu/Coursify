/**
 * @fileoverview This file contains the OtpModal component, which handles OTP verification.
 * It allows users to enter an OTP received via email to complete their registration.
 */

import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';
import { Button } from '../ui/button';
import { Cross } from '../icons/Cross';

/**
 * The OTP verification modal component.
 * Renders the modal content using a React Portal.
 */
const OtpModal = (props) => {
    const otpRef = useRef(null);

    /**
     * Handles the OTP verification API call.
     * It sends the entered OTP and email to the backend for verification.
     * On successful verification, it updates user state and local storage.
     */
    async function handleVerify() {
        const otp = otpRef.current.value;
        const email = props.email;

        try {
            // Determine the API endpoint based on the user type.
            const url = props.type === 'user' ? `/users/verify` : `/admin/verify`;
            const apiResponse = await api.post(url, { email, otp });

            if (apiResponse.status === 201) {
                props.setNotification({ message: "Successfully Signed Up", type: 'success' });
                localStorage.setItem("accessToken", apiResponse.data.accessToken);
                // Update global user state and local storage based on user type.
                if (props.type === 'user') {
                    props.setUser("user");
                    localStorage.setItem("type", "user");
                } else {
                    props.setUser("admin");
                    localStorage.setItem("type", "admin");
                }
                props.setIsVisible(false); // Close OTP modal on success.
            }
        } catch (error) {
            props.setNotification({ message: "Verification Failed", type: 'error' });
            console.error("Verification error:", error);
        }

        // Clear the notification message after a delay.
        setTimeout(() => props.setNotification({ message: '', type: '' }), 3000);
    }

    return createPortal(
        <div 
            className='fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50'
            onClick={() => props.setIsVisible(false)}
        >
            <div 
                className='bg-white w-60 sm:w-96 rounded-3xl flex flex-col p-8 relative'
                onClick={(e) => e.stopPropagation()}
            >
                <div 
                    className='absolute top-4 right-4 cursor-pointer hover:scale-110 transition' 
                    onClick={() => props.setIsVisible(false)}
                >
                    <Cross />
                </div>
                
                <div className='font-mono subpixel-antialiased text-4xl font-bold text-center w-full mb-7'>
                    Enter OTP
                </div>
                <div className="flex flex-col justify-center h-full">
                    <input ref={otpRef} type="text" placeholder='OTP' className='w-full h-10 my-2 border border-gray-300 rounded-xl pl-2 focus:outline-none focus:border-blue-500'/>
                    <Button onClick={handleVerify} variant="S-2">Verify</Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default OtpModal;
