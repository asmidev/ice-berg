import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { Heart, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from '@/lib/api';
import { useSearchParams } from 'next/navigation';

interface StudentRetentionChartProps {
  initialData: {
    active: number;
    joined: number;
    left: number;
    total: number;
  };
}

export const StudentRetentionChart: React.FC<StudentRetentionChartProps> = ({ initialData }) => {
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
      setData(d.stats?.students || initialData);
      setLoading(false);
    })
    .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, branchId]);

  const retentionRate = data.joined > 0 ? Math.round(((data.joined - data.left) / data.joined) * 100) : 100;
  
  const chartData = [
    { name: 'Yangi qo\'shilgan', value: data.joined, color: '#10b981' },
    { name: 'Tark etgan', value: data.left, color: '#ef4444' },
  ];

  return (
    <Card className={`p-6 bg-white border-none shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl h-[400px] flex flex-col group hover:shadow-xl transition-all duration-500 overflow-hidden relative ${loading ? 'opacity-50' : ''}`}>
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
         <Heart className="w-24 h-24 text-pink-500 fill-pink-500" />
      </div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex flex-col gap-1">
          <h3 className="text-[16px] font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase">
            Markaz salomatligi
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
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full h-fit ${retentionRate >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {retentionRate >= 0 ? 'Ijobiy' : 'Xatarli'}
        </span>
      </div>

      <div className="flex-1 min-h-0 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={10}
              dataKey="value"
              stroke="none"
              animationDuration={1000}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={`text-[28px] font-black tracking-tighter leading-none ${retentionRate >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {retentionRate}%
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
             Retention
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 relative z-10">
         <div className="p-2.5 bg-green-50/50 rounded-xl border border-green-100/50 flex flex-col gap-0.5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-green-600">
               <TrendingUp className="w-3 h-3" />
               <span className="text-[10px] font-black uppercase">Yangi</span>
            </div>
            <span className="text-[14px] font-black text-gray-900">{data.joined} ta</span>
         </div>
         <div className="p-2.5 bg-red-50/50 rounded-xl border border-red-100/50 flex flex-col gap-0.5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-red-600">
               <TrendingDown className="w-3 h-3" />
               <span className="text-[10px] font-black uppercase">Chiqib ketgan</span>
            </div>
            <span className="text-[14px] font-black text-gray-900">{data.left} ta</span>
         </div>
      </div>
    </Card>
  );
};
