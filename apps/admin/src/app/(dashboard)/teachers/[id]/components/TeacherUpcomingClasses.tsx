"use client";

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Clock, MapPin, Users, ChevronRight } from 'lucide-react';

interface UpcomingProps {
  upcoming: any[];
}

export const TeacherUpcomingClasses = ({ upcoming }: UpcomingProps) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const getCountdown = (startTime: string) => {
    const [h, m] = startTime.split(':').map(Number);
    const startMins = h * 60 + m;
    const currMins = now.getHours() * 60 + now.getMinutes();
    const diff = startMins - currMins;
    
    if (diff < 0) return "Dars boshlangan";
    if (diff > 60) return `${Math.floor(diff / 60)} soat ${diff % 60} daqiqa`;
    return `${diff} daqiqa qoldi`;
  };

  return (
    <Card className="p-6 rounded-md border-zinc-100 shadow-xl shadow-zinc-200/50 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-navy-800 uppercase tracking-widest flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-600" /> Keyingi Darslar
        </h3>
        <button className="text-[10px] font-bold text-cyan-600 hover:text-cyan-700 uppercase tracking-widest bg-cyan-50 px-3 py-1 rounded-full flex items-center gap-1 group">
          Hammasi <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="space-y-3">
        {upcoming.length === 0 ? (
          <div className="py-8 text-center text-zinc-400">
             <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
             <p className="text-[11px] font-bold uppercase tracking-widest">Bugun boshqa dars yo'q</p>
          </div>
        ) : upcoming.map((cls, i) => (
          <div key={i} className="group p-4 rounded-md bg-zinc-50 border border-zinc-100/50 hover:bg-white hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-100/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-white bg-cyan-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                {cls.groupName || 'Guruh'}
              </span>
              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                {getCountdown(cls.start_time)}
              </span>
            </div>
            <h4 className="text-zinc-800 font-bold text-sm mb-2 group-hover:text-cyan-700 transition-colors">
              {cls.groupName} - {cls.start_time}
            </h4>
            <div className="flex items-center gap-4 text-[11px] text-zinc-400 font-semibold uppercase tracking-widest">
               <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-cyan-500" /> {cls.roomName}</span>
               <span className="flex items-center gap-1.5"><Users className="w-3 h-3 text-cyan-500" /> 12 talaba</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
