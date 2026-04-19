"use client";

import { useState, useEffect } from "react";
import { TrendingDown, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from '@/lib/api';
import { useSearchParams } from 'next/navigation';

interface DebtorsStatsProps {
  initialTotalAmount: number;
  initialCount: number;
  initialDebtors?: Array<{ id: string; name: string; amount: number }>;
}

export function DebtorsStats({ initialTotalAmount, initialCount, initialDebtors = [] }: DebtorsStatsProps) {
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch_id') || localStorage.getItem('branch_id') || 'all';

  const [totalAmount, setTotalAmount] = useState(initialTotalAmount);
  const [count, setCount] = useState(initialCount);
  const [debtors, setDebtors] = useState(initialDebtors);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (period === '7d' && totalAmount === initialTotalAmount) return;
    
    setLoading(true);
    const end = new Date();
    const start = new Date();
    if (period === '7d') start.setDate(end.getDate() - 7);
    else if (period === '30d') start.setDate(end.getDate() - 30);
    else if (period === '90d') start.setDate(end.getDate() - 90);
    else if (period === 'year') start.setFullYear(end.getFullYear() - 1);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    api.get(`/analytics/dashboard?branch_id=${branchId}&startDate=${startStr}&endDate=${endStr}`)
    .then(res => {
      const d = res.data?.data || res.data;
      setTotalAmount(d.stats?.debtors?.amount || 0);
      setCount(d.stats?.debtors?.total || 0);
      setDebtors(d.topDebtors || []);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, [period, branchId]);

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] h-[400px] flex flex-col gap-4 group hover:shadow-xl transition-all duration-500 overflow-hidden ${loading ? 'opacity-50' : ''}`}>
      <div className="flex flex-col gap-1">
        <h3 className="text-[16px] font-black text-gray-900 uppercase tracking-tight">Qarzdorlar tahlili</h3>
        <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-gray-400" />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-6 border-none bg-transparent p-0 text-[11px] font-bold text-pink-500 focus:ring-0 w-auto gap-1">
                <SelectValue placeholder="Davr" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-xl">
                <SelectItem value="7d" className="text-[11px] font-bold">7 kun</SelectItem>
                <SelectItem value="30d" className="text-[11px] font-bold">1 oy</SelectItem>
                <SelectItem value="90d" className="text-[11px] font-bold">3 oy</SelectItem>
                <SelectItem value="year" className="text-[11px] font-bold">1 yil</SelectItem>
              </SelectContent>
            </Select>
          </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-100/50 overflow-hidden group/card shadow-sm">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/card:scale-110 transition-transform">
             <TrendingDown className="w-12 h-12 text-red-500" />
          </div>
          <div className="relative z-10 flex flex-col gap-0.5">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Umumiy qarz</span>
            <span className="text-[20px] font-black text-gray-900 tracking-tighter">
              {totalAmount.toLocaleString()} <span className="text-[12px]">SO'M</span>
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-white/50 rounded-full overflow-hidden">
             <div 
               className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full" 
               style={{ width: count > 0 ? '75%' : '0%' }}
             />
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-1">
           <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">So'nggi qarzdorlar</span>
           <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto no-scrollbar pr-1">
              {debtors.length > 0 ? debtors.map((debtor) => (
                <div key={debtor.id} className="flex items-center justify-between p-2.5 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors border border-transparent hover:border-gray-200/50">
                   <span className="text-[12px] font-bold text-gray-700 truncate max-w-[140px] leading-none">{debtor.name}</span>
                   <span className="text-[11px] font-black text-red-500">-{debtor.amount.toLocaleString()}</span>
                </div>
              )) : (
                <div className="text-center py-4 text-gray-300 text-[11px] font-medium">Qarzdorlar yo'q</div>
              )}
           </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-center pt-2">
         <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase">
            {count} ta qarzdor
         </span>
      </div>
    </div>
  );
}
