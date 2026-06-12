import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'sonner';
import { Users, UserCog, Trash2 } from 'lucide-react';

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [creators, setCreators] = useState([]);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchData();
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

  const handleDelete = async (id, type) => {
    if(!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      await api.delete(`/superadmin/${type}/${id}`);
      toast.success(`${type} deleted successfully`);
      fetchData();
    } catch (error) {
      toast.error(`Failed to delete ${type}`);
    }
  };

  return (
    <div className="p-8 animate-fade-in max-w-6xl mx-auto mt-10">
      <div className="glassmorphism rounded-3xl p-8 min-h-[600px]">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">SuperAdmin Dashboard</h1>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'users' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Users size={18} /> Users
            </button>
            <button 
              onClick={() => setActiveTab('creators')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'creators' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <UserCog size={18} /> Creators
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <th className="p-4 font-medium">Username</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Joined (Google)</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'users' ? users : creators).map(item => (
                <tr key={item._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{item.username}</td>
                  <td className="p-4 text-slate-600">{item.email}</td>
                  <td className="p-4 text-slate-600">
                    {item.googleId ? <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Google Auth</span> : <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">Standard</span>}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(item._id, activeTab === 'users' ? 'user' : 'creator')}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {(activeTab === 'users' ? users : creators).length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">No data found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
