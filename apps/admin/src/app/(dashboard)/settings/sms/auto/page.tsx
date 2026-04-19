"use client";

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
  Plus, Calendar, Clock, CheckCircle2, AlertCircle, Settings2, LayoutGrid, 
  Building2, MessageSquare, Trash2, Edit3, Save, Power, PowerOff, X, 
  Zap, Bell, Users, Send, Info, ChevronRight, Calculator
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function SmsAutoPage() {
  const confirm = useConfirm();
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch_id') || (typeof window !== 'undefined' ? localStorage.getItem('branch_id') : null) || 'all';

  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [templates, setTemplates] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [debtorsCount, setDebtorsCount] = useState(0);

  const [form, setForm] = useState({
    id: null as string | null,
    branch_id: 'all',
    template_id: '',
    scheduled_day: '5',
    scheduled_time: '10:00',
    type: 'DEBTOR',
    is_enabled: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [sendingDebtors, setSendingDebtors] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [configRes, tempRes, branchRes, debtorRes] = await Promise.all([
        api.get(`/sms/configs?branch_id=${branchId}`),
        api.get(`/sms/templates?branch_id=${branchId}`),
        api.get('/branches'),
        api.get(`/finance/debtors?branch_id=${branchId}&limit=1`) 
      ]);
      setConfigs(configRes.data?.data || configRes.data || []);
      setTemplates(tempRes.data?.data || tempRes.data || []);
      setBranches(branchRes.data?.data || branchRes.data || []);
      setDebtorsCount(debtorRes.data?.meta?.total || 0);
    } catch (err) { 
      // Silently handle or toast
    }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    setForm(f => ({ ...f, branch_id: branchId }));
  }, [branchId]);

  const handleSubmit = async () => {
    if (!form.template_id) {
       toast.error('Shablonni tanlang');
       return;
    }
    setSubmitting(true);
    try {
      await api.post('/sms/configs', { ...form, branch_id: form.branch_id === 'all' ? branchId : form.branch_id });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Saqlashda xatolik yuz berdi');
    }
    finally { setSubmitting(false); }
  };

  const manualSendDebtors = async () => {
    const isConfirmed = await confirm({
       title: 'Ommaviy SMS yuborish',
       message: `${debtorsCount} nafar qarzdorga ommaviy SMS yuborishni tasdiqlaysizmi? Bu jarayon xavfsiz batching (navbat) bilan amalga oshiriladi.`,
       type: 'info',
       confirmText: 'Yuborish',
       cancelText: 'Bekor qilish'
    });

    if (!isConfirmed) return;

    setSendingDebtors(true);
    try {
      const res = await api.post('/sms/send-debtors', { branch_id: branchId });
      toast.success(`${res.data.count} ta SMS muvaffaqiyatli yuborildi`);
    } catch (err) { 
      toast.error('SMS yuborishda xatolik yuz berdi');
    } finally {
      setSendingDebtors(false);
    }
  };

  // Pre-configured triggers (Payment, Enrollment)
  const autoTriggers = [
    { id: 'PAYMENT', title: 'To\'lov tasdiqnomasi', desc: 'To\'lov muvaffaqiyatli amalga oshirilganda kvitansiya yuborish', icon: <Calculator size={20} /> },
    { id: 'ENROLLMENT', title: 'Guruhga qo\'shilish', desc: 'Talaba guruhga qo\'shilganda tabrik va ma\'lumotlar yuborish', icon: <Users size={20} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAF9] p-6 pt-1 w-full mx-auto space-y-10">
      
      {/* ⚡ Quick Action: Manual Debtors Send */}
      <Card className="p-1 border-none shadow-sm bg-gradient-to-r from-navy-800 to-navy-900 overflow-hidden relative group">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-pink-500/10 skew-x-12 translate-x-20 group-hover:translate-x-10 transition-transform duration-500" />
        <div className="p-6 flex flex-wrap items-center justify-between gap-6 relative z-10 text-white">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-[12px] bg-white/10 backdrop-blur-md flex items-center justify-center text-pink-500">
              <Send size={28} className="rotate-12 group-hover:rotate-0 transition-transform" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold tracking-tight mb-1 uppercase">Ommaviy Qarz Bildirishnomasi</h3>
              <p className="text-[13px] text-white/60 font-medium max-w-[400px]">
                Hozirgi vaqtda <span className="text-pink-400 font-bold">{debtorsCount} ta</span> qarzdor talaba aniqlandi. Ularga bir tugma orqali SMS yuborish.
              </p>
            </div>
          </div>
          <Button 
            onClick={manualSendDebtors}
            disabled={sendingDebtors || debtorsCount === 0}
            className="h-12 px-8 rounded-[8px] bg-white text-navy-900 hover:bg-pink-500 hover:text-white font-bold text-[14px] flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
          >
            {sendingDebtors ? (
              <div className="w-5 h-5 border-2 border-navy-800/20 border-t-navy-800 rounded-full animate-spin" />
            ) : <Send size={18} />}
            Hozir yuborish
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* 🛠 Left Column: Automatic Triggers */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-2 px-1">
             <div className="w-8 h-8 rounded-[8px] bg-pink-50 text-pink-500 flex items-center justify-center">
                <Zap size={16} fill="currentColor" />
             </div>
             <h2 className="text-[16px] font-[700] text-gray-800 uppercase tracking-tight">Avtomatik Triggerlar</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
             {autoTriggers.map(trigger => {
                const config = configs.find(c => c.type === trigger.id);
                return (
                  <div key={trigger.id} className="bg-white p-6 rounded-[12px] border border-gray-100 shadow-sm hover:border-pink-200 transition-colors group">
                    <div className="flex items-start justify-between gap-6">
                       <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-[10px] bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-pink-50 group-hover:text-pink-500 transition-all shrink-0">
                             {trigger.icon}
                          </div>
                          <div>
                            <h4 className="text-[15px] font-bold text-gray-800 mb-1">{trigger.title}</h4>
                            <p className="text-[12px] text-gray-400 font-medium leading-relaxed">{trigger.desc}</p>
                          </div>
                       </div>
                       <Switch 
                         checked={config?.is_enabled || false} 
                         onCheckedChange={(checked) => {
                            if (!config && checked) {
                              setForm({ ...form, id: null, type: trigger.id, is_enabled: true });
                              setIsModalOpen(true);
                            } else if (config) {
                              api.post('/sms/configs', { ...config, is_enabled: checked }).then(() => fetchData());
                            }
                         }}
                         className="data-[state=checked]:bg-pink-500" 
                       />
                    </div>
                    
                    {config && (
                      <div className="mt-5 pt-5 border-t border-gray-50 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <MessageSquare size={14} className="text-gray-300" />
                           <span className="text-[11px] font-bold text-navy-800 uppercase bg-gray-50 px-3 py-1 rounded-full">
                              {config.template?.name || 'Tanlanmagan'}
                           </span>
                         </div>
                         <button 
                           onClick={() => { setForm({...config, branch_id: config.branch_id || 'all', scheduled_day: config.scheduled_day.toString()}); setIsModalOpen(true); }}
                           className="text-[11px] font-bold text-pink-500 hover:bg-pink-50 px-3 py-1 rounded-[6px] transition-colors flex items-center gap-1"
                         >
                            O'zgartirish <ChevronRight size={12} />
                         </button>
                      </div>
                    )}
                  </div>
                );
             })}
          </div>

          {/* 📅 Right Column (Stacked below on mobile): Scheduled Alarms */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-6 px-1">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[8px] bg-navy-100 text-navy-800 flex items-center justify-center">
                     <Bell size={16} fill="currentColor" />
                  </div>
                  <h2 className="text-[16px] font-[700] text-gray-800 uppercase tracking-tight">Rejalashtirilgan Eslatmalar</h2>
               </div>
               <Button 
                 onClick={() => { setForm({id: null, branch_id: branchId, template_id:'', scheduled_day:'5', scheduled_time:'10:00', type: 'DEBTOR', is_enabled:true}); setIsModalOpen(true); }} 
                 className="h-10 px-4 rounded-[8px] bg-pink-500 hover:bg-pink-600 text-white font-semibold text-[12px] flex items-center gap-2 shadow-sm transition-all active:scale-95 border-none outline-none"
               >
                 <Plus size={16} /> Yangi reja
               </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
               {loading ? [1,2].map(i => <div key={i} className="h-24 bg-white rounded-[12px] border animate-pulse" />) : configs.filter(c => c.type === 'DEBTOR').length === 0 ? (
                  <div className="py-12 border-2 border-dashed border-gray-100 rounded-[12px] flex flex-col items-center justify-center text-gray-300 gap-3 grayscale opacity-30">
                    <Calendar size={40} />
                    <span className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Rejalar mavjud emas</span>
                  </div>
               ) : configs.filter(c => c.type === 'DEBTOR').map(config => (
                  <div key={config.id} className="bg-white p-5 rounded-[12px] border border-gray-100 shadow-sm flex items-center justify-between gap-6 hover:border-navy-200 transition-all">
                     <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-[8px] flex items-center justify-center transition-colors shadow-sm", config.is_enabled ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400")}>
                           {config.is_enabled ? <Power size={18} /> : <PowerOff size={18} />}
                        </div>
                        <div>
                           <h4 className="text-[14px] font-bold text-gray-800 uppercase tracking-tight mb-1">{config.template?.name}</h4>
                           <div className="flex items-center gap-4">
                              <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider">
                                <Building2 size={12} /> {config.branch?.name || 'Barcha filiallar'}
                              </span>
                              <span className="text-[10px] font-bold text-navy-800 bg-navy-50 px-2 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-wider">
                                <Calendar size={12} /> Har oyning {config.scheduled_day}-sanasi
                              </span>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="text-right border-l border-gray-50 pl-6">
                           <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-0.5 text-center">Vaqt</p>
                           <p className="text-[15px] font-black text-gray-700 flex items-center gap-1.5 justify-center">
                              <Clock size={14} className="text-emerald-500" /> {config.scheduled_time}
                           </p>
                        </div>
                        <div className="flex items-center gap-1">
                           <button onClick={() => { setForm({ ...config, branch_id: config.branch_id || 'all', scheduled_day: config.scheduled_day.toString() }); setIsModalOpen(true); }} className="w-9 h-9 rounded-[8px] bg-gray-50 flex items-center justify-center text-gray-400 hover:text-navy-800 hover:bg-navy-100 transition-all active:scale-95">
                              <Edit3 size={16} />
                           </button>
                           <button className="w-9 h-9 rounded-[8px] bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95">
                              <Trash2 size={16} />
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
          </div>
        </div>

        {/* 📚 Right Sidebar: Info & Logs stub */}
        <div className="space-y-6 lg:sticky lg:top-6">
           <Card className="p-6 border-none shadow-sm bg-white overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-[15px] font-bold text-gray-800 uppercase tracking-tight">Eslatmalar</h3>
                 <Info size={16} className="text-gray-300" />
              </div>
              <div className="space-y-4">
                 {[
                   { title: 'Safe Sending', text: 'Eskiz platformasidan taqiq olmaslik uchun ommaviy xabarlar orasida 1 soniya pauza qo\'shiladi.', icon: <CheckCircle2 className="text-emerald-500" /> },
                   { title: 'Variable Check', text: 'Xabarlarda (STUDENT) o\'zgaruvchisi foydalanuvchi ismi bilan almashadi.', icon: <CheckCircle2 className="text-emerald-500" /> },
                   { title: 'Night Hours', text: 'SMS xabarnomalar kunduzgi vaqtda (10:00 - 18:00) yuborilishi tavsiya etiladi.', icon: <AlertCircle className="text-amber-500" /> },
                 ].map((item, i) => (
                   <div key={i} className="flex gap-4 p-4 rounded-[8px] bg-gray-50/50 border border-gray-50">
                      <div className="shrink-0 pt-1">{item.icon}</div>
                      <div>
                        <p className="text-[12px] font-bold text-gray-700 mb-1">{item.title}</p>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium">{item.text}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="p-6 border-none shadow-sm bg-white border-t-2 border-pink-500/20">
              <h3 className="text-[15px] font-bold text-gray-800 uppercase tracking-tight mb-4">Filiallar va Triggerlar</h3>
              <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic mb-4">
                "Barcha filiallar" sozlamasi har bir filial uchun alohida sozlama mavjud bo'lmasa ishlatiladi.
              </p>
              <div className="w-full h-1 bg-gray-50 rounded-full" />
           </Card>
        </div>
      </div>

      {/* --- CREATE/EDIT MODAL --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[16px] p-0 border-none shadow-2xl overflow-hidden selection:bg-pink-100">
           <div className="h-2 bg-gradient-to-r from-pink-500 to-navy-800 w-full" />
           
           <div className="p-8 space-y-8 text-left">
              <DialogHeader className="items-start space-y-2">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-[12px] flex items-center justify-center text-gray-800 border shadow-sm">
                       <Calendar size={24} />
                    </div>
                    <div>
                       <DialogTitle className="text-[18px] font-bold text-gray-900 leading-none">
                          {form.id ? 'Rejani tahrirlash' : 'Yangi reja yaratish'}
                       </DialogTitle>
                       <DialogDescription className="text-[13px] text-gray-500 font-medium capitalize">
                          {form.type.toLowerCase()} xabarnomalari uchun reja sozlash
                       </DialogDescription>
                    </div>
                 </div>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6">
                 <div className="col-span-2 space-y-2">
                    <Label className="text-[13px] font-semibold text-gray-700">Shablon tanlang</Label>
                    <Select value={form.template_id} onValueChange={v => setForm({...form, template_id: v})}>
                       <SelectTrigger className="h-11 rounded-[8px] bg-white border border-gray-200 text-gray-700 text-[14px] font-medium transition-all shadow-none">
                          <SelectValue placeholder="Shablonni tanlang" />
                       </SelectTrigger>
                       <SelectContent className="rounded-[12px] border-gray-100 shadow-xl overflow-hidden">
                          {templates.map(t => (
                            <SelectItem key={t.id} value={t.id} className="text-[14px] font-medium py-3 border-b border-gray-50 last:border-none focus:bg-pink-50 focus:text-pink-600 transition-colors">
                               {t.name}
                            </SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                 </div>

                 <div className="col-span-2 space-y-2">
                    <Label className="text-[13px] font-semibold text-gray-700">Filial (Branch)</Label>
                    <Select value={form.branch_id} onValueChange={v => setForm({...form, branch_id: v})}>
                       <SelectTrigger className="h-11 rounded-[8px] bg-white border border-gray-200 text-gray-700 text-[14px] font-medium transition-all shadow-none">
                          <SelectValue placeholder="Barcha filiallar" />
                       </SelectTrigger>
                       <SelectContent className="rounded-[12px] border-gray-100 shadow-xl">
                          <SelectItem value="all" className="font-bold text-pink-500 uppercase tracking-widest text-[11px] py-4 border-b border-pink-50">Barcha filiallar</SelectItem>
                          {branches.map(b => <SelectItem key={b.id} value={b.id} className="text-[14px] font-medium py-3 border-b border-gray-50 last:border-none">{b.name}</SelectItem>)}
                       </SelectContent>
                    </Select>
                 </div>

                 {form.type === 'DEBTOR' && (
                  <>
                    <div className="col-span-1 space-y-2">
                       <Label className="text-[13px] font-semibold text-gray-700">Oyning sanasi (1-31)</Label>
                       <Input 
                          type="number" 
                          value={form.scheduled_day} 
                          onChange={e => setForm({...form, scheduled_day: e.target.value})}
                          className="h-11 rounded-[8px] bg-white border border-gray-200 font-bold text-[14px] text-pink-600 px-4 focus-visible:ring-pink-500/20"
                       />
                    </div>

                    <div className="col-span-1 space-y-2">
                       <Label className="text-[13px] font-semibold text-gray-700">Vaqti (HH:MM)</Label>
                       <Input 
                          value={form.scheduled_time} 
                          onChange={e => setForm({...form, scheduled_time: e.target.value})}
                          placeholder="10:00"
                          className="h-11 rounded-[8px] bg-white border border-gray-200 font-bold text-[14px] text-gray-700 px-4 focus-visible:ring-pink-500/20"
                       />
                    </div>
                  </>
                 )}

                 <div className="col-span-2 flex items-center justify-between p-4 bg-gray-50/50 rounded-[12px] border border-gray-100 mt-2">
                    <div className="flex flex-col gap-0.5">
                       <Label className="text-[14px] font-bold text-gray-800">Holati</Label>
                       <p className="text-[11px] font-medium text-gray-400">Reja yoqilgan/o'chirilgan</p>
                    </div>
                    <Switch 
                       checked={form.is_enabled} 
                       onCheckedChange={v => setForm({...form, is_enabled: v})} 
                       className="data-[state=checked]:bg-pink-500"
                    />
                 </div>
              </div>

              <DialogFooter className="flex gap-4 pt-6 border-t border-gray-50">
                 <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="h-11 px-8 rounded-[8px] font-bold text-[12px] uppercase tracking-widest text-gray-400 hover:bg-gray-100 flex-1 hover:text-gray-900 border-none transition-all">Bekor qilish</Button>
                 <Button 
                   onClick={handleSubmit} 
                   disabled={submitting} 
                   className="h-11 px-8 rounded-[8px] font-bold text-[12px] uppercase tracking-widest bg-navy-800 hover:bg-navy-900 text-white flex-1 transition-all active:scale-95 shadow-lg shadow-navy-100 flex items-center gap-3 border-none flex-2"
                 >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={18} /> Saqlash
                      </>
                    )}
                 </Button>
              </DialogFooter>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
