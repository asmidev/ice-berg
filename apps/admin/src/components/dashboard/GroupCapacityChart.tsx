import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, Layout, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from '@/lib/api';
import { useSearchParams } from 'next/navigation';

interface GroupCapacityChartProps {
  initialData: Array<{ name: string; capacity: number; current: number; percent: number }>;
}

export const GroupCapacityChart: React.FC<GroupCapacityChartProps> = ({ initialData = [] }) => {
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
      setData(d.capacityData || []);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, [period, branchId]);

  return (
    <Card className={`p-6 bg-white border-none shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl h-[400px] flex flex-col group hover:shadow-xl transition-all duration-500 ${loading ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-[16px] font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase">
            Xonalar bandligi
            <Layout className="w-4 h-4 text-cyan-500" />
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
        <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center">
           <Users className="w-4.5 h-4.5 text-cyan-600" />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-5 overflow-y-auto no-scrollbar py-2">
        {data.map((group, index) => (
          <div key={index} className="flex flex-col gap-1.5 px-1">
            <div className="flex justify-between items-end">
              <span className="text-[13px] font-black text-gray-700 truncate max-w-[150px]">{group.name}</span>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                {group.current} / {group.capacity}
              </span>
            </div>
            <div className="relative pt-1 flex items-center gap-4">
              <Progress 
                value={group.percent} 
                className="h-1.5 rounded-full bg-gray-100 flex-1" 
                // @ts-ignore
                indicatorClassName={group.percent > 90 ? 'bg-red-500' : group.percent > 70 ? 'bg-amber-500' : 'bg-cyan-500'}
              />
              <span className={`text-[11px] font-black min-w-[30px] text-right ${group.percent > 90 ? 'text-red-500' : group.percent > 70 ? 'text-amber-500' : 'text-cyan-500'}`}>
                {group.percent}%
              </span>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 py-10">
             <Layout className="w-10 h-10 opacity-20 mb-2" />
             <p className="text-[12px] font-medium italic">Guruhlar topilmadi</p>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-gray-50/50 rounded-xl border border-gray-100/50 text-center">
         <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-tighter">
            * 90% dan yuqori bandlik guruh to'lganini anglatadi.
         </p>
      </div>
    </Card>
  );
};
