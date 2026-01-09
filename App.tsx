
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CloudSync from './components/CloudSync';
import Transactions from './components/Transactions';
import Budgets from './components/Budgets';
import Categories from './components/Categories';
import Login from './components/Login';
import { SyncData, SyncState, GoogleUser } from './types';
import { authService } from './services/authService';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_TRANSACTIONS, 
  INITIAL_PROFILE, 
  INITIAL_GOALS, 
  INITIAL_BUDGETS 
} from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(null);
  const [appData, setAppData] = useState<SyncData | null>(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [allAccounts, setAllAccounts] = useState<string[]>([]); // List of emails logged in locally

  const [syncState, setSyncState] = useState<SyncState>({
    isConnected: false,
    lastBackupDate: null,
    status: 'idle',
    progress: 0,
    error: null,
    errorType: null,
    googleUser: null
  });

  // Effect to load local session
  useEffect(() => {
    const savedUser = localStorage.getItem('FINSYNC_CURRENT_USER');
    const savedAccounts = localStorage.getItem('FINSYNC_LOCAL_ACCOUNTS');
    
    if (savedAccounts) {
      setAllAccounts(JSON.parse(savedAccounts));
    }

    if (savedUser) {
      const user: GoogleUser = JSON.parse(savedUser);
      setCurrentUser(user);
      loadUserData(user.email);
      setSyncState(prev => ({ 
        ...prev, 
        isConnected: true, 
        googleUser: user,
        lastBackupDate: localStorage.getItem(`lastBackupDate_${user.email}`)
      }));
    }
  }, []);

  const loadUserData = (email: string) => {
    const savedData = localStorage.getItem(`FINSYNC_DATA_${email}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // Ensure autoSync exists for legacy data
      if (parsed.settings && parsed.settings.autoSync === undefined) {
        parsed.settings.autoSync = true;
      }
      setAppData(parsed);
    } else {
      // Create new initial data for this account
      const newData: SyncData = {
        transactions: INITIAL_TRANSACTIONS,
        categories: INITIAL_CATEGORIES,
        budgets: INITIAL_BUDGETS,
        savingsGoals: INITIAL_GOALS,
        settings: { theme: 'light', notifications: true, syncInterval: '6h', autoSync: true },
        profile: { ...INITIAL_PROFILE, name: currentUser?.name || 'User', email: email },
        timestamp: Date.now()
      };
      setAppData(newData);
    }
  };

  // Sync data to storage whenever it changes
  useEffect(() => {
    if (currentUser && appData) {
      localStorage.setItem(`FINSYNC_DATA_${currentUser.email}`, JSON.stringify(appData));
    }
  }, [appData, currentUser]);

  const handleLoginSuccess = (user: GoogleUser) => {
    setCurrentUser(user);
    localStorage.setItem('FINSYNC_CURRENT_USER', JSON.stringify(user));
    
    const updatedAccounts = Array.from(new Set([...allAccounts, user.email]));
    setAllAccounts(updatedAccounts);
    localStorage.setItem('FINSYNC_LOCAL_ACCOUNTS', JSON.stringify(updatedAccounts));

    loadUserData(user.email);
    setSyncState(prev => ({ 
      ...prev, 
      isConnected: true, 
      googleUser: user,
      lastBackupDate: localStorage.getItem(`lastBackupDate_${user.email}`)
    }));
  };

  const handleLogout = async () => {
    await authService.logout();
    localStorage.removeItem('FINSYNC_CURRENT_USER');
    setCurrentUser(null);
    setAppData(null);
    setSyncState({
      isConnected: false,
      lastBackupDate: null,
      status: 'idle',
      progress: 0,
      error: null,
      errorType: null,
      googleUser: null
    });
  };

  const switchAccount = (email: string) => {
    setShowAccountMenu(false);
    const switchUser = async () => {
      const user = await authService.loginWithGoogle(email);
      handleLoginSuccess(user);
    };
    switchUser();
  };

  const updateAppData = (newData: Partial<SyncData>) => {
    if (!appData) return;
    setAppData(prev => ({
      ...prev!,
      ...newData,
      timestamp: Date.now()
    }));
  };

  const handleRestore = (restoredData: SyncData) => {
    setAppData(restoredData);
  };

  const handleSyncStateUpdate = (newState: Partial<SyncState>) => {
    setSyncState(prev => {
      const updated = { ...prev, ...newState };
      if (newState.lastBackupDate && currentUser) {
        localStorage.setItem(`lastBackupDate_${currentUser.email}`, newState.lastBackupDate);
      }
      return updated;
    });
  };

  if (!currentUser || !appData) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard data={appData} syncState={syncState} />;
      case 'transactions':
        return <Transactions data={appData} onUpdate={updateAppData} />;
      case 'budgets':
        return <Budgets data={appData} onUpdate={updateAppData} />;
      case 'categories':
        return <Categories data={appData} onUpdate={updateAppData} />;
      case 'settings':
        return (
          <CloudSync 
            currentData={appData} 
            syncState={syncState}
            onRestore={handleRestore}
            onStateUpdate={handleSyncStateUpdate}
            onSettingsUpdate={(settings) => updateAppData({ settings })}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-96 text-slate-400 space-y-4">
            <i className="fa-solid fa-screwdriver-wrench text-6xl opacity-20"></i>
            <p className="text-xl font-medium italic">Feature coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={currentUser} />
      
      <main className="flex-1 md:ml-64 p-4 md:p-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500"
              onClick={() => {}} // Mobile drawer trigger would go here in a full app
            >
              <i className="fa-solid fa-bars"></i>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 capitalize">
                {activeTab === 'settings' ? 'Cloud Control' : activeTab}
              </h1>
              <p className="text-slate-500 text-sm">Managing: <span className="font-bold text-blue-600">{currentUser.name}</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white transition-all">
              <i className="fa-solid fa-bell"></i>
            </button>
            
            <div className="h-10 w-px bg-slate-200 mx-2"></div>
            
            <div className="relative">
              <div 
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-3 px-3 py-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-95"
              >
                <img src={currentUser.picture} className="w-7 h-7 rounded-full border border-slate-100" alt="Avatar" />
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[100px]">{currentUser.email}</p>
                </div>
                <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 ml-1 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`}></i>
              </div>

              {showAccountMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowAccountMenu(false)}></div>
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3 mb-4 px-1">
                      <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white">
                        <i className="fa-solid fa-user-group"></i>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Switch Account</p>
                        <p className="text-slate-900 font-bold text-sm">Connected Gmails</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto pr-1">
                      {allAccounts.map(email => (
                        <button
                          key={email}
                          onClick={() => switchAccount(email)}
                          className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border ${
                            email === currentUser.email 
                              ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/5' 
                              : 'bg-slate-50/50 border-transparent hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${email === currentUser.email ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            {email[0].toUpperCase()}
                          </div>
                          <div className="text-left overflow-hidden">
                            <p className="text-xs font-bold text-slate-800 truncate">{email}</p>
                            {email === currentUser.email && <p className="text-[10px] text-blue-600 font-black uppercase tracking-tighter mt-0.5">Active Now</p>}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
                      <button 
                        onClick={() => { setShowAccountMenu(false); authService.loginWithGoogle().then(handleLoginSuccess); }}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl text-slate-600 bg-slate-50 hover:bg-slate-100 transition-all group"
                      >
                        <i className="fa-solid fa-plus-circle text-blue-500 group-hover:scale-110 transition-transform"></i>
                        <span className="text-xs font-bold">Add Another Account</span>
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all group"
                      >
                        <i className="fa-solid fa-power-off text-red-400 group-hover:rotate-12 transition-transform"></i>
                        <span className="text-xs font-bold">Logout Session</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="pb-20 max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 px-6 py-3 flex justify-between md:hidden z-50 shadow-2xl">
        {[
          { id: 'dashboard', icon: 'fa-chart-pie' },
          { id: 'transactions', icon: 'fa-list-ul' },
          { id: 'budgets', icon: 'fa-wallet' },
          { id: 'categories', icon: 'fa-tags' },
          { id: 'settings', icon: 'fa-cog' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              activeTab === item.id ? 'bg-slate-900 text-white shadow-lg scale-110' : 'text-slate-400'
            }`}
          >
            <i className={`fa-solid ${item.icon} text-lg`}></i>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
