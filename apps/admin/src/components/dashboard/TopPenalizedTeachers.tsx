"use client";

import React from 'react';
import { Trophy, TrendingDown, UserX } from 'lucide-react';

interface TopTeacher {
  name: string;
  count: number;
  totalAmount: number;
}

interface TopPenalizedTeachersProps {
  teachers: TopTeacher[];
}

export const TopPenalizedTeachers: React.FC<TopPenalizedTeachersProps> = ({ teachers }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 leading-tight">Eng Ko'p Jarima</h3>
            <p className="text-sm text-zinc-500 font-medium tracking-tight uppercase tracking-wider text-[10px]">O'qituvchilar Reytingi</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {teachers.length > 0 ? (
          teachers.map((t, idx) => (
            <div 
              key={idx} 
              className="relative flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-transparent hover:border-orange-100 hover:bg-white transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black
                  ${idx === 0 ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 
                    idx === 1 ? 'bg-zinc-800 text-white' : 
                    'bg-zinc-200 text-zinc-600'}`}
                >
                  #{idx + 1}
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">{t.name}</h4>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t.count} ta jarima</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-red-500 font-black text-sm">
                  <TrendingDown className="w-3 h-3" />
                  {(t.totalAmount || 0).toLocaleString()}
                </div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Umumiy Chegirma</div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-400 space-y-3 opacity-60">
             <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center">
                <UserX className="w-8 h-8 text-zinc-300" />
             </div>
             <p className="text-sm font-bold tracking-tight">Reyting mavjud emas</p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-orange-50/50 rounded-2xl border border-dashed border-orange-200">
         <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest text-center leading-relaxed">
            Eslatma: Jarimalar avtomatik ravishda dars tugaganidan keyin davomat qilinmasa yoziladi.
         </p>
      </div>
    </div>
  );
};
