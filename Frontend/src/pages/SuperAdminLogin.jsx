/**
 * @fileoverview Dedicated login page for SuperAdmin.
 * This is a full-page login (not a modal) at the route /superadmin/login.
 * It is completely separate from the user/creator login flow.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { userState } from '../store/atoms.js';
import api from '../api';
import { toast } from 'sonner';
import { ShieldCheck, Eye, EyeOff, Lock, User } from 'lucide-react';

export default function SuperAdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const setUser = useSetRecoilState(userState);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/superadmin/login', {
                username: username.trim(),
                password
            });

            if (response.status === 200) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('type', 'superadmin');
                setUser('superadmin');
                toast.success('Welcome back, SuperAdmin');
                navigate('/superadmin/dashboard');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Login failed';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-3xl" />
            </div>

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }}
            />

            {/* Login card */}
            <div className="relative z-10 w-[90%] max-w-md animate-fade-in">
                {/* Shield icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                        SuperAdmin Access
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Restricted area · Authorized personnel only
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Username field */}
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                                Username or Email
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    id="superadmin-username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    className="w-full h-12 bg-white/[0.06] border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    id="superadmin-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full h-12 bg-white/[0.06] border border-white/10 rounded-xl pl-11 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            id="superadmin-login-btn"
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <ShieldCheck className="w-4 h-4" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-600 text-xs mt-6">
                    This portal is for platform administrators only.
                </p>
            </div>
        </div>
    );
}
