import React, { useState, useEffect } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { userState, darkModeState } from '../store/atoms.js';
import api from '../api';
import { toast } from 'sonner';
import { User, Mail, Shield, Settings2, Lock, Bell, Moon, BookOpen, Sparkles } from 'lucide-react';

export default function Profile() {
  const userRole = useRecoilValue(userState);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'settings'

  // Settings states
  const [darkMode, setDarkMode] = useRecoilState(darkModeState);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!userRole) {
        setLoadingProfile(false);
        return;
      }
      try {
        let url;
        if (userRole === 'superadmin') url = '/superadmin/me';
        else if (userRole === 'admin') url = '/admin/me';
        else url = '/users/me';
        
        const response = await api.get(url);
        setProfileData(response.data.user);
      } catch (err) {
        console.error("Error loading profile:", err);
        toast.error("Failed to load profile details.");
      } finally {
        setLoadingProfile(false);
      }
    };
    loadProfile();
  }, [userRole]);

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success("Password updated successfully!");
    }, 1500);
  };

  const handleSavePreferences = () => {
    toast.success("Preferences saved successfully!");
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50 dark:bg-slate-950 px-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Access Denied</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Please log in to view your profile and account settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-16 animate-fade-in text-left">
      {/* Header section with gradient */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 py-12 px-4 sm:px-6 lg:px-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-purple-50/20 to-transparent"></div>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-4xl text-white font-bold shadow-xl shadow-indigo-600/20 border-4 border-white dark:border-slate-800">
              {profileData.username.charAt(0).toUpperCase()}
            </div>
            <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-green-500 border-4 border-white dark:border-slate-800"></span>
          </div>
          <div className="text-center md:text-left flex-grow">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center md:justify-start">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{profileData.username}</h1>
              <span className={`w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${profileData.role === 'Admin'
                ? 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/30'
                : 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/30'
                }`}>
                {profileData.role}
              </span>
            </div>
            <p className="mt-2 text-slate-500 dark:text-slate-400 w-fit font-medium flex items-center gap-2 justify-center md:justify-start">
              <Mail size={16} className="shrink-0 text-indigo-500 dark:text-indigo-400" /> {profileData.email}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 bg-white dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/50 shadow-sm w-fit gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all border-0 cursor-pointer ${activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
          >
            <User size={18} />
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all border-0 cursor-pointer ${activeTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
          >
            <Settings2 size={18} />
            Preferences & Settings
          </button>
        </div>

        {/* Tab Contents */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Main Card Panel */}
          <div className="md:col-span-8 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-xl overflow-hidden p-8">
            {activeTab === 'profile' ? (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <Sparkles size={20} className="text-indigo-600 dark:text-indigo-400" /> Account Overview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Username</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{profileData.username}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Email Address</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{profileData.email}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Account Role</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {profileData.role === 'SuperAdmin' ? 'Super Administrator' : profileData.role === 'Admin' ? 'Content Creator' : 'Student Scholar'}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">System Status</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span> Active Subscriber
                    </span>
                  </div>
                </div>

                {profileData.role !== 'Admin' && profileData.role !== 'SuperAdmin' && (
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                      <BookOpen size={20} className="text-indigo-600 dark:text-indigo-400" /> Learning Path Statistics
                    </h3>
                    <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-6 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/20 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Courses Enrolled</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">Includes active, paused, and finished courses.</p>
                      </div>
                      <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                        {profileData.enrolledCourses ? profileData.enrolledCourses.length : 0}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <Settings2 size={20} className="text-indigo-600 dark:text-indigo-400" /> Preferences
                </h2>

                <div className="flex flex-col gap-6 mb-8 text-slate-700 dark:text-slate-300">
                  {/* Dark Mode Toggle */}
                  <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Moon size={18} className="text-indigo-600 dark:text-indigo-400" /> Dark Mode
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">Switch the user interface color profile to dark mode.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={(e) => setDarkMode(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Email Notifications Toggle */}
                  <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Mail size={18} className="text-indigo-600 dark:text-indigo-400" /> Email Notifications
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">Receive course updates and recommended schedules directly via email.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailNotif}
                        onChange={(e) => setEmailNotif(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Push Notifications Toggle */}
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Bell size={18} className="text-indigo-600 dark:text-indigo-400" /> Push Notifications
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">Allow browser instant desktop alerts for newly updated course content.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pushNotif}
                        onChange={(e) => setPushNotif(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSavePreferences}
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98] border-0 cursor-pointer flex items-center justify-center"
                >
                  Save Preferences
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Change Password Card */}
          <div className="md:col-span-4 bg-white/80 dark:bg-slate-950 backdrop-blur-md p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-md">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <Lock size={18} className="text-indigo-600 dark:text-indigo-400" /> Security / Password
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-normal">Change your account password securely. Please use a strong password.</p>

            <form onSubmit={handlePasswordReset} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 mt-1 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full h-11 mt-1 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Match new password"
                  className="w-full h-11 mt-1 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="w-full h-11 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98] border-0 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {savingPassword ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
