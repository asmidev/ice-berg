"use client";

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Loader2, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AttendanceMarkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: any;
  onSuccess: () => void;
}

const STATUSES = [
  { value: 'PRESENT', label: 'Keldi', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { value: 'ABSENT', label: 'Kelmadi', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  { value: 'LATE', label: 'Kechikdi', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
];

export function AttendanceMarkingModal({ isOpen, onClose, group, onSuccess }: AttendanceMarkingModalProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [gradingSystem, setGradingSystem] = useState<any>(null);

  useEffect(() => {
    if (isOpen && group?.branch_id) {
      fetchGradingSettings();
    }
  }, [isOpen, group]);

  useEffect(() => {
    if (isOpen && group) {
      fetchAttendanceDetails();
    }
  }, [isOpen, group, date]);

  const fetchGradingSettings = async () => {
    try {
      const res = await api.get(`/lms/grading-settings?branch_id=${group.branch_id}`);
      setGradingSystem(res.data?.settings || { method: '10-ball' });
    } catch (e) {
      console.error('Grading settings fetch error:', e);
    }
  };

  const fetchAttendanceDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/group-details`, {
        params: { groupId: group.id, date }
      });
      // Har bir studentga mavjud bo'lsa bahosini qo'shish
      setStudents(res.data.students?.map((s: any) => ({ ...s, score: s.score || null })) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (enrollmentId: string, status: string) => {
    setStudents(prev => prev.map(s => 
      s.enrollmentId === enrollmentId ? { ...s, status } : s
    ));
  };

  const handleScoreChange = (enrollmentId: string, score: number) => {
    setStudents(prev => prev.map(s => 
      s.enrollmentId === enrollmentId ? { ...s, score } : s
    ));
  };

  const handleMarkAll = (status: string) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const handleSave = async () => {
    // Hammani baholanganini tekshirish
    const unrated = students.filter(s => s.score === null);
    if (unrated.length > 0) {
      toast.error(`Iltimos, barcha o'quvchilarga baxo qo'ying (${unrated.length} ta o'quvchi baholanmagan)`);
      return;
    }

    setSubmitting(true);
    try {
      const records = students
        .map(s => ({ 
          enrollmentId: s.enrollmentId, 
          status: s.status === 'NOT_MARKED' ? 'PRESENT' : s.status, // Agar belgilanmagan bo'lsa ham keldi deb hisoblanadi (bahosi borligi uchun)
          score: s.score 
        }));
      
      await api.post('/attendance/mark', {
        groupId: group.id,
        date,
        records
      });
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Davomatni saqlashda xatolik');
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreRange = () => {
    if (gradingSystem?.method === '5-ball') return [2, 3, 4, 5];
    if (gradingSystem?.method === '10-ball') return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    return Array.from({ length: 20 }, (_, i) => (i + 1) * 5); // 100-ballik uchun 5 lik qadam bilan 20 ta
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-[28px] border-none shadow-2xl">
        <DialogHeader className="p-8 bg-zinc-900 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
             <CalendarIcon className="w-6 h-6 text-emerald-400" />
             Davomatni Qayd Etish
          </DialogTitle>
          <p className="text-zinc-400 text-sm mt-2 font-medium">
            {group?.name} • {new Date(date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', weekday: 'long' })}
          </p>
        </DialogHeader>

        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar bg-white">
          <div className="flex items-center justify-between gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
             <div className="space-y-1">
                <Label className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Dars Sanasi</Label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent border-none font-bold text-zinc-900 focus:ring-0 p-0 block w-full outline-none"
                />
             </div>
             <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleMarkAll('PRESENT')}
                  className="rounded-xl border-zinc-200 text-[11px] font-bold text-emerald-600 hover:bg-emerald-50"
                >
                  Hammani Keldi qilish
                </Button>
             </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-zinc-400 font-bold text-sm tracking-widest uppercase">Yuklanmoqda...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {students.map((student) => (
                <div key={student.enrollmentId} className="flex flex-col p-6 rounded-3xl border border-zinc-100 hover:border-emerald-100 hover:bg-emerald-50/10 transition-all group gap-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-600 font-black text-sm group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                          {student.name.charAt(0)}
                       </div>
                       <div className="flex flex-col">
                         <span className="font-black text-zinc-900 uppercase tracking-tight text-sm">
                            {student.name}
                         </span>
                         <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">O'quvchi</span>
                       </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-zinc-50 p-1 rounded-2xl border border-zinc-100 shadow-inner">
                      {STATUSES.map((status) => (
                        <button
                          key={status.value}
                          onClick={() => handleStatusChange(student.enrollmentId, status.value)}
                          title={status.label}
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                            student.status === status.value 
                              ? `${status.bg} ${status.color} shadow-sm border ${status.border}` 
                              : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                          )}
                        >
                          <status.icon className="w-5 h-5" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                        Darsdagi Faollik Bahosi
                        {student.score && <Badge className="bg-emerald-500 text-white border-0 text-[9px] font-black px-1.5 h-4 ml-1">BELGILANDI</Badge>}
                      </Label>
                      <span className="text-[10px] font-black text-zinc-900">{student.score || 0} ball</span>
                    </div>
                    
                    <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide py-1">
                      {getScoreRange().map((scoreValue) => (
                        <button
                          key={scoreValue}
                          onClick={() => handleScoreChange(student.enrollmentId, scoreValue)}
                          className={cn(
                            "min-w-[42px] h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all border shrink-0",
                            student.score === scoreValue
                              ? "bg-zinc-900 text-white border-zinc-900 shadow-lg shadow-zinc-200 scale-110 z-10"
                              : "bg-white text-zinc-500 border-zinc-100 hover:border-zinc-300 hover:text-zinc-900"
                          )}
                        >
                          {scoreValue}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {students.length === 0 && (
                <div className="text-center py-10 text-zinc-400 font-medium bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                  Ushbu guruhda faol o'quvchilar yo'q.
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-8 bg-zinc-50 border-t border-zinc-100">
          <Button variant="ghost" onClick={onClose} disabled={submitting} className="rounded-2xl font-bold text-zinc-500">
            Bekor qilish
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={submitting || loading || students.length === 0}
            className="rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black px-10 shadow-xl shadow-zinc-200"
          >
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Saqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
