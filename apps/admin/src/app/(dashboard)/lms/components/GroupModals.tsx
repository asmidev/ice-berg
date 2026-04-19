"use client";

import { useEffect, useState } from 'react';
import { 
  X, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Info,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MoneyInput } from "@/components/ui/money-input";

interface GroupModalsProps {
  isOpen: boolean;
  onClose: () => void;
  isEditMode: boolean;
  groupData: any;
  setGroupData: (data: any) => void;
  onSave: () => void;
  isSubmitting: boolean;
  courses: any[];
  teachers: any[];
  rooms: any[];
}

export function GroupModals({
  isOpen,
  onClose,
  isEditMode,
  groupData,
  setGroupData,
  onSave,
  isSubmitting,
  courses,
  teachers,
  rooms
}: GroupModalsProps) {
  
  const daysOfWeek = [
    { id: 1, name: "Dushanba" },
    { id: 2, name: "Seshanba" },
    { id: 3, name: "Chorshanba" },
    { id: 4, name: "Payshanba" },
    { id: 5, name: "Juma" },
    { id: 6, name: "Shanba" },
    { id: 0, name: "Yakshanba" }
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[1100px] w-[95vw] md:max-h-[90vh] p-0 rounded-2xl bg-white border-none shadow-2xl overflow-hidden focus:outline-none flex flex-col">
          <DialogHeader className="p-8 pb-4 flex flex-row justify-between items-center bg-gray-50/50 border-b border-gray-100 shrink-0">
             <div>
                <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
                  {isEditMode ? 'Guruh ma\'lumotlarini yangilash' : 'Yangi guruh yaratish'}
                </DialogTitle>
                <DialogDescription className="text-sm font-medium text-gray-400 mt-1">
                  Guruhning barcha akademik va moliyaviy ma'lumotlarini shu yerdan boshqaring.
                </DialogDescription>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-all">
                <X size={20} />
             </button>
          </DialogHeader>
          
          <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
             {/* Section 1: Basic Info */}
             <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
                   <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Asosiy Ma'lumotlar</h4>
                </div>
                <div className="grid grid-cols-3 gap-6">
                   <div className="col-span-2 space-y-2">
                      <Label className="text-xs font-bold text-gray-600 ml-1">Guruh nomi <span className="text-pink-500">*</span></Label>
                      <Input 
                         placeholder="Masalan: General English - Elementary 101"
                         value={groupData.name}
                         onChange={e => setGroupData({...groupData, name: e.target.value})}
                         className="h-11 bg-white border-gray-200 rounded-xl font-bold text-gray-700 focus:border-pink-500 transition-all shadow-sm"
                      />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-600 ml-1">Kurs turi <span className="text-pink-500">*</span></Label>
                      <Select value={groupData.courseId} onValueChange={id => setGroupData({...groupData, courseId: id})}>
                         <SelectTrigger className="h-11 bg-white border-gray-200 rounded-xl font-bold text-gray-700">
                            <SelectValue placeholder="Kursni tanlang" />
                         </SelectTrigger>
                         <SelectContent>
                            {courses.map(c => <SelectItem key={c.id} value={c.id} className="font-semibold">{c.name}</SelectItem>)}
                         </SelectContent>
                      </Select>
                   </div>
                </div>
  
                <div className="grid grid-cols-3 gap-6">
                   <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-600 ml-1">Narxi (oylik) <span className="text-pink-500">*</span></Label>
                      <MoneyInput 
                         placeholder="0 UZS"
                         value={groupData.price}
                         onChange={val => setGroupData({...groupData, price: val})}
                         className="h-11 bg-white border-gray-200 rounded-xl font-bold text-gray-700 focus:border-pink-500 transition-all shadow-sm"
                      />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-600 ml-1">Sig'imi <span className="text-pink-500">*</span></Label>
                      <div className="relative">
                         <Input 
                            type="number"
                            value={groupData.capacity}
                            onChange={e => setGroupData({...groupData, capacity: parseInt(e.target.value) || 0})}
                            className="h-11 bg-white border-gray-200 rounded-xl font-bold text-gray-700 pl-10"
                         />
                         <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-600 ml-1">Boshlanish sanasi</Label>
                      <Input 
                         type="date"
                         value={groupData.startDate}
                         onChange={e => setGroupData({...groupData, startDate: e.target.value})}
                         className="h-11 bg-white border-gray-200 rounded-xl font-bold text-gray-700"
                      />
                   </div>
                </div>
             </div>
  
  
              {/* Section 2.5: Finance & Payroll */}
              <div className="space-y-4 pt-4 border-t border-gray-50">
                 <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                       <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Moliya va Ish haqi</h4>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-50/50 px-3 py-1.5 rounded-xl border border-amber-100">
                       <Label className="text-[10px] font-black text-amber-600 uppercase tracking-widest cursor-pointer">VIP Guruh</Label>
                       <Switch 
                          checked={groupData.is_vip || false} 
                          onCheckedChange={val => setGroupData({...groupData, is_vip: val})} 
                       />
                    </div>
                 </div>
  
                 <div className="grid grid-cols-2 gap-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                    <div className="space-y-4">
                       <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black bg-pink-500 text-white px-2 py-0.5 rounded-md uppercase">Asosiy Ustoz Oyligi</span>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <Label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Metod</Label>
                             <Select 
                                value={groupData.teacher_salary_type || 'PERCENT_REVENUE'} 
                                onValueChange={val => setGroupData({...groupData, teacher_salary_type: val})}
                             >
                                <SelectTrigger className="h-10 bg-white border-gray-200 rounded-xl font-bold text-gray-700 text-xs shadow-sm">
                                   <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                   <SelectItem value="PERCENT_REVENUE">Tushumdan foiz (%)</SelectItem>
                                   <SelectItem value="FIXED">Fix summa (so'm)</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Qiymat</Label>
                             <Input 
                                type="number"
                                placeholder={groupData.teacher_salary_type === 'FIXED' ? "Summani kiriting" : "% ni kiriting"}
                                value={groupData.teacher_salary_value || ""}
                                onChange={e => setGroupData({...groupData, teacher_salary_value: e.target.value})}
                                className="h-10 bg-white border-gray-200 rounded-xl font-bold text-gray-700 text-xs shadow-sm"
                             />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Haftalik darslari (soni)</Label>
                          <Input 
                             type="number"
                             value={groupData.main_teacher_days || ""}
                             onChange={e => setGroupData({...groupData, main_teacher_days: parseInt(e.target.value) || 0})}
                             className="h-10 bg-white border-gray-200 rounded-xl font-bold text-gray-700 text-xs shadow-sm"
                          />
                       </div>
                    </div>
  
                    {groupData.supportTeacherId && groupData.supportTeacherId !== 'none' && (
                       <div className="space-y-4 border-l border-gray-200 pl-8">
                          <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black bg-cyan-500 text-white px-2 py-0.5 rounded-md uppercase">Yordamchi Ustoz Oyligi</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Metod</Label>
                                <Select 
                                   value={groupData.support_salary_type || 'FIXED'} 
                                   onValueChange={val => setGroupData({...groupData, support_salary_type: val})}
                                >
                                   <SelectTrigger className="h-10 bg-white border-gray-200 rounded-xl font-bold text-gray-700 text-xs shadow-sm">
                                      <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent>
                                      <SelectItem value="PERCENT_REVENUE">Tushumdan foiz (%)</SelectItem>
                                      <SelectItem value="FIXED">Fix summa (so'm)</SelectItem>
                                   </SelectContent>
                                </Select>
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Qiymat</Label>
                                <Input 
                                   type="number"
                                   placeholder={groupData.support_salary_type === 'FIXED' ? "Summani kiriting" : "% ni kiriting"}
                                   value={groupData.support_salary_value || ""}
                                   onChange={e => setGroupData({...groupData, support_salary_value: e.target.value})}
                                   className="h-10 bg-white border-gray-200 rounded-xl font-bold text-gray-700 text-xs shadow-sm"
                                />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Haftalik darslari (soni)</Label>
                             <Input 
                                type="number"
                                value={groupData.support_teacher_days || ""}
                                onChange={e => setGroupData({...groupData, support_teacher_days: parseInt(e.target.value) || 0})}
                                className="h-10 bg-white border-gray-200 rounded-xl font-bold text-gray-700 text-xs shadow-sm"
                             />
                          </div>
                       </div>
                    )}
                 </div>
              </div>
  
              {/* Section 2: Teachers & Room */}
              <div className="space-y-4 pt-4 border-t border-gray-50">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">O'qituvchi va Xona</h4>
                 </div>
                 <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <Label className="text-xs font-bold text-gray-600 ml-1">Asosiy Ustoz</Label>
                       <Select value={groupData.teacherId} onValueChange={id => setGroupData({...groupData, teacherId: id})}>
                          <SelectTrigger className="h-11 bg-white border-gray-200 rounded-xl font-bold text-gray-700">
                             <SelectValue placeholder="O'qituvchini tanlang" />
                          </SelectTrigger>
                          <SelectContent>
                             {teachers.map(t => <SelectItem key={t.id} value={t.id} className="font-semibold">{t.user?.first_name} {t.user?.last_name}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs font-bold text-gray-600 ml-1">Yordamchi Ustoz</Label>
                       <Select value={groupData.supportTeacherId} onValueChange={id => setGroupData({...groupData, supportTeacherId: id})}>
                          <SelectTrigger className="h-11 bg-white border-gray-200 rounded-xl font-bold text-gray-700">
                             <SelectValue placeholder="Tanlash (ixtiyoriy)" />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="none">Yo'q</SelectItem>
                             {teachers.map(t => <SelectItem key={t.id} value={t.id} className="font-semibold">{t.user?.first_name} {t.user?.last_name}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs font-bold text-gray-600 ml-1">Xona</Label>
                       <Select value={groupData.roomId} onValueChange={id => setGroupData({...groupData, roomId: id})}>
                          <SelectTrigger className="h-11 bg-white border-gray-200 rounded-xl font-bold text-gray-700">
                             <SelectValue placeholder="Xonani tanlang" />
                          </SelectTrigger>
                          <SelectContent>
                             {rooms.map(r => <SelectItem key={r.id} value={r.id} className="font-semibold">{r.name} ({r.capacity} o'rin)</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                 </div>
              </div>
  
             {/* Section 3: Schedule Selection (Premium Design) */}
             <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-1.5 h-6 bg-navy-800 rounded-full" />
                   <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Dars Jadvali</h4>
                </div>
                
                <div className="p-6 bg-gray-50 rounded-2xl space-y-6">
                   <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map(day => {
                         const isActive = groupData.selectedDays?.includes(day.id);
                         return (
                            <button
                               key={day.id}
                               onClick={() => {
                                  const newDays = isActive 
                                     ? groupData.selectedDays.filter((d: number) => d !== day.id)
                                     : [...(groupData.selectedDays || []), day.id];
                                  setGroupData({...groupData, selectedDays: newDays});
                               }}
                               className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border-2 ${
                                  isActive 
                                  ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-100' 
                                  : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                               }`}
                            >
                               {day.name}
                            </button>
                         );
                      })}
                   </div>
  
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Boshlanish vaqti</Label>
                         <div className="relative">
                            <Input 
                               type="time" 
                               value={groupData.startTime}
                               onChange={e => setGroupData({...groupData, startTime: e.target.value})}
                               className="h-12 bg-white border-none rounded-xl font-bold text-gray-700 pl-10 shadow-sm"
                            />
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Tugash vaqti</Label>
                         <div className="relative">
                            <Input 
                               type="time" 
                               value={groupData.endTime}
                               onChange={e => setGroupData({...groupData, endTime: e.target.value})}
                               className="h-12 bg-white border-none rounded-xl font-bold text-gray-700 pl-10 shadow-sm"
                            />
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
                         </div>
                      </div>
                   </div>
  
                   <div className="flex items-center gap-4 bg-white/50 p-4 rounded-xl border border-white/80">
                      <Info size={16} className="text-pink-400 shrink-0" />
                      <p className="text-[11px] text-gray-500 font-medium">
                         Dars vaqtlarini belgilashda boshqa guruhlar bilan vaqt to'qnashuvi borligini tizim avtomatik tekshiradi.
                      </p>
                   </div>
                </div>
             </div>
          </div>
  
          <DialogFooter className="p-8 pt-4 bg-gray-50/50 border-t border-gray-100 flex gap-3 sm:justify-end">
             <Button 
                variant="outline" 
                onClick={onClose}
                className="h-11 px-8 rounded-xl font-bold text-gray-400 border-none bg-white hover:bg-gray-100 transition-all text-sm"
             >
                Bekor qilish
             </Button>
             <Button 
                disabled={isSubmitting}
                onClick={onSave}
                className="h-11 px-10 rounded-xl font-bold bg-pink-500 hover:bg-pink-600 text-white shadow-lg shadow-pink-100 transition-all text-sm flex items-center gap-2"
             >
                {isSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}
                <CheckCircle2 size={18} />
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

