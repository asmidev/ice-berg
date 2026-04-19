"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Heart } from 'lucide-react';

interface TeacherSatisfactionProps {
  data: { name: string; avgRating: number }[];
}

export const TeacherSatisfaction = ({ data = [] }: TeacherSatisfactionProps) => {
  const chartData = data.length > 0 ? data : [
    { name: 'Rayan Y', avgRating: 4.9 },
    { name: 'Aliyah S', avgRating: 4.7 },
    { name: 'Kelsy T', avgRating: 4.2 },
    { name: 'Zackary S', avgRating: 4.8 },
    { name: 'Javier Q', avgRating: 4.5 },
  ];

  return (
    <Card className="p-6 border border-zinc-100 shadow-xl shadow-zinc-200/20 bg-white h-full min-h-[300px] rounded-xl overflow-hidden relative">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
              <Heart className="w-5 h-5 fill-current" />
           </div>
           <div>
              <h3 className="text-[17px] font-black text-zinc-900 tracking-tight">Qoniqish Darajasi</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">O'quvchilar Bahosi (O'rtacha ⭐)</p>
           </div>
        </div>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -30 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 800 }}
              interval={0}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              domain={[0, 5]}
              hide
            />
            <Tooltip 
               cursor={{ fill: '#f8fafc', radius: 8 }}
               contentStyle={{ 
                 borderRadius: '12px', 
                 border: '1px solid #F1F5F9', 
                 boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                 fontSize: '11px',
                 fontWeight: 'bold'
               }}
            />
            <Bar 
              dataKey="avgRating" 
              radius={[6, 6, 0, 0]} 
              barSize={28}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.avgRating >= 4.5 ? '#F59E0B' : '#FBBF24'} 
                  opacity={entry.avgRating / 5}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
