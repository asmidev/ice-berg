"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp, MessageSquare, Award } from 'lucide-react';

interface PerformanceProps {
  performance: any;
  feedbacks: any[];
}

export const TeacherPerformance = ({ performance, feedbacks }: PerformanceProps) => {
  const metrics = [
    { 
      label: "Jadvallarni to'ldirish", 
      value: performance?.grading_timeliness || 0, 
      color: "bg-cyan-500", 
      icon: <TrendingUp className="w-3.5 h-3.5" /> 
    },
    { 
      label: "Oila/Talaba Davomati", 
      value: performance?.attendance_rate || 0, 
      color: "bg-indigo-500", 
      icon: <Award className="w-3.5 h-3.5" /> 
    },
    { 
      label: "Talabalar O'rtacha Bahosi", 
      value: performance?.avg_grade || 0, 
      color: "bg-purple-500", 
      icon: <Star className="w-3.5 h-3.5" /> 
    }
  ];

  return (
    <Card className="p-6 rounded-[2rem] border-zinc-100 shadow-xl shadow-zinc-200/50 bg-white">
      <h3 className="text-sm font-black text-navy-800 uppercase tracking-widest flex items-center gap-2 mb-8">
        <TrendingUp className="w-4 h-4 text-emerald-500" /> Ish Samaradorligi (KPI)
      </h3>

      <div className="space-y-6">
        {metrics.map((m, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                {m.icon} {m.label}
              </span>
              <span className="text-xs font-black text-navy-800">{m.value}%</span>
            </div>
            <Progress value={m.value} className="h-2 rounded-full bg-zinc-100" />
          </div>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-zinc-100/80">
        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-4">
          <MessageSquare className="w-3.5 h-3.5 text-orange-500" /> Ota-ona va Talaba Feedbacki
        </h4>
        
        {feedbacks.length === 0 ? (
          <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 text-center">
             <p className="text-[11px] font-bold text-orange-700 uppercase tracking-widest">Hozircha fikrlar mavjud emas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {feedbacks.slice(0, 2).map((f, i) => (
              <div key={i} className="p-3 bg-zinc-50 rounded-xl">
                 <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-700">
                      {f.student?.user?.first_name?.[0]}
                    </div>
                    <span className="text-[11px] font-black text-zinc-700">{f.student?.user?.first_name}</span>
                    <span className="ml-auto text-[9px] font-bold text-orange-500">★ {f.rating}</span>
                 </div>
                 <p className="text-[11px] text-zinc-500 italic leading-snug">"{f.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
