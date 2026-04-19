"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Edit2, Share2, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  teacher: any;
}

export const TeacherProfileHeader = ({ teacher }: HeaderProps) => {
  const router = useRouter();

  return (
    <div className="flex flex-col mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => router.push('/teachers')}
          className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-navy-800 tracking-tight">
            Ustoz <span className="text-cyan-600">Profilli</span>
          </h1>
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest leading-none mt-1">
            Barcha ma'lumotlar va ish samaradorligi
          </p>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
           <button className="h-10 px-5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-all flex items-center gap-2 shadow-sm">
             <Share2 className="w-3.5 h-3.5" /> Ulashish
           </button>
           <button className="h-10 px-5 bg-navy-800 text-white rounded-xl text-xs font-bold hover:bg-navy-900 transition-all flex items-center gap-2 shadow-lg shadow-navy-100 active:scale-95">
             <Edit2 className="w-3.5 h-3.5" /> Tahrirlash
           </button>
        </div>
      </div>

      <div className="relative h-32 bg-gradient-to-r from-navy-800 to-indigo-900 rounded-[2rem] overflow-hidden shadow-xl mb-[-4rem]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute top-4 right-8 flex gap-3">
           <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-bold text-white uppercase tracking-widest">
             {teacher.specialization || 'Umumiy'}
           </div>
           <div className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-full border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
             Active
           </div>
        </div>
      </div>
    </div>
  );
};
