"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { MoreHorizontal } from 'lucide-react';

const data = [
  { name: 'Science', value: 19, percent: 22, color: '#1E3A5F' },
  { name: 'Mathematics', value: 17, percent: 20, color: '#06B6D4' },
  { name: 'Language', value: 15, percent: 18, color: '#E0F7FA' },
  { name: 'Social', value: 13, percent: 15, color: '#F3E8FF' },
  { name: 'Arts', value: 11, percent: 13, color: '#FCE7F3' },
  { name: 'Physical Education', value: 11, percent: 12, color: '#F1F5F9' },
];

interface DepartmentStatsProps {
  data?: any[];
  total?: number;
}

const COLORS = [
  '#1E3A5F', // Science
  '#06B6D4', // Math
  '#A5F3FC', // Language
  '#C4B5FD', // Social
  '#FBCFE8', // Arts
  '#F0FDF4', // Light green
  '#FFFBEB', // Light yellow
  '#F1F5F9', // PE
];

export const DepartmentStats = ({ data = [], total = 0 }: DepartmentStatsProps) => {
  // If no data from API, show a placeholder or handle it
  const displayData = data.length > 0 ? data : [
    { name: "Ma'lumot yo'q", value: 1, percent: 0 }
  ];

  return (
    <Card className="p-6 rounded-md border border-zinc-100 shadow-sm bg-white h-full min-h-[440px] flex flex-col">
      <div className="flex items-center justify-between mb-0">
        <h3 className="text-sm font-black text-[#1E3A5F] uppercase tracking-widest">Yo'nalishlar</h3>
        <button className="text-zinc-400 hover:text-zinc-600 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="h-[220px] w-full relative flex items-center justify-center mt-[-20px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="75%"
              startAngle={180}
              endAngle={0}
              innerRadius={70}
              outerRadius={105}
              paddingAngle={data.length > 1 ? 4 : 0}
              dataKey="value"
              stroke="none"
            >
              {displayData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  className="outline-none" 
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-[48%] left-1/2 -translate-x-1/2 text-center">
           <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Jami</p>
           <p className="text-3xl font-black text-[#1E3A5F]">{total}</p>
        </div>
      </div>

      <div className="mt-auto space-y-3.5 pb-2">
        {displayData.map((item, i) => (
          <div key={i} className="flex items-center justify-between group cursor-default">
            <div className="flex items-center gap-3">
              <div 
                className="w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125" 
                style={{ backgroundColor: COLORS[i % COLORS.length] }} 
              />
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-[#1E3A5F] transition-colors truncate max-w-[150px]">
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-[11px] font-black text-[#1E3A5F]">{item.value}</span>
               <div className="w-10 text-right">
                  <span className="text-[11px] font-bold text-zinc-400">{item.percent}%</span>
               </div>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-[10px] text-center text-zinc-300 italic pt-4">Ma'lumotlar mavjud emas</p>
        )}
      </div>
    </Card>
  );
};
