
import React, { useState } from 'react';
import { SyncData, Transaction, Category } from '../types';
import { POPULAR_CURRENCIES } from '../constants';

interface TransactionsProps {
  data: SyncData;
  onUpdate: (newData: Partial<SyncData>) => void;
  t: any;
  isModalOpen?: boolean;
  setIsModalOpen?: (open: boolean) => void;
}

type DateFilter = 'all' | 'today' | 'this-month';

const Transactions: React.FC<TransactionsProps> = ({ data, onUpdate, t, isModalOpen, setIsModalOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<{status: 'idle' | 'listening' | 'success' | 'error', message?: string}>({status: 'idle'});

  const currencySymbol = POPULAR_CURRENCIES.find(c => c.code === data.profile.currency)?.symbol || '৳';

  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    type: 'expense',
    amount: 0,
    description: '',
    category: data.categories[0]?.name || 'অন্যান্য',
    date: new Date().toISOString().split('T')[0]
  });

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("আপনার ব্রাউজার ভয়েস ইনপুট সাপোর্ট করে না।");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'bn-BD';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setVoiceStatus({status: 'listening', message: 'শুনছি... বলুন'});
    };
    
    recognition.onend = () => {
      if (voiceStatus.status === 'listening') {
        setVoiceStatus({status: 'idle'});
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error:", event.error);
      setVoiceStatus({status: 'error', message: 'বুঝতে পারিনি, আবার চেষ্টা করুন'});
      setTimeout(() => setVoiceStatus({status: 'idle'}), 2000);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNewTx(prev => ({ ...prev, description: (prev.description || '') + ' ' + transcript }));
      setVoiceStatus({status: 'success', message: 'শোনা হয়েছে!'});
      setTimeout(() => setVoiceStatus({status: 'idle'}), 2000);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Recognition start failed:", e);
      setVoiceStatus({status: 'error', message: 'ভয়েস ইনপুট চালু করা যায়নি'});
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.description) return;

    if (editingTxId) {
      const updatedTransactions = data.transactions.map(tx => 
        tx.id === editingTxId ? { ...tx, ...newTx as Transaction } : tx
      );
      onUpdate({ transactions: updatedTransactions });
    } else {
      const tx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        ...newTx as any,
      };
      onUpdate({ transactions: [tx, ...data.transactions] });
    }
    
    closeModal();
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTxId(tx.id);
    setNewTx({
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      category: tx.category,
      date: tx.date
    });
    setIsModalOpen?.(true);
  };

  const closeModal = () => {
    setIsModalOpen?.(false);
    setEditingTxId(null);
    setNewTx({
      type: 'expense',
      amount: 0,
      description: '',
      category: data.categories[0]?.name || 'অন্যান্য',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t.deleteConfirm)) {
      onUpdate({ transactions: data.transactions.filter(tx => tx.id !== id) });
    }
  };

  const getCategoryColor = (catName: string) => {
    return data.categories.find(c => c.name === catName)?.color || '#94a3b8';
  };

  const filtered = data.transactions
    .filter(tx => (typeFilter === 'all' || tx.type === typeFilter))
    .filter(tx => {
      const txDate = new Date(tx.date);
      const now = new Date();
      if (dateFilter === 'today') {
        return txDate.toDateString() === now.toDateString();
      }
      if (dateFilter === 'this-month') {
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      }
      return true;
    })
    .filter(tx => 
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      tx.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-4 animate-in fade-in pb-24 relative px-1">
      <div className="sticky top-0 z-10 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md pt-2 pb-2">
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
          <input 
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 pl-11 rounded-2xl font-bold text-sm shadow-sm outline-none focus:ring-2 ring-blue-100 transition-all dark:text-white"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto custom-scrollbar">
          {['all', 'income', 'expense'].map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f as any)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                typeFilter === f ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700'
              }`}
            >
              {f === 'all' ? 'সব ধরণের' : t[f as keyof typeof t]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((tx) => {
            const color = getCategoryColor(tx.category);
            return (
              <div 
                key={tx.id} 
                className="p-4 rounded-[2rem] border border-white dark:border-slate-800 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform group relative overflow-hidden bg-white dark:bg-slate-800/40"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: color }}></div>
                
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: color }}>
                    <i className={`fa-solid ${tx.type === 'income' ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight mb-1">{tx.description}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                      {tx.category} • {new Date(tx.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <p className={`text-sm font-black ${tx.type === 'income' ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
                    {tx.type === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString()}
                  </p>
                  <button onClick={() => handleEdit(tx)} className="p-2 text-slate-300 dark:text-slate-600 hover:text-blue-500 transition-colors">
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center text-slate-300">
            <i className="fa-solid fa-receipt text-5xl mb-4 opacity-20 block"></i>
            <p className="text-xs font-bold uppercase tracking-widest">কোনো লেনদেন পাওয়া যায়নি</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-slate-900/40 backdrop-blur-sm p-3">
          {voiceStatus.status !== 'idle' && (
            <div className="absolute top-20 left-0 right-0 z-[110] flex justify-center px-4">
              <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
                voiceStatus.status === 'listening' ? 'bg-blue-600 text-white border-blue-400' : 
                voiceStatus.status === 'success' ? 'bg-green-600 text-white border-green-400' : 
                'bg-red-600 text-white border-red-400'
              } animate-in slide-in-from-top-4`}>
                {voiceStatus.status === 'listening' && <i className="fa-solid fa-microphone fa-beat"></i>}
                {voiceStatus.status === 'success' && <i className="fa-solid fa-check-circle"></i>}
                {voiceStatus.status === 'error' && <i className="fa-solid fa-circle-exclamation"></i>}
                <span className="text-xs font-black uppercase tracking-widest">{voiceStatus.message}</span>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom-full w-full max-w-lg mx-auto safe-area-bottom">
            <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mx-auto mb-8" onClick={closeModal}></div>
            
            <form onSubmit={handleSave} className="space-y-5">
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
                <button 
                  type="button" 
                  onClick={() => setNewTx({...newTx, type: 'expense'})} 
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all ${newTx.type === 'expense' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400 dark:text-slate-600'}`}
                >ব্যয়</button>
                <button 
                  type="button" 
                  onClick={() => setNewTx({...newTx, type: 'income'})} 
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all ${newTx.type === 'income' ? 'bg-green-500 text-white shadow-lg' : 'text-slate-400 dark:text-slate-600'}`}
                >আয়</button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">পরিমাণ</label>
                <input 
                  type="number" required value={newTx.amount || ''} 
                  onChange={e => setNewTx({...newTx, amount: parseFloat(e.target.value)})} 
                  className="w-full bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl font-black text-3xl text-slate-900 dark:text-white outline-none ring-blue-100 focus:ring-4 transition-all" 
                  placeholder="0.00" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">বিবরণ</label>
                <div className="relative">
                  <input 
                    type="text" required value={newTx.description} 
                    onChange={e => setNewTx({...newTx, description: e.target.value})} 
                    className="w-full bg-slate-50 dark:bg-slate-900 p-4 pr-12 rounded-xl font-bold text-sm outline-none ring-blue-100 focus:ring-2 dark:text-white" 
                    placeholder="কী বাবদ?" 
                  />
                  <button 
                    type="button" onClick={handleVoiceInput}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${voiceStatus.status === 'listening' ? 'bg-blue-600 text-white animate-pulse shadow-lg' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    <i className="fa-solid fa-microphone"></i>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">শ্রেণী</label>
                    <select 
                      value={newTx.category} 
                      onChange={e => setNewTx({...newTx, category: e.target.value})} 
                      className="w-full bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl font-bold text-xs outline-none dark:text-white border-none appearance-none"
                    >
                      {data.categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">তারিখ</label>
                    <input 
                      type="date" required value={newTx.date} 
                      onChange={e => setNewTx({...newTx, date: e.target.value})} 
                      className="w-full bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl font-bold text-xs outline-none dark:text-white" 
                    />
                  </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-black rounded-2xl uppercase text-xs">বাতিল</button>
                <button type="submit" className="flex-[2] py-4 gradient-bg text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase text-xs">সেভ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
