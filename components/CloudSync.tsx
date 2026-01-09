
import React, { useState } from 'react';
import { driveService, SyncError } from '../services/driveService';
import { SyncState, SyncData, SyncInterval } from '../types';

interface CloudSyncProps {
  currentData: SyncData;
  syncState: SyncState;
  onRestore: (data: SyncData) => void;
  onStateUpdate: (state: Partial<SyncState>) => void;
  onSettingsUpdate: (settings: SyncData['settings']) => void;
}

const CloudSync: React.FC<CloudSyncProps> = ({ 
  currentData, 
  syncState, 
  onRestore, 
  onStateUpdate, 
  onSettingsUpdate 
}) => {
  const [conflictData, setConflictData] = useState<SyncData | null>(null);

  const handleError = (error: unknown) => {
    if (error instanceof SyncError) {
      onStateUpdate({ status: 'error', error: error.message, errorType: error.type, progress: 0 });
    } else {
      onStateUpdate({ status: 'error', error: 'Database connection error.', errorType: 'unknown', progress: 0 });
    }
  };

  const handleBackup = async () => {
    onStateUpdate({ status: 'syncing', progress: 0, error: null });
    try {
      await driveService.uploadBackup(currentData, (p) => {
        onStateUpdate({ progress: p });
      });
      const now = new Date().toLocaleString();
      onStateUpdate({ 
        status: 'synced', 
        lastBackupDate: now,
        progress: 100 
      });
      setTimeout(() => onStateUpdate({ status: 'idle', progress: 0 }), 3000);
    } catch (error) {
      handleError(error);
    }
  };

  const startRestore = async () => {
    onStateUpdate({ status: 'syncing', progress: 0, error: null });
    try {
      const data = await driveService.downloadBackup(currentData.profile.email, (p) => {
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
        alert('No cloud database found for this account.');
        onStateUpdate({ status: 'idle' });
      }
    } catch (error) {
      handleError(error);
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

  const intervals: SyncInterval[] = ['1h', '6h', '12h', '24h'];

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative pb-10">
      {/* Conflict Resolution Modal */}
      {conflictData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 shadow-inner">
                <i className="fa-solid fa-database text-3xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Database Synchronization</h2>
                <p className="text-slate-500 font-medium">Found a mismatch between local and cloud data.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <div className="p-6 rounded-3xl border-2 border-slate-100 bg-slate-50">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-2">Local Instance</p>
                <p className="text-lg font-bold text-slate-800 mb-1">Latest Local</p>
                <p className="text-xs text-slate-500">{new Date(currentData.timestamp).toLocaleString()}</p>
              </div>
              <div className="p-6 rounded-3xl border-2 border-blue-100 bg-blue-50/30">
                <p className="text-[10px] uppercase tracking-widest text-blue-400 font-black mb-2">Cloud Database</p>
                <p className="text-lg font-bold text-slate-800 mb-1">Server Backup</p>
                <p className="text-xs text-slate-500">{new Date(conflictData.timestamp).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => resolveConflict(false)} className="flex-1 py-5 px-6 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all text-lg">
                Keep Local
              </button>
              <button onClick={() => resolveConflict(true)} className="flex-1 py-5 px-6 rounded-2xl gradient-bg text-white font-bold hover:shadow-2xl transition-all text-lg">
                Restore From Cloud
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Status Panel */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 gradient-bg opacity-[0.03] -mr-32 -mt-32 rounded-full"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white text-sm">
                <i className="fa-solid fa-cloud"></i>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Database Sync</h1>
            </div>
            <p className="text-slate-500 font-medium">Secured by AES-256 Encryption & Google Drive</p>
          </div>
          
          <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all ${
            currentData.settings.autoSync 
            ? 'bg-green-50 text-green-700 border-green-100 ring-4 ring-green-500/5' 
            : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <i className={`fa-solid ${currentData.settings.autoSync ? 'fa-shield-check' : 'fa-shield-slash'} text-lg`}></i>
            <span className="font-bold uppercase tracking-widest text-xs">{currentData.settings.autoSync ? 'Real-time Sync Active' : 'Manual Mode Only'}</span>
          </div>
        </div>

        {syncState.error && (
          <div className="mb-8 p-5 bg-red-50 border-2 border-red-100 rounded-3xl flex items-start gap-4 animate-in slide-in-from-top-4">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 flex-shrink-0">
              <i className="fa-solid fa-triangle-exclamation text-xl"></i>
            </div>
            <div className="flex-1">
              <p className="text-red-900 font-black text-sm uppercase tracking-tight">Cloud Sync Interrupted</p>
              <p className="text-red-600 text-sm mt-1 font-medium">{syncState.error}</p>
            </div>
            <button onClick={handleBackup} className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-red-700 transition-all">Retry Sync</button>
          </div>
        )}

        {syncState.googleUser && (
          <div className="bg-slate-50/50 p-6 md:p-8 rounded-[2rem] border border-slate-100">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <img src={syncState.googleUser.picture} className="w-16 h-16 rounded-full border-4 border-white shadow-lg" alt="User" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center text-[10px] text-white">
                    <i className="fa-solid fa-check"></i>
                  </div>
                </div>
                <div>
                  <p className="font-black text-slate-900 text-lg leading-tight">{syncState.googleUser.name}</p>
                  <p className="text-sm text-slate-500 font-medium">{syncState.googleUser.email}</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                <div className="flex items-center justify-between gap-6 px-6 py-4 bg-white rounded-2xl border border-slate-200 flex-1">
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 uppercase font-black mb-0.5 tracking-widest">Background Sync</p>
                    <p className="text-xs font-bold text-slate-700">{currentData.settings.autoSync ? 'Enabled' : 'Disabled'}</p>
                  </div>
                  <button 
                    onClick={toggleAutoSync}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none ${
                      currentData.settings.autoSync ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                        currentData.settings.autoSync ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className={`flex flex-col gap-1 transition-all ${currentData.settings.autoSync ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-1">Sync Cycle</p>
                  <div className="flex gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
                    {intervals.map(interval => (
                      <button
                        key={interval}
                        onClick={() => onSettingsUpdate({ ...currentData.settings, syncInterval: interval })}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                          currentData.settings.syncInterval === interval 
                            ? 'bg-slate-900 text-white shadow-lg' 
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {interval}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Backup Module */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-lg flex flex-col group hover:border-blue-200 transition-all">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-upload text-2xl"></i>
            </div>
            <div>
              <h3 className="font-black text-xl text-slate-900 tracking-tight">Commit to Cloud</h3>
              <p className="text-sm text-slate-500 font-medium">Save all local changes to database.</p>
            </div>
          </div>

          <div className="mt-auto space-y-6">
            <div className="flex justify-between items-end p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Last Sync Event</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{syncState.lastBackupDate || 'Never Backed Up'}</p>
              </div>
              <div className="text-right">
                <i className="fa-solid fa-clock-rotate-left text-slate-300"></i>
              </div>
            </div>

            {syncState.status === 'syncing' && syncState.progress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-blue-600 uppercase">
                  <span>Transferring Data...</span>
                  <span>{syncState.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full transition-all duration-300 ease-out" style={{ width: `${syncState.progress}%` }}></div>
                </div>
              </div>
            )}

            <button
              onClick={handleBackup}
              disabled={syncState.status === 'syncing'}
              className="w-full py-5 rounded-2xl gradient-bg text-white font-black text-lg hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0"
            >
              {syncState.status === 'syncing' ? (
                <span className="flex items-center justify-center gap-3">
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  Syncing Database
                </span>
              ) : 'Sync Now'}
            </button>
          </div>
        </div>

        {/* Restore Module */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-lg flex flex-col group hover:border-purple-200 transition-all">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-download text-2xl"></i>
            </div>
            <div>
              <h3 className="font-black text-xl text-slate-900 tracking-tight">Cloud Retrieval</h3>
              <p className="text-sm text-slate-500 font-medium">Pull database from cloud storage.</p>
            </div>
          </div>

          <div className="mt-auto space-y-6">
            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
              <i className="fa-solid fa-circle-info text-amber-500 mt-1"></i>
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                Restoring will replace all current data on this device for <b>{currentData.profile.email}</b>.
              </p>
            </div>

            <button
              onClick={startRestore}
              disabled={syncState.status === 'syncing'}
              className="w-full py-5 rounded-2xl border-2 border-slate-200 text-slate-800 font-black text-lg hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
            >
              Fetch Database
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudSync;
