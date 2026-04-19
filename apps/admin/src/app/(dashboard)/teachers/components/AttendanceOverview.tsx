"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Award } from 'lucide-react';

interface AcademicSuccessProps {
  data: { name: string; avgGrade: number }[];
}

export const TeacherAcademicSuccess = ({ data = [] }: AcademicSuccessProps) => {
  // If no data, show a few placeholders for visual consistency
  const chartData = data.length > 0 ? data : [
    { name: 'T-01', avgGrade: 80 },
    { name: 'T-02', avgGrade: 95 },
    { name: 'T-03', avgGrade: 75 },
    { name: 'T-04', avgGrade: 88 },
    { name: 'T-05', avgGrade: 92 },
  ];

  return (
    <Card className="p-6 border border-zinc-100 shadow-xl shadow-zinc-200/20 bg-white h-full min-h-[300px] rounded-xl overflow-hidden relative">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
              <Award className="w-5 h-5" />
           </div>
            <div>
              <h3 className="text-[17px] font-black text-zinc-900 tracking-tight">Akademik O'zlashtirish</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">O'quvchilar O'rtacha Bahosi (0-100)</p>
           </div>
        </div>
      </div>

      <div className="h-[220px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800 }}
              dy={10}
            />
            <YAxis 
               domain={[0, 100]} 
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
               dataKey="avgGrade" 
               fill="url(#colorSuccess)" 
               radius={[6, 6, 0, 0]} 
               barSize={32}
               stroke="#22D3EE"
               strokeWidth={1}
               strokeDasharray="4 2"
            />
            <Line 
              type="monotone" 
              dataKey="avgGrade" 
              stroke="#0891B2" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#0891B2', strokeWidth: 2, stroke: '#fff' }} 
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={2000}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
