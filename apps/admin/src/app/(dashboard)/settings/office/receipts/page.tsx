"use client";

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  ReceiptText, Save, FileType, MessageSquare, 
  CheckCircle2, AlertCircle, Building2, Send, 
  Printer, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/hooks/use-confirm';

export default function OfficeReceiptsSettingsPage() {
  const confirm = useConfirm();
  const searchParams = useSearchParams();
  const [branch, setBranch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branchId, setBranchId] = useState('all');
  
  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  // Receipt Settings State
  const [settings, setSettings] = useState({
    receipt_branch_name: '',
    receipt_header: '⭐⭐⭐ ICE BERG ⭐⭐⭐',
    receipt_footer: 'Bizni tanlaganingiz uchun tashakkur!\nIjtimoiy tarmoqlar: @ice_berg_edu',
    telegram_enabled: true,
    show_logo: true
  });

  // Templates State
  const [templates, setTemplates] = useState<any[]>([]);
  const [activeModal, setActiveModal] = useState<'SAVE_TEMPLATE' | 'LIST_TEMPLATES' | null>(null);
  const [templateName, setTemplateName] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    const handleSyncBranch = () => {
      const bId = searchParams?.get('branch_id') || localStorage.getItem('branch_id') || 'all';
      if (bId !== branchId) {
        setBranchId(bId);
      }
    };

    handleSyncBranch();

    // Listen for storage changes from other tabs/header
    window.addEventListener('storage', handleSyncBranch);
    // Poll slightly to catch internal navigation if searchParams is slow
    const interval = setInterval(handleSyncBranch, 1000);

    return () => {
      window.removeEventListener('storage', handleSyncBranch);
      clearInterval(interval);
    };
  }, [searchParams, branchId]);

  const fetchBranch = async () => {
    if (branchId === 'all') return;
    setLoading(true);
    try {
      const res = await api.get(`/branches/${branchId}`);
      const bData = res.data?.data || res.data; // Handle wrapped response
      setBranch(bData);
      
      if (bData?.settings) {
         setSettings({
            receipt_branch_name: bData.settings.receipt_branch_name || bData.name || '',
            receipt_header: bData.settings.receipt_header || '⭐⭐⭐ ICE BERG ⭐⭐⭐',
            receipt_footer: bData.settings.receipt_footer || 'Bizni tanlaganingiz uchun tashakkur!\nIjtimoiy tarmoqlar: @ice_berg_edu',
            telegram_enabled: bData.settings.telegram_enabled !== false,
            show_logo: bData.settings.show_logo !== false
         });
      } else if (bData) {
         setSettings(prev => ({ ...prev, receipt_branch_name: bData.name || '' }));
      }
      fetchTemplates();
    } catch (err) {
      showToast('Xatolik yuklashda', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    const bId = branchId || 'all';
    try {
      const res = await api.get(`/receipt-templates?branch_id=${bId}`);
      const tData = res.data?.data || res.data;
      setTemplates(Array.isArray(tData) ? tData : []);
    } catch (err) {
      console.error('Fetch templates error:', err);
      setTemplates([]);
    }
  };

  useEffect(() => {
    fetchBranch();
  }, [branchId]);

  const handleSave = async () => {
    if (branchId === 'all') return showToast('Iltimos, filialni tanlang', 'error');
    setIsSubmitting(true);
    try {
      await api.put(`/branches/${branchId}`, {
        settings: { ...branch.settings, ...settings }
      });
      showToast('Sozlamalar saqlandi');
      fetchBranch();
    } catch (err) {
      showToast('Saqlashda xatolik', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName) return;
    setIsSubmitting(true);
    try {
      await api.post('/receipt-templates', {
        branch_id: branchId,
        name: templateName,
        settings
      });
      showToast('Shablon saqlandi');
      setTemplateName('');
      setActiveModal(null);
      fetchTemplates();
    } catch (err) {
      showToast('Shablonni saqlashda xatolik', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = (t: any) => {
     setSettings(t.settings);
     setActiveModal(null);
     showToast('Shablon yuklandi. Saqlashni unutmang.');
  };

  const deleteTemplate = async (id: string) => {
     const isConfirmed = await confirm({
        title: "Shablonni o'chirish",
        message: "Shablonni o'chirmoqchimisiz?",
        type: "danger"
     });
     if (!isConfirmed) return;
     try {
       await api.delete(`/receipt-templates/${id}`);
       showToast('Shablon o\'chirildi');
       fetchTemplates();
     } catch (err) {
       showToast('O\'chirishda xatolik', 'error');
     }
  };

  if (branchId === 'all') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 bg-white rounded-2xl border border-dashed border-gray-200">
         <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
            <ReceiptText size={32} />
         </div>
         <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-gray-900">Filial Tanlanmagan</h3>
            <p className="text-gray-500 text-sm max-w-[280px]">Kvitansiya sozlamalarini boshqarish uchun yuqoridagi menyudan filialni tanlang.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-20">
      
      {/* --- TOAST --- */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
           <div className={cn("flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border min-w-[300px]", toast.type === 'success' ? "bg-white border-emerald-100 text-emerald-600" : "bg-white border-rose-100 text-rose-600")}>
              {toast.type === 'success' ? <CheckCircle2 size={24} className="text-emerald-500" /> : <AlertCircle size={24} className="text-rose-500" />}
              <span className="font-bold text-[13px]">{toast.message}</span>
           </div>
        </div>
      )}

      {/* 🚀 Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[12px] shadow-sm border border-gray-100 flex items-center gap-5 group transition-all hover:bg-navy-50/30">
          <div className="w-12 h-12 rounded-xl bg-navy-50 text-[#1E3A5F] flex items-center justify-center group-hover:bg-[#1E3A5F] group-hover:text-white transition-all">
            <Printer size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Chek Formati</p>
            <h2 className="text-xl font-black text-[#1E3A5F] leading-none">80mm Thermal</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[12px] shadow-sm border border-gray-100 flex items-center gap-5 group transition-all hover:bg-pink-50/30">
          <div className="w-12 h-12 rounded-xl bg-pink-50 text-[#EC4899] flex items-center justify-center group-hover:bg-[#EC4899] group-hover:text-white transition-all">
            <FileType size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Shablonlar</p>
            <h2 className="text-xl font-black text-[#1E3A5F] leading-none">{templates.length} ta</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[12px] shadow-sm border border-gray-100 flex items-center gap-5 group transition-all hover:bg-emerald-50/30">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <Building2 size={24} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Filial</p>
            <h2 className="text-xl font-black text-[#1E3A5F] leading-none truncate max-w-[150px]">{branch?.name || '...'}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
         
         {/* 🛠 Configuration Section */}
         <div className="space-y-6">
            <div className="bg-white p-8 rounded-[12px] shadow-sm border border-gray-100 space-y-8">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 pb-6 gap-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-navy-800 text-white flex items-center justify-center">
                        <Save size={20} />
                     </div>
                     <div>
                        <h3 className="text-lg font-black text-[#1E3A5F]">Tarkib Sozlamalari</h3>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Chek matnlarini tahrirlash</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <Button 
                        variant="outline"
                        onClick={() => setActiveModal('LIST_TEMPLATES')}
                        className="h-10 border-gray-200 text-gray-600 font-bold text-[11px] uppercase tracking-wider rounded-lg hover:bg-gray-50 transition-all"
                     >
                        Shablonlar
                     </Button>
                     <Button 
                        disabled={isSubmitting || loading} 
                        onClick={handleSave}
                     className="bg-[#EC4899] hover:bg-pink-600 text-white font-black text-xs uppercase tracking-widest h-10 px-6 rounded-lg shadow-lg shadow-pink-100 transition-all active:scale-95"
                  >
                     {isSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}
                  </Button>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                     <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Building2 size={12} className="text-navy-400" /> Filial nomi (Chekda)
                     </Label>
                     <Input 
                        value={settings.receipt_branch_name} 
                        onChange={(e) => setSettings({...settings, receipt_branch_name: e.target.value})}
                        placeholder="Masalan: ICE BERG Birlashgan filiali" 
                        className="h-11 bg-gray-50 border-gray-100 font-bold text-sm focus:ring-1 focus:ring-pink-100" 
                     />
                  </div>

                  <div className="space-y-2">
                     <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <FileType size={12} className="text-navy-400" /> Sarlavha (Header)
                     </Label>
                     <Input 
                        value={settings.receipt_header} 
                        onChange={(e) => setSettings({...settings, receipt_header: e.target.value})}
                        className="h-11 bg-gray-50 border-gray-100 font-bold text-sm focus:ring-1 focus:ring-pink-100" 
                     />
                  </div>

                  <div className="space-y-2">
                     <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <MessageSquare size={12} className="text-navy-400" /> Pastki matn (Footer)
                     </Label>
                     <Textarea 
                        value={settings.receipt_footer} 
                        onChange={(e) => setSettings({...settings, receipt_footer: e.target.value})}
                        className="min-h-[100px] bg-gray-50 border-gray-100 font-semibold text-[13px] leading-relaxed resize-none focus:ring-1 focus:ring-pink-100" 
                     />
                  </div>

                  <div className="pt-4 border-t border-gray-50 flex flex-col gap-4">
                     <div className="flex items-center justify-between p-4 bg-navy-50/50 rounded-xl border border-navy-100/50">
                        <div className="flex items-center gap-3">
                           <Send size={18} className="text-[#1E3A5F]" />
                           <div>
                              <p className="text-[11px] font-black text-[#1E3A5F] uppercase tracking-widest">Telegramga yuborish</p>
                              <p className="text-[10px] font-bold text-gray-400">To'lovdan so'ng avtomatik</p>
                           </div>
                        </div>
                        <Switch 
                           checked={settings.telegram_enabled} 
                           onCheckedChange={(v) => setSettings({...settings, telegram_enabled: v})} 
                        />
                     </div>
                     <Button 
                        variant="ghost" 
                        onClick={() => setActiveModal('SAVE_TEMPLATE')}
                        className="w-full h-11 border border-dashed border-gray-200 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50/50 font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all"
                     >
                        Shablon sifatida saqlash
                     </Button>
                  </div>
               </div>
            </div>

            <div className="bg-amber-50 p-6 rounded-[12px] border border-amber-100 flex gap-4">
               <Info size={24} className="text-amber-500 shrink-0" />
               <p className="text-[12px] font-semibold text-amber-700 leading-relaxed">
                  <b>Eslatma:</b> Kvitansiya dizayni faqat termal printerlar (80mm) uchun optimallashtirilgan. O'zgarishlar faqat yangi amalga oshiriladigan to'lovlar uchun amal qiladi.
               </p>
            </div>
         </div>

         {/* 🧾 Live Preview Section */}
         <div className="lg:sticky lg:top-8 flex flex-col items-center">
            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Jonli Ko'rinish (Live Preview)</h4>
            
            <div className="w-full max-w-[340px] bg-white shadow-2xl rounded-sm border border-gray-200 p-8 flex flex-col items-center text-center font-mono text-[11px] text-gray-800 animate-in zoom-in-95 duration-300 relative">
               {/* Thermal paper deco */}
               <div className="absolute -top-1 left-0 w-full h-1 bg-[radial-gradient(circle,transparent_20%,white_20%)] bg-[length:10px_10px] pointer-events-none" />
               
               <p className="text-sm font-black mb-1">{settings.receipt_header}</p>
               <p className="text-[10px] font-bold uppercase mb-4 text-gray-500">{settings.receipt_branch_name || branch?.name}</p>
               
               <div className="w-full border-t border-dashed border-gray-300 pt-4 mb-4 space-y-1">
                  <div className="flex justify-between uppercase font-bold"><span>Kurs:</span> <span>Ingliz Tili (IELTS)</span></div>
                  <div className="flex justify-between uppercase"><span>Bosqich:</span> <span>4-etap</span></div>
                  <div className="flex justify-between uppercase"><span>Oy:</span> <span>Sentyabr 2026</span></div>
                  <div className="w-full border-t border-gray-100 my-2" />
                  <div className="flex justify-between uppercase"><span>Chek kodi:</span> <span className="font-black">#882734</span></div>
                  <div className="flex justify-between uppercase"><span>Sana:</span> <span>{new Date().toLocaleDateString()}</span></div>
                  <div className="flex justify-between uppercase"><span>Mijoz:</span> <span>Ibragimov Sardor</span></div>
                  <div className="flex justify-between uppercase"><span>Kassir:</span> <span>Malika R.</span></div>
               </div>
               
               <div className="w-full text-left mb-2">
                  <p className="font-black uppercase tracking-wider underline underline-offset-4">To'lov ma'lumoti</p>
               </div>
               
               <div className="w-full space-y-4">
                  <div className="flex justify-between items-center text-[12px] font-black">
                     <span className="uppercase">Jami to'lov:</span>
                     <span className="text-base">1,200,000 UZS</span>
                  </div>
                  
                  <div className="w-full border-t border-dashed border-gray-300 pt-4 text-center">
                     <p className="text-[10px] text-gray-500 whitespace-pre-wrap leading-relaxed font-bold">
                        {settings.receipt_footer}
                     </p>
                  </div>

                  <div className="pt-4 flex flex-col items-center opacity-40 grayscale">
                     <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center font-sans text-[10px] font-black border border-gray-300">QR CODE</div>
                     <p className="text-[8px] mt-2 font-black">SCANNED BY ICE BERG SYSTEM</p>
                  </div>
               </div>

               {/* Bottom paper deco */}
               <div className="absolute -bottom-2 left-0 w-full h-2 bg-[radial-gradient(circle,transparent_20%,white_20%)] bg-[length:10px_10px] rotate-180 pointer-events-none" />
            </div>

            <p className="mt-6 text-[11px] font-bold text-gray-400 italic">Prevyu ko'rinishi haqiqiy printerdagi kenglikka moslangan</p>
         </div>

      </div>

      {/* --- SAVE TEMPLATE MODAL --- */}
      <Dialog open={activeModal === 'SAVE_TEMPLATE'} onOpenChange={o => !o && setActiveModal(null)}>
        <DialogContent className="sm:max-w-[420px] p-0 border-none rounded-2xl shadow-2xl bg-white overflow-hidden">
           <form onSubmit={handleSaveAsTemplate}>
              <div className="p-8 space-y-6">
                 <div className="space-y-1">
                    <h3 className="text-xl font-black text-[#1E3A5F]">Shablon Sifatida Saqlash</h3>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Joriy dizaynni yangi nom bilan saqlash</p>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Shablon nomi *</Label>
                    <Input 
                       required 
                       value={templateName} 
                       onChange={e => setTemplateName(e.target.value)} 
                       placeholder="Masalan: Yangi yil aksiyasi" 
                       className="h-11 bg-gray-50 border-gray-100 font-bold focus:ring-1 focus:ring-pink-100" 
                    />
                 </div>
                 <div className="flex gap-3">
                    <Button type="button" variant="ghost" onClick={() => setActiveModal(null)} className="flex-1 h-11 rounded-xl font-bold text-gray-500">Bekor qilish</Button>
                    <Button disabled={isSubmitting} type="submit" className="flex-1 h-11 rounded-xl bg-[#1E3A5F] hover:bg-navy-900 text-white font-black text-xs uppercase tracking-widest">Saqlash</Button>
                 </div>
              </div>
           </form>
        </DialogContent>
      </Dialog>

      {/* --- TEMPLATES LIST MODAL --- */}
      <Dialog open={activeModal === 'LIST_TEMPLATES'} onOpenChange={o => !o && setActiveModal(null)}>
        <DialogContent className="sm:max-w-[480px] p-0 border-none rounded-2xl shadow-2xl bg-white overflow-hidden">
           <div className="p-8 space-y-6">
              <div className="space-y-1 border-b border-gray-50 pb-4">
                 <h3 className="text-xl font-black text-[#1E3A5F]">Tayyor Shablonlar</h3>
                 <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Tanlang va dizaynga qo'llang</p>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-100">
                 {templates.length === 0 ? (
                    <div className="py-12 text-center text-gray-300 font-bold text-xs uppercase tracking-widest">Shablonlar mavjud emas</div>
                 ) : (
                    templates.map(t => (
                       <div key={t.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:border-indigo-100 transition-all">
                          <div>
                             <p className="font-black text-[#1E3A5F] text-[13px]">{t.name}</p>
                             <p className="text-[10px] font-semibold text-gray-400">{new Date(t.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                             <Button size="sm" onClick={() => applyTemplate(t)} className="h-8 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-black text-[10px] uppercase tracking-wider rounded-lg border-none shadow-none">Apply</Button>
                             <Button size="sm" variant="ghost" onClick={() => deleteTemplate(t.id)} className="h-8 w-8 p-0 text-gray-300 hover:text-rose-500 rounded-lg"><Trash2 size={14} /></Button>
                          </div>
                       </div>
                    ))
                 )}
              </div>
              
              <Button type="button" onClick={() => setActiveModal(null)} className="w-full h-11 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs uppercase tracking-widest transition-all">Yopish</Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Support Components
function Trash2(props: any) {
   return (
     <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
   );
}
