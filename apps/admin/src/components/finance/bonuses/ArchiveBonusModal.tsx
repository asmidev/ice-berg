import { Archive } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ArchiveBonusModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  setReason: (r: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export function ArchiveBonusModal({ 
  isOpen, onOpenChange, reason, setReason, onSubmit, submitting 
}: ArchiveBonusModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[16px] p-8 border-none shadow-2xl bg-white focus:outline-none">
        <DialogHeader className="items-center text-center space-y-3 mb-6">
           <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-2 shadow-inner"><Archive size={32} /></div>
           <DialogTitle className="text-[24px] font-black text-rose-600 tracking-tight">Bonusni arxivlash</DialogTitle>
           <DialogDescription className="text-[12px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
             Arxivlash sababini kiriting. <br /> (Tushuntirish: Kassa balansiga qaytariladi)
           </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
             <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Sabab</Label>
             <Input 
               value={reason} 
               onChange={e => setReason(e.target.value)}
               placeholder="Arxivlash sababini kiriting..." 
               className="h-12 px-4 rounded-[8px] bg-gray-50/50 border border-gray-100 font-bold text-[13px] focus:ring-1 focus:ring-rose-200 placeholder:text-gray-300 transition-all shadow-sm" 
             />
          </div>
        </div>
        <DialogFooter className="mt-6 flex gap-3">
           <Button variant="outline" className="h-12 px-6 rounded-[8px] font-bold text-[14px] flex-1 border-gray-200 text-gray-400 hover:bg-gray-50 transition-all" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
           <Button 
             className="h-12 px-8 rounded-[8px] font-bold text-[14px] bg-[#F43F5E] hover:bg-rose-600 flex-1 text-white border-none shadow-lg shadow-rose-100 transition-all" 
             onClick={onSubmit} 
             disabled={submitting || !reason}
            >
              Arxivlash
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
