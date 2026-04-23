"use client";

import React from 'react';
import { Search, Filter, ChevronDown, Plus } from 'lucide-react';

interface TeacherFiltersProps {
  search: string;
  setSearch: (v: string) => void;
  onAdd: () => void;
  onImport?: () => void;
  onExport?: () => void;
  startDate?: string;
  setStartDate?: (v: string) => void;
  endDate?: string;
  setEndDate?: (v: string) => void;
}

export const TeacherFilters = ({ 
  search, setSearch, onAdd, onImport, onExport,
  startDate, setStartDate, endDate, setEndDate
}: TeacherFiltersProps) => {
  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* Top Title & Breadcrumb */}
      <div className="flex items-center justify-between">
         <div className="flex-1"></div>
      </div>

      {/* Main Action Bar */}
      <div className="flex items-center justify-between">
         <h2 className="text-lg font-black text-[#1E3A5F]">O'qituvchilar</h2>

         <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-cyan-600 transition-colors" />
               <input 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 type="text" 
                 placeholder="O'qituvchi izlash" 
                 className="h-10 w-[300px] pl-11 pr-4 bg-white border border-zinc-100 rounded-xl text-xs font-bold text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all shadow-sm"
               />
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-2">
               <input 
                 type="date" 
                 value={startDate}
                 onChange={(e) => setStartDate?.(e.target.value)}
                 className="h-10 px-3 bg-white border border-zinc-100 rounded-xl text-[11px] font-bold text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all shadow-sm"
               />
               <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Gacha</span>
               <input 
                 type="date" 
                 value={endDate}
                 onChange={(e) => setEndDate?.(e.target.value)}
                 className="h-10 px-3 bg-white border border-zinc-100 rounded-xl text-[11px] font-bold text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all shadow-sm"
               />
            </div>

            {/* Import Button */}
            {onImport && (
               <button 
                 onClick={onImport}
                 className="h-10 px-6 bg-white text-zinc-600 border border-zinc-100 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-zinc-50 transition-all shadow-sm active:scale-95"
               >
                  Excel Import
               </button>
            )}

            {/* Export Button */}
            {onExport && (
               <button 
                 onClick={onExport}
                 className="h-10 px-6 bg-white text-zinc-600 border border-zinc-100 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-zinc-50 transition-all shadow-sm active:scale-95"
               >
                  Eksport
               </button>
            )}

            {/* Add Button */}
            <button 
              onClick={onAdd}
              className="h-10 px-6 bg-[#F3E8FF] text-[#9333EA] rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#E9D5FF] transition-all border border-[#E9D5FF]/50 shadow-sm active:scale-95 ml-2"
            >
               <Plus className="w-4 h-4" /> O'qituvchi qo'shish
            </button>
         </div>
      </div>
    </div>
  );
};
