"use client";

import { MoreHorizontal, UserX, Clock, BookOpen } from "lucide-react";

interface Student {
  studentId: string;
  name: string;
  photo?: string;
  group: string;
  time: string | Date;
}

interface AbsentStudentsTodayProps {
  students: Student[];
}

export function AbsentStudentsToday({ students }: AbsentStudentsTodayProps) {
  return (
    <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col gap-8 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[18px] font-black text-gray-900 tracking-tight uppercase">Bugun kelmagan talabalar</h3>
          <p className="text-[12px] font-medium text-gray-400 mt-1">Darsga qatnashmaganlar ro'yxati</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-3 py-1 bg-pink-50 text-pink-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
             {students.length} kishi
           </div>
           <button className="text-gray-300 hover:text-gray-500">
             <MoreHorizontal className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <UserX className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-sm font-bold text-gray-400">Barcha talabalar darsda</p>
          </div>
        ) : (
          students.map((s, i) => (
            <div 
              key={i} 
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl hover:bg-gray-50/80 transition-all border border-transparent hover:border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  {s.photo ? (
                    <img src={s.photo} alt={s.name} className="w-12 h-12 rounded-2xl object-cover shadow-sm bg-gray-100" />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-100 to-pink-50 flex items-center justify-center shadow-sm">
                      <span className="text-pink-600 font-black text-sm">{s.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-black text-gray-800 group-hover:text-pink-600 transition-colors uppercase">{s.name}</span>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <BookOpen size={13} className="text-indigo-400" />
                      <span className="text-[11px] font-bold tracking-wide">{s.group}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 mt-4 sm:mt-0">
                <div className="flex flex-col items-end">
                   <div className="flex items-center gap-1.5 text-gray-400">
                      <Clock size={13} />
                      <span className="text-[10px] font-black uppercase">{new Date(s.time).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                   </div>
                   <span className="text-[9px] font-bold text-red-400 uppercase mt-1">Kelmagan</span>
                </div>
                <button className="p-2 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-gray-100 transition-all opacity-0 group-hover:opacity-100">
                   <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {students.length > 0 && (
        <button className="mt-4 py-4 w-full bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold text-[12px] uppercase tracking-widest rounded-2xl transition-all border border-transparent hover:border-gray-200">
           Barchasini ko'rish
        </button>
      )}
    </div>
  );
}
