import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { ShoppingBag, TrendingUp, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from '@/lib/api';
import { useSearchParams } from 'next/navigation';

interface InventorySalesChartProps {
  initialRevenue: number;
}

export const InventorySalesChart: React.FC<InventorySalesChartProps> = ({ initialRevenue }) => {
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch_id') || localStorage.getItem('branch_id') || 'all';

  const [revenue, setRevenue] = useState(initialRevenue);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (period === '7d' && revenue === initialRevenue) return;
    
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
      setRevenue(d.inventoryRevenue || 0);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, [period, branchId]);

  // Mock trend based on current revenue
  const mockTrend = [
    { day: '1', rev: revenue * 0.1 },
    { day: '2', rev: revenue * 0.3 },
    { day: '3', rev: revenue * 0.2 },
    { day: '4', rev: revenue * 0.5 },
    { day: '5', rev: revenue * 0.4 },
    { day: '6', rev: revenue * 0.8 },
    { day: '7', rev: revenue },
  ];

  return (
    <Card className={`p-6 bg-white border-none shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl h-[400px] flex flex-col group hover:shadow-xl transition-all duration-500 overflow-hidden relative ${loading ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="flex flex-col gap-1">
          <h3 className="text-[16px] font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase">
            Qo'shimcha savdo
            <ShoppingBag className="w-4 h-4 text-purple-500" />
          </h3>
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
      </div>

      <div className="mt-2 mb-4 relative z-10">
         <div className="flex items-baseline gap-1.5">
            <span className="text-[32px] font-black text-gray-900 tracking-tighter leading-none">
              {revenue.toLocaleString()}
            </span>
            <span className="text-[14px] font-bold text-gray-400">uzs</span>
         </div>
         <div className="flex items-center gap-1.5 text-success font-bold text-[11px] mt-1.5 uppercase">
            <TrendingUp className="w-3.5 h-3.5" />
            +12.5% o'sish
         </div>
      </div>

      <div className="flex-1 -mx-6 -mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockTrend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }}
              labelStyle={{ display: 'none' }}
              formatter={(value: any) => [`${value.toLocaleString()} UZS`, 'Sotuv']}
            />
            <Area 
              type="monotone" 
              dataKey="rev" 
              stroke="#8b5cf6" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorRev)" 
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
