
import React, { useState, useEffect } from 'react';
import { UserLog } from '../types';
import { authService } from '../services/authService';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await authService.getRegistry();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    activeToday: users.filter(u => u.status === 'active').length,
    totalBackups: users.filter(u => u.lastBackupAt !== null).length
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-10 px-1">
      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'মোট ইউজার', value: stats.total, icon: 'fa-users', color: 'bg-blue-500' },
          { label: 'সক্রিয় ইউজার', value: stats.activeToday, icon: 'fa-user-check', color: 'bg-green-500' },
          { label: 'ব্যাকআপ লজ', value: stats.totalBackups, icon: 'fa-cloud-arrow-up', color: 'bg-purple-500' }
        ].map((s, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className={`w-8 h-8 ${s.color} rounded-xl flex items-center justify-center text-white text-xs mb-3`}>
              <i className={`fa-solid ${s.icon}`}></i>
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">সেন্ট্রাল ইউজার ডাটাবেস</h3>
          <div className="flex gap-2">
            <button onClick={loadUsers} className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-500">
              <i className="fa-solid fa-rotate"></i>
            </button>
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
              <input 
                type="text" 
                placeholder="ইমেইল দিয়ে খুঁজুন..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full md:w-64 bg-slate-50 dark:bg-slate-900 border-none p-3 pl-10 rounded-xl text-xs font-bold outline-none focus:ring-2 ring-blue-100"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center"><i className="fa-solid fa-circle-notch fa-spin text-blue-500 text-3xl"></i></div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">ইউজার ইনফো</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">রেজিস্ট্রেশন</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">লাস্ট সিঙ্ক</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-black">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-[10px] text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400">
                        {new Date(user.registeredAt).toLocaleDateString('bn-BD')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400">
                        {user.lastBackupAt ? new Date(user.lastBackupAt).toLocaleString('bn-BD') : 'কখনো নয়'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${
                        user.status === 'active' ? 'bg-green-100 text-green-600 dark:bg-green-900/20' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {user.status === 'active' ? 'Verified' : user.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-slate-300">
                      <p className="text-[10px] font-black uppercase tracking-widest">কোনো ইউজার ডাটা পাওয়া যায়নি</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
