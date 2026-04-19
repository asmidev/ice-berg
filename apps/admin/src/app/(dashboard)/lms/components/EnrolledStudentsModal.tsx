"use client";

import { useState, useEffect } from 'react';
import { X, Users, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';
import api from '@/lib/api';

interface EnrolledStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: any;
  onSuccess: () => void;
}

export function EnrolledStudentsModal({
  isOpen,
  onClose,
  group,
  onSuccess
}: EnrolledStudentsModalProps) {
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && group?.id) {
       fetchEnrollments();
    }
  }, [isOpen, group]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      // `getGroupAttendance` endpoitidan barcha aktiv o'quvchilarni olamiz
      const res = await api.get(`/lms/groups/${group.id}/attendance`);
      const groupData = res.data?.data || res.data;
      setEnrollments(groupData?.enrollments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (enrollmentId: string) => {
    const isConfirmed = await confirm({
      title: "O'quvchini o'chirish",
      message: "Haqiqatan ham bu talabani guruhdan o'chirmoqchimisiz?",
      type: "danger"
    });
    if (!isConfirmed) return;
    
    setSubmitting(enrollmentId);
    try {
      await api.delete(`/lms/enrollments/${enrollmentId}/unenroll`);
      setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
      onSuccess();
    } catch (e) {
      console.error(e);
      toast.error("Xatolik yuz berdi");
    } finally {
      setSubmitting(null);
    }
  };

  if (!group) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 rounded-2xl bg-white border-none shadow-2xl overflow-hidden focus:outline-none">
        <DialogHeader className="p-8 pb-4 flex flex-row justify-between items-center bg-indigo-50/50 border-b border-indigo-100">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-bold">
                 <Users size={24} />
              </div>
              <div>
                 <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
                    Guruh O'quvchilari
                 </DialogTitle>
                 <p className="text-sm font-medium text-indigo-400 mt-1">
                    "{group.name}" guruhidagi faol o'quvchilar ({enrollments.length} ta)
                 </p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-indigo-100 rounded-xl text-indigo-400 transition-all">
              <X size={20} />
           </button>
        </DialogHeader>

        <div className="p-8 space-y-6">
           <div className="max-h-[350px] overflow-y-auto custom-scrollbar border border-gray-100 rounded-2xl relative">
              {loading ? (
                <div className="p-20 flex flex-col items-center justify-center space-y-4">
                   <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                   <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Yuklanmoqda...</p>
                </div>
              ) : enrollments.length > 0 ? (
                 <div className="divide-y divide-gray-50">
                    {enrollments.map(enrollment => {
                       const student = enrollment.student;
                       return (
                          <div key={enrollment.id} className="flex items-center justify-between p-4 hover:bg-indigo-50/30 transition-all">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all bg-indigo-50 text-indigo-600">
                                   {student?.user?.first_name?.[0]}{student?.user?.last_name?.[0]}
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-sm font-bold text-gray-800">{student?.user?.first_name} {student?.user?.last_name}</span>
                                   <span className="text-xs font-medium text-gray-400">{student?.user?.phone}</span>
                                </div>
                             </div>
                             <Button 
                                variant="ghost" 
                                size="sm" 
                                disabled={submitting === enrollment.id}
                                onClick={() => handleUnenroll(enrollment.id)}
                                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg p-2 flex items-center gap-2 font-bold"
                             >
                                {submitting === enrollment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                O'chirish
                             </Button>
                          </div>
                       );
                    })}
                 </div>
              ) : (
                <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
                   <AlertCircle className="w-12 h-12 text-gray-200" />
                   <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Guruhda o'quvchilar yo'q</p>
                </div>
              )}
           </div>
        </div>

        <DialogFooter className="p-8 pt-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
           <Button 
              variant="outline" 
              onClick={onClose}
              className="h-11 px-8 rounded-xl font-bold text-gray-600 border-none bg-white hover:bg-gray-100 transition-all"
           >
              Yopish
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
