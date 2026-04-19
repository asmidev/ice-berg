import { Wallet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PaySalaryFormData, Cashbox } from '@/types/finance';

interface PaySalaryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PaySalaryFormData;
  setFormData: (data: PaySalaryFormData) => void;
  cashboxes: Cashbox[];
  onSubmit: () => void;
  submitting: boolean;
}

export function PaySalaryModal({ 
  isOpen, onOpenChange, formData, setFormData, 
  cashboxes, onSubmit, submitting 
}: PaySalaryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-md rounded-[16px] p-8 border-none shadow-2xl bg-white focus:outline-none">
          <DialogHeader className="items-center text-center space-y-3 mb-6">
             <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center text-teal-500 mb-2 shadow-inner"><Wallet size={36} /></div>
             <DialogTitle className="text-[28px] font-black text-[#1E3A5F] tracking-tight">Tasdiqlash</DialogTitle>
             <DialogDescription className="text-[14px] font-bold text-zinc-400">Ish haqini to'lash usulini tanlang</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
             <div className="space-y-2">
                <Label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-2">Kassani tanlang</Label>
                <Select value={formData.cashbox_id} onValueChange={(v) => setFormData({...formData, cashbox_id: v})}>
                   <SelectTrigger className="h-12 px-4 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold focus:ring-1 focus:ring-blue-100 transition-all shadow-sm"><SelectValue placeholder="..." /></SelectTrigger>
                   <SelectContent className="rounded-2xl border-zinc-100 shadow-xl">
                      {cashboxes.map((c: Cashbox) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({Number(c.balance).toLocaleString()} so'm)
                        </SelectItem>
                      ))}
                   </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <Label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-2">To'lov usuli</Label>
                <Select value={formData.method} onValueChange={(v: any) => setFormData({...formData, method: v})}>
                   <SelectTrigger className="h-12 px-4 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold focus:ring-1 focus:ring-blue-100 transition-all shadow-sm"><SelectValue /></SelectTrigger>
                   <SelectContent className="rounded-2xl border-zinc-100 shadow-xl">
                      <SelectItem value="CASH">Naqd pul orqali</SelectItem>
                      <SelectItem value="CARD">Plastik karta orqali</SelectItem>
                      <SelectItem value="TRANSFER">Bank o'tkazmasi</SelectItem>
                   </SelectContent>
                </Select>
             </div>
          </div>

          <DialogFooter className="mt-4 flex gap-3">
             <Button variant="outline" className="h-12 rounded-[8px] font-bold text-[14px] flex-1 border-gray-200 text-gray-400 hover:bg-gray-50 transition-all font-bold" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
             <Button 
               className="h-12 rounded-[8px] font-bold text-[14px] bg-[#1E3A5F] hover:bg-black flex-1 text-white border-none shadow-lg shadow-blue-100 transition-all" 
               onClick={onSubmit} 
               disabled={submitting}
             >
               Ha, to'lash
             </Button>
          </DialogFooter>
       </DialogContent>
    </Dialog>
  );
}
