import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Cross } from '../icons/Cross';
import { Button } from '../ui/button';
import { Check, X, Loader2 } from 'lucide-react';
import api from '../api';

const UsernameModal = ({ setIsVisible, onSubmit }) => {
    const [username, setUsername] = useState('');
    const [isAvailable, setIsAvailable] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        const checkAvailability = async () => {
            if (username.length < 3) {
                setIsAvailable(null);
                return;
            }
            setIsChecking(true);
            try {
                const res = await api.post('/users/check-username', { username });
                setIsAvailable(res.data.available);
            } catch (err) {
                setIsAvailable(null);
            } finally {
                setIsChecking(false);
            }
        };

        const timeoutId = setTimeout(checkAvailability, 500);
        return () => clearTimeout(timeoutId);
    }, [username]);

    const handleSubmit = () => {
        if (!username.trim() || username.length < 3 || isAvailable === false) {
            return;
        }
        onSubmit(username);
    };

    return createPortal(
        <div 
            className='fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[60] animate-fade-in'
            onClick={() => setIsVisible(false)}
        >
            <div 
                className='glassmorphism bg-white/95 dark:bg-slate-900/95 w-[90%] sm:w-96 rounded-[2rem] flex flex-col p-8 relative shadow-2xl border border-white/50 dark:border-slate-850'
                onClick={(e) => e.stopPropagation()}
            >
                <div 
                    className='absolute top-4 right-4 cursor-pointer hover:scale-110 transition text-slate-600 dark:text-slate-400' 
                    onClick={() => setIsVisible(false)}
                >
                    <Cross />
                </div>
                
                <div className='text-2xl font-bold text-center w-full mb-6 text-slate-800 dark:text-white tracking-tight'>
                    Choose a Username
                </div>
                <p className='text-sm text-slate-500 dark:text-slate-400 text-center mb-6'>
                    You're almost there! Pick a unique username for your account.
                </p>

                <div className="flex flex-col justify-center">
                    <div className="relative mb-6">
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder='Username' 
                            className='w-full h-12 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600'
                        />
                        <div className="absolute right-3 top-3 h-6 w-6 flex items-center justify-center">
                            {isChecking ? (
                                <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
                            ) : username.length >= 3 && isAvailable === true ? (
                                <Check className="h-5 w-5 text-emerald-500" />
                            ) : username.length >= 3 && isAvailable === false ? (
                                <X className="h-5 w-5 text-rose-500" />
                            ) : null}
                        </div>
                    </div>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!username.trim() || username.length < 3 || isAvailable === false || isChecking}
                        className="w-full h-12 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Complete Signup
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default UsernameModal;
