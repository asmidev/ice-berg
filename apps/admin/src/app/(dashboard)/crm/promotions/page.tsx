"use client";

import { useEffect, useState } from 'react';
import { 
  Search, Plus, Calendar, Users, 
  ChevronRight, BarChart3, School,
  MoreHorizontal, Eye, Edit2, Trash2,
  Filter, ArrowUpRight, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';

export default function PromotionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch_id') || 'all';

  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    manager_id: '',
    classes: [{ name: '', count: '', notes: '' }]
  });

  const [staff, setStaff] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [promosRes, staffRes] = await Promise.all([
        api.get(`/promotions?branch_id=${branchId}&search=${search}`),
        api.get(`/settings/office/staff?branch_id=${branchId}`)
      ]);
      setPromotions(promosRes.data || []);
      setStaff(staffRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [branchId, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/promotions', {
        ...formData,
        branch_id: branchId === 'all' ? null : branchId
      });
      setIsModalOpen(false);
      setFormData({ name: '', date: format(new Date(), 'yyyy-MM-dd'), manager_id: '', classes: [{ name: '', count: '', notes: '' }] });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addClassRow = () => {
    setFormData({ ...formData, classes: [...formData.classes, { name: '', count: '', notes: '' }] });
  };

  return (
    <div className="flex flex-col space-y-6 w-full py-4 animate-in fade-in duration-500">
      
      {/* 🚀 Top Stats Overlay */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border-none shadow-sm rounded-2xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <School size={80} className="text-pink-500" />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Jami tadbirlar</p>
            <h3 className="text-3xl font-black text-gray-900">{promotions.length} <span className="text-sm font-medium text-gray-400 ml-1">ta</span></h3>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-emerald-500 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
              <ArrowUpRight size={12} /> +12% bu oy
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-none shadow-sm rounded-2xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <Users size={80} className="text-indigo-500" />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Yig'ilgan lidlar</p>
            <h3 className="text-3xl font-black text-gray-900">
              {promotions.reduce((acc, p) => acc + (p._count?.leads || 0), 0)}
              <span className="text-sm font-medium text-gray-400 ml-1">ta</span>
            </h3>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-indigo-500 bg-indigo-50 w-fit px-2 py-0.5 rounded-full">
              <BarChart3 size={12} /> ROI: {promotions.length > 0 ? (promotions.reduce((acc, p) => acc + (p._count?.leads || 0), 0) / promotions.length).toFixed(1) : 0} lid/tadbir
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-none shadow-sm rounded-2xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <BarChart3 size={80} className="text-amber-500" />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">O'rtacha samaradorlik</p>
            <h3 className="text-3xl font-black text-gray-900">14%</h3>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-amber-500 bg-amber-50 w-fit px-2 py-0.5 rounded-full">
              Konversiya (Lid &rarr; O'quvchi)
            </div>
          </div>
        </Card>
      </div>

      {/* 🔍 Filter & Action Bar */}
      <Card className="p-4 bg-white border-none shadow-sm rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Maktab yoki tadbir nomi..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-pink-200 transition-all outline-none text-[14px] font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="h-11 bg-pink-500 hover:bg-pink-600 text-white font-black rounded-xl px-6 shadow-lg shadow-pink-100 border-none uppercase tracking-wider text-[11px]"
          >
            <Plus className="w-4 h-4 mr-2" /> Yangi Tadbir
          </Button>
        </div>
      </Card>

      {/* 🏔️ Promotions List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-50">
           <div className="w-10 h-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ma'lumotlar yuklanmoqda...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <motion.div 
              key={promo.id}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Card 
                onClick={() => router.push(`/crm/promotions/${promo.id}?branch_id=${branchId}`)}
                className="group bg-white border-none shadow-sm hover:shadow-xl hover:shadow-pink-500/5 rounded-[24px] overflow-hidden cursor-pointer transition-all border-l-4 border-l-transparent hover:border-l-pink-500"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-pink-50 transition-colors">
                      <School className="text-gray-400 group-hover:text-pink-500 transition-colors" size={24} />
                    </div>
                    <Badge variant="secondary" className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-tight py-1 px-3 rounded-full">
                      {format(new Date(promo.date), 'dd MMMM', { locale: uz })}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-black text-gray-900 mb-2 group-hover:text-pink-500 transition-colors">{promo.name}</h3>
                  
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                    <Users size={14} className="opacity-50" />
                    <span className="font-medium">{promo.manager?.first_name} {promo.manager?.last_name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Siniflar</p>
                      <p className="text-lg font-black text-gray-900">{promo.classes?.length || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lidlar</p>
                      <p className="text-lg font-black text-emerald-500">+{promo._count?.leads || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50/50 group-hover:bg-pink-50/30 transition-colors flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 group-hover:text-pink-500 uppercase tracking-widest">Batafsil ko'rish</span>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-pink-500 translate-x-0 group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </motion.div>
          ))}

          {promotions.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 opacity-30">
               <School size={64} className="mb-4" />
               <p className="font-black uppercase tracking-[0.2em] text-sm">Hozircha hech qanday tadbir yo'q</p>
            </div>
          )}
        </div>
      )}

      {/* 🔮 Add Promotion Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-[4px]" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative z-10 w-full max-w-[640px]">
              <Card className="bg-white shadow-2xl rounded-[32px] border-none overflow-hidden">
                 <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div>
                      <h3 className="font-black text-2xl text-gray-900">Yangi Targ'ibot</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Maktab yoki tadbir ma'lumotlari</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full hover:bg-gray-50 transition-colors">
                      <Plus className="rotate-45" size={24} />
                    </Button>
                 </div>
                 
                 <form onSubmit={handleCreate} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="flex flex-col gap-2">
                          <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Tadbir / Maktab nomi</label>
                          <input required type="text" placeholder="Masalan: 5-maktab tashrifi" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-12 w-full bg-gray-50 border-none rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-pink-50 transition-all outline-none" />
                       </div>
                       
                       <div className="flex flex-col gap-2">
                          <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Sana</label>
                          <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="h-12 w-full bg-gray-50 border-none rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-pink-50 transition-all outline-none" />
                       </div>

                       <div className="flex flex-col gap-2 md:col-span-2">
                          <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Mas'ul xodim</label>
                          <select 
                            required 
                            value={formData.manager_id} 
                            onChange={e => setFormData({...formData, manager_id: e.target.value})}
                            className="h-12 w-full bg-gray-50 border-none rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-pink-50 transition-all outline-none appearance-none"
                          >
                             <option value="">Tanlang...</option>
                             {staff.map(s => <option key={s.id} value={s.user_id}>{s.user?.first_name} {s.user?.last_name}</option>)}
                          </select>
                       </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Siniflar / Bo'limlar</label>
                        <Button type="button" variant="ghost" size="sm" onClick={addClassRow} className="text-pink-500 font-black text-[10px] uppercase">
                          <Plus size={14} className="mr-1" /> Sinf Qo'shish
                        </Button>
                      </div>

                      {formData.classes.map((cls, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-2xl grid grid-cols-12 gap-4 items-start border border-transparent hover:border-pink-100 transition-all">
                          <div className="col-span-4 flex flex-col gap-1.5">
                            <input placeholder="Sinf (10-A)" value={cls.name} onChange={e => {
                              const newClasses = [...formData.classes];
                              newClasses[idx].name = e.target.value;
                              setFormData({...formData, classes: newClasses});
                            }} className="bg-white h-10 px-3 rounded-xl border-none font-bold text-sm outline-none focus:ring-2 focus:ring-pink-100" />
                          </div>
                          <div className="col-span-3 flex flex-col gap-1.5">
                            <input type="number" placeholder="Soni" value={cls.count} onChange={e => {
                              const newClasses = [...formData.classes];
                              newClasses[idx].count = e.target.value;
                              setFormData({...formData, classes: newClasses});
                            }} className="bg-white h-10 px-3 rounded-xl border-none font-bold text-sm outline-none focus:ring-2 focus:ring-pink-100" />
                          </div>
                          <div className="col-span-5 flex flex-col gap-1.5 relative">
                            <textarea placeholder="Izoh..." value={cls.notes} onChange={e => {
                              const newClasses = [...formData.classes];
                              newClasses[idx].notes = e.target.value;
                              setFormData({...formData, classes: newClasses});
                            }} className="bg-white h-10 px-3 py-2 rounded-xl border-none font-bold text-sm outline-none focus:ring-2 focus:ring-pink-100 resize-none" />
                            {formData.classes.length > 1 && (
                              <button type="button" onClick={() => setFormData({...formData, classes: formData.classes.filter((_, i) => i !== idx)})} className="absolute -right-2 -top-2 w-5 h-5 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                                <Plus className="rotate-45" size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-8 flex justify-end gap-3 border-t border-gray-50">
                      <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="h-12 px-6 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all uppercase tracking-widest text-[11px]">Bekor qilish</Button>
                      <Button type="submit" disabled={isSubmitting} className="h-12 px-8 bg-pink-500 hover:bg-pink-600 text-white font-black rounded-2xl shadow-xl shadow-pink-100 border-none transition-all uppercase tracking-widest text-[11px]">
                         {isSubmitting ? "Saqlanmoqda..." : "Tadbirni yaratish"}
                      </Button>
                    </div>
                 </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
