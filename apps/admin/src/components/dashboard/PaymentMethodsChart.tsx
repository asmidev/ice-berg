import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { CreditCard, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from '@/lib/api';
import { useSearchParams } from 'next/navigation';

interface PaymentMethodsChartProps {
  initialData: Array<{ name: string; value: number }>;
}

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981'];

export const PaymentMethodsChart: React.FC<PaymentMethodsChartProps> = ({ initialData = [] }) => {
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
      setData(d.paymentMethodData || []);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, [period, branchId]);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className={`p-6 bg-white border-none shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl h-[400px] flex flex-col group hover:shadow-xl transition-all duration-500 ${loading ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-[16px] font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase">
            To'lov turlari
            <CreditCard className="w-4 h-4 text-indigo-500" />
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

      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.length > 0 ? data : [{ name: 'Ma\'lumot yo\'q', value: 1 }]}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={8}
              dataKey="value"
              stroke="none"
              animationDuration={1000}
            >
              {(data.length > 0 ? data : [{ name: '', value: 1 }]).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={data.length > 0 ? COLORS[index % COLORS.length] : '#f1f5f9'} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => `${value.toLocaleString()} UZS`}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[20px] font-black text-gray-900 tracking-tighter leading-none">
            {(total / 1000000).toFixed(1)}M
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
             Jami (UZS)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="text-[11px] font-bold text-gray-600 truncate">{entry.name}</span>
            </div>
            <span className="text-[12px] font-black text-gray-900 ml-4">
              {total > 0 ? Math.round((entry.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
