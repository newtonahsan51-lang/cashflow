
import React, { useState } from 'react';
import { cloudService } from '../services/cloudService';
import { SyncState, SyncData, UserProfile } from '../types';
import { POPULAR_CURRENCIES } from '../constants';

interface CloudSyncProps {
  currentData: SyncData;
  syncState: SyncState;
  onRestore: (data: SyncData) => void;
  onStateUpdate: (state: Partial<SyncState>) => void;
  onSettingsUpdate: (settings: SyncData['settings']) => void;
  onProfileUpdate: (profile: Partial<UserProfile>) => void;
  t: any;
}

const CloudSync: React.FC<CloudSyncProps> = ({ 
  currentData, 
  syncState, 
  onRestore, 
  onStateUpdate, 
  onSettingsUpdate,
  onProfileUpdate,
  t 
}) => {
  const [conflictData, setConflictData] = useState<SyncData | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState({ 
    name: currentData.profile.name, 
    currency: currentData.profile.currency 
  });

  const handleBackup = async () => {
    onStateUpdate({ status: 'syncing', progress: 0, error: null });
    try {
      await cloudService.uploadBackup(currentData, (p) => {
        onStateUpdate({ progress: p });
      });
      const now = new Date().toLocaleString();
      onStateUpdate({ 
        status: 'synced', 
        lastBackupDate: now,
        progress: 100 
      });
      setTimeout(() => onStateUpdate({ status: 'idle', progress: 0 }), 3000);
    } catch (error: any) {
      onStateUpdate({ status: 'error', error: error.message, progress: 0 });
    }
  };

  const startRestore = async () => {
    onStateUpdate({ status: 'syncing', progress: 0, error: null });
    try {
      const data = await cloudService.downloadBackup(currentData.profile.email, (p) => {
        onStateUpdate({ progress: p });
      });
      
      if (data) {
        if (currentData.timestamp > data.timestamp) {
          setConflictData(data);
        } else {
          onRestore(data);
          onStateUpdate({ status: 'synced', progress: 100 });
          setTimeout(() => onStateUpdate({ status: 'idle', progress: 0 }), 2000);
        }
      } else {
        alert('আপনার অ্যাকাউন্টের জন্য কোনো সার্ভার ব্যাকআপ পাওয়া যায়নি।');
        onStateUpdate({ status: 'idle' });
      }
    } catch (error: any) {
      onStateUpdate({ status: 'error', error: error.message, progress: 0 });
    }
  };

  const resolveConflict = (proceed: boolean) => {
    if (proceed && conflictData) {
      onRestore(conflictData);
      onStateUpdate({ status: 'synced', progress: 100 });
      setTimeout(() => onStateUpdate({ status: 'idle', progress: 0 }), 2000);
    } else {
      onStateUpdate({ status: 'idle', progress: 0 });
    }
    setConflictData(null);
  };

  const toggleAutoSync = () => {
    onSettingsUpdate({
      ...currentData.settings,
      autoSync: !currentData.settings.autoSync
    });
  };

  const handleProfileSave = () => {
    onProfileUpdate(tempProfile);
    setIsEditingProfile(false);
  };

  const userInitial = syncState.user?.name.charAt(0).toUpperCase() || '?';

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative pb-10 px-1">
      {conflictData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-black mb-4">ডাটা অমিল পাওয়া গেছে</h2>
            <p className="text-slate-500 mb-6">সার্ভারের চেয়ে আপনার বর্তমান ডাটা নতুন। আপনি কি সার্ভার থেকে পুরনো ডাটা রিস্টোর করতে চান?</p>
            <div className="flex gap-4">
              <button onClick={() => resolveConflict(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 rounded-2xl font-bold">বর্তমান ডাটা রাখুন</button>
              <button onClick={() => resolveConflict(true)} className="flex-1 py-4 gradient-bg text-white rounded-2xl font-bold">সার্ভার থেকে নিন</button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 border border-slate-200 dark:border-slate-700 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 gradient-bg opacity-[0.05] -mr-24 -mt-24 rounded-full"></div>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white text-sm">
              <i className="fa-solid fa-user-gear"></i>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">প্রোফাইল সেটিংস</h3>
          </div>
          <button 
            onClick={() => setIsEditingProfile(!isEditingProfile)} 
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500"
          >
            <i className={`fa-solid ${isEditingProfile ? 'fa-xmark' : 'fa-pen-to-square'}`}></i>
          </button>
        </div>

        {isEditingProfile ? (
          <div className="space-y-4 animate-in slide-in-from-top-2">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">আপনার নাম</label>
              <input 
                type="text" 
                value={tempProfile.name} 
                onChange={e => setTempProfile({...tempProfile, name: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-blue-100 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">ডিফল্ট কারেন্সি</label>
              <select 
                value={tempProfile.currency} 
                onChange={e => setTempProfile({...tempProfile, currency: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-blue-100 dark:text-white appearance-none"
              >
                {POPULAR_CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.symbol} - {c.name}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleProfileSave}
              className="w-full py-4 gradient-bg text-white rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all mt-2"
            >
              পরিবর্তন সেভ করুন
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-5 p-2">
             <div className="w-16 h-16 rounded-[1.5rem] gradient-bg flex items-center justify-center text-white text-3xl font-black shadow-lg">
                {userInitial}
             </div>
             <div>
               <p className="font-black text-slate-900 dark:text-white text-xl">{currentData.profile.name}</p>
               <p className="text-xs text-slate-400 font-bold">{currentData.profile.email}</p>
               <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-[9px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/50">
                    {currentData.profile.currency}
                  </span>
                  <span className="text-[10px] text-slate-300">• Private Account</span>
               </div>
             </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 border border-slate-200 dark:border-slate-700 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center justify-center text-blue-600">
             <i className="fa-solid fa-cloud-bolt text-xl"></i>
           </div>
           <div>
             <h3 className="font-black text-slate-900 dark:text-white text-sm">অটো ব্যাকআপ</h3>
             <p className="text-[10px] text-slate-400 font-bold">ডাটা স্বয়ংক্রিয়ভাবে ড্রাইভে সেভ হবে</p>
           </div>
        </div>
        <button 
          onClick={toggleAutoSync}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all ${currentData.settings.autoSync ? 'bg-blue-600 shadow-md shadow-blue-500/20' : 'bg-slate-200 dark:bg-slate-700'}`}
        >
          <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${currentData.settings.autoSync ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col group">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center justify-center text-blue-600">
              <i className="fa-solid fa-cloud-arrow-up text-xl"></i>
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">ব্যাকআপ নিন</h3>
          </div>

          <div className="mt-auto space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">সর্বশেষ সিঙ্ক</p>
              <p className="text-xs font-bold mt-1 text-slate-700 dark:text-slate-300">{syncState.lastBackupDate || 'কখনো নয়'}</p>
            </div>

            {syncState.status === 'syncing' && (
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${syncState.progress}%` }}></div>
              </div>
            )}

            <button
              onClick={handleBackup}
              disabled={syncState.status === 'syncing'}
              className="w-full py-4 rounded-2xl gradient-bg text-white font-black text-base shadow-lg active:scale-95 disabled:opacity-50 transition-all"
            >
              {syncState.status === 'syncing' ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "সিঙ্ক শুরু করুন"}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col group">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/10 rounded-2xl flex items-center justify-center text-purple-600">
              <i className="fa-solid fa-cloud-arrow-down text-xl"></i>
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">রিস্টোর ডাটা</h3>
          </div>

          <div className="mt-auto space-y-4">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl leading-relaxed border border-slate-100 dark:border-slate-800">
              সার্ভার থেকে ডাটা আনলে আপনার মোবাইলের বর্তমান ডাটা আপডেট হয়ে যাবে।
            </p>
            <button
              onClick={startRestore}
              disabled={syncState.status === 'syncing'}
              className="w-full py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 dark:text-white font-black text-base active:scale-95 disabled:opacity-50 transition-all hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              ডাটা রিস্টোর করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudSync;
