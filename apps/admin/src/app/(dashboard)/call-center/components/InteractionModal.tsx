"use client";

import { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Calendar, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface InteractionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: any;
  taskType: 'DEBTOR' | 'NEW_LEAD' | 'ABSENTEE' | 'LEAD';
  onSuccess: () => void;
}

export default function InteractionModal({ isOpen, onOpenChange, student, taskType, onSuccess }: InteractionModalProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    note: '',
    nextCallAt: '',
    promisedDate: '',
    status: 'CALLED'
  });

  const handleSubmit = async () => {
    if (!form.note) return;
    setSubmitting(true);
    try {
      const payload: any = {
        taskId: student.callCenterTasks?.[0]?.id,
        branchId: student.branch_id,
        type: taskType,
        note: form.note,
        nextCallAt: form.nextCallAt,
        promisedDate: form.promisedDate,
        status: form.status
      };

      if (student.isLead) {
        payload.leadId = student.id;
      } else {
        payload.studentId = student.id;
      }

      await api.post('/call-center/interaction', payload);
      
      onSuccess();

      if (form.status === 'RESOLVED') {
        router.push(`/finance/debtors?phone=${student.user?.phone || ''}`);
      }

      onOpenChange(false);
      setForm({ note: '', nextCallAt: '', promisedDate: '', status: 'CALLED' });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[16px] p-0 border-none shadow-[0_20px_60px_rgba(0,0,0,0.18)] bg-white overflow-hidden">
        <DialogHeader className="p-6 pb-0 flex flex-row items-center gap-4 space-y-0">
          <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-[#ec4899]">
            <Phone size={24} />
          </div>
          <div>
            <DialogTitle className="text-[18px] font-semibold text-gray-900">Muloqotni qayd etish</DialogTitle>
            <DialogDescription className="text-[13px] font-medium text-gray-500">
              {student?.user?.first_name} {student?.user?.last_name}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="p-6 grid gap-5">
          <div className="space-y-1.5">
            <Label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Natija / Izoh</Label>
            <textarea 
              value={form.note}
              onChange={e => setForm({...form, note: e.target.value})}
              placeholder="Suhbat natijasini batafsil yozing..."
              className="w-full h-28 rounded-lg bg-gray-50 border border-gray-100 p-4 text-sm font-medium text-gray-700 focus:bg-white focus:border-[#ec4899] focus:ring-4 focus:ring-pink-500/10 transition-all outline-none resize-none placeholder:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Keyingi aloqa vaqti</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  type="datetime-local"
                  value={form.nextCallAt}
                  onChange={e => setForm({...form, nextCallAt: e.target.value})}
                  className="h-10 pl-10 bg-gray-50 border-gray-100 rounded-lg text-[13px] font-medium text-gray-700 focus:bg-white"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">To'lov sanasi (Va'da)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  type="date"
                  value={form.promisedDate}
                  onChange={e => setForm({...form, promisedDate: e.target.value})}
                  className="h-10 pl-10 bg-gray-50 border-gray-100 rounded-lg text-[13px] font-medium text-gray-700 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Holat</Label>
            <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
              <SelectTrigger className="h-10 rounded-lg bg-gray-50 border-gray-100 font-medium text-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="CALLED" className="font-medium">Qo'ng'iroq qilindi</SelectItem>
                <SelectItem value="PENDING" className="font-medium">Kutilmoqda</SelectItem>
                <SelectItem value="RESOLVED" className="font-medium text-emerald-600">Muammo hal qilindi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 flex gap-3 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10 rounded-lg font-semibold border-gray-200 text-gray-600 px-6">
            Bekor qilish
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || !form.note} 
            className="h-10 rounded-lg font-semibold bg-[#ec4899] hover:bg-[#be185d] text-white px-8 transition-all border-none"
          >
            {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
