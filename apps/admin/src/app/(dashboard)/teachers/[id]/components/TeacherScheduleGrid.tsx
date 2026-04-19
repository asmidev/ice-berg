"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { CalendarRange } from 'lucide-react';

interface ScheduleProps {
  taughtGroups: any[];
  supportedGroups: any[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const TeacherScheduleGrid = ({ taughtGroups = [], supportedGroups = [] }: ScheduleProps) => {
  const allGroups = [...taughtGroups, ...supportedGroups];

  return (
    <Card className="p-6 rounded-[2rem] border-zinc-100 shadow-xl shadow-zinc-200/50 bg-white">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-black text-navy-800 uppercase tracking-widest flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-indigo-600" /> Haftalik Jadval
        </h3>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 px-3 py-1 rounded-full">
           {allGroups.length} Guruh
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day, i) => {
          const dayId = i + 1; // Assuming 1-Mon, 7-Sun
          const dayClasses = allGroups.flatMap(g => 
            g.schedules
              .filter((s: any) => s.day_of_week === (dayId === 7 ? 0 : dayId))
              .map((s: any) => ({ ...s, groupName: g.name }))
          ).sort((a,b) => a.start_time.localeCompare(b.start_time));

          return (
            <div key={day} className="flex flex-col gap-2 min-h-[220px]">
              <div className="text-center py-2 bg-zinc-50 rounded-xl">
                 <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{day}</span>
              </div>
              <div className="flex flex-col gap-2">
                {dayClasses.map((cls, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100/50 hover:bg-white hover:shadow-md transition-all group">
                    <p className="text-[10px] font-black text-indigo-700 leading-tight mb-1 group-hover:text-indigo-900 line-clamp-2 uppercase">
                      {cls.groupName}
                    </p>
                    <p className="text-[9px] font-bold text-zinc-400">{cls.start_time}</p>
                  </div>
                ))}
                {dayClasses.length === 0 && (
                  <div className="h-20 border-2 border-dashed border-zinc-100 rounded-xl" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
