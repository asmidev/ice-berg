"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Area, ComposedChart } from 'recharts';
import { Award, TrendingUp } from 'lucide-react';

interface Props {
  data: { name: string; avgGrade: number }[];
}

export const AcademicPerformanceChart = ({ data = [] }: Props) => {
  const chartData = data.length > 0 ? data : [
    { name: 'Ochilova S', avgGrade: 88 },
    { name: 'Karimov A', avgGrade: 92 },
    { name: 'Ibragimov J', avgGrade: 75 },
    { name: 'Sodiqov M', avgGrade: 84 },
    { name: 'Nazarova D', avgGrade: 95 },
  ];

  return (
    <Card className="p-6 border-none shadow-2xl shadow-zinc-200/50 bg-white h-full min-h-[340px] rounded-3xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none">
        <Award className="w-32 h-32 text-indigo-600 rotate-12" />
      </div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
              <Award className="w-6 h-6" />
           </div>
            <div>
              <h3 className="text-[18px] font-black text-zinc-900 tracking-tight leading-none mb-1.5">Akademik Muvaffaqiyat</h3>
              <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                Ustozlar Reytingi (Top 10)
              </p>
           </div>
        </div>
      </div>

      <div className="h-[230px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#818CF8" stopOpacity={0.4}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis domain={[0, 100]} hide />
            <Tooltip 
              cursor={{ fill: '#F8FAFC', radius: 12 }}
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                fontSize: '12px',
                fontWeight: '800',
                padding: '12px 16px'
              }}
              itemStyle={{ color: '#4F46E5' }}
            />
            <Bar 
               dataKey="avgGrade" 
               fill="url(#barGradient)" 
               radius={[8, 8, 8, 8]} 
               barSize={24}
               animationDuration={1500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
