import { Archive } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArchiveSalaryFormData } from '@/types/finance';

interface ArchiveSalaryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ArchiveSalaryFormData;
  setFormData: (data: ArchiveSalaryFormData) => void;
  onSubmit: () => void;
  submitting: boolean;
}

const PRESET_REASONS = [
  "Noto'g'ri hisoblangan",
  "Xodim ishdan bo'shatilgan",
  "To'lov bekor qilindi",
  "Boshqa"
];

export function ArchiveSalaryModal({ 
  isOpen, onOpenChange, formData, setFormData, 
  onSubmit, submitting 
}: ArchiveSalaryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[16px] p-8 border-none shadow-2xl bg-white focus:outline-none">
        <DialogHeader className="items-center text-center space-y-3 mb-6">
           <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-2 shadow-inner"><Archive size={36} /></div>
           <DialogTitle className="text-[28px] font-black text-rose-600 tracking-tight">Arxivlash</DialogTitle>
           <DialogDescription className="text-[14px] font-bold text-zinc-400 tracking-wide">Ish haqini bekor qilish sababini tanlang yoki kiriting</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESET_REASONS.map(reason => (
              <button 
                key={reason}
                onClick={() => setFormData({...formData, reason})}
                className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all border
                  ${formData.reason === reason ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-zinc-50 border-transparent text-zinc-400 hover:bg-zinc-100'}
                `}
              >
                {reason}
              </button>
            ))}
          </div>
          <div className="space-y-2">
             <Input 
               value={formData.reason} 
               onChange={e => setFormData({...formData, reason: e.target.value})}
               placeholder="Sababni kiriting..." 
               className="h-12 px-4 rounded-[8px] bg-gray-50/50 border border-gray-100 font-bold focus:ring-1 focus:ring-rose-200 placeholder:text-gray-300 transition-all shadow-sm" 
             />
          </div>
        </div>
        
        <DialogFooter className="mt-4 flex gap-3">
           <Button variant="outline" className="h-12 rounded-[8px] font-bold text-[14px] flex-1 border-gray-200 text-gray-400 hover:bg-gray-50 transition-all" onClick={() => onOpenChange(false)}>Ortga</Button>
           <Button 
             className="h-12 rounded-[8px] font-bold text-[14px] bg-[#F43F5E] hover:bg-rose-600 flex-1 text-white border-none shadow-lg shadow-rose-100 transition-all font-bold" 
             onClick={onSubmit} 
             disabled={submitting || !formData.reason}
            >
              Arxivlash
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
