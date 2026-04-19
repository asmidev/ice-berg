'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock } from "lucide-react";
import api from "@/lib/api";

interface CalendarProps {
  staffId: string;
  name: string;
  type: 'staff' | 'teacher';
  onDateClick?: (date: Date) => void;
}

export const AttendanceCalendarVIP = ({ staffId, name, type, onDateClick }: CalendarProps) => {
  const [date, setDate] = useState(new Date());
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper to get days in month
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(date.getFullYear(), date.getMonth());
  const firstDay = getFirstDayOfMonth(date.getFullYear(), date.getMonth());

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => i); // Start from Monday

  const monthNames = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
  ];

  useEffect(() => {
    if (!staffId) return;
    fetchMonthlyData();
  }, [staffId, date.getMonth(), date.getFullYear(), type]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/staff-attendance/monthly?type=${type}&person_id=${staffId}&year=${date.getFullYear()}&month=${date.getMonth() + 1}`);
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const safeRecords = Array.isArray(records) ? records : [];
  
  const getStatusForDay = (day: number) => {
    const targetDateStr = new Date(Date.UTC(date.getFullYear(), date.getMonth(), day)).toISOString().split('T')[0];
    const record = safeRecords.find(r => r.date.startsWith(targetDateStr));
    return record ? record.status : 'NONE';
  };

  const stats = {
    present: safeRecords.filter(r => r.status === 'PRESENT').length,
    late: safeRecords.filter(r => r.status === 'LATE').length,
    absent: safeRecords.filter(r => r.status === 'ABSENT').length,
  };

  return (
    <Card className="border-none shadow-xl shadow-zinc-200/40 bg-white rounded-xl overflow-hidden h-full">
      <CardHeader className="border-b border-zinc-50 bg-zinc-50/50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-pink-500 shadow-sm">
                <CalendarIcon className="w-5 h-5" />
             </div>
             <div>
                <CardTitle className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none mb-1">Davomat Tarixi</CardTitle>
                <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">{name}</p>
             </div>
          </div>
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-zinc-200">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-zinc-50 text-zinc-400" onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-[11px] font-black uppercase tracking-widest px-2 text-zinc-600">
              {monthNames[date.getMonth()]} {date.getFullYear()}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-zinc-50 text-zinc-400" onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"].map(d => (
            <div key={d} className="text-center text-[10px] font-black text-zinc-300 uppercase py-2 tracking-widest">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map(i => <div key={`empty-${i}`} className="aspect-square" />)}
          {days.map(day => {
            const status = getStatusForDay(day);
            
            let bgClass = "bg-white hover:border-zinc-200";
            let textClass = status === 'NONE' ? "text-zinc-400" : "text-zinc-600";
            
            if (status === 'PRESENT') {
              bgClass = "bg-emerald-50 border-emerald-100";
              textClass = "text-emerald-600";
            } else if (status === 'LATE') {
              bgClass = "bg-amber-50 border-amber-100";
              textClass = "text-amber-600";
            } else if (status === 'ABSENT') {
              bgClass = "bg-[#1e3a5f]/5 border-[#1e3a5f]/10";
              textClass = "text-[#1e3a5f]";
            }
            
            return (
              <div 
                key={day} 
                onClick={() => onDateClick?.(new Date(date.getFullYear(), date.getMonth(), day))}
                className={`aspect-square rounded-xl border border-zinc-50 flex flex-col items-center justify-center relative cursor-pointer hover:shadow-md transition-all group ${bgClass}`}
              >
                <span className={`text-[11px] font-black ${textClass}`}>{day}</span>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 pt-6 border-t border-zinc-50 grid grid-cols-3 gap-2">
           <div className="flex flex-col items-start p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Keldi</span>
              <span className="text-sm font-black text-emerald-600">{stats.present}</span>
           </div>
           <div className="flex flex-col items-start p-3 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Kechikdi</span>
              <span className="text-sm font-black text-amber-600">{stats.late}</span>
           </div>
           <div className="flex flex-col items-start p-3 bg-[#1e3a5f]/5 rounded-xl border border-[#1e3a5f]/10">
              <span className="text-[10px] font-black text-[#1e3a5f] uppercase tracking-widest mb-1">Kelmadi</span>
              <span className="text-sm font-black text-[#1e3a5f]">{stats.absent}</span>
           </div>
        </div>
      </CardContent>
    </Card>
  );
};
