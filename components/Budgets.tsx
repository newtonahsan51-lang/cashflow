
import React, { useState } from 'react';
import { SyncData, Budget, Category } from '../types';

interface BudgetsProps {
  data: SyncData;
  onUpdate: (newData: Partial<SyncData>) => void;
}

const Budgets: React.FC<BudgetsProps> = ({ data, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState<number>(0);

  const calculateSpent = (categoryId: string) => {
    const category = data.categories.find(c => c.id === categoryId);
    if (!category) return 0;
    return data.transactions
      .filter(t => t.category === category.name && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleUpdateLimit = (categoryId: string) => {
    const existing = data.budgets.find(b => b.categoryId === categoryId);
    let newBudgets: Budget[];
    
    if (existing) {
      newBudgets = data.budgets.map(b => b.categoryId === categoryId ? { ...b, limit: editVal } : b);
    } else {
      newBudgets = [...data.budgets, { categoryId, limit: editVal, spent: calculateSpent(categoryId) }];
    }
    
    onUpdate({ budgets: newBudgets });
    setEditingId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {data.categories.filter(c => c.name !== 'Income').map((cat) => {
        const budget = data.budgets.find(b => b.categoryId === cat.id);
        const spent = calculateSpent(cat.id);
        const limit = budget?.limit || 0;
        const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
        const isOver = spent > limit && limit > 0;

        return (
          <div key={cat.id} className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg" style={{ backgroundColor: cat.color }}>
                  <i className={`fa-solid ${cat.icon}`}></i>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{cat.name} Budget</h3>
                  <p className="text-xs text-slate-400 font-medium">Monthly limit</p>
                </div>
              </div>
              <button 
                onClick={() => { setEditingId(cat.id); setEditVal(limit); }}
                className="text-slate-400 hover:text-blue-500 transition-colors"
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-2xl font-black text-slate-900">${spent.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Spent this month</p>
                </div>
                <div className="text-right">
                  {editingId === cat.id ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        autoFocus
                        value={editVal} 
                        onChange={e => setEditVal(parseFloat(e.target.value))}
                        className="w-24 bg-slate-50 border border-slate-200 p-2 rounded-lg text-sm font-bold text-slate-700 outline-none"
                      />
                      <button onClick={() => handleUpdateLimit(cat.id)} className="bg-blue-600 text-white p-2 rounded-lg text-xs font-bold">Set</button>
                    </div>
                  ) : (
                    <p className={`text-sm font-bold ${isOver ? 'text-red-600' : 'text-slate-400'}`}>
                      of ${limit.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full ${isOver ? 'bg-red-500' : 'bg-blue-600'}`}
                  style={{ width: `${percent}%`, backgroundColor: isOver ? '#ef4444' : cat.color }}
                ></div>
              </div>

              {isOver && (
                <div className="flex items-center gap-2 text-red-600 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  Budget Exceeded by ${(spent - limit).toLocaleString()}
                </div>
              )}
            </div>
            
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-110 transition-transform -z-0 opacity-50"></div>
          </div>
        );
      })}
    </div>
  );
};

export default Budgets;
