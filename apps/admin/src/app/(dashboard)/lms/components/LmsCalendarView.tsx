"use client";

import { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  X, 
  Calendar as CalendarIcon,
  BookOpen,
  Users,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LmsCalendarViewProps {
  groups: any[];
  isLoading: boolean;
}

export function LmsCalendarView({ groups, isLoading }: LmsCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 12)); // Default to April 2026 for demo
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'Day' | 'Week' | 'Month'>('Month');

  // Helper stats for navigation
  const monthNames = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
  ];
  
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // --- Calculations ---

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    if (viewMode === 'Month') {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDay = firstDay.getDay();
      
      const calendarDays = [];
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = startingDay - 1; i >= 0; i--) {
        calendarDays.push({ day: prevMonthLastDay - i, month: month - 1, year, isCurrentMonth: false });
      }
      for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push({ day: i, month, year, isCurrentMonth: true });
      }
      const remainingSlots = 42 - calendarDays.length;
      for (let i = 1; i <= remainingSlots; i++) {
          calendarDays.push({ day: i, month: month + 1, year, isCurrentMonth: false });
      }
      return calendarDays;
    } else if (viewMode === 'Week') {
      const current = new Date(currentDate);
      const first = current.getDate() - current.getDay();
      const week = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(current.setDate(first + i));
        week.push({ day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), isCurrentMonth: d.getMonth() === month });
      }
      return week;
    } else {
      return [{ day: currentDate.getDate(), month: currentDate.getMonth(), year: currentDate.getFullYear(), isCurrentMonth: true }];
    }
  }, [currentDate, viewMode]);

  const eventsByDay = useMemo(() => {
    const map: Record<string, any[]> = {};
    groups.forEach(group => {
      group.schedules?.forEach((schedule: any) => {
        const dayOfWeek = schedule.day_of_week; 
        map[dayOfWeek] = map[dayOfWeek] || [];
        map[dayOfWeek].push({
          id: `${group.id}-${schedule.id}`,
          groupName: group.name,
          courseName: group.course?.name,
          startTime: schedule.start_time,
          endTime: schedule.end_time,
          roomName: schedule.room?.name,
          teacherName: `${group.teacher?.user?.first_name || ''} ${group.teacher?.user?.last_name || ''}`,
          type: group.is_online ? 'online' : 'academic',
          studentsCount: group._count?.enrollments || 0
        });
      });
    });
    return map;
  }, [groups]);

  // --- Handlers ---

  const handleNext = () => {
    if (viewMode === 'Month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === 'Week') {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(currentDate.getDate() + 7);
      setCurrentDate(nextWeek);
    } else {
      const nextDay = new Date(currentDate);
      nextDay.setDate(currentDate.getDate() + 1);
      setCurrentDate(nextDay);
    }
  };

  const handlePrev = () => {
    if (viewMode === 'Month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'Week') {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(currentDate.getDate() - 7);
      setCurrentDate(prevWeek);
    } else {
      const prevDay = new Date(currentDate);
      prevDay.setDate(currentDate.getDate() - 1);
      setCurrentDate(prevDay);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20 bg-white rounded-2xl border border-gray-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-280px)] gap-6">
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">
              {viewMode === 'Day' ? `${currentDate.getDate()}-avgust, ` : ''}
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg p-1">
              <button onClick={handlePrev} className="p-1 hover:bg-white hover:shadow-sm rounded transition-all">
                <ChevronLeft size={18} className="text-gray-500" />
              </button>
              <button onClick={handleNext} className="p-1 hover:bg-white hover:shadow-sm rounded transition-all">
                <ChevronRight size={18} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-lg">
            {['Day', 'Week', 'Month'].map(view => (
              <button 
                key={view}
                onClick={() => setViewMode(view as any)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  view === viewMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Header */}
        <div className={`grid ${viewMode === 'Day' ? 'grid-cols-1' : 'grid-cols-7'} border-b border-gray-100 bg-gray-50/50`}>
          {viewMode === 'Day' ? (
             <div className="py-3 text-center text-[11px] font-bold text-gray-400 border-r border-gray-100/50">TIMELINE</div>
          ) : (
            daysShort.map(day => (
              <div key={day} className="py-3 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider border-r last:border-r-0 border-gray-100/50">
                {day}
              </div>
            ))
          )}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className={`grid ${viewMode === 'Day' ? 'grid-cols-1' : 'grid-cols-7'} h-full min-h-[400px]`}>
            {calendarData.map((data, idx) => {
              const dayIndex = viewMode === 'Month' ? (idx % 7) : (viewMode === 'Week' ? idx : currentDate.getDay());
              const dayEvents = data.isCurrentMonth || viewMode !== 'Month' ? (eventsByDay[dayIndex.toString()] || []) : [];
              
              return (
                <div 
                  key={idx} 
                  className={`min-h-[120px] border-b border-r border-gray-50 p-2 transition-colors ${
                    !data.isCurrentMonth && viewMode === 'Month' ? 'bg-gray-50/30' : 'hover:bg-gray-50/10'
                  } ${idx % 7 === 6 || viewMode === 'Day' ? 'border-r-0' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold ${
                      data.isCurrentMonth || viewMode !== 'Month' ? 'text-gray-900' : 'text-gray-300'
                    }`}>
                      {data.day}
                    </span>
                    {viewMode === 'Day' && <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{daysShort[dayIndex]}</span>}
                  </div>
                  <div className={`${viewMode === 'Day' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-1'}`}>
                    {dayEvents.map((event: any) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setSelectedEvent(event)}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold truncate cursor-pointer transition-all hover:shadow-md border-l-4 ${
                          event.type === 'online' 
                          ? 'bg-cyan-50 text-cyan-700 border-cyan-500 hover:bg-cyan-100' 
                          : 'bg-pink-50 text-pink-700 border-pink-500 hover:bg-pink-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                           <span>{event.startTime}</span>
                           <Clock size={10} className="opacity-40" />
                        </div>
                        <div className="truncate">{event.groupName}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side Panel: Schedule Details */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-80 bg-white rounded-2xl border border-gray-200 shadow-lg flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Ma'lumotlar</h3>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className={`p-4 rounded-xl space-y-4 border-l-4 ${
                selectedEvent.type === 'online' ? 'bg-cyan-50 border-cyan-500' : 'bg-pink-50 border-pink-500'
              }`}>
                <div className="space-y-1">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    selectedEvent.type === 'online' ? 'bg-cyan-100 text-cyan-700' : 'bg-pink-100 text-pink-700'
                  }`}>
                    {selectedEvent.type}
                  </span>
                  <h4 className="text-lg font-bold text-gray-900 leading-tight">
                    {selectedEvent.groupName}
                  </h4>
                  <p className="text-xs text-gray-500 italic">{selectedEvent.courseName}</p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <CalendarIcon size={16} className="text-gray-400" />
                    <span>Dushanba, Aprel 13, 2026</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <Clock size={16} className="text-gray-400" />
                    <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{selectedEvent.roomName || 'Xona tayinlanmagan'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <Users size={16} className="text-gray-400" />
                    <span>{selectedEvent.studentsCount} O'quvchi</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">O'qituvchi</p>
                   <p className="text-sm font-bold text-gray-800">{selectedEvent.teacherName}</p>
                </div>
              </div>

              <div className="space-y-3">
                 <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Eslatmalar</h5>
                 <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-600 leading-relaxed italic">
                    Guruh darslari har dushanba, chorshanba va juma kunlari bo'lib o'tadi. Bugungi dars o'quv jarayonining 12-bosqichi hisoblanadi.
                 </div>
              </div>
            </div>

            <div className="p-6 pt-2 bg-gray-50/50 border-t border-gray-100 flex gap-2">
               <button className="flex-1 h-10 rounded-xl bg-pink-500 text-white text-xs font-bold shadow-lg shadow-pink-100 hover:bg-pink-600 transition-all">
                 Davomatni ochish
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!selectedEvent && (
        <div className="w-80 flex flex-col items-center justify-center text-center p-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
           <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-gray-300" />
           </div>
           <h4 className="text-sm font-bold text-gray-600 mb-1">Darsni tanlang</h4>
           <p className="text-[11px] text-gray-400">Tafsilotlarni ko'rish uchun tanlagan kuningizdagi darsga bosing.</p>
        </div>
      )}
    </div>
  );
}
