"use client";

import React from 'react';
import { MoreVertical, Edit2, Trash2, Archive, ExternalLink, UserCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRouter } from 'next/navigation';

interface TeacherTableProps {
  teachers: any[];
  loading: boolean;
  onEdit: (t: any) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

export const TeacherTable = ({ teachers, loading, onEdit, onDelete, onArchive }: TeacherTableProps) => {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden flex-1 relative flex flex-col mt-2">
      <div className="overflow-x-auto w-full custom-scrollbar min-h-[500px]">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-zinc-50/50 border-b border-zinc-100/80">
              <th className="py-4 pl-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest w-20">T/R</th>
              <th className="py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">USTOZ NOMI</th>
              <th className="py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">TELEFON RAQAM</th>
              <th className="py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">FILIAL</th>
              <th className="py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">ISH HAQI (TURI)</th>
              <th className="py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">XONA / GURUH</th>
              <th className="py-4 pr-6 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest w-16 invisible">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100/50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="py-10 text-center animate-pulse text-zinc-300 font-medium">Yuklanmoqda...</td></tr>
              ))
            ) : teachers.length === 0 ? (
              <tr><td colSpan={7} className="py-20 text-center text-zinc-400 font-medium">O'qituvchilar topilmadi</td></tr>
            ) : teachers.map((teacher, idx) => {
              const totalGroups = (teacher.taughtGroups?.length || 0) + (teacher.supportedGroups?.length || 0);
              return (
                <tr key={teacher.id} className="group hover:bg-zinc-50/50 transition-all duration-200">
                  <td className="pl-6 py-4">
                    <span className="text-xs font-bold text-zinc-400">{(idx + 1).toString().padStart(2, '0')}.</span>
                  </td>
                  <td className="py-4">
                    <div 
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => router.push(`/teachers/${teacher.id}`)}
                    >
                      <div className="w-9 h-9 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold overflow-hidden border border-cyan-200">
                        {teacher.user?.photo_url ? (
                          <img src={teacher.user.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          teacher.user?.first_name?.[0]
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[13px] text-zinc-800 group-hover:text-cyan-600 transition-colors">
                          {teacher.user?.first_name} {teacher.user?.last_name}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-semibold">{teacher.specialization || 'Umumiy ustoz'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-[12px] font-medium text-zinc-600 tracking-tight">{teacher.user?.phone}</span>
                  </td>
                  <td className="py-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {teacher.branch?.name || 'Filialsiz'}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-zinc-700">{Number(teacher.salary_amount).toLocaleString()} UZS</span>
                      <span className="text-[10px] text-cyan-600 font-black tracking-widest uppercase">{teacher.salary_type}</span>
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-zinc-100 text-zinc-600 border border-zinc-200 shadow-sm">
                      {totalGroups} GURUH
                    </span>
                  </td>
                  <td className="py-4 pr-6 text-right">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all active:scale-95 border border-transparent hover:border-zinc-200">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-44 p-1.5 bg-white rounded-xl shadow-xl border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
                        <button 
                          onClick={() => router.push(`/teachers/${teacher.id}`)}
                          className="w-full text-left px-3 py-2 text-[12px] font-bold text-zinc-600 hover:bg-cyan-50 hover:text-cyan-700 flex items-center justify-between rounded-lg transition-colors group"
                        >
                          Profilni ko'rish <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                        </button>
                        <button 
                          onClick={() => onEdit(teacher)}
                          className="w-full text-left px-3 py-2 text-[12px] font-bold text-zinc-600 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between rounded-lg transition-colors group"
                        >
                          Tahrirlash <Edit2 className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                        </button>
                        <div className="h-px bg-zinc-100 my-1 mx-2" />
                        <button 
                          onClick={() => onArchive(teacher.id)}
                          className="w-full text-left px-3 py-2 text-[12px] font-bold text-amber-600 hover:bg-amber-50 flex items-center justify-between rounded-lg transition-colors group"
                        >
                          Arxivlash <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => onDelete(teacher.id)}
                          className="w-full text-left px-3 py-2 text-[12px] font-bold text-rose-500 hover:bg-rose-50 flex items-center justify-between rounded-lg transition-colors group"
                        >
                          O'chirish <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </PopoverContent>
                    </Popover>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
