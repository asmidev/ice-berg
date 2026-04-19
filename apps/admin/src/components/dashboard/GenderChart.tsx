import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from '@/lib/api';
import { useSearchParams } from 'next/navigation';

interface GenderChartProps {
  initialData?: {
    boys: number;
    girls: number;
    total: number;
  };
}

export const GenderChart: React.FC<GenderChartProps> = ({ initialData }) => {
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
      setData(d.stats?.gender || initialData);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, [period, branchId]);

  const chartData = [
    { name: 'O\'g\'il bolalar', value: data?.boys || 0, color: '#0EA5E9' },
    { name: 'Qiz bolalar', value: data?.girls || 0, color: '#EC4899' },
  ];

  const total = data?.total || 0;

  return (
    <Card className={`border-none shadow-[0_2px_12px_rgba(0,0,0,0.04)] bg-white rounded-2xl h-[400px] flex flex-col p-6 gap-4 group hover:shadow-xl transition-all duration-500 ${loading ? 'opacity-50' : ''}`}>
      <div className="flex flex-col gap-1">
        <h3 className="text-[16px] font-black text-gray-900 uppercase tracking-tight">O'quvchilar jinsi</h3>
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
      
      <div className="flex-1 flex flex-col items-center justify-center relative min-h-[180px]">
        <div className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={6}
                dataKey="value"
                stroke="none"
                animationDuration={1000}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Central Label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pt-1 pointer-events-none">
          <span className="text-[28px] font-black text-gray-900 leading-none tracking-tighter">
            {total.toLocaleString()}
          </span>
          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mt-0.5">Davrda</span>
        </div>
      </div>

      {/* Modern Detailed Legend at Bottom */}
      <div className="flex items-center justify-center gap-6 mt-2">
         <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />
              <span className="text-[11px] font-black text-gray-800 uppercase tracking-tight">O'g'illar</span>
            </div>
            <span className="text-[12px] font-bold text-gray-400 mt-0.5">{data?.boys || 0} ta</span>
         </div>
         <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#EC4899]" />
              <span className="text-[11px] font-black text-gray-800 uppercase tracking-tight">Qizlar</span>
            </div>
            <span className="text-[12px] font-bold text-gray-400 mt-0.5">{data?.girls || 0} ta</span>
         </div>
      </div>
    </Card>
  );
};
