"use client";

import { useState } from 'react';
import { X, MessageSquare, Send, Users, AlertCircle, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SmsGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: any;
  onSend: (message: string) => void;
  isSubmitting: boolean;
}

export function SmsGroupModal({
  isOpen,
  onClose,
  group,
  onSend,
  isSubmitting
}: SmsGroupModalProps) {
  const [message, setMessage] = useState('');
  const [template, setTemplate] = useState('none');

  const templates = [
    { id: '1', name: "Dars bekor qilindi", text: "Assalomu alaykum, hurmatli o'quvchi. Bugungi dars o'qituvchining betobligiga ko'ra boshqa kunga ko'chirildi. Noqulaylik uchun uzr so'raymiz." },
    { id: '2', name: "To'lov haqida eslatma", text: "Assalomu alaykum! Kurslar uchun to'lov muddati kelganligini eslatib o'tamiz. Iltimos, to'lovni o'z vaqtida amalga oshiring." },
    { id: '3', name: "Yangi bosqich", text: "Tabriklaymiz! Sizning guruhingiz keyingi bosqichga o'tdi. Darslar o'sha vaqtda davom etadi." }
  ];

  const handleTemplateChange = (val: string) => {
    setTemplate(val);
    if (val === 'none') {
        setMessage('');
    } else {
        const t = templates.find(t => t.id === val);
        if (t) setMessage(t.text);
    }
  };

  if (!group) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 rounded-2xl bg-white border-none shadow-2xl overflow-hidden focus:outline-none">
        <DialogHeader className="p-8 pb-4 flex flex-row justify-between items-center bg-pink-50/50 border-b border-pink-100">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 font-bold">
                 <MessageSquare size={24} />
              </div>
              <div>
                 <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
                    SMS yuborish
                 </DialogTitle>
                 <p className="text-sm font-medium text-pink-400 mt-1">
                    Guruhning barcha o'quvchilariga xabar yuborish
                 </p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-pink-100 rounded-xl text-pink-400 transition-all">
              <X size={20} />
           </button>
        </DialogHeader>

        <div className="p-8 space-y-6">
           <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400">
                 <Users size={18} />
              </div>
              <div>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Qabul qiluvchilar</p>
                 <p className="text-sm font-bold text-gray-800">{group.name} — {group._count?.enrollments || 0} ta o'quvchi</p>
              </div>
           </div>

           <div className="space-y-4">
              <div className="space-y-2">
                 <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Shablon tanlash</Label>
                 <Select value={template} onValueChange={handleTemplateChange}>
                    <SelectTrigger className="h-11 bg-white border-gray-200 rounded-xl font-bold text-gray-700">
                       <SelectValue placeholder="Tayyor shablonni tanlash (ixtiyoriy)" />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="none" className="font-semibold text-gray-400 italic">Shablonsiz</SelectItem>
                       {templates.map(t => <SelectItem key={t.id} value={t.id} className="font-semibold">{t.name}</SelectItem>)}
                    </SelectContent>
                 </Select>
              </div>

              <div className="space-y-2">
                 <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Xabar matni</Label>
                 <Textarea 
                    placeholder="Xabar matnini bu yerga yozing..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="min-h-[150px] bg-white border-gray-200 rounded-2xl font-semibold text-gray-700 focus:border-pink-500 transition-all shadow-sm"
                 />
                 <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] text-gray-400 font-bold">Max: 160 belgi (1 ta SMS)</p>
                    <p className="text-[10px] font-bold text-pink-600">{message.length} belgi</p>
                 </div>
              </div>
           </div>

           <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
              <Info className="w-6 h-6 text-blue-500 shrink-0" />
              <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                 SMS Eskiz.uz tizimi orqali barcha faol o'quvchilarga bir vaqtda yuboriladi. Iltimos, ma'lumotlar to'g'riligini tekshiring.
              </p>
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
              disabled={isSubmitting || !message.trim()}
              onClick={() => onSend(message)}
              className="h-11 px-10 rounded-xl font-bold bg-pink-500 hover:bg-pink-600 text-white shadow-lg shadow-pink-100 transition-all flex items-center gap-2"
           >
              {isSubmitting ? 'Yuborilmoqda...' : 'Yuborish'}
              <Send size={18} />
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
