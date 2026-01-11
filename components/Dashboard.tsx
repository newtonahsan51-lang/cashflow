
import React from 'react';
import { SyncData, SyncState } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { POPULAR_CURRENCIES } from '../constants';

interface DashboardProps {
  data: SyncData;
  syncState: SyncState;
  t: any;
}

const Dashboard: React.FC<DashboardProps> = ({ data, syncState, t }) => {
  const currencySymbol = POPULAR_CURRENCIES.find(c => c.code === data.profile.currency)?.symbol || '৳';

  const chartData = data.categories.map(cat => ({
    name: cat.name,
    amount: data.transactions
      .filter(t => t.category === cat.name && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
    color: cat.color
  })).filter(d => d.amount > 0);

  const totalBalance = data.transactions.reduce((sum, t) => 
    t.type === 'income' ? sum + t.amount : sum - t.amount, 0);

  const totalExpense = data.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-4">
      {/* Wallet Summary Card */}
      <div className="gradient-bg p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">{t.totalBalance}</p>
        <h2 className="text-3xl font-black">{currencySymbol}{totalBalance.toLocaleString()}</h2>
        
        <div className="mt-8 flex justify-between items-center gap-4 border-t border-white/10 pt-4">
          <div className="flex-1">
             <p className="text-white/60 text-[10px] uppercase font-black mb-1">মোট ব্যয়</p>
             <p className="text-sm font-bold">{currencySymbol}{totalExpense.toLocaleString()}</p>
          </div>
          <div className="flex-1 text-right">
             <p className="text-white/60 text-[10px] uppercase font-black mb-1">সিঙ্ক অবস্থা</p>
             <div className="flex items-center justify-end gap-1.5">
               <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-bold">সুরক্ষিত</span>
             </div>
          </div>
        </div>
      </div>

      {/* Chart Card */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm transition-colors duration-300">
        <h3 className="text-sm font-black text-slate-800 dark:text-white mb-6 uppercase tracking-tight">ব্যয় বিশ্লেষণ</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" hide />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px'}}
              />
              <Bar dataKey="amount" radius={[8, 8, 8, 8]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          {chartData.map(d => (
            <div key={d.name} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{d.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{t.recentActivities}</h3>
          <button className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase">সব দেখুন</button>
        </div>
        <div className="space-y-4">
          {data.transactions.slice(0, 4).map(t_item => (
            <div key={t_item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm ${t_item.type === 'income' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                  <i className={`fa-solid ${t_item.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{t_item.description}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t_item.category}</p>
                </div>
              </div>
              <div className={`text-xs font-black ${t_item.type === 'income' ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
                {t_item.type === 'income' ? '+' : '-'}{currencySymbol}{t_item.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
