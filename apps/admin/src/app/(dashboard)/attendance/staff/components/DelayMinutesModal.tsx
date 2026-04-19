'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, AlertCircle } from "lucide-react";

interface DelayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (minutes: number) => void;
  initialValue?: number;
  name: string;
}

export const DelayMinutesModal = ({ isOpen, onClose, onSubmit, initialValue = 0, name }: DelayModalProps) => {
  const [minutes, setMinutes] = useState(initialValue);

  useEffect(() => {
    setMinutes(initialValue);
  }, [initialValue, isOpen]);

  const handleConfirm = () => {
    onSubmit(minutes);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="bg-amber-500 p-8 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 border border-white/20">
            <Clock className="w-6 h-6" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight mb-1">
            Kechikish Vaqti
          </DialogTitle>
          <p className="text-white/80 text-[13px] font-bold uppercase tracking-widest leading-relaxed">
            {name} uchun kechikish miqdorini belgilang
          </p>
        </DialogHeader>
        
        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Vaqt (Minutda)</label>
            <div className="relative group">
              <Input 
                type="number" 
                value={minutes} 
                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                className="h-16 pl-6 pr-16 bg-zinc-50 border-zinc-200 rounded-2xl font-black text-2xl focus:ring-4 focus:ring-amber-50 focus:border-amber-300 transition-all outline-none" 
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-sm uppercase tracking-widest">Min</div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100/50">
               <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
               <p className="text-[11px] text-amber-700 font-bold leading-relaxed">
                 Ushbu ma'lumot xodimning oylik statistikasi va KPI ko'rsatkichlariga ta'sir qilishi mumkin.
               </p>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0 pt-2">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="h-12 flex-1 rounded-xl font-bold text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
            >
              Bekor qilish
            </Button>
            <Button 
              onClick={handleConfirm}
              className="h-12 flex-1 bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-100 text-white font-black rounded-xl uppercase tracking-widest text-xs"
            >
              Saqlash
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
