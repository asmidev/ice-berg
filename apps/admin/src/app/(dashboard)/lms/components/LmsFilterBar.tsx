"use client";

import { Search, Plus, Filter, LayoutGrid, Calendar as CalendarIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LmsFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  courseFilter: string;
  onCourseFilterChange: (val: string) => void;
  teacherFilter: string;
  onTeacherFilterChange: (val: string) => void;
  roomFilter: string;
  onRoomFilterChange: (val: string) => void;
  activeView: 'list' | 'calendar';
  onViewChange: (view: 'list' | 'calendar') => void;
  onAddClick: () => void;
  courses: any[];
  teachers: any[];
  rooms: any[];
  onExport: () => void;
}

export function LmsFilterBar({
  search,
  onSearchChange,
  courseFilter,
  onCourseFilterChange,
  teacherFilter,
  onTeacherFilterChange,
  roomFilter,
  onRoomFilterChange,
  activeView,
  onViewChange,
  onAddClick,
  courses,
  teachers,
  rooms,
  onExport
}: LmsFilterBarProps) {
  return (
    <div className="flex flex-col space-y-4 mb-6">
      {/* Top row: Search and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Guruhlarni qidirish..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
            />
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => onViewChange('list')}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeView === 'list' 
                ? 'bg-white text-pink-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid size={14} />
              Ro'yxat
            </button>
            <button
              onClick={() => onViewChange('calendar')}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeView === 'calendar' 
                ? 'bg-white text-pink-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CalendarIcon size={14} />
              Taqvim
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onExport}
            className="flex items-center gap-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50"
          >
            <Download size={16} />
            Export
          </Button>
          <Button
            onClick={onAddClick}
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold text-sm rounded-lg flex items-center gap-2 px-5"
          >
            <Plus size={18} />
            Yangi guruh
          </Button>
        </div>
      </div>

      {/* Bottom row: Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={courseFilter} onValueChange={onCourseFilterChange}>
          <SelectTrigger className="w-[180px] h-9 bg-white border-gray-200 rounded-lg text-xs font-medium text-gray-600">
            <SelectValue placeholder="Barcha kurslar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha kurslar</SelectItem>
            {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={teacherFilter} onValueChange={onTeacherFilterChange}>
          <SelectTrigger className="w-[180px] h-9 bg-white border-gray-200 rounded-lg text-xs font-medium text-gray-600">
            <SelectValue placeholder="Barcha o'qituvchilar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha o'qituvchilar</SelectItem>
            {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.user?.first_name} {t.user?.last_name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={roomFilter} onValueChange={onRoomFilterChange}>
          <SelectTrigger className="w-[160px] h-9 bg-white border-gray-200 rounded-lg text-xs font-medium text-gray-600">
            <SelectValue placeholder="Barcha xonalar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha xonalar</SelectItem>
            {rooms.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Button variant="ghost" className="h-9 px-3 text-xs text-gray-400 hover:text-gray-600" onClick={() => {
          onSearchChange('');
          onCourseFilterChange('all');
          onTeacherFilterChange('all');
          onRoomFilterChange('all');
        }}>
          Filtrlarni tozalash
        </Button>
      </div>
    </div>
  );
}
