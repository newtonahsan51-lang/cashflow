
import React from 'react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  t: any;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab, t }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'fa-house', label: t.dashboard, color: '#4F46E5' },
    { id: 'transactions', icon: 'fa-receipt', label: t.transactions, color: '#10B981' },
    { id: 'notes', icon: 'fa-note-sticky', label: t.notes, color: '#F59E0B' },
    { id: 'reports', icon: 'fa-chart-simple', label: t.reports, color: '#8B5CF6' },
    { id: 'settings', icon: 'fa-cloud', label: t.cloudSync || 'সিঙ্ক', color: '#06B6D4' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 px-2 pt-3 pb-8 flex justify-around items-center z-50 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.03)] transition-colors duration-300">
      {menuItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 group ${
              isActive ? 'scale-110' : 'opacity-40 hover:opacity-70'
            }`}
          >
            <div 
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                isActive ? 'shadow-lg shadow-current/10' : ''
              }`}
              style={{ 
                color: isActive ? item.color : '#94A3B8',
                backgroundColor: isActive ? `${item.color}15` : 'transparent' 
              }}
            >
              <i className={`fa-solid ${item.icon} text-lg`}></i>
            </div>
            <span 
              className="text-[10px] font-black uppercase tracking-tighter transition-colors"
              style={{ color: isActive ? item.color : '#94A3B8' }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNav;
