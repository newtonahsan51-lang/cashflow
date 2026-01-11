
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Dashboard from './components/Dashboard';
import CloudSync from './components/CloudSync';
import Transactions from './components/Transactions';
import Budgets from './components/Budgets';
import Categories from './components/Categories';
import Reports from './components/Reports';
import Notes from './components/Notes';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import CameraModal from './components/CameraModal';
import { SyncData, SyncState, User, UserLog } from './types';
import { authService } from './services/authService';
import { driveService } from './services/driveService';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_TRANSACTIONS, 
  INITIAL_PROFILE, 
  INITIAL_GOALS, 
  INITIAL_BUDGETS,
  INITIAL_NOTES,
  TRANSLATIONS
} from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appData, setAppData] = useState<SyncData | null>(null);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncState>({
    isConnected: false,
    lastBackupDate: null,
    status: 'idle',
    progress: 0,
    error: null,
    errorType: null,
    user: null
  });

  useEffect(() => {
    driveService.connect().then(connected => {
      setSyncStatus(prev => ({ ...prev, isConnected: connected }));
    });

    const savedUser = localStorage.getItem('FINSYNC_CURRENT_USER');
    if (savedUser) {
      const user: User = JSON.parse(savedUser);
      setCurrentUser(user);
      setSyncStatus(prev => ({ ...prev, user }));
      loadUserData(user.email);
    }
  }, []);

  useEffect(() => {
    if (appData?.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appData?.settings.darkMode]);

  const loadUserData = (email: string) => {
    const savedData = localStorage.getItem(`FINSYNC_DATA_${email}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (!parsed.notes) parsed.notes = INITIAL_NOTES;
      setAppData(parsed);
    } else {
      const newData: SyncData = {
        transactions: INITIAL_TRANSACTIONS,
        notes: INITIAL_NOTES,
        categories: INITIAL_CATEGORIES,
        budgets: INITIAL_BUDGETS,
        savingsGoals: INITIAL_GOALS,
        settings: { theme: 'light', notifications: true, syncInterval: '6h', autoSync: true, language: 'bn', darkMode: false },
        profile: { ...INITIAL_PROFILE, email: email },
        timestamp: Date.now()
      };
      setAppData(newData);
    }
  };

  const updateGlobalSyncLog = (email: string) => {
    const registry: UserLog[] = JSON.parse(localStorage.getItem('FINSYNC_USER_REGISTRY') || '[]');
    const updated = registry.map(u => 
      u.email === email ? { ...u, lastBackupAt: new Date().toISOString() } : u
    );
    localStorage.setItem('FINSYNC_USER_REGISTRY', JSON.stringify(updated));
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setSyncStatus(prev => ({ ...prev, user }));
    localStorage.setItem('FINSYNC_CURRENT_USER', JSON.stringify(user));
    loadUserData(user.email);
  };

  const handleLogout = async () => {
    if (window.confirm("আপনি কি নিশ্চিতভাবে লগআউট করতে চান?")) {
      await authService.logout();
      setCurrentUser(null);
      setAppData(null);
      setActiveTab('dashboard');
    }
  };

  const updateAppData = (newData: Partial<SyncData>) => {
    if (!appData) return;
    const updated = { ...appData!, ...newData, timestamp: Date.now() };
    setAppData(updated);
    if (currentUser) {
      localStorage.setItem(`FINSYNC_DATA_${currentUser.email}`, JSON.stringify(updated));
    }
  };

  const handleProfileUpdate = (profile: Partial<SyncData['profile']>) => {
    if (!appData || !currentUser) return;
    const updatedProfile = { ...appData.profile, ...profile };
    updateAppData({ profile: updatedProfile });
    
    if (profile.name) {
      const updatedUser = { ...currentUser, name: profile.name };
      setCurrentUser(updatedUser);
      setSyncStatus(prev => ({ ...prev, user: updatedUser }));
      localStorage.setItem('FINSYNC_CURRENT_USER', JSON.stringify(updatedUser));
    }
  };

  const handleCaptureProfile = (img: string) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, picture: img };
      setCurrentUser(updatedUser);
      setSyncStatus(prev => ({ ...prev, user: updatedUser }));
      localStorage.setItem('FINSYNC_CURRENT_USER', JSON.stringify(updatedUser));
      handleProfileUpdate({ avatar: img });
    }
  };

  if (!currentUser || !appData) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const lang = appData.settings.language || 'bn';
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard data={appData} syncState={syncStatus} t={t} />;
      case 'transactions': return <Transactions data={appData} onUpdate={updateAppData} t={t} isModalOpen={isAddingTransaction} setIsModalOpen={setIsAddingTransaction} />;
      case 'budgets': return <Budgets data={appData} onUpdate={updateAppData} t={t} />;
      case 'categories': return <Categories data={appData} onUpdate={updateAppData} t={t} />;
      case 'reports': return <Reports data={appData} t={t} />;
      case 'notes': return <Notes data={appData} onUpdate={updateAppData} t={t} />;
      case 'admin': return <AdminPanel />;
      case 'settings': return (
        <CloudSync 
          currentData={appData} 
          syncState={syncStatus}
          onRestore={setAppData as any}
          onStateUpdate={(st) => {
            setSyncStatus(prev => ({ ...prev, ...st }));
            if (st.status === 'synced' && currentUser) updateGlobalSyncLog(currentUser.email);
          }}
          onSettingsUpdate={(settings) => updateAppData({ settings: { ...appData.settings, ...settings } })}
          onProfileUpdate={handleProfileUpdate}
          t={t}
        />
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row pb-32 md:pb-0 overscroll-none transition-colors duration-300">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={currentUser} 
        t={t} 
        lang={lang} 
        onLangChange={(l) => updateAppData({ settings: { ...appData.settings, language: l }})}
        darkMode={appData.settings.darkMode}
        onDarkModeToggle={(v) => updateAppData({ settings: { ...appData.settings, darkMode: v }})}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 md:ml-64 p-4 md:p-8 safe-area-top">
        <header className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-3">
             <button onClick={handleLogout} className="md:hidden w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
               <i className="fa-solid fa-right-from-bracket text-xs"></i>
             </button>
             <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {activeTab === 'admin' ? 'অ্যাডমিন প্যানেল' : (t[activeTab as keyof typeof t] || activeTab)}
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {currentUser.role === 'admin' ? 'Administrator' : currentUser.name}
              </p>
            </div>
          </div>
          
          {currentUser.picture ? (
            <img 
              onClick={() => setIsCameraOpen(true)} 
              src={currentUser.picture} 
              className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-md active:scale-90 cursor-pointer object-cover" 
              alt="Avatar"
            />
          ) : (
            <div 
              onClick={() => setIsCameraOpen(true)} 
              className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-black cursor-pointer shadow-md active:scale-90"
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
          )}
        </header>

        <div className="max-w-4xl mx-auto">{renderContent()}</div>
      </main>

      <button 
        onClick={() => { setActiveTab('transactions'); setIsAddingTransaction(true); }} 
        className="md:hidden fixed bottom-28 right-6 w-14 h-14 gradient-bg rounded-2xl text-white shadow-2xl z-40 flex items-center justify-center active:scale-75"
      >
        <i className="fa-solid fa-plus text-xl"></i>
      </button>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={currentUser.role} t={t} />

      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCaptureProfile} />
    </div>
  );
};

export default App;
