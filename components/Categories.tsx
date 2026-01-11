
import React, { useState } from 'react';
import { SyncData, Category } from '../types';
import { CATEGORY_ICONS } from '../constants';

interface CategoriesProps {
  data: SyncData;
  onUpdate: (newData: Partial<SyncData>) => void;
  t: any;
}

const Categories: React.FC<CategoriesProps> = ({ data, onUpdate, t }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', icon: 'fa-burger', color: '#FF6B6B' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name) return;
    onUpdate({ categories: [...data.categories, { id: Date.now().toString(), ...newCat }] });
    setIsAdding(false);
    setNewCat({ name: '', icon: 'fa-burger', color: '#FF6B6B' });
  };

  return (
    <div className="space-y-3 animate-in fade-in pb-10">
      <div className="grid grid-cols-2 gap-2 px-1">
        {data.categories.map((cat) => (
          <div key={cat.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[10px]" style={{ backgroundColor: cat.color }}>
              <i className={`fa-solid ${cat.icon}`}></i>
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-slate-800 truncate">{cat.name}</p>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">{data.transactions.filter(tx => tx.category === cat.name).length} এন্ট্রি</p>
            </div>
          </div>
        ))}
        <button onClick={() => setIsAdding(true)} className="bg-slate-50 border-2 border-dashed border-slate-200 p-3 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:bg-slate-100 transition-colors">
          <i className="fa-solid fa-plus-circle text-sm"></i>
          <span className="text-[10px] font-black uppercase tracking-widest">নতুন</span>
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-slate-900/40 backdrop-blur-sm p-3">
          <div className="bg-white rounded-[2rem] p-5 pb-8 shadow-2xl animate-in slide-in-from-bottom-full w-full max-w-lg mx-auto safe-area-bottom">
            <div className="w-10 h-1 bg-slate-100 rounded-full mx-auto mb-6" onClick={() => setIsAdding(false)}></div>
            <h3 className="text-lg font-black text-slate-900 mb-6 text-center">নতুন ক্যাটেগরি</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <input required value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} className="w-full bg-slate-50 p-4 rounded-xl font-bold text-sm outline-none ring-blue-100 focus:ring-2" placeholder="নাম দিন..." />
              
              <div className="bg-slate-50 p-3 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">আইকন ও কালার পছন্দ করুন</p>
                <div className="grid grid-cols-6 gap-2 h-48 overflow-y-auto custom-scrollbar p-1">
                  {CATEGORY_ICONS.map((item, idx) => (
                    <button 
                      key={idx} 
                      type="button" 
                      onClick={() => setNewCat({...newCat, icon: item.icon, color: item.color})} 
                      className={`aspect-square rounded-xl flex items-center justify-center border-2 transition-all ${newCat.icon === item.icon ? 'border-blue-500 bg-white scale-110 shadow-md' : 'border-transparent bg-white/50'}`}
                      style={{ color: item.color }}
                    >
                      <i className={`fa-solid ${item.icon} text-sm`}></i>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-xl text-xs uppercase">বাতিল</button>
                <button type="submit" className="flex-[2] py-4 gradient-bg text-white font-black rounded-xl text-xs uppercase shadow-lg">ক্যাটেগরি সেভ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
