
import React from 'react';
import { SyncData, SyncState } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  data: SyncData;
  syncState: SyncState;
}

const Dashboard: React.FC<DashboardProps> = ({ data, syncState }) => {
  const chartData = data.categories.map(cat => ({
    name: cat.name,
    amount: data.transactions
      .filter(t => t.category === cat.name && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
    color: cat.color
  }));

  const totalBalance = data.transactions.reduce((sum, t) => 
    t.type === 'income' ? sum + t.amount : sum - t.amount, 0);

  const totalExpense = data.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const getSyncBadge = () => {
    switch (syncState.status) {
      case 'syncing':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 animate-pulse">
            <i className="fa-solid fa-sync fa-spin"></i> Syncing...
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100">
            <i className="fa-solid fa-circle-exclamation"></i> Sync Error
          </div>
        );
      case 'synced':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100">
            <i className="fa-solid fa-check"></i> Synced
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
            <i className="fa-solid fa-cloud"></i> Offline
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-slate-800">Financial Overview</h2>
        <div className="flex items-center gap-3">
          {getSyncBadge()}
          <span className="text-[10px] text-slate-400 font-medium">
            {syncState.lastBackupDate ? `Updated: ${syncState.lastBackupDate.split(',')[1]}` : 'Unsynced'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Total Balance</p>
          <h2 className="text-3xl font-bold text-slate-900">${totalBalance.toLocaleString()}</h2>
          <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
            <i className="fa-solid fa-arrow-up mr-1"></i>
            +12.5% from last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Expenses</p>
          <h2 className="text-3xl font-bold text-slate-900">${totalExpense.toLocaleString()}</h2>
          <div className="mt-4 flex items-center text-red-600 text-sm font-medium">
            <i className="fa-solid fa-arrow-down mr-1"></i>
            -2.4% from last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Sync Auto-Interval</p>
          <div className="flex items-center gap-2 mt-2">
            <i className="fa-solid fa-repeat text-blue-500"></i>
            <span className="text-slate-700 font-semibold">Every {data.settings.syncInterval}</span>
          </div>
          <p className="text-xs text-slate-400 mt-4">Manual backup available in Cloud tab</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-[400px]">
          <h3 className="text-lg font-bold mb-6">Spending by Category</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold mb-6">Recent Activities</h3>
          <div className="space-y-4 flex-1">
            {data.transactions.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-all group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    <i className={`fa-solid ${t.type === 'income' ? 'fa-plus' : 'fa-minus'}`}></i>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t.description}</p>
                    <p className="text-xs text-slate-400">{t.category}</p>
                  </div>
                </div>
                <div className={`text-sm font-bold ${t.type === 'income' ? 'text-green-600' : 'text-slate-900'}`}>
                  {t.type === 'income' ? '+' : '-'}${t.amount}
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 text-center w-full text-blue-600 font-semibold text-sm hover:underline">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
