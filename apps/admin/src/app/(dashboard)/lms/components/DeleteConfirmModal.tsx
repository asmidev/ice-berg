"use client";

import { X, Trash2, AlertCircle, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  isSubmitting
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 rounded-2xl bg-white border-none shadow-2xl overflow-hidden focus:outline-none">
        <DialogHeader className="p-8 pb-4 flex flex-row justify-between items-center bg-rose-50/50 border-b border-rose-100">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 font-bold">
                 <Trash2 size={24} />
              </div>
              <div>
                 <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
                    {title}
                 </DialogTitle>
                 <p className="text-sm font-medium text-rose-400 mt-1">
                    Bu amalni bekor qilib bo'lmaydi
                 </p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-rose-100 rounded-xl text-rose-400 transition-all">
              <X size={20} />
           </button>
        </DialogHeader>

        <div className="p-8 space-y-6">
           <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center">
                 <AlertTriangle size={32} className="text-rose-500 animate-pulse" />
              </div>
              <p className="text-sm font-medium text-gray-600 leading-relaxed px-4">
                 {description}
              </p>
           </div>
        </div>

        <DialogFooter className="p-8 pt-4 bg-gray-50/50 border-t border-gray-100 flex gap-3 sm:justify-end">
           <Button 
              variant="outline" 
              onClick={onClose}
              className="h-11 px-8 rounded-xl font-bold text-gray-400 border-none bg-white hover:bg-gray-100 transition-all"
           >
              Orqaga qasytish
           </Button>
           <Button 
              disabled={isSubmitting}
              onClick={onConfirm}
              className="h-11 px-10 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-100 transition-all flex items-center gap-2"
           >
              {isSubmitting ? 'O\'chirilmoqda...' : 'Tasdiqlayman'}
              <Trash2 size={18} />
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
