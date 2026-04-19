"use client";

import React from 'react';
import { ShieldAlert, History, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';

interface Penalty {
  teacherName: string;
  groupName: string;
  amount: number;
  date: string;
}

interface PenalizedTeachersTodayProps {
  penalties: Penalty[];
}

export const PenalizedTeachersToday: React.FC<PenalizedTeachersTodayProps> = ({ penalties }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 leading-tight">Bugungi Jarimalar</h3>
            <p className="text-sm text-zinc-500 font-medium tracking-tight uppercase tracking-wider text-[10px]">Kechikkan davomatlar</p>
          </div>
        </div>
        
        <div className="px-3 py-1 bg-red-50 text-red-500 text-xs font-bold rounded-full border border-red-100 uppercase tracking-widest">
          {penalties.length} ta
        </div>
      </div>

      <div className="space-y-4">
        {penalties.length > 0 ? (
          penalties.map((p, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between p-4 bg-zinc-50/50 rounded-2xl border border-transparent hover:border-red-100 hover:bg-white transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-bold text-zinc-400 group-hover:text-red-500 transition-colors shadow-sm">
                  {p.teacherName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm group-hover:text-red-600 transition-colors">{p.teacherName}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-medium text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded-md">{p.groupName}</span>
                    <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                    <span className="text-[11px] font-medium text-zinc-400">
                      {format(new Date(p.date), 'HH:mm', { locale: uz })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-red-500">-{p.amount.toLocaleString()} UZS</div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Jarima</div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-400 space-y-3 opacity-60">
             <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-zinc-300" />
             </div>
             <p className="text-sm font-bold tracking-tight">Bugun jarimalar mavjud emas</p>
          </div>
        )}
      </div>

      <button className="w-full mt-6 py-4 bg-zinc-50 hover:bg-zinc-100 text-zinc-500 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all border border-transparent hover:border-zinc-200">
         Barcha jarimalarni ko'rish
      </button>
    </div>
  );
};
