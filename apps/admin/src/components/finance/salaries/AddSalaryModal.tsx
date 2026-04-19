import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AddSalaryFormData, Employee } from '@/types/finance';

interface AddSalaryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: AddSalaryFormData;
  setFormData: (data: AddSalaryFormData) => void;
  teachers: Employee[];
  staff: Employee[];
  onSubmit: () => void;
  submitting: boolean;
}

export function AddSalaryModal({ 
  isOpen, onOpenChange, formData, setFormData, 
  teachers, staff, onSubmit, submitting 
}: AddSalaryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-2xl rounded-[16px] p-8 border-none shadow-2xl bg-white overflow-y-auto max-h-[90vh] custom-scrollbar focus:outline-none">
          <DialogHeader className="items-center text-center space-y-3 mb-6">
             <div className="w-20 h-20 bg-pink-50/50 rounded-full flex items-center justify-center text-pink-500 mb-2 transition-transform hover:scale-110">
                <Plus size={36} strokeWidth={2.5} />
             </div>
             <DialogTitle className="text-[28px] font-black text-[#1E3A5F] tracking-tight">Ish haqi qo'shish</DialogTitle>
             <DialogDescription className="text-[14px] font-bold text-gray-400">Yangi ish haqi yozuvini kiriting va hisoblang</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 py-4">
             <div className="col-span-1 space-y-2">
                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Xodim turi</Label>
                <Select value={formData.employee_type} onValueChange={(v: any) => setFormData({...formData, employee_type: v, employee_id: ''})}>
                   <SelectTrigger className="h-12 px-4 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold focus:ring-1 focus:ring-pink-100 transition-all shadow-sm"><SelectValue /></SelectTrigger>
                   <SelectContent className="rounded-2xl border-zinc-100 shadow-xl">
                      <SelectItem value="TEACHER">O'qituvchi</SelectItem>
                      <SelectItem value="STAFF">Boshqa xodim</SelectItem>
                   </SelectContent>
                </Select>
             </div>
             <div className="col-span-1 space-y-2">
                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Xodimni tanlang</Label>
                <Select value={formData.employee_id} onValueChange={(v: any) => setFormData({...formData, employee_id: v})}>
                   <SelectTrigger className="h-12 px-4 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold focus:ring-1 focus:ring-pink-100 transition-all shadow-sm"><SelectValue placeholder="..." /></SelectTrigger>
                   <SelectContent className="rounded-2xl border-zinc-100 shadow-xl">
                      {(formData.employee_type === 'TEACHER' ? teachers : staff).map((e: Employee) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.user?.first_name || ''} {e.user?.last_name || ''} 
                          {!e.user?.first_name && !e.user?.last_name && `(ID: ${e.id.substring(0,8)})`}
                        </SelectItem>
                      ))}
                   </SelectContent>
                </Select>
             </div>
             <div className="col-span-1 space-y-2">
                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Asosiy Maosh</Label>
                <Input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="h-12 px-4 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold focus:ring-1 focus:ring-pink-100 transition-all shadow-sm text-[16px]" placeholder="0" />
             </div>
             <div className="col-span-1 space-y-2">
                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Jarima</Label>
                <Input type="number" value={formData.deduction} onChange={e => setFormData({...formData, deduction: e.target.value})} className="h-12 px-4 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold focus:ring-1 focus:ring-pink-100 transition-all shadow-sm text-[16px] text-rose-500" placeholder="0" />
             </div>
             <div className="col-span-2 space-y-2">
                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Qaysi oy uchun (Mas: 2026-04)</Label>
                <Input value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} className="h-12 px-4 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold focus:ring-1 focus:ring-pink-100 transition-all shadow-sm text-[14px]" placeholder="YYYY-MM" />
             </div>
             <div className="col-span-2 space-y-2">
                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Maosh turi</Label>
                <Select value={formData.type} onValueChange={(v: any) => setFormData({...formData, type: v})}>
                   <SelectTrigger className="h-12 px-4 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold focus:ring-1 focus:ring-pink-100 transition-all shadow-sm"><SelectValue /></SelectTrigger>
                   <SelectContent className="rounded-2xl border-zinc-100 shadow-xl">
                      <SelectItem value="FIXED">Oylik (Fixed)</SelectItem>
                      <SelectItem value="KPI">KPI / Komissiya foizi bo'yicha</SelectItem>
                      <SelectItem value="HOURLY">Soatbay uslubda</SelectItem>
                   </SelectContent>
                </Select>
             </div>
             <div className="col-span-2 space-y-2">
                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Izoh (ixtiyoriy)</Label>
                <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="h-12 px-4 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold focus:ring-1 focus:ring-pink-100 transition-all shadow-sm" placeholder="..." />
             </div>
          </div>

          <DialogFooter className="mt-6 flex gap-3">
             <Button variant="outline" className="h-12 rounded-[8px] font-bold text-[14px] flex-1 border-gray-200 text-gray-400 hover:bg-gray-50 transition-all" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
             <Button className="h-12 rounded-[8px] font-bold text-[14px] bg-[#EC4899] hover:bg-pink-600 flex-1 text-white border-none shadow-lg shadow-pink-100 transition-all" onClick={onSubmit} disabled={submitting}>Saqlash</Button>
          </DialogFooter>
       </DialogContent>
    </Dialog>
  );
}
