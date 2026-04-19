"use client";

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, Banknote, Landmark, Smartphone, MoreHorizontal, 
  Plus, Search, Settings2, ShieldCheck, Wallet, Loader2, ArrowRight,
  TrendingUp, Activity, CheckCircle2, Trash2, Edit3, Save
} from 'lucide-react';
import { useConfirm } from '@/hooks/use-confirm';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Static Gateway Definitions (Icons and Colors)
const GATEWAY_DEFS: any = {
  cash: { name: "Naqd Pul (Kassa)", icon: Banknote, color: "emerald", desc: "Fizik pul olib kelinganida" },
  card: { name: "Plastik Karta (Terminal)", icon: CreditCard, color: "blue", desc: "Bank terminali orqali" },
};

export default function PaymentTypesSettingsPage() {
  const confirm = useConfirm();
  const searchParams = useSearchParams();
  const [branchId, setBranchId] = useState('all');
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [branch, setBranch] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingGateway, setEditingGateway] = useState<any>(null);
  
  // Forms
  const [categoryForm, setCategoryForm] = useState({ name: '', is_active: true });
  const [gatewayForm, setGatewayForm] = useState<any>({});
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const bId = (typeof window !== 'undefined' ? localStorage.getItem('branch_id') : null) || 'all';
    setBranchId(bId);
    setMounted(true);
  }, [searchParams]);

  const fetchData = async () => {
    if (!mounted || branchId === 'all') return;
    setLoading(true);
    try {
      const [branchRes, categoriesRes] = await Promise.all([
        api.get(`/branches/${branchId}`),
        api.get(`/finance/payment-categories?branch_id=${branchId}`)
      ]);
      setBranch(branchRes.data);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [branchId, mounted]);

  const handleToggleGateway = async (key: string, enabled: boolean) => {
    try {
       await api.post(`/branches/${branchId}/gateways`, {
          [key]: { enabled }
       });
       fetchData();
    } catch (err) {
       console.error(err);
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name) return;
    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(`/finance/payment-categories/${editingCategory.id}`, categoryForm);
      } else {
        await api.post(`/finance/payment-categories`, { ...categoryForm, branch_id: branchId });
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', is_active: true });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Kategoriyani o'chirish",
      message: "O'chirishni tasdiqlaysizmi?",
      type: "danger"
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/finance/payment-categories/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveGatewayConfig = async () => {
    setSubmitting(true);
    try {
      await api.post(`/branches/${branchId}/gateways`, {
        [editingGateway.key]: gatewayForm
      });
      setIsGatewayModalOpen(false);
      setEditingGateway(null);
      setGatewayForm({});
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;
  if (branchId === 'all') return (
     <div className="flex flex-col items-center justify-center p-20 text-center">
        <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 mb-6 font-bold text-2xl">!</div>
        <h2 className="text-2xl font-black text-navy-800">Filialni tanlang</h2>
        <p className="text-gray-500 mt-2">Sozlamalarni ko'rish uchun yuqoridan filialni tanlanishi shart.</p>
     </div>
  );

  const gateways = branch?.settings?.gateways || {};

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-700 pb-12">
      
      {/* 📊 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card className="p-[24px] border border-gray-100 shadow-sm bg-white rounded-[16px] flex items-center gap-4 group hover:border-pink-200 transition-colors">
            <div className="w-[52px] h-[52px] rounded-2xl bg-pink-50 flex items-center justify-center text-[#EC4899] shrink-0 group-hover:scale-110 transition-transform">
               <Wallet className="w-6 h-6" />
            </div>
            <div>
               <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-none">Jami Usullar</h3>
               <p className="text-[26px] font-black text-gray-900 leading-none">{Object.keys(gateways).length + (Object.keys(gateways).includes('cash') ? 0 : 1)}</p>
            </div>
         </Card>
         <Card className="p-[24px] border border-gray-100 shadow-sm bg-white rounded-[16px] flex items-center gap-4 group hover:border-emerald-200 transition-colors">
            <div className="w-[52px] h-[52px] rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-110 transition-transform">
               <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
               <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-none">Faol Gatewaylar</h3>
               <p className="text-[26px] font-black text-gray-900 leading-none">
                 {Object.values(gateways).filter((g: any) => g.enabled).length}
               </p>
            </div>
         </Card>
         <Card className="p-[24px] border border-gray-100 shadow-sm bg-white rounded-[16px] flex items-center gap-4 group hover:border-blue-200 transition-colors">
            <div className="w-[52px] h-[52px] rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-110 transition-transform">
               <Activity className="w-6 h-6" />
            </div>
            <div>
               <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-none">Kategoriyalar</h3>
               <p className="text-[26px] font-black text-gray-900 leading-none">{categories.length}</p>
            </div>
         </Card>
      </div>

      <Tabs defaultValue="methods" className="w-full">
         <div className="flex items-center justify-between mb-2">
            <TabsList className="bg-gray-100/50 p-1 rounded-xl">
               <TabsTrigger value="methods" className="rounded-lg font-bold text-[13px] px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-pink-600 data-[state=active]:shadow-sm">To'lov Usullari (Gateways)</TabsTrigger>
               <TabsTrigger value="categories" className="rounded-lg font-bold text-[13px] px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-pink-600 data-[state=active]:shadow-sm">To'lov Kategoriyalari</TabsTrigger>
            </TabsList>

            {/* Action button for Categories tab */}
            <TabsContent value="categories" className="m-0">
               <Button onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', is_active: true }); setIsCategoryModalOpen(true); }} className="bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl flex items-center gap-2 h-10 px-5 shadow-lg shadow-pink-200">
                  <Plus className="w-4 h-4" /> Qo'shish
               </Button>
            </TabsContent>
         </div>

         <TabsContent value="methods" className="mt-4 animate-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
               {Object.entries(GATEWAY_DEFS).map(([key, def]: [string, any]) => {
                  const config = gateways[key] || { enabled: key === 'cash' || key === 'card' };
                  const Icon = def.icon;
                  return (
                     <Card key={key} className={cn(
                        "p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group",
                        config.enabled ? "bg-white border-gray-100 shadow-sm" : "bg-gray-50 border-gray-100 opacity-70 grayscale"
                     )}>
                        <div className="flex items-start justify-between mb-6">
                           <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-transform group-hover:rotate-3",
                              config.enabled ? `bg-${def.color}-50 border-${def.color}-100 text-${def.color}-600` : "bg-white border-gray-200 text-gray-400"
                           )}>
                              <Icon className="w-7 h-7" />
                           </div>
                           <Switch 
                              checked={config.enabled} 
                              onCheckedChange={(val) => handleToggleGateway(key, val)}
                              className="data-[state=checked]:bg-emerald-500 scale-110" 
                           />
                        </div>
                        
                        <h3 className="text-lg font-black text-navy-800 leading-tight">{def.name}</h3>
                        <p className="text-[13px] font-bold text-gray-500 mt-2 min-h-[40px] leading-relaxed">{def.desc}</p>

                        <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-50">
                           <div className="flex items-center gap-2">
                              {config.enabled ? (
                                 <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-none">Faol</Badge>
                              ) : (
                                 <Badge className="bg-gray-100 text-gray-400 border-gray-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-none">O'chirilgan</Badge>
                              )}
                           </div>
                        </div>
                     </Card>
                  );
               })}
            </div>
         </TabsContent>

         <TabsContent value="categories" className="mt-4 animate-in slide-in-from-bottom-2 duration-500">
            <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                           <th className="py-4 pl-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-16">T/R</th>
                           <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Kategoriya Nomi</th>
                           <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Holat</th>
                           <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Yaratilgan</th>
                           <th className="py-4 pr-6 text-right w-24"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {loading ? (
                           [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={5} className="py-6 pl-6"><div className="h-4 bg-gray-100 rounded-full w-full" /></td></tr>)
                        ) : categories.length === 0 ? (
                           <tr>
                              <td colSpan={5} className="py-20 text-center flex flex-col items-center">
                                 <Activity className="w-12 h-12 text-gray-200 mb-4" />
                                 <p className="text-gray-400 font-bold">Kategoriyalar topilmadi</p>
                              </td>
                           </tr>
                        ) : categories.map((cat, idx) => (
                           <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="py-5 pl-6 text-[13px] font-bold text-gray-400">{idx + 1}</td>
                              <td className="py-5 px-6 font-bold text-navy-800">{cat.name}</td>
                              <td className="py-5 px-6 text-center">
                                 {cat.is_active ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">Faol</span>
                                 ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">Faolsiz</span>
                                 )}
                              </td>
                              <td className="py-5 px-6 text-center text-[12px] font-bold text-gray-400">
                                 {new Date(cat.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-5 pr-6 text-right">
                                 <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button onClick={() => { setEditingCategory(cat); setCategoryForm({ name: cat.name, is_active: cat.is_active }); setIsCategoryModalOpen(true); }} variant="outline" size="icon" className="h-9 w-9 border-gray-100 rounded-xl text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                       <Edit3 className="w-4 h-4" />
                                    </Button>
                                    <Button onClick={() => handleDeleteCategory(cat.id)} variant="outline" size="icon" className="h-9 w-9 border-gray-100 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                                       <Trash2 className="w-4 h-4" />
                                    </Button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </Card>
         </TabsContent>
      </Tabs>

      {/* --- CATEGORY MODAL --- */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
         <DialogContent className="sm:max-w-md rounded-3xl p-8 border-none shadow-2xl">
            <DialogHeader className="space-y-4">
               <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 mx-auto">
                  <Activity className="w-8 h-8" />
               </div>
               <DialogTitle className="text-2xl font-black text-center text-navy-800">
                  {editingCategory ? "Kategoriyani Tahrirlash" : "Yangi Kategoriya"}
               </DialogTitle>
               <DialogDescription className="text-center font-bold text-gray-400">
                  To'lov turlarini (maqsadi) boshqarish tizimi
               </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-6">
               <div className="space-y-2">
                  <Label className="text-[12px] font-black uppercase text-gray-400 tracking-widest ml-1">Kategoriya Nomi</Label>
                  <Input 
                     value={categoryForm.name}
                     onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}
                     placeholder="Masalan: Kurs To'lovi"
                     className="h-14 rounded-2xl border-gray-100 focus:border-pink-500 font-bold bg-gray-50/50"
                  />
               </div>
               <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <div className="flex flex-col">
                     <span className="text-[14px] font-bold text-navy-800 tracking-tight">Status</span>
                     <span className="text-[11px] font-bold text-gray-400 tracking-tight">Kategoriya barcha jadvallarda ko'rinadi</span>
                  </div>
                  <Switch 
                     checked={categoryForm.is_active}
                     onCheckedChange={(val) => setCategoryForm({...categoryForm, is_active: val})}
                     className="data-[state=checked]:bg-pink-600"
                  />
               </div>
            </div>

            <DialogFooter className="gap-3 sm:justify-center">
               <Button onClick={() => setIsCategoryModalOpen(false)} variant="outline" className="h-12 flex-1 rounded-2xl font-bold border-gray-100">Bekor qilish</Button>
               <Button onClick={handleSaveCategory} disabled={submitting} className="h-12 flex-1 rounded-2xl font-bold bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-200">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingCategory ? "Saqlash" : "Yaratish"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
