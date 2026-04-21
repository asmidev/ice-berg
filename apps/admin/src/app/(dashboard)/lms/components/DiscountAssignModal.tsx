import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Percent, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { toast } from 'sonner';

interface DiscountAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudentIds: string[];
  onSuccess: () => void;
  studentsCount: number;
}

export function DiscountAssignModal({
  isOpen,
  onClose,
  selectedStudentIds,
  onSuccess,
  studentsCount
}: DiscountAssignModalProps) {
  const [loading, setLoading] = useState(false);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState('');
  const [durationMonths, setDurationMonths] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchDiscounts();
    }
  }, [isOpen]);

  const fetchDiscounts = async () => {
    try {
      const res = await api.get('/discounts');
      setDiscounts(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Chegirmalarni yuklashda xatolik yuz berdi');
    }
  };

  const handleAssign = async () => {
    if (!selectedDiscountId) {
      toast.error('Iltimos, chegirma tanlang');
      return;
    }

    setLoading(true);
    try {
      let expiresAtStr: string | undefined = undefined;
      if (durationMonths !== null) {
        const date = new Date();
        date.setMonth(date.getMonth() + durationMonths);
        expiresAtStr = date.toISOString();
      }

      await Promise.all(
        selectedStudentIds.map(studentId => 
          api.post('/discounts/assign', {
            student_id: studentId,
            discount_id: selectedDiscountId,
            expires_at: expiresAtStr
          })
        )
      );

      toast.success(`${studentsCount} ta o'quvchiga chegirma biriktirildi`);
      onSuccess();
      onClose();
    } catch (err: any) {
       console.error(err);
       toast.error(err.response?.data?.message || "Chegirma biriktirishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
        <motion.div 
           initial={{ opacity: 0 }} 
           animate={{ opacity: 1 }} 
           exit={{ opacity: 0 }} 
           onClick={onClose}
           className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div 
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 20 }}
           className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-pink-900/10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-pink-50/50 border-b border-pink-100">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
                   <Percent size={20} />
                </div>
                <div>
                   <h2 className="text-lg font-black text-gray-800 tracking-tight leading-none mb-1">Chegirma Biriktirish</h2>
                   <p className="text-[11px] font-bold text-gray-400 tracking-wide uppercase">
                     {studentsCount} ta o'quvchi tanlandi
                   </p>
                </div>
             </div>
             <Button size="icon" variant="ghost" onClick={onClose} className="rounded-full hover:bg-pink-100/50 text-gray-400 hover:text-pink-600">
                <X size={20} />
             </Button>
          </div>

          <div className="p-6 space-y-6">
             {/* Warning if no discount exists */}
             {discounts.length === 0 && (
                <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                   <AlertCircle size={20} className="text-orange-500 shrink-0 mt-0.5" />
                   <p className="text-sm font-medium text-orange-800">
                     Tizimda chegirmalar topilmadi. Avval sozlamalardan chegirma yarating.
                   </p>
                </div>
             )}

             <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Tizimdagi Chegirma</Label>
                <div className="grid grid-cols-1 gap-2">
                   {discounts.map(d => (
                      <div 
                         key={d.id} 
                         onClick={() => setSelectedDiscountId(d.id)}
                         className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                            selectedDiscountId === d.id ? 'border-pink-500 bg-pink-50/20' : 'border-gray-100 hover:border-pink-200'
                         }`}
                      >
                         <span className={`text-sm font-bold ${selectedDiscountId === d.id ? 'text-pink-700' : 'text-gray-700'}`}>{d.name}</span>
                         <span className={`text-[11px] font-black uppercase px-2 py-1 rounded-lg ${
                            selectedDiscountId === d.id ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-500'
                         }`}>
                            -{d.type === 'PERCENT' ? `${d.value}%` : `${new Intl.NumberFormat('uz-UZ').format(d.value)} so'm`}
                         </span>
                      </div>
                   ))}
                </div>
             </div>

             <div className="space-y-2 mt-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Tugash muddati</Label>
                <div className="grid grid-cols-3 gap-2">
                   {[
                      { label: '1 oy', value: 1 },
                      { label: '3 oy', value: 3 },
                      { label: '6 oy', value: 6 },
                      { label: '9 oy', value: 9 },
                      { label: '1 yil', value: 12 },
                      { label: 'Muddatsiz', value: null }
                   ].map(opt => (
                      <div 
                         key={opt.label}
                         onClick={() => setDurationMonths(opt.value)}
                         className={`p-2 rounded-xl text-center cursor-pointer transition-all border-2 text-xs font-bold ${
                            durationMonths === opt.value ? 'bg-pink-100 border-pink-500 text-pink-700' : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-pink-200'
                         }`}
                      >
                         {opt.label}
                      </div>
                   ))}
                </div>
                <p className="text-[10px] font-medium text-gray-400 mt-2">
                   Tanlangan oylardagi to'lovlar uchun chegirma avtomat tarzda qo'llaniladi.
                </p>
             </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
             <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold border-gray-200" disabled={loading}>
                Bekor qilish
             </Button>
             <Button 
               onClick={handleAssign} 
               className="flex-1 h-12 rounded-xl font-bold bg-pink-600 hover:bg-pink-700 shadow-lg shadow-pink-200 text-white gap-2"
               disabled={loading || discounts.length === 0}
             >
                <Save size={18} /> Saqlash
             </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
