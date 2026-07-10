import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, X, UserX, UserCheck } from 'lucide-react';
import api from '../api';
import { toast } from 'sonner';

export default function SACreatorsList() {
    const navigate = useNavigate();
    const [creators, setCreators] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    
    const debounceRef = useRef(null);

    const fetchCreators = async (p = 1, s = '') => {
        setLoading(true);
        try {
            const res = await api.get('/superadmin/creators', {
                params: { page: p, limit: 15, search: s }
            });
            setCreators(res.data.creators);
            setTotal(res.data.total);
            setPage(res.data.page);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            toast.error('Failed to load creators');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCreators(1, '');
    }, []);

    const handleSearchChange = (value) => {
        setSearch(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchCreators(1, value);
        }, 400);
    };

    const formatDate = (dateStr, id) => {
        let d = dateStr ? new Date(dateStr) : id ? new Date(parseInt(id.substring(0, 8), 16) * 1000) : null;
        if (!d) return '—';
        return d.toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const formatStorage = (bytes) => {
        if (!bytes && bytes !== 0) return '0 MB';
        const mb = bytes / (1024 * 1024);
        if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
        return `${mb.toFixed(0)} MB`;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8 animate-fade-in md:pl-60">
            <div className="max-w-6xl mx-auto">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                            Manage Creators
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            View and manage content creators.
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Search by username or email..."
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
                            <div className="p-12 text-center text-sm text-slate-400">Loading creators...</div>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Username</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Courses</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Storage</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {creators.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-12 text-center text-sm text-slate-400">
                                                {search ? 'No creators match your search.' : 'No creators found.'}
                                            </td>
                                        </tr>
                                    ) : creators.map(creator => (
                                        <tr 
                                            key={creator._id} 
                                            onClick={() => navigate(`/superadmin/manage/creators/${creator._id}`)}
                                            className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
                                        >
                                            <td className="p-4 font-semibold text-sm">{creator.username}</td>
                                            <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{creator.email}</td>
                                            <td className="p-4">
                                                {creator.blocked ? (
                                                    <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 flex items-center gap-1 w-fit">
                                                        <UserX size={12} /> Blocked
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-1 w-fit">
                                                        <UserCheck size={12} /> Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-xs font-bold">
                                                    {creator.coursesCount || 0}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{formatStorage(creator.storageUsed)}</td>
                                            <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{formatDate(creator.createdAt, creator._id)}</td>
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
                                    onClick={() => fetchCreators(page - 1, search)}
                                    disabled={page <= 1 || loading}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={14} /> Previous
                                </button>
                                <button
                                    onClick={() => fetchCreators(page + 1, search)}
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
