import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, ShieldAlert, ShieldCheck, ShieldPlus, Trash2, 
    BookOpen, Flag, UserX, UserCheck, CheckCircle2, XCircle
} from 'lucide-react';
import api from '../api';
import { toast } from 'sonner';

export default function SAUserDetail() {
    const { userId } = useParams();
    const navigate = useNavigate();
    
    const [user, setUser] = useState(null);
    const [reports, setReports] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // For granting course
    const [selectedCourseId, setSelectedCourseId] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [userRes, coursesRes] = await Promise.all([
                api.get(`/superadmin/users/${userId}`),
                api.get('/superadmin/courses/all')
            ]);
            setUser(userRes.data.user);
            setReports(userRes.data.reports);
            setAllCourses(coursesRes.data.courses);
        } catch (err) {
            toast.error('Failed to load user details');
            navigate('/superadmin/manage/users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userId]);

    const handleBlockToggle = async () => {
        setActionLoading(true);
        try {
            const res = await api.put(`/superadmin/users/${userId}/block`);
            toast.success(res.data.message);
            setUser(prev => ({ ...prev, blocked: res.data.blocked }));
        } catch (err) {
            toast.error('Failed to toggle block status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleGrantCourse = async () => {
        if (!selectedCourseId) return toast.error('Select a course first');
        setActionLoading(true);
        try {
            await api.post(`/superadmin/users/${userId}/grant-course`, { courseId: selectedCourseId });
            toast.success('Course granted successfully');
            setSelectedCourseId('');
            fetchData(); // Refresh to get updated enrolledCourses
        } catch (err) {
            toast.error('Failed to grant course');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRevokeCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to revoke access to this course?')) return;
        setActionLoading(true);
        try {
            await api.delete(`/superadmin/users/${userId}/revoke-course/${courseId}`);
            toast.success('Course access revoked');
            fetchData();
        } catch (err) {
            toast.error('Failed to revoke course access');
        } finally {
            setActionLoading(false);
        }
    };

    const handleElevate = async () => {
        if (!window.confirm(`Elevate ${user.username} to SuperAdmin? This action cannot be undone here.`)) return;
        setActionLoading(true);
        try {
            const res = await api.post('/superadmin/elevate', { userId: user._id });
            toast.success(res.data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to elevate user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to permanently delete this user? This cannot be undone.')) return;
        setActionLoading(true);
        try {
            await api.delete(`/superadmin/user/${userId}`);
            toast.success('User deleted');
            navigate('/superadmin/manage/users');
        } catch (err) {
            toast.error('Failed to delete user');
            setActionLoading(false);
        }
    };

    const formatDate = (dateStr, id) => {
        let d = dateStr ? new Date(dateStr) : id ? new Date(parseInt(id.substring(0, 8), 16) * 1000) : null;
        if (!d) return '—';
        return d.toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500">Loading user data...</div>;
    }

    if (!user) return null;

    // Filter out courses the user already has
    const enrolledIds = user.enrolledCourses?.map(c => c._id) || [];
    const availableToGrant = allCourses.filter(c => !enrolledIds.includes(c._id));

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-8 animate-fade-in pl-60">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-2">
                    <button 
                        onClick={() => navigate('/superadmin/manage/users')}
                        className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                            {user.username}
                            {user.blocked && (
                                <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 flex items-center gap-1">
                                    <UserX size={14} /> Suspended
                                </span>
                            )}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{user.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Left Column: Profile & Actions */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Profile Info</h2>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <span className="text-slate-500 block mb-1">Joined</span>
                                    <span className="font-medium">{formatDate(user.createdAt, user._id)}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-1">Auth Method</span>
                                    <span className={`px-2 py-1 text-[10px] font-bold rounded-md inline-block ${
                                        user.googleId
                                            ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400'
                                            : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                                    }`}>
                                        {user.googleId ? 'Google Sign-In' : 'Email/Password'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Danger Zone</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={handleBlockToggle}
                                    disabled={actionLoading}
                                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition border disabled:opacity-50 ${
                                        user.blocked 
                                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-900/40' 
                                        : 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 border-orange-200 dark:border-orange-900 hover:bg-orange-100 dark:hover:bg-orange-900/40'
                                    }`}
                                >
                                    {user.blocked ? <UserCheck size={16} /> : <ShieldAlert size={16} />}
                                    {user.blocked ? 'Unblock Account' : 'Suspend Account'}
                                </button>
                                
                                <button
                                    onClick={handleElevate}
                                    disabled={actionLoading || user.googleId}
                                    title={user.googleId ? 'Cannot elevate Google accounts' : ''}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 disabled:opacity-50"
                                >
                                    <ShieldPlus size={16} /> Elevate to SuperAdmin
                                </button>
                                
                                <button
                                    onClick={handleDelete}
                                    disabled={actionLoading}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50"
                                >
                                    <Trash2 size={16} /> Permanently Delete
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Courses & Reports */}
                    <div className="md:col-span-2 space-y-6">
                        
                        {/* Enrolled Courses */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
                                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <BookOpen size={18} className="text-indigo-500" /> Enrolled Courses
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold">
                                    {user.enrolledCourses?.length || 0}
                                </span>
                            </div>
                            
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 flex items-center gap-3">
                                <select 
                                    value={selectedCourseId}
                                    onChange={e => setSelectedCourseId(e.target.value)}
                                    className="flex-1 h-10 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                >
                                    <option value="">-- Select a course to grant --</option>
                                    {availableToGrant.map(c => (
                                        <option key={c._id} value={c._id}>
                                            {c.title} {c.published ? '' : '(Unpublished)'}
                                        </option>
                                    ))}
                                </select>
                                <button 
                                    onClick={handleGrantCourse}
                                    disabled={!selectedCourseId || actionLoading}
                                    className="px-4 h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition disabled:opacity-50"
                                >
                                    Grant Access
                                </button>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto">
                                {user.enrolledCourses?.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-slate-400">User is not enrolled in any courses.</div>
                                ) : (
                                    user.enrolledCourses?.map(course => (
                                        <div key={course._id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0">
                                                    {course.image ? <img src={course.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900"></div>}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm line-clamp-1">{course.title}</p>
                                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                                        {course.published ? (
                                                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={12} /> Published</span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400"><XCircle size={12} /> Unpublished</span>
                                                        )}
                                                        <span>·</span>
                                                        <span>₹{course.price}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleRevokeCourse(course._id)}
                                                disabled={actionLoading}
                                                className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                                            >
                                                Revoke
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Reports Filed */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
                                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Flag size={18} className="text-rose-500" /> Reports Filed
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold">
                                    {reports.length}
                                </span>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto">
                                {reports.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-slate-400">User hasn't filed any reports.</div>
                                ) : (
                                    reports.map(report => (
                                        <div key={report._id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-semibold text-sm">{report.subject}</h3>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                                    report.status === 'Open' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30' :
                                                    report.status === 'In Progress' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30' :
                                                    'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30'
                                                }`}>
                                                    {report.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{report.description}</p>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-3">
                                                <span>Target: {report.videoId ? 'Video' : 'Course'}</span>
                                                <span>·</span>
                                                <span>{formatDate(report.createdAt, report._id)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
