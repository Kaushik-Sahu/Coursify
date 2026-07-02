import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'sonner';
import {
  Users, UserCog, Trash2, RefreshCw, BookOpen, AlertCircle,
  Search, ChevronLeft, ChevronRight, ShieldPlus, X, LogOut
} from 'lucide-react';

const ITEMS_PER_PAGE = 15;

export default function SuperAdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL
  const getTab = () => {
    if (location.pathname.includes('/users')) return 'users';
    if (location.pathname.includes('/creators')) return 'creators';
    return 'overview';
  };
  const [activeTab, setActiveTab] = useState(getTab());

  // Stats
  const [stats, setStats] = useState({ users: 0, creators: 0, courses: 0, newReports: 0 });
  const [loadingStats, setLoadingStats] = useState(false);

  // Users tab state
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  // Creators tab state
  const [creators, setCreators] = useState([]);
  const [creatorsTotal, setCreatorsTotal] = useState(0);
  const [creatorsPage, setCreatorsPage] = useState(1);
  const [creatorsTotalPages, setCreatorsTotalPages] = useState(1);
  const [creatorsSearch, setCreatorsSearch] = useState('');
  const [creatorsLoading, setCreatorsLoading] = useState(false);

  // Action states
  const [actionLoading, setActionLoading] = useState(null);

  // Elevate modal
  const [elevateTarget, setElevateTarget] = useState(null); // { _id, username, email, type }
  const [elevateLoading, setElevateLoading] = useState(false);

  // Debounce refs
  const usersDebounceRef = useRef(null);
  const creatorsDebounceRef = useRef(null);

  // Sync tab with URL
  useEffect(() => {
    setActiveTab(getTab());
  }, [location.pathname]);

  // ─── Fetch Stats ───
  const fetchStats = useCallback(async (forceRefresh = false) => {
    setLoadingStats(true);
    try {
      const res = await api.get(`/superadmin/stats${forceRefresh ? '?refresh=true' : ''}`);
      setStats(res.data.stats);
      if (forceRefresh) toast.success('Statistics refreshed');
    } catch {
      toast.error('Failed to fetch statistics');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ─── Fetch Users ───
  const fetchUsers = useCallback(async (page = 1, search = '') => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: ITEMS_PER_PAGE });
      if (search) params.set('search', search);
      const res = await api.get(`/superadmin/users?${params}`);
      setUsers(res.data.users || []);
      setUsersTotal(res.data.total || 0);
      setUsersPage(res.data.page || 1);
      setUsersTotalPages(res.data.totalPages || 1);
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // ─── Fetch Creators ───
  const fetchCreators = useCallback(async (page = 1, search = '') => {
    setCreatorsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: ITEMS_PER_PAGE });
      if (search) params.set('search', search);
      const res = await api.get(`/superadmin/creators?${params}`);
      setCreators(res.data.creators || []);
      setCreatorsTotal(res.data.total || 0);
      setCreatorsPage(res.data.page || 1);
      setCreatorsTotalPages(res.data.totalPages || 1);
    } catch {
      toast.error('Failed to fetch creators');
    } finally {
      setCreatorsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchUsers(1, '');
    fetchCreators(1, '');
  }, []);

  // ─── Debounced search handlers ───
  const handleUsersSearchChange = (value) => {
    setUsersSearch(value);
    clearTimeout(usersDebounceRef.current);
    usersDebounceRef.current = setTimeout(() => {
      fetchUsers(1, value);
    }, 400);
  };

  const handleCreatorsSearchChange = (value) => {
    setCreatorsSearch(value);
    clearTimeout(creatorsDebounceRef.current);
    creatorsDebounceRef.current = setTimeout(() => {
      fetchCreators(1, value);
    }, 400);
  };

  // ─── Delete handler ───
  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    setActionLoading(id);
    try {
      await api.delete(`/superadmin/${type}/${id}`);
      toast.success(`${type === 'user' ? 'User' : 'Creator'} deleted successfully`);
      if (type === 'user') fetchUsers(usersPage, usersSearch);
      else fetchCreators(creatorsPage, creatorsSearch);
      fetchStats(true);
    } catch {
      toast.error(`Failed to delete ${type}`);
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Elevate to SuperAdmin handler ───
  const handleElevate = async () => {
    if (!elevateTarget) return;
    setElevateLoading(true);
    try {
      const res = await api.post('/superadmin/elevate', { userId: elevateTarget._id });
      toast.success(res.data.message || `${elevateTarget.username} elevated to SuperAdmin`);
      setElevateTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to elevate user');
    } finally {
      setElevateLoading(false);
    }
  };

  // ─── Tab navigation ───
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'overview') navigate('/superadmin/dashboard');
    else if (tab === 'users') navigate('/superadmin/users');
    else if (tab === 'creators') navigate('/superadmin/creators');
  };

  // ─── Logout ───
  const handleLogout = async () => {
    try {
      await api.post('/superadmin/logout');
    } catch { /* ignore */ }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('type');
    navigate('/superadmin/login');
  };

  // ─── Helpers ───
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatStorage = (mb) => {
    if (!mb && mb !== 0) return '—';
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb.toFixed(0)} MB`;
  };

  // ─────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col animate-fade-in">

      {/* ═══ Top Header ═══ */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">SuperAdmin Console</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Platform Management Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStats(true)}
            disabled={loadingStats}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition border-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loadingStats ? 'animate-spin' : ''} /> Refresh Stats
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition border border-red-100 dark:border-red-900/40 cursor-pointer"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* ═══ Tab Bar ═══ */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 flex gap-0.5 shrink-0">
        {[
          { key: 'overview', label: 'Overview', icon: <BookOpen size={15} /> },
          { key: 'users', label: 'User Management', icon: <Users size={15} /> },
          { key: 'creators', label: 'Creator Management', icon: <UserCog size={15} /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-extrabold transition border-b-2 cursor-pointer bg-transparent border-l-0 border-r-0 border-t-0 ${
              activeTab === tab.key
                ? 'border-b-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-b-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ Content ═══ */}
      <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">

        {/* ════════════════════════════════════════ */}
        {/*  OVERVIEW TAB                            */}
        {/* ════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'Total Users', value: stats.users, icon: <Users size={22} />, bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400' },
                { label: 'Total Creators', value: stats.creators, icon: <UserCog size={22} />, bg: 'bg-purple-100 dark:bg-purple-950/40', text: 'text-purple-600 dark:text-purple-400' },
                { label: 'Total Courses', value: stats.courses, icon: <BookOpen size={22} />, bg: 'bg-indigo-100 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400' },
                { label: 'Open Reports', value: stats.newReports, icon: <AlertCircle size={22} />, bg: 'bg-rose-100 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-400' },
              ].map(card => (
                <div key={card.label} className="glassmorphism rounded-2xl p-6 border border-white/50 dark:border-slate-800 hover:shadow-md transition">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 rounded-xl ${card.bg} ${card.text}`}>{card.icon}</div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.label}</span>
                  </div>
                  <p className="text-4xl font-extrabold">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="mt-8 glassmorphism rounded-2xl p-6 border border-white/50 dark:border-slate-800">
              <h3 className="text-sm font-extrabold mb-4 text-slate-700 dark:text-slate-300">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => handleTabChange('users')} className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition border border-blue-100 dark:border-blue-900/30 cursor-pointer">
                  <Users size={14} /> Manage Users
                </button>
                <button onClick={() => handleTabChange('creators')} className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-xl text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/30 transition border border-purple-100 dark:border-purple-900/30 cursor-pointer">
                  <UserCog size={14} /> Manage Creators
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════ */}
        {/*  USER MANAGEMENT TAB                     */}
        {/* ════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold">User Management</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{usersTotal} total users</p>
              </div>
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={usersSearch}
                  onChange={(e) => handleUsersSearchChange(e.target.value)}
                  placeholder="Search by username or email..."
                  className="w-full h-10 pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/50 transition placeholder-slate-400"
                />
                {usersSearch && (
                  <button onClick={() => handleUsersSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-0 p-0">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              {usersLoading ? (
                <div className="p-12 text-center text-sm text-slate-400">Loading users...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Username</th>
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Auth</th>
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Courses</th>
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-12 text-center text-sm text-slate-400">
                            {usersSearch ? 'No users match your search.' : 'No users found.'}
                          </td>
                        </tr>
                      ) : users.map(user => (
                        <tr key={user._id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                          <td className="p-4 font-semibold text-sm">{user.username}</td>
                          <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{user.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${
                              user.googleId
                                ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/40'
                                : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40'
                            }`}>
                              {user.googleId ? 'Google' : 'Email'}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{formatDate(user.createdAt)}</td>
                          <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-xs font-bold">
                              {user.enrolledCourses?.length || 0}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setElevateTarget({ _id: user._id, username: user.username, email: user.email, type: 'user' })}
                                className="p-2 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition border-0 cursor-pointer bg-transparent"
                                title="Elevate to SuperAdmin"
                              >
                                <ShieldPlus size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(user._id, 'user')}
                                disabled={actionLoading === user._id}
                                className="p-2 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition border-0 cursor-pointer bg-transparent disabled:opacity-40"
                                title="Delete User"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls */}
              {usersTotalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Page {usersPage} of {usersTotalPages} · {usersTotal} total
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchUsers(usersPage - 1, usersSearch)}
                      disabled={usersPage <= 1 || usersLoading}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} /> Previous
                    </button>
                    <button
                      onClick={() => fetchUsers(usersPage + 1, usersSearch)}
                      disabled={usersPage >= usersTotalPages || usersLoading}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════ */}
        {/*  CREATOR MANAGEMENT TAB                  */}
        {/* ════════════════════════════════════════ */}
        {activeTab === 'creators' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold">Creator Management</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{creatorsTotal} total creators</p>
              </div>
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={creatorsSearch}
                  onChange={(e) => handleCreatorsSearchChange(e.target.value)}
                  placeholder="Search by username or email..."
                  className="w-full h-10 pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/50 transition placeholder-slate-400"
                />
                {creatorsSearch && (
                  <button onClick={() => handleCreatorsSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-0 p-0">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              {creatorsLoading ? (
                <div className="p-12 text-center text-sm text-slate-400">Loading creators...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Username</th>
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Auth</th>
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Storage Used</th>
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creators.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-12 text-center text-sm text-slate-400">
                            {creatorsSearch ? 'No creators match your search.' : 'No creators found.'}
                          </td>
                        </tr>
                      ) : creators.map(creator => (
                        <tr key={creator._id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                          <td className="p-4 font-semibold text-sm">{creator.username}</td>
                          <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{creator.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${
                              creator.googleId
                                ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/40'
                                : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40'
                            }`}>
                              {creator.googleId ? 'Google' : 'Email'}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{formatDate(creator.createdAt)}</td>
                          <td className="p-4 text-sm">
                            <span className="bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-md text-xs font-bold border border-purple-100 dark:border-purple-900/30">
                              {formatStorage(creator.storageUsed)}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setElevateTarget({ _id: creator._id, username: creator.username, email: creator.email, type: 'creator' })}
                                className="p-2 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition border-0 cursor-pointer bg-transparent"
                                title="Elevate to SuperAdmin"
                              >
                                <ShieldPlus size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(creator._id, 'creator')}
                                disabled={actionLoading === creator._id}
                                className="p-2 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition border-0 cursor-pointer bg-transparent disabled:opacity-40"
                                title="Delete Creator"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls */}
              {creatorsTotalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Page {creatorsPage} of {creatorsTotalPages} · {creatorsTotal} total
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchCreators(creatorsPage - 1, creatorsSearch)}
                      disabled={creatorsPage <= 1 || creatorsLoading}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} /> Previous
                    </button>
                    <button
                      onClick={() => fetchCreators(creatorsPage + 1, creatorsSearch)}
                      disabled={creatorsPage >= creatorsTotalPages || creatorsLoading}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ═══ Elevate to SuperAdmin Confirmation Modal ═══ */}
      {elevateTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
                <ShieldPlus size={22} />
              </div>
              <h3 className="text-lg font-extrabold">Elevate to SuperAdmin</h3>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/40 rounded-xl p-4 mb-5 border border-slate-100 dark:border-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
                <span className="font-bold text-slate-800 dark:text-white">{elevateTarget.username}</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{elevateTarget.email}</p>
              <p className="text-[10px] text-slate-400 mt-1.5 uppercase font-bold tracking-wider">
                Current role: {elevateTarget.type === 'creator' ? 'Creator' : 'User'}
              </p>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              This will grant <strong className="text-slate-800 dark:text-white">{elevateTarget.username}</strong> full SuperAdmin privileges. This action creates a new SuperAdmin account using their existing credentials. The original account remains unchanged.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setElevateTarget(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer border-0"
              >
                Cancel
              </button>
              <button
                onClick={handleElevate}
                disabled={elevateLoading}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition cursor-pointer border-0 disabled:opacity-50 shadow-md shadow-amber-500/20"
              >
                {elevateLoading ? 'Elevating...' : 'Confirm Elevation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
