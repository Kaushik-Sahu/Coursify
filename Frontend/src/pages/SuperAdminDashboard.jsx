import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'sonner';
import {
  Users, UserCog, Trash2, RefreshCw, BookOpen, AlertCircle, Clock,
  Search, ChevronLeft, ChevronRight, ShieldPlus, X, LogOut, ShieldAlert
} from 'lucide-react';

const ITEMS_PER_PAGE = 15;

export default function SuperAdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL
  const getTab = () => {
    if (location.pathname.includes('/users')) return 'users';
    if (location.pathname.includes('/creators')) return 'creators';
    if (location.pathname.includes('/reports')) return 'reports';
    return 'overview';
  };
  const [activeTab, setActiveTab] = useState(getTab());

  // Stats
  const [stats, setStats] = useState({ users: 0, creators: 0, courses: 0, newReports: 0, inProgressReports: 0 });
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

  // Reports tab state
  const [reports, setReports] = useState([]);
  const [reportsTotal, setReportsTotal] = useState(0);
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsTotalPages, setReportsTotalPages] = useState(1);
  const [reportsStatusFilter, setReportsStatusFilter] = useState('Open');
  const [reportsLoading, setReportsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportEmailTarget, setReportEmailTarget] = useState('reporter');
  const [reportEmailMessage, setReportEmailMessage] = useState('');
  const [reportEmailLoading, setReportEmailLoading] = useState(false);

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

  // ─── Fetch Reports ───
  const fetchReports = useCallback(async (page = 1, status = 'Open') => {
    setReportsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: ITEMS_PER_PAGE });
      if (status) params.set('status', status);
      const res = await api.get(`/superadmin/reports?${params}`);
      setReports(res.data.reports || []);
      setReportsTotal(res.data.total || 0);
      setReportsPage(res.data.page || 1);
      setReportsTotalPages(res.data.totalPages || 1);
    } catch {
      toast.error('Failed to fetch reports');
    } finally {
      setReportsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchUsers(1, '');
    fetchCreators(1, '');
    fetchReports(1, 'Open');
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

  // ─── Update Report Status handler ───
  const handleUpdateReportStatus = async (id, newStatus) => {
    setActionLoading(id);
    try {
      await api.put(`/superadmin/reports/${id}/status`, { status: newStatus });
      toast.success(`Report marked as ${newStatus}`);
      fetchReports(reportsPage, reportsStatusFilter);
      fetchStats(true); // Update Open Reports count
    } catch {
      toast.error('Failed to update report status');
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Send Report Email handler ───
  const handleSendReportEmail = async (e) => {
    e.preventDefault();
    if (!reportEmailMessage.trim() || !selectedReport) return;
    setReportEmailLoading(true);
    try {
      await api.post(`/superadmin/reports/${selectedReport._id}/email`, {
        target: reportEmailTarget,
        subject: `Coursify Support Update: Re: ${selectedReport.subject}`,
        message: reportEmailMessage
      });
      toast.success('Email sent successfully');
      setReportEmailMessage('');
    } catch {
      toast.error('Failed to send email');
    } finally {
      setReportEmailLoading(false);
    }
  };

  // ─── Video Actions ───
  const handleBlockVideo = async () => {
    if (!selectedReport?.videoId) return;
    try {
      const res = await api.put(`/superadmin/reports/${selectedReport._id}/video/toggle-block`);
      toast.success(res.data.message);
      // We don't have to fully refetch all reports just to update modal UI, 
      // but it's safest to just let them know it worked.
    } catch {
      toast.error('Failed to toggle video block');
    }
  };

  const handleDeleteVideo = async () => {
    if (!selectedReport?.videoId) return;
    if (!window.confirm('Are you sure you want to permanently delete this video? This cannot be undone.')) return;
    try {
      await api.delete(`/superadmin/reports/${selectedReport._id}/video`);
      toast.success('Video permanently deleted');
      setSelectedReport(null);
      fetchReports(reportsPage, reportsStatusFilter);
    } catch {
      toast.error('Failed to delete video');
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
    else if (tab === 'reports') navigate('/superadmin/reports');
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
  const formatDate = (dateStr, id) => {
    let d = dateStr ? new Date(dateStr) : id ? new Date(parseInt(id.substring(0, 8), 16) * 1000) : null;
    if (!d) return '—';
    return d.toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatStorage = (bytes) => {
    if (!bytes && bytes !== 0) return '—';
    const mb = bytes / (1024 * 1024);
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
          { key: 'reports', label: 'Reports', icon: <ShieldAlert size={15} /> },
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {[
                { label: 'Total Users', value: stats.users, icon: <Users size={22} />, bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400' },
                { label: 'Total Creators', value: stats.creators, icon: <UserCog size={22} />, bg: 'bg-purple-100 dark:bg-purple-950/40', text: 'text-purple-600 dark:text-purple-400' },
                { label: 'Total Courses', value: stats.courses, icon: <BookOpen size={22} />, bg: 'bg-indigo-100 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400' },
                { label: 'Open Reports', value: stats.newReports, icon: <AlertCircle size={22} />, bg: 'bg-rose-100 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-400' },
                { label: 'In Progress Reports', value: stats.inProgressReports, icon: <Clock size={22} />, bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400' },
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
                          <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{formatDate(user.createdAt, user._id)}</td>
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
                          <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{formatDate(creator.createdAt, creator._id)}</td>
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

        {/* ════════════════════════════════════════ */}
        {/*  REPORTS TAB                             */}
        {/* ════════════════════════════════════════ */}
        {activeTab === 'reports' && (
          <div className="max-w-7xl mx-auto animate-fade-in flex flex-col h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Reports Management</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review and resolve user reports on videos and courses.</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={reportsStatusFilter}
                  onChange={(e) => {
                    setReportsStatusFilter(e.target.value);
                    fetchReports(1, e.target.value);
                  }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
                <button
                  onClick={() => fetchReports(reportsPage, reportsStatusFilter)}
                  className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Refresh Reports"
                >
                  <RefreshCw size={18} className={reportsLoading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex-grow flex flex-col">
              {reportsLoading ? (
                <div className="flex flex-col items-center justify-center p-16 text-slate-400">
                  <RefreshCw size={32} className="animate-spin mb-4 opacity-50" />
                  <p className="font-medium">Loading reports...</p>
                </div>
              ) : (
                <div className="overflow-x-auto flex-grow custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Reported By</th>
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Target</th>
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Issue</th>
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Status</th>
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Date</th>
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-12 text-center text-sm text-slate-400">
                            No reports found.
                          </td>
                        </tr>
                      ) : reports.map(report => (
                        <tr key={report._id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                          <td className="p-4 text-sm">
                            <span className="font-semibold">{report.reporterId?.username || 'Unknown'}</span>
                            <br />
                            <span className="text-xs text-slate-500">{report.reporterId?.email || ''}</span>
                          </td>
                          <td className="p-4 text-sm">
                            {report.videoId ? (
                              <div 
                                className="cursor-pointer hover:underline text-indigo-600 dark:text-indigo-400"
                                onClick={() => {
                                  const cId = report.courseId?._id || report.courseId;
                                  if (cId) navigate(`/course/${cId}?videoId=${report.videoId._id || report.videoId}`);
                                  else toast.error('Course ID is missing for this older report.');
                                }}
                              >
                                <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded mr-1 font-bold no-underline inline-block">Video</span>
                                {report.videoId.title || 'View Video'}
                              </div>
                            ) : report.courseId ? (
                              <div
                                className="cursor-pointer hover:underline text-emerald-600 dark:text-emerald-400"
                                onClick={() => {
                                  const cId = report.courseId?._id || report.courseId;
                                  if (cId) navigate(`/course/${cId}`, { state: { preview: true } });
                                }}
                              >
                                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded mr-1 font-bold no-underline inline-block">Course</span>
                                {report.courseId.title || 'View Course'}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Unknown</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-sm text-rose-600 dark:text-rose-400">{report.subject}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-xs">{report.description}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${
                              report.status === 'Resolved'
                                ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/40'
                                : report.status === 'In Progress'
                                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40'
                                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40'
                            }`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{formatDate(report.createdAt, report._id)}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedReport(report)}
                                className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded text-xs font-bold transition border-0 cursor-pointer"
                              >
                                View Details
                              </button>
                              {report.status !== 'Resolved' && (
                                <button
                                  onClick={() => handleUpdateReportStatus(report._id, 'Resolved')}
                                  disabled={actionLoading === report._id}
                                  className="px-2 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded text-xs font-bold transition border-0 cursor-pointer disabled:opacity-40"
                                >
                                  Resolve
                                </button>
                              )}
                              {report.status === 'Open' && (
                                <button
                                  onClick={() => handleUpdateReportStatus(report._id, 'In Progress')}
                                  disabled={actionLoading === report._id}
                                  className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded text-xs font-bold transition border-0 cursor-pointer disabled:opacity-40"
                                >
                                  In Progress
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls */}
              {reportsTotalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Page {reportsPage} of {reportsTotalPages} · {reportsTotal} total
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchReports(reportsPage - 1, reportsStatusFilter)}
                      disabled={reportsPage <= 1 || reportsLoading}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} /> Previous
                    </button>
                    <button
                      onClick={() => fetchReports(reportsPage + 1, reportsStatusFilter)}
                      disabled={reportsPage >= reportsTotalPages || reportsLoading}
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

      {/* ═══ Report Details & Email Modal ═══ */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <ShieldAlert size={22} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">Report Details</h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer border-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-5 mb-6 border border-slate-100 dark:border-slate-800/60">
              <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-800/60">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Subject</p>
                <p className="text-base font-bold text-slate-800 dark:text-white">{selectedReport.subject}</p>
              </div>
              <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-800/60">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">Description</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedReport.description}</p>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Reporter</p>
                  <p className="text-sm font-semibold">{selectedReport.reporterId?.username} ({selectedReport.reporterId?.email})</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Target</p>
                  <p className="text-sm font-semibold">
                    {selectedReport.courseId ? selectedReport.courseId.title : 'Unknown Course'}
                    {selectedReport.videoId ? ` > ${selectedReport.videoId.title}` : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-4">
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">Contact Parties via Email</h4>
              
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="emailTarget"
                    value="reporter"
                    checked={reportEmailTarget === 'reporter'}
                    onChange={() => setReportEmailTarget('reporter')}
                    className="accent-indigo-500"
                  />
                  <span>Email Reporter</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="emailTarget"
                    value="creator"
                    checked={reportEmailTarget === 'creator'}
                    onChange={() => setReportEmailTarget('creator')}
                    className="accent-indigo-500"
                  />
                  <span>Email Course Creator</span>
                </label>
              </div>

              <textarea
                value={reportEmailMessage}
                onChange={(e) => setReportEmailMessage(e.target.value)}
                placeholder={`Write your message to the ${reportEmailTarget} here...`}
                className="w-full min-h-[120px] p-4 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none resize-y"
              />
            </div>

            {selectedReport.videoId && (
              <div className="flex flex-col gap-3 mb-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">Video Moderation Actions</h4>
                <div className="flex gap-3">
                  <button
                    onClick={handleBlockVideo}
                    className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-bold transition cursor-pointer border-0"
                  >
                    Toggle Block (Hide)
                  </button>
                  <button
                    onClick={handleDeleteVideo}
                    className="px-4 py-2 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-bold transition cursor-pointer border-0"
                  >
                    Permanently Delete
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer border-0"
              >
                Close
              </button>
              <button
                onClick={handleSendReportEmail}
                disabled={reportEmailLoading || !reportEmailMessage.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer border-0 disabled:opacity-50 flex items-center gap-2 shadow-md shadow-indigo-600/20"
              >
                {reportEmailLoading ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
