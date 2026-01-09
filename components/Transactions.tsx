
import React, { useState } from 'react';
import { SyncData, Transaction, Category } from '../types';

interface TransactionsProps {
  data: SyncData;
  onUpdate: (newData: Partial<SyncData>) => void;
}

const Transactions: React.FC<TransactionsProps> = ({ data, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    type: 'expense',
    amount: 0,
    description: '',
    category: data.categories[0].name,
    date: new Date().toISOString().split('T')[0]
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const tx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      ...newTx as any,
    };
    onUpdate({ transactions: [tx, ...data.transactions] });
    setIsAdding(false);
    setNewTx({
      type: 'expense',
      amount: 0,
      description: '',
      category: data.categories[0].name,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDelete = (id: string) => {
    onUpdate({ transactions: data.transactions.filter(t => t.id !== id) });
  };

  const filtered = data.transactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {['all', 'income', 'expense'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                filter === f ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="gradient-bg text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <i className="fa-solid fa-plus"></i>
          Add Transaction
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-3xl border-2 border-blue-100 shadow-xl animate-in zoom-in-95">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Type</label>
              <select
                value={newTx.type}
                onChange={e => setNewTx({...newTx, type: e.target.value as any})}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Category</label>
              <select
                value={newTx.category}
                onChange={e => setNewTx({...newTx, category: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {data.categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Amount</label>
              <input
                type="number"
                required
                value={newTx.amount || ''}
                onChange={e => setNewTx({...newTx, amount: parseFloat(e.target.value)})}
                placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Date</label>
              <input
                type="date"
                required
                value={newTx.date}
                onChange={e => setNewTx({...newTx, date: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="md:col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Description</label>
              <input
                type="text"
                required
                value={newTx.description}
                onChange={e => setNewTx({...newTx, description: e.target.value})}
                placeholder="What did you spend on?"
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition-all">Save</button>
              <button type="button" onClick={() => setIsAdding(false)} className="bg-slate-100 text-slate-500 p-3 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((tx) => {
                const category = data.categories.find(c => c.name === tx.category);
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          <i className={`fa-solid ${tx.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                        </div>
                        <span className="font-semibold text-slate-800">{tx.description}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category?.color || '#cbd5e1' }}></div>
                        <span className="text-sm text-slate-500 font-medium">{tx.category}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm text-slate-400 font-medium">
                        {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className={`px-8 py-5 text-right font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-slate-900'}`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDelete(tx.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
