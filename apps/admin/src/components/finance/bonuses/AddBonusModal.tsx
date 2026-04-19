import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AddBonusFormData, Employee, Cashbox, BonusSource } from '@/types/finance';

interface AddBonusModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: AddBonusFormData;
  setFormData: (data: AddBonusFormData) => void;
  teachers: Employee[];
  staff: Employee[];
  cashboxes: Cashbox[];
  sources: BonusSource[];
  onSubmit: () => void;
  submitting: boolean;
}

export function AddBonusModal({ 
  isOpen, onOpenChange, formData, setFormData, 
  teachers, staff, cashboxes, sources, onSubmit, submitting 
}: AddBonusModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-xl rounded-[16px] p-8 border-none shadow-2xl bg-white focus:outline-none overflow-y-auto max-h-[90vh] custom-scrollbar">
          <DialogHeader className="items-center text-center space-y-3 mb-6">
             <div className="w-20 h-20 bg-pink-50/50 rounded-full flex items-center justify-center text-[#EC4899] mb-2 transition-transform hover:scale-110">
                <Plus size={36} strokeWidth={2.5} />
             </div>
             <DialogTitle className="text-[26px] font-black text-[#1E3A5F] tracking-tight">Bonus yozish</DialogTitle>
             <DialogDescription className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Yangi rag'batlantirish yozuvini yarating</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-5 py-2">
             <div className="col-span-1 space-y-2">
                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Xodim turi</Label>
                <Select value={formData.employee_type} onValueChange={(v: any) => setFormData({...formData, employee_type: v, employee_id: ''})}>
                   <SelectTrigger className="h-11 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold focus:ring-1 focus:ring-pink-100 transition-all shadow-sm"><SelectValue /></SelectTrigger>
                   <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                      <SelectItem value="TEACHER">O'qituvchi</SelectItem>
                      <SelectItem value="STAFF">Xodim</SelectItem>
                   </SelectContent>
                </Select>
             </div>
             <div className="col-span-1 space-y-2">
                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Xodim</Label>
                <Select value={formData.employee_id} onValueChange={(v) => setFormData({...formData, employee_id: v})}>
                   <SelectTrigger className="h-11 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold focus:ring-1 focus:ring-pink-100 transition-all shadow-sm"><SelectValue placeholder="Tanlang..." /></SelectTrigger>
                   <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                      {(formData.employee_type === 'TEACHER' ? teachers : staff).map((e: Employee) => (
                        <SelectItem key={e.id} value={e.id}>
                           {e.user?.first_name || ''} {e.user?.last_name || ''} 
                           {!e.user?.first_name && `(ID: ${e.id.substring(0,6)})`}
                        </SelectItem>
                      ))}
                   </SelectContent>
                </Select>
             </div>
             <div className="col-span-1 space-y-2">
                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Summa</Label>
                <Input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="h-11 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold focus:ring-1 focus:ring-pink-100 transition-all shadow-sm text-[15px]" placeholder="0" />
             </div>
             <div className="col-span-1 space-y-2">
                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Manba (Turi)</Label>
                <Select value={formData.source_id} onValueChange={(v) => setFormData({...formData, source_id: v})}>
                   <SelectTrigger className="h-11 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold focus:ring-1 focus:ring-pink-100 transition-all shadow-sm"><SelectValue placeholder="Tanlang..." /></SelectTrigger>
                   <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                      {sources.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                   </SelectContent>
                </Select>
             </div>
             <div className="col-span-1 space-y-2">
                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Kassa (Chiqim)</Label>
                <Select value={formData.cashbox_id} onValueChange={(v) => setFormData({...formData, cashbox_id: v})}>
                   <SelectTrigger className="h-11 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold focus:ring-1 focus:ring-pink-100 transition-all shadow-sm"><SelectValue placeholder="Kassani tanlang" /></SelectTrigger>
                   <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                      {cashboxes.map((c: Cashbox) => (
                        <SelectItem key={c.id} value={c.id}>
                           {c.name} ({Number(c.balance).toLocaleString()} so'm)
                        </SelectItem>
                      ))}
                   </SelectContent>
                </Select>
             </div>
             <div className="col-span-1 space-y-2">
                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">To'lov usuli</Label>
                <Select value={formData.method} onValueChange={(v: any) => setFormData({...formData, method: v})}>
                   <SelectTrigger className="h-11 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold focus:ring-1 focus:ring-pink-100 transition-all shadow-sm"><SelectValue /></SelectTrigger>
                   <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                      <SelectItem value="CASH">Naqd pul</SelectItem>
                      <SelectItem value="CARD">Plastik karta</SelectItem>
                      <SelectItem value="TRANSFER">O'tkazma</SelectItem>
                   </SelectContent>
                </Select>
             </div>
             <div className="col-span-2 space-y-2">
                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Mukofot sababi (Izoh)</Label>
                <Input value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="h-11 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold focus:ring-1 focus:ring-pink-100 transition-all shadow-sm" placeholder="..." />
             </div>
          </div>

          <DialogFooter className="mt-8 flex gap-3">
             <Button variant="outline" className="h-12 rounded-[8px] font-bold text-[14px] flex-1 border-gray-200 text-gray-400 hover:bg-gray-50 transition-all font-bold" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
             <Button 
               className="h-12 rounded-[8px] font-bold text-[14px] bg-[#EC4899] hover:bg-pink-600 flex-1 text-white border-none shadow-lg shadow-pink-100 transition-all" 
               onClick={onSubmit} 
               disabled={submitting}
             >
               Saqlash
             </Button>
          </DialogFooter>
       </DialogContent>
    </Dialog>
  );
}
