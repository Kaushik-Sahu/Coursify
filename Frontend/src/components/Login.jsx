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

import { useSetRecoilState } from 'recoil';
import { userState } from '../store/atoms.js';
import UsernameModal from './UsernameModal';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';

/**
 * The presentational component for the login modal.
 * Renders the modal content using a React Portal.
 */
const Page = (props) => {
    // Render the modal in a portal to ensure it appears on top of all other content.
    return createPortal(
        <div className='fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in' onClick={() => props.setIsVisible(false)}>
            <div className='glassmorphism bg-white/95 dark:bg-slate-900/95 w-[90%] sm:w-96 rounded-[2rem] flex flex-col p-8 relative shadow-2xl border border-white/50 dark:border-slate-850' onClick={(e) => e.stopPropagation()}>
                <div 
                    className='absolute top-4 right-4 cursor-pointer hover:scale-110 transition text-slate-600 dark:text-slate-400' 
                    onClick={() => props.setIsVisible(false)}
                >
                    <Cross />
                </div>
                
                <div className='text-3xl font-bold text-center w-full mb-8 text-slate-800 dark:text-white tracking-tight'>
                    {props.forgotStep > 0 ? "Reset Password" : "Welcome Back"}
                </div>
                <div className="flex flex-col justify-center h-full">
                    {props.forgotStep === 0 ? (
                        <>
                            {/* User type switcher */}
                    <div className='flex flex-row items-center justify-center gap-2 p-1 bg-slate-100/80 dark:bg-slate-950 rounded-full mb-6 w-full max-w-[240px] mx-auto'>
                        <div className={`flex items-center justify-center w-1/2 h-10 transition-all duration-300 ease-in-out font-medium rounded-full cursor-pointer ${props.type === 'user' ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`} onClick={() => props.settype('user')}>User</div>
                        <div className={`flex items-center justify-center w-1/2 h-10 transition-all duration-300 ease-in-out font-medium rounded-full cursor-pointer ${props.type === 'admin' ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`} onClick={() => props.settype('admin')}>Creator</div>
                    </div>
                    <input ref={props.user} type="text" placeholder='Username or Email' className='w-full h-12 mb-4 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600'/>
                    <input ref={props.Password} type="password" placeholder='Password' className='w-full h-12 mb-2 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600'/>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => props.setForgotStep(1)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline bg-transparent border-none cursor-pointer p-0 font-medium">Forgot Password?</button>
                    </div>
                    <button onClick={props.Login} className="w-full h-12 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 active:scale-[0.98]">Login</button>
                    <div className="mt-4 flex justify-center">
                        <GoogleLogin
                            onSuccess={props.handleGoogleSuccess}
                            onError={() => toast.error('Google Login Failed')}
                        />
                    </div>
                        </>
                    ) : props.forgotStep === 1 ? (
                        <>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center">Enter your email address to receive a password reset code.</p>
                            <input value={props.forgotEmail} onChange={(e) => props.setForgotEmail(e.target.value)} type="email" placeholder='Email Address' className='w-full h-12 mb-6 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600'/>
                            <button onClick={props.handleSendResetOTP} disabled={props.isLoading} className="w-full h-12 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50">
                                {props.isLoading ? 'Sending...' : 'Send Reset Code'}
                            </button>
                            <button onClick={() => props.setForgotStep(0)} className="w-full h-12 mt-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-none cursor-pointer">Back to Login</button>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center">Enter the code sent to your email and your new password.</p>
                            <input value={props.forgotOtp} onChange={(e) => props.setForgotOtp(e.target.value)} type="text" placeholder='6-digit Reset Code' className='w-full h-12 mb-4 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600'/>
                            <input value={props.newPassword} onChange={(e) => props.setNewPassword(e.target.value)} type="password" placeholder='New Password' className='w-full h-12 mb-6 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600'/>
                            <button onClick={props.handleResetPassword} disabled={props.isLoading} className="w-full h-12 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50">
                                {props.isLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                            <button onClick={() => props.setForgotStep(0)} className="w-full h-12 mt-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-none cursor-pointer">Back to Login</button>
                        </>
                    )}
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
    const [isUsernameModalVisible, setIsUsernameModalVisible] = useState(false);
    const [pendingGoogleToken, setPendingGoogleToken] = useState(null);
    const userRef = useRef(null);
    const passwordRef = useRef(null);
    const [type, settype] = useState(localStorage.getItem("type") || "user");
    
    const setUser = useSetRecoilState(userState);

    // Forgot Password State
    const [forgotStep, setForgotStep] = useState(0); // 0: Login, 1: Email, 2: OTP
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotOtp, setForgotOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
                toast.success("Successfully Logged in");
                localStorage.setItem("accessToken", apiResponse.data.accessToken);
                setUser(type); // Update global user state.
                localStorage.setItem("type", type);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Login Failed";
            toast.error(errorMessage);
            console.error("login error:", error);
            // Clear stale auth data on failure.
            localStorage.removeItem("type");
            localStorage.removeItem("accessToken");
        }
        
        setIsVisible(false);
    }

    async function handleSendResetOTP() {
        if (!forgotEmail) {
            return toast.error("Please enter your email");
        }
        setIsLoading(true);
        try {
            const url = type === 'user' ? '/users/forgot-password' : '/admin/forgot-password';
            await api.post(url, { email: forgotEmail });
            toast.success("Reset code sent to your email!");
            setForgotStep(2);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to send reset code");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleResetPassword() {
        if (!forgotOtp || !newPassword) {
            return toast.error("Please enter the code and a new password");
        }
        if (newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }
        setIsLoading(true);
        try {
            const url = type === 'user' ? '/users/reset-password' : '/admin/reset-password';
            await api.post(url, { email: forgotEmail, otp: forgotOtp, newPassword });
            toast.success("Password reset successfully! You can now login.");
            setForgotStep(0);
            setForgotEmail('');
            setForgotOtp('');
            setNewPassword('');
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to reset password");
        } finally {
            setIsLoading(false);
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
                toast.success("Successfully Logged in with Google");
                localStorage.setItem("accessToken", apiResponse.data.accessToken);
                setUser(apiResponse.data.role);
                localStorage.setItem("type", apiResponse.data.role);
                setIsVisible(false);
            }
        } catch (error) {
            toast.error("Google Login Failed");
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
                toast.success("Successfully Logged in with Google");
                localStorage.setItem("accessToken", apiResponse.data.accessToken);
                setUser(apiResponse.data.role);
                localStorage.setItem("type", apiResponse.data.role);
                setIsUsernameModalVisible(false);
            }
        } catch (error) {
            toast.error("Google Login Failed");
            console.error(error);
        }
    }

    return (
        <div className='w-fit h-fit'>
            <Button 
                variant="primary" 
                onClick={() => setIsVisible(true)}
            >
                Login
            </Button>
            
            {isVisible && <Page 
                Login={handleLogin} 
                user={userRef} 
                Password={passwordRef} 
                settype={handleSetType} 
                type={type} 
                setIsVisible={setIsVisible} 
                handleGoogleSuccess={handleGoogleSuccess} 
                forgotStep={forgotStep}
                setForgotStep={setForgotStep}
                forgotEmail={forgotEmail}
                setForgotEmail={setForgotEmail}
                forgotOtp={forgotOtp}
                setForgotOtp={setForgotOtp}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                handleSendResetOTP={handleSendResetOTP}
                handleResetPassword={handleResetPassword}
                isLoading={isLoading}
            />}
            {isUsernameModalVisible && <UsernameModal setIsVisible={setIsUsernameModalVisible} onSubmit={handleGoogleUsernameSubmit} />}
        </div>
    );
};

export default Login;