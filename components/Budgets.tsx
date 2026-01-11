
import React, { useState } from 'react';
import { SyncData, Budget } from '../types';

interface BudgetsProps {
  data: SyncData;
  onUpdate: (newData: Partial<SyncData>) => void;
  t: any;
}

const Budgets: React.FC<BudgetsProps> = ({ data, onUpdate, t }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState<number>(0);

  const calculateSpent = (categoryId: string) => {
    const category = data.categories.find(c => c.id === categoryId);
    if (!category) return 0;
    return data.transactions
      .filter(tx => tx.category === category.name && tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  const handleUpdate = (categoryId: string) => {
    const newBudgets = data.budgets.some(b => b.categoryId === categoryId)
      ? data.budgets.map(b => b.categoryId === categoryId ? { ...b, limit: editVal } : b)
      : [...data.budgets, { categoryId, limit: editVal, spent: calculateSpent(categoryId) }];
    onUpdate({ budgets: newBudgets });
    setEditingId(null);
  };

  return (
    <div className="space-y-3 animate-in fade-in pb-10">
      {data.categories.filter(c => c.name !== 'বেতন').map((cat) => {
        const budget = data.budgets.find(b => b.categoryId === cat.id);
        const spent = calculateSpent(cat.id);
        const limit = budget?.limit || 0;
        const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
        const isOver = spent > limit && limit > 0;

        return (
          <div key={cat.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs shadow-sm" style={{ backgroundColor: cat.color }}>
                  <i className={`fa-solid ${cat.icon}`}></i>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">{cat.name}</h3>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">মাসিক সীমা</p>
                </div>
              </div>
              <button onClick={() => { setEditingId(cat.id); setEditVal(limit); }} className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 active:bg-blue-50 active:text-blue-500 transition-colors">
                <i className="fa-solid fa-pen-to-square text-[10px]"></i>
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <div>
                   <p className="text-base font-black text-slate-900">{t.currency}{spent.toLocaleString()}</p>
                   <p className="text-[8px] text-slate-400 font-bold uppercase">ব্যয় হয়েছে</p>
                </div>
                <div className="text-right">
                  {editingId === cat.id ? (
                    <div className="flex items-center gap-1">
                      <input type="number" autoFocus value={editVal} onChange={e => setEditVal(parseFloat(e.target.value))} className="w-14 bg-slate-50 border p-1 rounded text-[10px] font-bold outline-none" />
                      <button onClick={() => handleUpdate(cat.id)} className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold">সেট</button>
                    </div>
                  ) : (
                    <p className={`text-[9px] font-black ${isOver ? 'text-red-500' : 'text-slate-300'}`}>
                       {t.currency}{limit.toLocaleString()} সীমার মধ্যে
                    </p>
                  )}
                </div>
              </div>
              <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${isOver ? 'bg-red-500' : ''}`} style={{ width: `${percent}%`, backgroundColor: isOver ? '' : cat.color }}></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Budgets;
