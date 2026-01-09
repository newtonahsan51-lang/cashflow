
import React, { useState } from 'react';
import { SyncData, Category } from '../types';

interface CategoriesProps {
  data: SyncData;
  onUpdate: (newData: Partial<SyncData>) => void;
}

const CATEGORY_ICONS = [
  'fa-utensils', 'fa-car', 'fa-bag-shopping', 'fa-heart', 'fa-tv', 'fa-house', 
  'fa-graduation-cap', 'fa-plane', 'fa-gift', 'fa-briefcase', 'fa-pills', 'fa-dumbbell'
];

const CATEGORY_COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', 
  '#06b6d4', '#14b8a6', '#f97316', '#6366f1', '#64748b', '#22c55e'
];

const Categories: React.FC<CategoriesProps> = ({ data, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState<Partial<Category>>({
    name: '',
    icon: CATEGORY_ICONS[0],
    color: CATEGORY_COLORS[0]
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name) return;
    
    const cat: Category = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCat.name,
      icon: newCat.icon!,
      color: newCat.color!
    };
    
    onUpdate({ categories: [...data.categories, cat] });
    setIsAdding(false);
    setNewCat({ name: '', icon: CATEGORY_ICONS[0], color: CATEGORY_COLORS[0] });
  };

  const handleDelete = (id: string) => {
    if (data.categories.length <= 1) return alert("You must have at least one category.");
    onUpdate({ 
      categories: data.categories.filter(c => c.id !== id),
      // Also remove budgets associated with this category
      budgets: data.budgets.filter(b => b.categoryId !== id)
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Categories</h2>
          <p className="text-sm text-slate-500">Organize your spending habits</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="gradient-bg text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <i className="fa-solid fa-plus"></i>
          New Category
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Create Category</h3>
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Name</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={newCat.name}
                  onChange={e => setNewCat({...newCat, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-lg font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Gaming"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {CATEGORY_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewCat({...newCat, icon})}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                        newCat.icon === icon ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-transparent bg-slate-50 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <i className={`fa-solid ${icon}`}></i>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Color</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCat({...newCat, color})}
                      className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
                        newCat.color === color ? 'ring-2 ring-slate-900 ring-offset-2' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    ></button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 gradient-bg text-white font-bold rounded-2xl shadow-lg transition-all">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.categories.map((cat) => (
          <div key={cat.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group hover:shadow-md transition-all relative overflow-hidden">
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: cat.color }}>
                <i className={`fa-solid ${cat.icon}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 truncate">{cat.name}</h4>
                <p className="text-xs text-slate-400">
                  {data.transactions.filter(t => t.category === cat.name).length} transactions
                </p>
              </div>
              {cat.name !== 'Income' && (
                <button 
                  onClick={() => handleDelete(cat.id)}
                  className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              )}
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-[0.03]" style={{ backgroundColor: cat.color }}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
