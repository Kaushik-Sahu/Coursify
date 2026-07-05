import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, X, Eye, EyeOff } from 'lucide-react';
import api from '../api';
import { toast } from 'sonner';

export default function SACoursesList() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    
    const debounceRef = useRef(null);

    const fetchCourses = async (p = 1, s = '') => {
        setLoading(true);
        try {
            const res = await api.get('/superadmin/courses', {
                params: { page: p, limit: 15, search: s }
            });
            setCourses(res.data.courses);
            setTotal(res.data.total);
            setPage(res.data.page);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses(1, '');
    }, []);

    const handleSearchChange = (value) => {
        setSearch(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchCourses(1, value);
        }, 400);
    };

    const formatDate = (dateStr, id) => {
        let d = dateStr ? new Date(dateStr) : id ? new Date(parseInt(id.substring(0, 8), 16) * 1000) : null;
        if (!d) return '—';
        return d.toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-8 animate-fade-in pl-60">
            <div className="max-w-6xl mx-auto">
                
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                            Manage Courses
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            View and inspect all courses created on the platform.
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Search by course title..."
                                className="w-full h-10 pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/50 transition placeholder-slate-400"
                            />
                            {search && (
                                <button onClick={() => handleSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-12 text-center text-sm text-slate-400">Loading courses...</div>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Creator</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="p-12 text-center text-sm text-slate-400">
                                                {search ? 'No courses match your search.' : 'No courses found.'}
                                            </td>
                                        </tr>
                                    ) : courses.map(course => (
                                        <tr 
                                            key={course._id} 
                                            className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                                        >
                                            <td className="p-4 font-semibold text-sm">
                                                <div className="flex items-center gap-3">
                                                    {course.image && (
                                                        <img src={course.image} alt={course.title} className="w-10 h-10 rounded-md object-cover border border-slate-200 dark:border-slate-700" />
                                                    )}
                                                    <span className="truncate max-w-[200px] block" title={course.title}>{course.title}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">{course.creator?.username}</span>
                                                    <span className="text-xs">{course.creator?.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-500 dark:text-slate-400 font-mono">
                                                ₹{course.price.toFixed(2)}
                                            </td>
                                            <td className="p-4">
                                                {course.published ? (
                                                    <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-1 w-fit">
                                                        <Eye size={12} /> Published
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 flex items-center gap-1 w-fit">
                                                        <EyeOff size={12} /> Draft
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{formatDate(course.createdAt, course._id)}</td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => navigate(`/course/${course._id}`, { state: { course } })}
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                                                >
                                                    Inspect Course
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 mt-auto">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                Page {page} of {totalPages} · {total} total
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => fetchCourses(page - 1, search)}
                                    disabled={page <= 1 || loading}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={14} /> Previous
                                </button>
                                <button
                                    onClick={() => fetchCourses(page + 1, search)}
                                    disabled={page >= totalPages || loading}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Next <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
