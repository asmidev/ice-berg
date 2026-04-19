"use client";

import { useState, useEffect } from 'react';
import { X, Archive, AlertCircle, Plus, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';

interface ArchiveGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: any;
  reasons: string[];
  onConfirm: (reason: string) => void;
  onAddReason: (reason: string) => void;
  isSubmitting: boolean;
}

export function ArchiveGroupModal({
  isOpen,
  onClose,
  group,
  reasons,
  onConfirm,
  onAddReason,
  isSubmitting
}: ArchiveGroupModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [newReason, setNewReason] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    if (reasons.length > 0 && !selectedReason) {
      setSelectedReason(reasons[0]);
    }
  }, [reasons, isOpen]);

  const handleConfirm = () => {
    onConfirm(selectedReason);
  };

  const handleAddNew = () => {
    if (newReason.trim()) {
      onAddReason(newReason.trim());
      setSelectedReason(newReason.trim());
      setNewReason('');
      setIsAddingNew(false);
    }
  };

  if (!group) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 rounded-2xl bg-white border-none shadow-2xl overflow-hidden focus:outline-none">
        <DialogHeader className="p-8 pb-4 flex flex-row justify-between items-center bg-gray-50/50 border-b border-gray-100">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 font-bold">
                 <Archive size={24} />
              </div>
              <div>
                 <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
                    Guruhni arxivlash
                 </DialogTitle>
                 <p className="text-sm font-medium text-gray-400 mt-1">
                    "{group.name}" guruhi arxivga yuboriladi
                 </p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-all">
              <X size={20} />
           </button>
        </DialogHeader>

        <div className="p-8 space-y-6">
           <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
              <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                 Guruhni arxivlash uni faol ro'yxatdan olib tashlaydi. Arxivlangan guruhlar dars jadvalidan o'chiriladi va ular bilan bog'liq statistika o'zgaradi.
              </p>
           </div>

           <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Arxivlash sababi</Label>
                 {!isAddingNew && (
                    <button 
                       onClick={() => setIsAddingNew(true)}
                       className="text-[10px] font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 transition-all"
                    >
                       <Plus size={12} /> Yangi sabab
                    </button>
                 )}
              </div>

              {isAddingNew ? (
                 <div className="flex gap-2">
                    <Input 
                       placeholder="Yangi sabab kiriting..."
                       value={newReason}
                       onChange={e => setNewReason(e.target.value)}
                       className="h-11 bg-white border-gray-200 rounded-xl font-bold text-gray-700 flex-1"
                    />
                    <Button 
                       onClick={handleAddNew}
                       className="h-11 px-4 bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
                    >
                       <Plus size={20} />
                    </Button>
                    <Button 
                       variant="ghost" 
                       onClick={() => setIsAddingNew(false)}
                       className="h-11 px-3 text-gray-400"
                    >
                       <X size={20} />
                    </Button>
                 </div>
              ) : (
                 <Select value={selectedReason} onValueChange={setSelectedReason}>
                    <SelectTrigger className="h-11 bg-white border-gray-200 rounded-xl font-bold text-gray-700">
                       <SelectValue placeholder="Sababni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                       {reasons.map((r, i) => <SelectItem key={i} value={r} className="font-semibold">{r}</SelectItem>)}
                    </SelectContent>
                 </Select>
              )}
           </div>
        </div>

        <DialogFooter className="p-8 pt-4 bg-gray-50/50 border-t border-gray-100 flex gap-3 sm:justify-end">
           <Button 
              variant="outline" 
              onClick={onClose}
              className="h-11 px-8 rounded-xl font-bold text-gray-400 border-none bg-white hover:bg-gray-100 transition-all"
           >
              Bekor qilish
           </Button>
           <Button 
              disabled={isSubmitting || !selectedReason}
              onClick={handleConfirm}
              className="h-11 px-10 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-100 transition-all flex items-center gap-2"
           >
              {isSubmitting ? 'Saqlanmoqda...' : 'Arxivlash'}
              <Archive size={18} />
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
