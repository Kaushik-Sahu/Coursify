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
                    Enter OTP
                </div>
                <div className="flex flex-col justify-center h-full">
                    <input ref={otpRef} type="text" placeholder='OTP Code' className='w-full h-12 mb-6 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600'/>
                    <button onClick={handleVerify} className="w-full h-12 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 active:scale-[0.98]">Verify OTP</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default OtpModal;
