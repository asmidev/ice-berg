"use client";

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
  Wallet, ArrowUpRight, ArrowDownRight, CreditCard, Banknote, 
  Receipt, ArrowRightLeft, TrendingUp, CalendarDays, ExternalLink,
  Plus, Search, RotateCcw, LayoutGrid, Building2, ArrowRight,
  ShieldCheck, Clock, Trash2, MoreHorizontal, Minus, User, RefreshCw, Smartphone,
  CheckCircle2, AlertCircle, TrendingDown, Layers
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell, Sector
} from 'recharts';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-md p-5 rounded-[16px] border border-white/20 shadow-2xl flex flex-col gap-3 min-w-[200px]">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2">{label}</p>
        <div className="flex flex-col gap-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke }} />
                  <span className="text-[11px] font-bold text-gray-500 uppercase">{entry.name}</span>
               </div>
               <span className="text-[13px] font-black text-[#1E3A5F]">{Number(entry.value).toLocaleString()} <span className="text-[9px] text-gray-300">uzs</span></span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const ActiveDot = (props: any) => {
  const { cx, cy, stroke, payload, value } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill={stroke} fillOpacity={0.15} />
      <circle cx={cx} cy={cy} r={4} fill={stroke} stroke="white" strokeWidth={2} />
    </g>
  );
};

const COLORS = ['#1E3A5F', '#EC4899', '#10b981', '#f43f5e', '#8b5cf6', '#f59e0b', '#06b6d4'];

export default function FinanceCashboxPage() {
  return (
    <Suspense fallback={<div className="p-10 text-zinc-400 font-bold uppercase tracking-widest animate-pulse">Yuklanmoqda...</div>}>
      <CashboxContent />
    </Suspense>
  );
}

function CashboxContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState('all');
  
  // Data
  const [stats, setStats] = useState<any>(null);
  const [graphData, setGraphData] = useState<any[]>([]);
  const [cashboxes, setCashboxes] = useState<any[]>([]);

  // Filters & Periods
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    const bId = (typeof window !== 'undefined' ? localStorage.getItem('branch_id') : null) || 'all';
    setBranchId(bId);
    setMounted(true);
  }, [searchParams]);

  const setRange = (p: string) => {
    const end = new Date();
    const start = new Date();
    switch(p) {
      case 'today': break;
      case 'yesterday': 
        start.setDate(end.getDate() - 1); 
        end.setDate(end.getDate() - 1);
        break;
      case '7d': start.setDate(end.getDate() - 7); break;
      case '30d': start.setDate(end.getDate() - 30); break;
      case 'thisMonth': start.setDate(1); break;
      case 'lastMonth':
        start.setMonth(end.getMonth() - 1);
        start.setDate(1);
        end.setDate(0); // Last day of prev month
        break;
    }
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const fetchData = async () => {
    if (!mounted) return;
    setLoading(true);
    try {
      const start = startDate;
      const end = endDate;
      const [statsRes, graphRes, cashRes] = await Promise.all([
        api.get(`/finance/cashbox/summary?branch_id=${branchId}&startDate=${start}&endDate=${end}`),
        api.get(`/finance/cashbox/graph?branch_id=${branchId}&startDate=${start}&endDate=${end}`),
        api.get(`/finance/cashboxes?branch_id=${branchId}`)
      ]);

      setStats(statsRes.data?.data || statsRes.data || null);
      setGraphData(graphRes.data?.data || (Array.isArray(graphRes.data) ? graphRes.data : []));
      setCashboxes(cashRes.data?.data || (Array.isArray(cashRes.data) ? cashRes.data : []));
    } catch (err) {
      console.error("Fetch error:", err);
      showToast('Ma\'lumotlarni yuklashda xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [branchId, mounted, startDate, endDate]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-20">
      
      {/* --- TOAST --- */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
           <div className={cn("flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border min-w-[300px]", toast.type === 'success' ? "bg-white border-emerald-100 text-emerald-600" : "bg-white border-rose-100 text-rose-600")}>
              {toast.type === 'success' ? <CheckCircle2 size={24} className="text-emerald-500" /> : <AlertCircle size={24} className="text-rose-500" />}
              <span className="font-bold text-[13px]">{toast.message}</span>
           </div>
        </div>
      )}

      {/* 🚀 Top Summary Cards & Global Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
         <div className="bg-white p-5 rounded-[12px] shadow-sm border border-gray-100 flex justify-between items-center group relative overflow-hidden h-[100px]">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#1E3A5F]" />
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 opacity-70">Naqd Pullman (Kassa)</p>
               <h2 className="text-xl font-black text-[#1E3A5F]">
                  {stats?.cash_total?.toLocaleString() || 0}
                  <span className="text-[10px] text-gray-300 font-bold ml-1">uzs</span>
               </h2>
            </div>
            <div className="w-10 h-10 rounded-[8px] bg-navy-50 text-[#1E3A5F] flex items-center justify-center group-hover:bg-[#1E3A5F] group-hover:text-white transition-all"><Banknote size={20} /></div>
         </div>

         <div className="bg-white p-5 rounded-[12px] shadow-sm border border-gray-100 flex justify-between items-center group relative overflow-hidden h-[100px]">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#EC4899]" />
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 opacity-70">Plastik/Bank (PL/BANK)</p>
               <h2 className="text-xl font-black text-[#1E3A5F]">
                  {stats?.other_total?.toLocaleString() || 0}
                  <span className="text-[10px] text-gray-300 font-bold ml-1">uzs</span>
               </h2>
            </div>
            <div className="w-10 h-10 rounded-[8px] bg-pink-50 text-[#EC4899] flex items-center justify-center group-hover:bg-[#EC4899] group-hover:text-white transition-all"><CreditCard size={20} /></div>
         </div>

         <div className="bg-white p-5 rounded-[12px] shadow-sm border border-gray-100 flex justify-between items-center group relative overflow-hidden h-[100px]">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 opacity-70">Jami Kirim (Davr)</p>
               <h2 className="text-xl font-black text-emerald-600">
                  +{stats?.period_incomes?.toLocaleString() || 0}
                  <span className="text-[10px] text-gray-300 font-bold ml-1">uzs</span>
               </h2>
            </div>
            <div className="w-10 h-10 rounded-[8px] bg-emerald-50 text-emerald-500 flex items-center justify-center"><ArrowUpRight size={20} /></div>
         </div>

         <div className="bg-white p-5 rounded-[12px] shadow-sm border border-gray-100 flex justify-between items-center group relative overflow-hidden h-[100px]">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 opacity-70">Jami Chiqim (Davr)</p>
               <h2 className="text-xl font-black text-rose-600">
                  -{stats?.period_expenses?.toLocaleString() || 0}
                  <span className="text-[10px] text-gray-300 font-bold ml-1">uzs</span>
               </h2>
            </div>
            <div className="w-10 h-10 rounded-[8px] bg-rose-50 text-rose-500 flex items-center justify-center"><ArrowDownRight size={20} /></div>
         </div>

         <div className="bg-white p-5 rounded-[12px] shadow-sm border border-gray-100 flex justify-between items-center group relative overflow-hidden h-[100px]">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 opacity-70">Sof Foyda (Davr)</p>
               <h2 className={`text-xl font-black ${Number(stats?.net_profit || 0) >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                  {stats?.net_profit > 0 ? '+' : ''}{stats?.net_profit?.toLocaleString() || 0}
                  <span className="text-[10px] text-gray-300 font-bold ml-1">uzs</span>
               </h2>
            </div>
            <div className="w-10 h-10 rounded-[8px] bg-indigo-50 text-indigo-500 flex items-center justify-center"><TrendingUp size={20} /></div>
         </div>

         {/* --- SLICK GLOBAL FILTER Card --- */}
         <div className="bg-white p-5 rounded-[12px] shadow-sm border border-gray-100 flex flex-col justify-center gap-1 group relative overflow-hidden h-[100px] hover:border-[#EC4899]/30 transition-all">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">Hisobot Davri:</p>
            <Popover>
               <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 text-[12px] font-black text-[#1E3A5F] hover:text-[#EC4899] transition-colors uppercase tracking-wider">
                     <CalendarDays size={16} className="text-gray-400" />
                     {new Date(startDate).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })} - {new Date(endDate).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                  </button>
               </PopoverTrigger>
               <PopoverContent className="w-[320px] p-6 rounded-[20px] shadow-2xl border-gray-100 bg-white" align="end">
                  <div className="flex flex-col gap-5">
                     <div className="flex flex-col gap-3">
                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sana tanlang:</Label>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="flex flex-col gap-1.5">
                              <span className="text-[9px] font-bold text-gray-300 uppercase ml-1">Dan</span>
                              <input 
                                 type="date" 
                                 value={startDate} 
                                 onChange={e => setStartDate(e.target.value)}
                                 className="h-9 px-3 bg-gray-50 border-none rounded-lg text-[11px] font-bold text-[#1E3A5F] outline-none" 
                              />
                           </div>
                           <div className="flex flex-col gap-1.5">
                              <span className="text-[9px] font-bold text-gray-300 uppercase ml-1">Gacha</span>
                              <input 
                                 type="date" 
                                 value={endDate} 
                                 onChange={e => setEndDate(e.target.value)}
                                 className="h-9 px-3 bg-gray-50 border-none rounded-lg text-[11px] font-bold text-[#1E3A5F] outline-none" 
                              />
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col gap-2 pt-4 border-t border-gray-50">
                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tezkor tanlovlar:</Label>
                        <div className="grid grid-cols-2 gap-2">
                           <button onClick={() => setRange('today')} className="py-2 px-3 rounded-lg bg-gray-50 hover:bg-[#1E3A5F] hover:text-white text-[11px] font-bold text-gray-500 transition-all">Bugun</button>
                           <button onClick={() => setRange('yesterday')} className="py-2 px-3 rounded-lg bg-gray-50 hover:bg-[#1E3A5F] hover:text-white text-[11px] font-bold text-gray-500 transition-all">Kecha</button>
                           <button onClick={() => setRange('7d')} className="py-2 px-3 rounded-lg bg-gray-50 hover:bg-[#1E3A5F] hover:text-white text-[11px] font-bold text-gray-500 transition-all">Oxirgi 7 kun</button>
                           <button onClick={() => setRange('30d')} className="py-2 px-3 rounded-lg bg-gray-50 hover:bg-[#1E3A5F] hover:text-white text-[11px] font-bold text-gray-500 transition-all">Oxirgi 30 kun</button>
                           <button onClick={() => setRange('thisMonth')} className="py-2 px-3 rounded-lg bg-gray-50 hover:bg-[#1E3A5F] hover:text-white text-[11px] font-bold text-gray-500 transition-all">Shu oy</button>
                           <button onClick={() => setRange('lastMonth')} className="py-2 px-3 rounded-lg bg-gray-50 hover:bg-[#1E3A5F] hover:text-white text-[11px] font-bold text-gray-500 transition-all">O'tgan oy</button>
                        </div>
                     </div>
                  </div>
               </PopoverContent>
            </Popover>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
         {/* 🚀 Revenue Structure (3D Pie Chart) */}
         <div className="bg-white p-8 rounded-[12px] shadow-sm border border-gray-100 flex flex-col items-center relative overflow-hidden min-h-[460px]">
            <div className="absolute top-6 left-8 flex flex-col">
               <h4 className="text-[12px] font-black text-[#1E3A5F] uppercase tracking-widest mb-1">Daromad Strukturasi</h4>
               <p className="text-[10px] font-bold text-gray-400 italic">Kirimlar tahlili</p>
            </div>
            
            <div className="w-full h-[280px] mt-8 relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <defs>
                        {COLORS.map((color, i) => (
                           <linearGradient key={`grad-in-${i}`} id={`grad-in-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor={color} stopOpacity={1} />
                              <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                           </linearGradient>
                        ))}
                        <filter id="shadow-in" x="-20%" y="-20%" width="140%" height="140%">
                           <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                           <feOffset dx="4" dy="6" result="offsetblur" />
                           <feComponentTransfer><feFuncA type="linear" slope="0.3" /></feComponentTransfer>
                           <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                     </defs>
                     <Tooltip content={<CustomTooltip />} />
                     <Pie
                        data={stats?.revenue_directions || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={105}
                        paddingAngle={8}
                        dataKey="value"
                        animationDuration={1500}
                        stroke="none"
                        filter="url(#shadow-in)"
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                     >
                        {(stats?.revenue_directions || []).map((entry: any, index: number) => (
                           <Cell key={`cell-in-${index}`} fill={`url(#grad-in-${index % COLORS.length})`} />
                        ))}
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
               
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-8">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Jami Kirim</p>
                  <h3 className="text-xl font-black text-emerald-600">
                     {stats?.period_incomes?.toLocaleString() || 0}
                  </h3>
               </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8 w-full">
               {(stats?.revenue_directions || []).slice(0, 6).map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 hover:scale-105 transition-transform">
                     <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                     <span className="text-[10px] font-black text-[#1E3A5F]">{item.name}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* 🔴 Expense Structure (3D Pie Chart) */}
         <div className="bg-white p-8 rounded-[12px] shadow-sm border border-gray-100 flex flex-col items-center relative overflow-hidden min-h-[460px]">
            <div className="absolute top-6 left-8 flex flex-col">
               <h4 className="text-[12px] font-black text-[#1E3A5F] uppercase tracking-widest mb-1">Chiqim Strukturasi</h4>
               <p className="text-[10px] font-bold text-gray-400 italic">Xarajatlar tahlili</p>
            </div>
            
            <div className="w-full h-[280px] mt-8 relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <defs>
                        {['#f43f5e', '#fb923c', '#d946ef', '#a855f7', '#6366f1', '#facc15'].map((color, i) => (
                           <linearGradient key={`grad-ex-${i}`} id={`grad-ex-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor={color} stopOpacity={1} />
                              <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                           </linearGradient>
                        ))}
                        <filter id="shadow-ex" x="-20%" y="-20%" width="140%" height="140%">
                           <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                           <feOffset dx="4" dy="6" result="offsetblur" />
                           <feComponentTransfer><feFuncA type="linear" slope="0.3" /></feComponentTransfer>
                           <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                     </defs>
                     <Tooltip content={<CustomTooltip />} />
                     <Pie
                        data={stats?.expense_directions || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={105}
                        paddingAngle={8}
                        dataKey="value"
                        animationDuration={1500}
                        stroke="none"
                        filter="url(#shadow-ex)"
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                     >
                        {(stats?.expense_directions || []).map((entry: any, index: number) => (
                           <Cell key={`cell-ex-${index}`} fill={`url(#grad-ex-${index % 6})`} />
                        ))}
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
               
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-8">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Jami Chiqim</p>
                  <h3 className="text-xl font-black text-rose-600">
                     {stats?.period_expenses?.toLocaleString() || 0}
                  </h3>
               </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8 w-full">
               {(stats?.expense_directions || []).slice(0, 6).map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 hover:scale-105 transition-transform">
                     <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#f43f5e', '#fb923c', '#d946ef', '#a855f7', '#6366f1', '#facc15'][i % 6] }} />
                     <span className="text-[10px] font-black text-[#1E3A5F]">{item.name}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* 🚀 Incomes & Expenses Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Incomes Details */}
         <div className="bg-white p-8 rounded-[12px] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><TrendingUp size={20} /></div>
                  <h3 className="text-[16px] font-black text-[#1E3A5F] uppercase tracking-tight">Kirim Detallari</h3>
               </div>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Tanlangan davr bo'yicha</span>
            </div>
            
            <div className="space-y-6">
               {[
                 { label: 'Naqd pul', amount: stats?.incomes?.CASH || 0, color: 'bg-emerald-500' },
                 { label: 'Plastik karta', amount: stats?.incomes?.CARD || 0, color: 'bg-blue-500' },
                 { label: 'Bank o\'tkazmasi', amount: stats?.incomes?.TRANSFER || 0, color: 'bg-[#1E3A5F]' },
                 { label: 'Terminal', amount: stats?.incomes?.TERMINAL || 0, color: 'bg-indigo-400' }
               ].map((item, i) => (
                 <div key={i} className="group">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[12px] font-bold text-gray-500 group-hover:text-[#1E3A5F] transition-colors">{item.label}</span>
                       <span className="text-[14px] font-black text-[#1E3A5F]">{item.amount.toLocaleString()} <span className="text-gray-300 text-[10px]">so'm</span></span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                       <div className={cn("h-full transition-all duration-1000", item.color)} style={{ width: stats?.period_incomes > 0 ? `${(item.amount / stats.period_incomes) * 100}%` : '0%' }} />
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Expenses Details */}
         <div className="bg-white p-8 rounded-[12px] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"><TrendingDown size={20} /></div>
                  <h3 className="text-[16px] font-black text-[#1E3A5F] uppercase tracking-tight">Chiqim Detallari</h3>
               </div>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Tanlangan davr bo'yicha</span>
            </div>
            
            <div className="space-y-6">
               {[
                 { label: 'Naqd pul', amount: stats?.expenses?.CASH || 0, color: 'bg-rose-500' },
                 { label: 'Plastik karta', amount: stats?.expenses?.CARD || 0, color: 'bg-amber-400' },
                 { label: 'Bank o\'tkazmasi', amount: stats?.expenses?.TRANSFER || 0, color: 'bg-[#1E3A5F]' },
                 { label: 'Terminal', amount: stats?.expenses?.TERMINAL || 0, color: 'bg-zinc-400' }
               ].map((item, i) => (
                 <div key={i} className="group">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[12px] font-bold text-gray-500 group-hover:text-[#1E3A5F] transition-colors">{item.label}</span>
                       <span className="text-[14px] font-black text-[#1E3A5F]">{item.amount.toLocaleString()} <span className="text-gray-300 text-[10px]">so'm</span></span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                       <div className={cn("h-full transition-all duration-1000", item.color)} style={{ width: stats?.period_expenses > 0 ? `${(item.amount / stats.period_expenses) * 100}%` : '0%' }} />
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* 🚀 Premium Financial Graphics Section */}
      <div className="bg-white p-10 rounded-[12px] shadow-sm border border-gray-100 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-zinc-100"><TrendingUp size={200} /></div>
         
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 relative z-10 gap-6">
            <div>
               <h3 className="text-2xl font-black text-[#1E3A5F] tracking-tight mb-1">Moliya Dinamikasi</h3>
               <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest italic">Kirim, Chiqim va Sof Foyda tahlili</p>
            </div>
            
            <div className="flex flex-wrap gap-6 bg-gray-50/50 backdrop-blur-sm px-6 py-3 rounded-2xl border border-gray-100">
               <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-100" />
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Kirimlar</span>
               </div>
               <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-100" />
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Chiqimlar</span>
               </div>
               <div className="flex items-center gap-2.5">
                  <div className="w-5 h-1 rounded-full bg-indigo-500 shadow-lg shadow-indigo-100" />
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Sof Foyda</span>
               </div>
            </div>
         </div>

         <div className="min-h-[450px] h-[450px] w-full relative z-10">
            {loading ? (
               <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-zinc-300 animate-pulse">
                  <RefreshCw className="animate-spin" size={40} />
                  <span className="font-black text-[10px] uppercase tracking-widest">Ma'lumotlar qayta ishlanmoqda...</span>
               </div>
            ) : (
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={graphData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorKirim" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorChiqim" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                           <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.6} />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                        dy={15} 
                     />
                     <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                        tickFormatter={(v:number) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v.toLocaleString()} 
                     />
                     <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '5 5' }} />
                     
                     <Area 
                        type="monotone" 
                        name="Kirim"
                        dataKey="kirim" 
                        stroke="#10b981" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorKirim)" 
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                        animationDuration={2000}
                     />
                     <Area 
                        type="monotone" 
                        name="Chiqim"
                        dataKey="chiqim" 
                        stroke="#f43f5e" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorChiqim)" 
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e' }}
                        animationDuration={2000}
                     />
                     <Area 
                        type="monotone" 
                        name="Sof Foyda"
                        dataKey="net" 
                        stroke="#6366f1" 
                        strokeWidth={3} 
                        strokeDasharray="8 5"
                        fill="none" 
                        animationDuration={2500}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            )}
         </div>
      </div>

    </div>
  );
}
