"use client";

import React from 'react';
import { 
  MoreHorizontal, User, Archive, Trash2, Key, Edit, 
  ChevronLeft, ChevronRight, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StudentTableProps {
  students: any[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalStudents: number;
  onPageChange: (p: number) => void;
  onAction: (type: string, student: any) => void;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students, loading, page, totalPages, totalStudents,
  onPageChange, onAction, selectedIds, toggleSelect, toggleSelectAll,
  activeDropdown, setActiveDropdown
}) => {
  return (
    <div className="bg-white rounded-[12px] border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-zinc-100">
              <th className="py-4 pl-6 w-12">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-zinc-300 text-pink-500 focus:ring-pink-500 cursor-pointer"
                  checked={selectedIds.length === students.length && students.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="py-4 px-4 text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">ID</th>
              <th className="py-4 px-4 text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Talaba</th>
              <th className="py-4 px-4 text-[12px] font-semibold text-zinc-500 uppercase tracking-wider text-right">Balans</th>
              <th className="py-4 px-4 text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Guruhlar</th>
              <th className="py-4 px-4 text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-[12px] font-semibold text-zinc-500 uppercase tracking-wider text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="py-6 px-6"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                </tr>
              ))
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-20 text-center text-zinc-400 font-medium">Talabalar topilmadi</td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 pl-6">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-zinc-300 text-pink-500 focus:ring-pink-500 cursor-pointer"
                      checked={selectedIds.includes(student.id)}
                      onChange={() => toggleSelect(student.id)}
                    />
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-[13px] font-medium text-blue-600">
                      S-{student.id.slice(-4).toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-[12px]">
                        {student.user?.first_name?.[0]}{student.user?.last_name?.[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-zinc-800 leading-tight">
                          {student.user?.first_name} {student.user?.last_name}
                        </span>
                        <span className="text-[12px] text-zinc-500">{student.user?.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className={`text-[13px] font-bold ${student.balance < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {student.balance?.toLocaleString()} UZS
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {student.enrollments?.length > 0 ? (
                        student.enrollments.slice(0, 2).map((enr: any) => (
                          <span key={enr.id} className="inline-flex px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase border border-blue-100">
                            {enr.group?.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-zinc-400">Guruhsiz</span>
                      )}
                      {student.enrollments?.length > 2 && (
                        <span className="text-[10px] text-zinc-400 font-bold">+{student.enrollments.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider
                      ${student.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 
                        student.status === 'DEBTOR' ? 'bg-red-50 text-red-600' : 
                        'bg-zinc-100 text-zinc-500'}
                    `}>
                      {student.status === 'ACTIVE' ? 'Aktiv' : student.status === 'DEBTOR' ? 'Qarzdor' : student.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right relative">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => window.location.href = `/students/${student.id}?branch_id=${new URLSearchParams(window.location.search).get('branch_id') || 'all'}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-pink-50 hover:text-pink-500 transition-colors"
                        title="Profilni ko'rish"
                      >
                        <User className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === student.id ? null : student.id);
                          }}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${activeDropdown === student.id ? 'bg-pink-50 text-pink-500' : 'text-zinc-400 hover:bg-zinc-100'}`}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        
                        <AnimatePresence>
                          {activeDropdown === student.id && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-zinc-100 py-1.5 z-[100]"
                            >
                              <button onClick={() => onAction('edit', student)} className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
                                <Edit className="w-4 h-4 text-blue-500" /> Tahrirlash
                              </button>
                              <button onClick={() => onAction('archive', student)} className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
                                <Archive className="w-4 h-4 text-amber-500" /> Arxivlash
                              </button>
                              <button onClick={() => onAction('password', student)} className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
                                <Key className="w-4 h-4 text-indigo-500" /> Parol yangilash
                              </button>
                              <div className="h-px bg-zinc-100 my-1" />
                              <button onClick={() => onAction('delete', student)} className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors">
                                <Trash2 className="w-4 h-4" /> O'chirish
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Container */}
      <div className="px-6 py-4 bg-gray-50/30 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-[13px] text-zinc-500">
          Ko'rsatilyapti <span className="font-bold text-zinc-700">{(page - 1) * 20 + 1}</span> dan <span className="font-bold text-zinc-700">{Math.min(page * 20, totalStudents)}</span> gacha, jami <span className="font-bold text-zinc-700">{totalStudents}</span> natija
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center bg-white rounded-xl border border-zinc-200 p-1 shadow-sm">
             {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
               const p = i + 1;
               return (
                 <button
                   key={p}
                   onClick={() => onPageChange(p)}
                   className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === p ? 'bg-pink-500 text-white shadow-pink-200 shadow-lg' : 'text-zinc-600 hover:bg-zinc-50'}`}
                 >
                   {p}
                 </button>
               )
             })}
             {totalPages > 5 && <span className="px-2 text-zinc-400">...</span>}
          </div>

          <button 
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 transition-all shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
