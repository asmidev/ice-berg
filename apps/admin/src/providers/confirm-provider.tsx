"use client";

import React, { useState, useCallback, useRef } from 'react';
import { ConfirmContext } from '@/hooks/use-confirm';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, HelpCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export const ConfirmProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<{
    title: string;
    message: string;
    type: 'info' | 'danger';
    confirmText: string;
    cancelText: string;
  }>({
    title: '',
    message: '',
    type: 'info',
    confirmText: 'Tasdiqlash',
    cancelText: 'Bekor qilish',
  });

  const resolveRef = useRef<(value: boolean) => void>();

  const confirm = useCallback((confirmOptions: any) => {
    setOptions({
      title: confirmOptions.title || 'Tasdiqlash',
      message: confirmOptions.message || 'Ushbu amalni tasdiqlaysizmi?',
      type: confirmOptions.type || 'info',
      confirmText: confirmOptions.confirmText || 'Tasdiqlash',
      cancelText: confirmOptions.cancelText || 'Bekor qilish',
    });
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleClose = useCallback((value: boolean) => {
    setIsOpen(false);
    setTimeout(() => {
      resolveRef.current?.(value);
    }, 200); // Wait for animation
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose(false)}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl bg-white/95 backdrop-blur-xl rounded-[24px]">
          <div className={`h-1.5 w-full ${options.type === 'danger' ? 'bg-rose-500' : 'bg-navy-800'}`} />
          
          <div className="p-8 pb-6 flex flex-col items-center text-center space-y-4">
             <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300 ${
                options.type === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-navy-50 text-navy-800'
             }`}>
                {options.type === 'danger' ? <AlertTriangle size={32} /> : <HelpCircle size={32} />}
             </div>

             <div className="space-y-2">
                <DialogTitle className="text-[20px] font-black text-gray-900 tracking-tight leading-tight">
                   {options.title}
                </DialogTitle>
                <DialogDescription className="text-[14px] text-gray-500 font-medium leading-relaxed px-2">
                   {options.message}
                </DialogDescription>
             </div>
          </div>

          <DialogFooter className="p-6 pt-2 flex gap-3 sm:flex-row flex-col w-full">
             <Button 
               variant="ghost" 
               onClick={() => handleClose(false)} 
               className="h-12 flex-1 rounded-[14px] font-bold text-[12px] uppercase tracking-widest text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all border-none"
             >
                {options.cancelText}
             </Button>
             <Button 
               onClick={() => handleClose(true)}
               className={`h-12 flex-1 rounded-[14px] font-bold text-[12px] uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 border-none ${
                 options.type === 'danger' 
                    ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' 
                    : 'bg-navy-800 hover:bg-navy-900 shadow-navy-200'
               }`}
             >
                {options.confirmText}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
};
