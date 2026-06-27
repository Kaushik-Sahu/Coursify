import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'sonner';
import { Users, UserCog, Trash2, RefreshCw, BookOpen, AlertCircle } from 'lucide-react';

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [creators, setCreators] = useState([]);
  const [stats, setStats] = useState({ users: 0, creators: 0, courses: 0, newReports: 0 });
  const [activeTab, setActiveTab] = useState('users');
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, creatorsRes] = await Promise.all([
        api.get('/superadmin/users'),
        api.get('/superadmin/creators')
      ]);
      setUsers(usersRes.data.users || []);
      setCreators(creatorsRes.data.creators || []);
    } catch (error) {
      toast.error("Failed to fetch data");
    }
  };

  const fetchStats = async (forceRefresh = false) => {
    setLoadingStats(true);
    try {
      const res = await api.get(`/superadmin/stats${forceRefresh ? '?refresh=true' : ''}`);
      setStats(res.data.stats);
      if (forceRefresh) toast.success("Statistics refreshed");
    } catch (error) {
      toast.error("Failed to fetch statistics");
    } finally {
      setLoadingStats(false);
    }
  };

  const handleDelete = async (id, type) => {
    if(!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      await api.delete(`/superadmin/${type}/${id}`);
      toast.success(`${type} deleted successfully`);
      fetchData();
      fetchStats(true); // refresh stats after deletion
    } catch (error) {
      toast.error(`Failed to delete ${type}`);
    }
  };

  return (
    <div className="p-8 animate-fade-in max-w-6xl mx-auto mt-10">
      
      {/* Stats Grid */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">SuperAdmin Dashboard</h1>
        <button 
          onClick={() => fetchStats(true)} 
          disabled={loadingStats}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl font-medium hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors disabled:opacity-50 cursor-pointer border-0"
        >
          <RefreshCw size={18} className={loadingStats ? "animate-spin" : ""} /> Refresh Stats
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glassmorphism bg-white/70 dark:bg-slate-900/50 rounded-2xl p-6 border border-white/50 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl"><Users size={24}/></div>
            <h3 className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-xs">Total Users</h3>
          </div>
          <p className="text-4xl font-bold text-slate-800 dark:text-white">{stats.users}</p>
        </div>
        
        <div className="glassmorphism bg-white/70 dark:bg-slate-900/50 rounded-2xl p-6 border border-white/50 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl"><UserCog size={24}/></div>
            <h3 className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-xs">Creators</h3>
          </div>
          <p className="text-4xl font-bold text-slate-800 dark:text-white">{stats.creators}</p>
        </div>

        <div className="glassmorphism bg-white/70 dark:bg-slate-900/50 rounded-2xl p-6 border border-white/50 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl"><BookOpen size={24}/></div>
            <h3 className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-xs">Total Courses</h3>
          </div>
          <p className="text-4xl font-bold text-slate-800 dark:text-white">{stats.courses}</p>
        </div>

        <div className="glassmorphism bg-white/70 dark:bg-slate-900/50 rounded-2xl p-6 border border-white/50 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl"><AlertCircle size={24}/></div>
            <h3 className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-xs">New Reports</h3>
          </div>
          <p className="text-4xl font-bold text-slate-800 dark:text-white">{stats.newReports}</p>
        </div>
      </div>

      <div className="glassmorphism bg-white/70 dark:bg-slate-900/50 rounded-3xl p-8 min-h-[600px] border border-white/50 dark:border-slate-800">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">User Management</h2>
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all border-0 cursor-pointer ${activeTab === 'users' ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <Users size={18} /> Users
            </button>
            <button 
              onClick={() => setActiveTab('creators')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all border-0 cursor-pointer ${activeTab === 'creators' ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <UserCog size={18} /> Creators
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="p-4 font-medium">Username</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Joined (Google)</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'users' ? users : creators).map(item => (
                <tr key={item._id} className="border-b border-slate-50 dark:border-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{item.username}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{item.email}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {item.googleId ? <span className="px-2 py-1 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs rounded-full">Google Auth</span> : <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 text-xs rounded-full">Standard</span>}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(item._id, activeTab === 'users' ? 'user' : 'creator')}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 p-2 rounded-lg transition-colors border-0 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {(activeTab === 'users' ? users : creators).length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500 dark:text-slate-400">No data found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
