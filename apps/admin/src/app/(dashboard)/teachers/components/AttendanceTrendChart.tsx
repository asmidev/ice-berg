"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Calendar } from 'lucide-react';

interface Props {
  data: { month: string; rate: number }[];
}

export const AttendanceTrendChart = ({ data = [] }: Props) => {
  const chartData = data.length > 0 ? data : [
    { month: 'Yan', rate: 85 },
    { month: 'Feb', rate: 88 },
    { month: 'Mar', rate: 92 },
    { month: 'Apr', rate: 90 },
    { month: 'May', rate: 94 },
    { month: 'Iyun', rate: 96 },
  ];

  return (
    <Card className="p-6 border-none shadow-2xl shadow-zinc-200/50 bg-white h-full min-h-[340px] rounded-3xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none">
        <Activity className="w-32 h-32 text-rose-600 -rotate-12" />
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm border border-rose-100/50">
              <Activity className="w-6 h-6" />
           </div>
           <div>
              <h3 className="text-[18px] font-black text-zinc-900 tracking-tight leading-none mb-1.5">Davomat Trendi</h3>
              <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-rose-400" />
                Oxirgi 6 oylik ko'rsatkich (%)
              </p>
           </div>
        </div>
      </div>

      <div className="h-[230px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis domain={[0, 100]} hide />
            <Tooltip 
               cursor={{ stroke: '#F43F5E', strokeWidth: 1, strokeDasharray: '4 4' }}
               contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                fontSize: '12px',
                fontWeight: '800',
                padding: '12px 16px'
               }}
               itemStyle={{ color: '#F43F5E' }}
               formatter={(value: any) => [`${value}%`, 'Davomat']}
            />
            <Area 
              type="monotone" 
              dataKey="rate" 
              stroke="#F43F5E" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorRate)" 
              dot={{ r: 4, fill: '#fff', stroke: '#F43F5E', strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
