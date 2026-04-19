"use client";

import { X, Clock, MapPin, Calendar as CalendarIcon, Users, BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

interface GroupCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: any;
}

export function GroupCalendarModal({ isOpen, onClose, group }: GroupCalendarModalProps) {
  if (!group) return null;

  const daysOfWeek = [
    "Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 rounded-2xl bg-white border-none shadow-2xl overflow-hidden focus:outline-none">
        <DialogHeader className="p-8 pb-4 flex flex-row justify-between items-center bg-gray-50/50 border-b border-gray-100">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600">
                 <CalendarIcon size={24} />
              </div>
              <div>
                 <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
                    {group.name} - Dars Jadvali
                 </DialogTitle>
                 <p className="text-sm font-medium text-gray-400 mt-1">
                    Haftalik dars soatlari va xona ma'lumotlari
                 </p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-all">
              <X size={20} />
           </button>
        </DialogHeader>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Left side: Basic schedule info */}
           <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                 <div className="flex items-center gap-3">
                    <BookOpen size={18} className="text-pink-500" />
                    <span className="text-sm font-bold text-gray-700">{group.course?.name}</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <Users size={16} className="text-gray-400" />
                    <span>{group._count?.enrollments || 0} / {group.capacity} O'quvchilar</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{group.room?.name || 'Xona tayinlanmagan'}</span>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">O'qituvchilar</h4>
                 <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                       <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center text-pink-600 font-bold text-xs uppercase">
                          {group.teacher?.user?.first_name?.[0]}{group.teacher?.user?.last_name?.[0]}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-800">{group.teacher?.user?.first_name} {group.teacher?.user?.last_name}</span>
                          <span className="text-[10px] text-gray-400">Asosiy Ustoz</span>
                       </div>
                    </div>
                    {group.support_teacher && (
                       <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                          <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center text-cyan-600 font-bold text-xs uppercase">
                             {group.support_teacher?.user?.first_name?.[0]}{group.support_teacher?.user?.last_name?.[0]}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-xs font-bold text-gray-800">{group.support_teacher?.user?.first_name} {group.support_teacher?.user?.last_name}</span>
                             <span className="text-[10px] text-gray-400">Assistent</span>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Right side: Visual weekly grid */}
           <div className="space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Haftalik Taqvim</h4>
              <div className="space-y-2">
                 {[1, 2, 3, 4, 5, 6, 0].map(dayNum => {
                    const schedule = group.schedules?.find((s: any) => s.day_of_week === dayNum);
                    return (
                       <div 
                        key={dayNum} 
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          schedule 
                          ? 'bg-pink-50 border-pink-100 scale-[1.02] shadow-sm' 
                          : 'bg-white border-gray-50 opacity-50'
                        }`}
                       >
                          <span className={`text-xs font-bold ${schedule ? 'text-pink-700' : 'text-gray-400'}`}>
                             {daysOfWeek[dayNum]}
                          </span>
                          {schedule ? (
                             <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-2 py-1 bg-white rounded-lg shadow-sm border border-pink-100">
                                   <Clock size={12} className="text-pink-500" />
                                   <span className="text-[10px] font-black text-pink-700">{schedule.start_time} - {schedule.end_time}</span>
                                </div>
                             </div>
                          ) : (
                             <span className="text-[10px] font-bold text-gray-300 italic">Dars yo'q</span>
                          )}
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>

        <div className="p-8 pt-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
           <Button 
            onClick={onClose}
            className="h-11 px-8 rounded-xl font-bold bg-navy-800 hover:bg-navy-900 text-white shadow-lg transition-all"
           >
              Tushunarli
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
