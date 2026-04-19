"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Settings2, User, MoreHorizontal, Phone, Mail } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface TeacherGridProps {
  teachers: any[];
  loading: boolean;
  onEdit: (t: any) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

export const TeacherGrid = ({ teachers, loading, onEdit }: TeacherGridProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch_id') || 'all';

  const navigateToProfile = (id: string) => {
    router.push(`/teachers/${id}?branch_id=${branchId}`);
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1,2,3,4,5,6,7,8].map(i => (
        <div key={i} className="h-[280px] bg-zinc-100 rounded-md" />
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
      {teachers.map((teacher, i) => (
        <Card key={teacher.id} className="p-6 border border-zinc-100 shadow-sm bg-white hover:shadow-xl transition-all duration-300 group relative flex flex-col rounded-md">
          {/* Header Action */}
          <button className="absolute top-4 right-4 text-zinc-300 hover:text-zinc-600">
             <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {/* Top Profile Info */}
          <div className="flex items-center gap-4 mb-6">
             <div 
               onClick={() => navigateToProfile(teacher.id)}
               className="w-12 h-12 rounded-full bg-pink-50 border border-pink-100 overflow-hidden cursor-pointer active:scale-95 transition-transform shrink-0 flex items-center justify-center pt-2"
             >
                {teacher.user?.photo_url ? (
                   <img src={teacher.user.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-lg font-black text-pink-500">
                      {teacher.user?.first_name?.[0]}
                   </div>
                )}
             </div>
             <div className="min-w-0">
                <h3 
                  onClick={() => navigateToProfile(teacher.id)}
                  className="font-black text-[#1E3A5F] group-hover:text-[#06B6D4] transition-colors cursor-pointer leading-tight mb-0.5 truncate text-[16px]"
                >
                  {teacher.user?.first_name} {teacher.user?.last_name}
                </h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                   T-{1000 + (i + 1)} · <span className="normal-case">{teacher.specialization || 'English Language'}</span>
                </p>
             </div>
          </div>

          {/* Unified Contact Block (from design) */}
          <div className="bg-zinc-50 rounded-xl p-4 space-y-3 mb-6">
             <div className="flex items-center gap-3">
                <Phone className="w-3.5 h-3.5 text-zinc-300" />
                <span className="text-[11px] font-bold text-zinc-500 tracking-tight">{teacher.user?.phone}</span>
             </div>
             <div className="flex items-center gap-3 border-t border-zinc-200/50 pt-2.5">
                <Mail className="w-3.5 h-3.5 text-zinc-300" />
                <span className="text-[11px] font-bold text-zinc-500 truncate tracking-tight">
                   {teacher.user?.email || `teacher_${teacher.id.slice(0,4)}@iceburg.uz`}
                </span>
             </div>
          </div>

          {/* Bottom Actions Row */}
          <div className="flex items-center justify-between mt-auto">
             <div>
                <button 
                  onClick={() => onEdit(teacher)}
                  className="w-10 h-9 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-cyan-600 hover:border-cyan-200 transition-all group/btn active:scale-95"
                  title="Tahrirlash"
                >
                   <Settings2 className="w-4 h-4 group-hover/btn:rotate-45 transition-transform" />
                </button>
             </div>
             
             <button 
               onClick={() => navigateToProfile(teacher.id)}
               className="h-9 px-5 bg-[#1E3A5F] text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#2a4a75] transition-all active:scale-95 shadow-md shadow-blue-900/10"
             >
                <User className="w-3.5 h-3.5" /> Profil
             </button>
          </div>
        </Card>
      ))}
    </div>
  );
};
