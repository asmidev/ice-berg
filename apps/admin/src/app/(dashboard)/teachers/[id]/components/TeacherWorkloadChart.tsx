"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

interface WorkloadProps {
  data: any[];
}

export const TeacherWorkloadChart = ({ data }: WorkloadProps) => {
  return (
    <Card className="p-6 rounded-[2rem] border-zinc-100 shadow-xl shadow-zinc-200/50 bg-white min-h-[300px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-black text-navy-800 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4 text-pink-500" /> Ish Yuklamasi
          </h3>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Haftalik dars soatlari</p>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-1.5 min-w-[80px]">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <span className="text-[10px] font-bold text-zinc-500">HAFTALIK</span>
           </div>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} 
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
              labelStyle={{ fontWeight: 800, color: '#1E293B' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#06B6D4" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
