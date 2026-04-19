import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { useSearchParams } from 'next/navigation';

interface EarningsChartProps {
  initialData: any[];
}

export const EarningsChart: React.FC<EarningsChartProps> = ({ initialData }) => {
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch_id') || localStorage.getItem('branch_id') || 'all';

  const [data, setData] = useState(initialData);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (period === '7d' && data === initialData) return;
    
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
      setData(d.chartData || []);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, [period, branchId]);

  return (
    <div className={`border-none shadow-[0_2px_12px_rgba(0,0,0,0.04)] bg-white rounded-2xl overflow-hidden p-6 flex flex-col gap-6 group hover:shadow-xl transition-all duration-500 ${loading ? 'opacity-50' : ''}`}>
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
           <h3 className="text-[17px] font-black text-gray-900 uppercase tracking-tight">Daromad va Xarajat</h3>
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
        <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      <div className="h-[280px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPayments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EC4899" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}}
              tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`}
            />
            <Tooltip 
              cursor={{ stroke: '#F1F5F9', strokeWidth: 2 }}
              contentStyle={{
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
                padding: '12px',
                background: '#fff'
              }}
              itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
              labelStyle={{ color: '#94A3B8', fontSize: '9px', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#6366F1" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPayments)" 
              name="Tushumlar"
              animationDuration={1000}
            />
            <Area 
              type="monotone" 
              dataKey="expenses" 
              stroke="#EC4899" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorExpenses)" 
              name="Xarajatlar"
              animationDuration={1000}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle" 
              iconSize={6}
              wrapperStyle={{ top: -50, right: 0, fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
