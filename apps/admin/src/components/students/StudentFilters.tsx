"use client";

import React from 'react';
import { Search, Plus, Download, X, Settings, List } from 'lucide-react';

interface StudentFiltersProps {
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  groupId: string;
  setGroupId: (v: string) => void;
  courseId: string;
  setCourseId: (v: string) => void;
  onClear: () => void;
  onAdd: () => void;
  onExport: () => void;
  onImport: () => void;
  groups: any[];
  courses: any[];
  totalCount: number;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
}

export const StudentFilters: React.FC<StudentFiltersProps> = ({
  search, setSearch, status, setStatus, groupId, setGroupId, courseId, setCourseId,
  onClear, onAdd, onExport, onImport, groups, courses, totalCount,
  startDate, setStartDate, endDate, setEndDate
}) => {
  return (
    <div className="flex flex-col gap-4 mt-6">
      {/* Top row: Total and Main Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-pink-50 text-pink-600 rounded-full text-[13px] font-bold border border-pink-100 shadow-sm">
            Jami: {totalCount} talaba
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onImport}
            className="flex items-center gap-2 h-10 px-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[13px] font-bold rounded-lg hover:bg-emerald-100 transition-colors shadow-sm"
          >
            <List className="w-4 h-4" /> Import Excel
          </button>
          <button 
            onClick={onExport}
            className="flex items-center gap-2 h-10 px-4 bg-white border border-zinc-200 text-zinc-600 text-[13px] font-bold rounded-lg hover:bg-zinc-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 h-10 px-6 bg-pink-500 text-white text-[13px] font-bold rounded-lg hover:bg-pink-600 transition-all shadow-lg shadow-pink-200 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Talaba Qo'shish
          </button>
        </div>
      </div>

      {/* Bottom row: Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl border border-zinc-100 shadow-sm">
        <div className="relative flex-1 min-w-[280px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Talaba ismi yoki telefon raqami..."
            className="w-full h-10 pl-10 pr-4 bg-gray-50/50 border border-zinc-200 rounded-lg text-[13px] outline-none focus:border-pink-500 focus:bg-white transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="h-6 w-px bg-zinc-200 hidden md:block" />

        <select 
          className="h-10 px-3 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-700 outline-none focus:border-pink-500"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
        >
          <option value="">Barcha Guruhlar</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>

        <select 
          className="h-10 px-3 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-700 outline-none focus:border-pink-500"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        >
          <option value="">Barcha Kurslar</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select 
          className="h-10 px-3 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-700 font-bold outline-none focus:border-pink-500"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Barcha Statuslar</option>
          <option value="ACTIVE">Aktiv</option>
          <option value="DEBTOR">Qarzdorlar</option>
          <option value="FROZEN">Muzlatilgan</option>
        </select>

        <div className="flex items-center gap-2">
           <input 
             type="date" 
             value={startDate}
             onChange={(e) => setStartDate(e.target.value)}
             className="h-10 px-3 bg-white border border-zinc-200 rounded-lg text-[12px] font-medium text-zinc-700 outline-none focus:border-pink-500"
           />
           <span className="text-[10px] font-black text-zinc-300 uppercase">Gacha</span>
           <input 
             type="date" 
             value={endDate}
             onChange={(e) => setEndDate(e.target.value)}
             className="h-10 px-3 bg-white border border-zinc-200 rounded-lg text-[12px] font-medium text-zinc-700 outline-none focus:border-pink-500"
           />
        </div>

        <button 
          onClick={onClear}
          className="ml-auto flex items-center gap-2 px-3 py-2 text-zinc-400 hover:text-zinc-600 transition-colors"
          title="Filtrlarni tozalash"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
