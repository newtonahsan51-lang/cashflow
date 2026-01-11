
import React, { useState, useMemo } from 'react';
import { SyncData, Transaction } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { POPULAR_CURRENCIES } from '../constants';

interface ReportsProps {
  data: SyncData;
  t: any;
}

type DateRange = 'this-month' | 'last-month' | 'all' | 'custom';
type ReportType = 'income' | 'expense';

const Reports: React.FC<ReportsProps> = ({ data, t }) => {
  const [dateRange, setDateRange] = useState<DateRange>('this-month');
  const [reportType, setReportType] = useState<ReportType>('expense');
  const [customStartDate, setCustomStartDate] = useState<string>(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(data.categories.map(c => c.name));

  const currencySymbol = POPULAR_CURRENCIES.find(c => c.code === data.profile.currency)?.symbol || '৳';

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    return data.transactions.filter(tx => {
      const txDate = new Date(tx.date);
      const matchesType = tx.type === reportType;
      const isCategorySelected = selectedCategories.includes(tx.category);

      let isInDateRange = true;
      if (dateRange === 'this-month') {
        isInDateRange = txDate >= startOfThisMonth;
      } else if (dateRange === 'last-month') {
        isInDateRange = txDate >= startOfLastMonth && txDate <= endOfLastMonth;
      } else if (dateRange === 'custom') {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999); // Include the whole end day
        isInDateRange = txDate >= start && txDate <= end;
      }

      return matchesType && isCategorySelected && isInDateRange;
    });
  }, [data.transactions, dateRange, reportType, selectedCategories, customStartDate, customEndDate]);

  const chartData = useMemo(() => {
    return data.categories
      .map(cat => ({
        name: cat.name,
        value: filteredTransactions
          .filter(tx => tx.category === cat.name)
          .reduce((sum, tx) => sum + tx.amount, 0),
        color: cat.color,
        icon: cat.icon
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [data.categories, filteredTransactions]);

  const totalAmount = chartData.reduce((sum, d) => sum + d.value, 0);

  const toggleCategory = (name: string) => {
    setSelectedCategories(prev => 
      prev.includes(name) 
        ? prev.filter(c => c !== name) 
        : [...prev, name]
    );
  };

  const selectAllCategories = () => setSelectedCategories(data.categories.map(c => c.name));
  const deselectAllCategories = () => setSelectedCategories([]);

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      {/* Type Selector (Income / Expense) */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm mx-1">
        <button 
          onClick={() => setReportType('expense')}
          className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all ${reportType === 'expense' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400'}`}
        >
          <i className="fa-solid fa-arrow-down mr-2"></i>ব্যয়
        </button>
        <button 
          onClick={() => setReportType('income')}
          className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all ${reportType === 'income' ? 'bg-green-500 text-white shadow-lg' : 'text-slate-400'}`}
        >
          <i className="fa-solid fa-arrow-up mr-2"></i>আয়
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="flex gap-2 overflow-x-auto custom-scrollbar px-1">
        {(['this-month', 'last-month', 'all', 'custom'] as DateRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
              dateRange === range ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-400 border-slate-100'
            }`}
          >
            {range === 'this-month' ? 'এই মাস' : range === 'last-month' ? 'গত মাস' : range === 'all' ? 'সব সময়' : 'কাস্টম'}
          </button>
        ))}
      </div>

      {/* Custom Date Inputs */}
      {dateRange === 'custom' && (
        <div className="bg-white p-4 rounded-[2rem] border border-slate-50 shadow-sm grid grid-cols-2 gap-3 animate-in slide-in-from-top-2">
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-1">শুরু</label>
            <input 
              type="date" 
              value={customStartDate} 
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="w-full bg-slate-50 border-none p-3 rounded-xl font-bold text-xs focus:ring-2 ring-blue-100 outline-none"
            />
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-1">শেষ</label>
            <input 
              type="date" 
              value={customEndDate} 
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="w-full bg-slate-50 border-none p-3 rounded-xl font-bold text-xs focus:ring-2 ring-blue-100 outline-none"
            />
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-50 shadow-sm space-y-3">
        <div className="flex justify-between items-center px-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ফিল্টার ক্যাটেগরি</p>
          <div className="flex gap-3">
            <button onClick={selectAllCategories} className="text-[10px] font-black text-blue-600 uppercase">সব</button>
            <button onClick={deselectAllCategories} className="text-[10px] font-black text-slate-300 uppercase">কিছু না</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.name)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                selectedCategories.includes(cat.name)
                  ? 'bg-slate-50 border-slate-200 text-slate-900'
                  : 'bg-white border-transparent text-slate-300 opacity-60'
              }`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
              <span className="text-[10px] font-bold">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Panel */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm">
        <div className="text-center mb-6">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">সারসংক্ষেপ ({reportType === 'income' ? 'আয়' : 'ব্যয়'})</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
            {dateRange === 'this-month' ? 'এই মাসের রিপোর্ট' : 
             dateRange === 'last-month' ? 'গত মাসের রিপোর্ট' : 
             dateRange === 'all' ? 'সামগ্রিক রিপোর্ট' : 
             `${new Date(customStartDate).toLocaleDateString('bn-BD')} - ${new Date(customEndDate).toLocaleDateString('bn-BD')}`}
          </p>
        </div>
        
        {chartData.length > 0 ? (
          <>
            <div className="h-56 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={6}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">মোট {reportType === 'income' ? 'আয়' : 'ব্যয়'}</p>
                <p className={`text-xl font-black ${reportType === 'income' ? 'text-green-600' : 'text-slate-900'}`}>
                  {currencySymbol}{totalAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* List Breakdown */}
            <div className="mt-8 space-y-2">
              {chartData.map(d => (
                <div key={d.name} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-white">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[10px] shadow-sm" style={{ backgroundColor: d.color }}>
                      <i className={`fa-solid ${d.icon}`}></i>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{d.name}</p>
                      <div className="w-24 h-1 bg-slate-100 rounded-full mt-1">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ backgroundColor: d.color, width: `${(d.value / totalAmount) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900">{currencySymbol}{d.value.toLocaleString()}</p>
                    <p className="text-[9px] font-black text-slate-400">{((d.value / totalAmount) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-20 text-center text-slate-300">
            <i className={`fa-solid ${reportType === 'income' ? 'fa-face-frown' : 'fa-chart-line'} text-5xl mb-4 opacity-20 block`}></i>
            <p className="text-xs font-bold">এই ফিল্টারে কোনো লেনদেন পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
