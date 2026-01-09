
import React from 'react';
import { GoogleUser } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: GoogleUser;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
    { id: 'transactions', icon: 'fa-list-ul', label: 'Transactions' },
    { id: 'budgets', icon: 'fa-wallet', label: 'Budgets' },
    { id: 'categories', icon: 'fa-tags', label: 'Categories' },
    { id: 'settings', icon: 'fa-cog', label: 'Cloud Sync' },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen text-slate-400 p-4 fixed left-0 top-0 flex flex-col hidden md:flex">
      <div className="flex items-center gap-3 px-2 mb-10 mt-2">
        <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white text-xl">
          <i className="fa-solid fa-vault"></i>
        </div>
        <span className="text-white font-bold text-xl tracking-tight">FinSync</span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-blue-600/20 text-blue-400 font-medium' 
                : 'hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5`}></i>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
        <div className="flex items-center gap-3 mb-2">
          <img src={user.picture} className="w-8 h-8 rounded-full border border-slate-600" alt="Profile" />
          <div className="text-xs overflow-hidden">
            <p className="text-slate-200 font-medium truncate">{user.name}</p>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[8px]">Cloud Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
