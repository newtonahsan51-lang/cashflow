
import React from 'react';
import { User, AppLanguage } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  t: any;
  lang: AppLanguage;
  onLangChange: (lang: AppLanguage) => void;
  darkMode: boolean;
  onDarkModeToggle: (val: boolean) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  user, 
  t, 
  lang, 
  onLangChange,
  darkMode,
  onDarkModeToggle,
  onLogout
}) => {
  const menuItems = [
    { id: 'dashboard', icon: 'fa-chart-pie', label: t.dashboard },
    { id: 'transactions', icon: 'fa-list-ul', label: t.transactions },
    { id: 'reports', icon: 'fa-chart-simple', label: t.reports },
    { id: 'notes', icon: 'fa-note-sticky', label: t.notes },
    { id: 'budgets', icon: 'fa-wallet', label: t.budgets },
    { id: 'categories', icon: 'fa-tags', label: t.categories },
    { id: 'settings', icon: 'fa-cog', label: t.cloudSync },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen text-slate-400 p-6 fixed left-0 top-0 flex flex-col hidden md:flex z-50 border-r border-slate-800">
      <div className="flex items-center gap-3 mb-10 mt-2">
        <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white text-xl">
          <i className="fa-solid fa-vault"></i>
        </div>
        <span className="text-white font-black text-2xl tracking-tight">FinSync</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-bold' 
                : 'hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5 text-lg`}></i>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 rounded-2xl border border-slate-700/30">
          <div className="flex items-center gap-2">
            <i className={`fa-solid ${darkMode ? 'fa-moon text-blue-400' : 'fa-sun text-yellow-400'} text-sm`}></i>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ডার্ক মোড</span>
          </div>
          <button 
            onClick={() => onDarkModeToggle(!darkMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${
              darkMode ? 'bg-blue-600' : 'bg-slate-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="p-1 bg-slate-800/50 rounded-xl flex">
          <button 
            onClick={() => onLangChange('bn')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'bn' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
          >BN</button>
          <button 
            onClick={() => onLangChange('en')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
          >EN</button>
        </div>

        <div className="group relative">
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-[1.5rem] border border-slate-700/50 hover:border-slate-600 transition-colors">
            {user.picture ? (
              <img src={user.picture} className="w-10 h-10 rounded-full border-2 border-slate-700 object-cover" alt="Profile" />
            ) : (
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-black text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-xs overflow-hidden flex-1">
              <p className="text-slate-100 font-bold truncate">{user.name}</p>
              <p className="text-blue-500 font-black uppercase tracking-tighter text-[8px]">PRIVATE ACCOUNT</p>
            </div>
            <button 
              onClick={onLogout}
              className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors bg-slate-700/30 rounded-lg"
              title="Logout"
            >
              <i className="fa-solid fa-right-from-bracket text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
