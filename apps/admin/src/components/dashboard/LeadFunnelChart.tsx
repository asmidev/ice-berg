import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList } from 'recharts';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from '@/lib/api';
import { useSearchParams } from 'next/navigation';

interface LeadFunnelChartProps {
  initialData: Array<{ name: string; count: number }>;
  initialConversionRate: number;
}

export const LeadFunnelChart: React.FC<LeadFunnelChartProps> = ({ initialData = [], initialConversionRate }) => {
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch_id') || localStorage.getItem('branch_id') || 'all';

  const [data, setData] = useState(initialData);
  const [conversionRate, setConversionRate] = useState(initialConversionRate);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (period === '7d' && data === initialData) return; // Skip initial load if same
    
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
      setData(d.funnelData || []);
      setConversionRate(d.stats?.leads?.conversionRate || 0);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, [period, branchId]);

  const chartData = [...data].sort((a,b) => b.count - a.count);

  return (
    <Card className={`p-6 bg-white border-none shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl h-[400px] flex flex-col group hover:shadow-xl transition-all duration-500 ${loading ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-[16px] font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase">
            Sotuv voronkasi
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
        <div className="flex flex-col items-end">
           <div className="flex items-center gap-1.5 text-success font-black text-[18px] tracking-tighter">
             <TrendingUp className="w-4 h-4" />
             {conversionRate}%
           </div>
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Konversiya</span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={90} 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#4B5563', fontSize: 11, fontWeight: 700 }}
            />
            <Tooltip 
              cursor={{ fill: '#F9FAFB', radius: 10 }}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`rgba(236, 72, 153, ${1 - index * 0.15})`} 
                />
              ))}
              <LabelList dataKey="count" position="right" style={{ fill: '#111827', fontWeight: 900, fontSize: 11 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-pink-50 flex items-center justify-center">
               <Users className="w-3.5 h-3.5 text-pink-500" />
            </div>
            <span className="text-[11px] font-bold text-gray-600">Jami kelgan lidlar</span>
         </div>
         <span className="text-[13px] font-black text-gray-900">
           {chartData.reduce((acc, curr) => acc + curr.count, 0)} nafar
         </span>
      </div>
    </Card>
  );
};
