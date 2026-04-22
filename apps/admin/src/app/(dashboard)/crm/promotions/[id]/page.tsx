"use client";

import { useEffect, useState } from 'react';
import { 
  ChevronLeft, Plus, Users, School, 
  MessageSquare, BarChart3, TrendingUp,
  CheckCircle2, Clock, X, Save, Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';

export default function PromotionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch_id') || 'all';
  const id = params.id;

  const [promotion, setPromotion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('classes');
  
  // Class Editing State
  const [editingClass, setEditingClass] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPromotion = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/promotions/${id}`);
      setPromotion(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotion();
  }, [id]);

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.patch(`/promotions/classes/${editingClass.id}`, editingClass);
      setEditingClass(null);
      fetchPromotion();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-50">
        <div className="w-10 h-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ma'lumotlar yuklanmoqda...</span>
      </div>
    );
  }

  if (!promotion) return <div>Topilmadi</div>;

  return (
    <div className="flex flex-col space-y-6 w-full py-4 animate-in fade-in duration-500">
      
      {/* 🔙 Back & Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full p-0 hover:bg-white hover:shadow-sm"
          >
            <ChevronLeft size={24} />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{promotion.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-pink-50 text-pink-500 border-none font-bold text-[10px] uppercase">
                {format(new Date(promotion.date), 'dd MMMM yyyy', { locale: uz })}
              </Badge>
              <span className="text-gray-300">•</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Mas'ul: {promotion.manager?.first_name} {promotion.manager?.last_name}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button className="h-11 bg-white hover:bg-gray-50 text-gray-900 border border-gray-100 rounded-2xl px-6 font-bold shadow-sm">
             <TrendingUp className="w-4 h-4 mr-2 text-indigo-500" /> Eksport (Excel)
          </Button>
          <Button className="h-11 bg-pink-500 hover:bg-pink-600 text-white font-black rounded-2xl px-6 shadow-xl shadow-pink-100 border-none uppercase tracking-wider text-[11px]">
             <Plus className="w-4 h-4 mr-2" /> Lid Qo'shish
          </Button>
        </div>
      </div>

      {/* 📊 Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border-none shadow-sm rounded-3xl">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
            <School size={12} /> Jami Siniflar
          </p>
          <h3 className="text-3xl font-black text-gray-900">{promotion.classes?.length || 0}</h3>
          <p className="text-xs font-bold text-gray-300 mt-2 italic">Faol sinif tashriflari</p>
        </Card>
        
        <Card className="p-6 bg-white border-none shadow-sm rounded-3xl">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
            <Users size={12} /> Jami O'quvchilar
          </p>
          <h3 className="text-3xl font-black text-indigo-500">
            {promotion.classes?.reduce((acc: number, c: any) => acc + (c.count || 0), 0)}
          </h3>
          <p className="text-xs font-bold text-gray-300 mt-2 italic">Tashrif qilingan kontingent</p>
        </Card>

        <Card className="p-6 bg-white border-none shadow-sm rounded-3xl">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
            <MessageSquare size={12} /> Olingan Lidlar
          </p>
          <h3 className="text-3xl font-black text-emerald-500">{promotion.leads?.length || 0}</h3>
          <p className="text-xs font-bold text-gray-300 mt-2 italic">Konversiya uchun tayyor</p>
        </Card>

        <Card className="p-6 bg-white border-none shadow-sm rounded-3xl bg-gradient-to-br from-pink-500 to-indigo-600 text-white">
          <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
            <TrendingUp size={12} /> ROI / Samaradorlik
          </p>
          <h3 className="text-3xl font-black">
            {promotion.classes?.reduce((acc: number, c: any) => acc + (c.count || 0), 0) > 0 
              ? ((promotion.leads?.length / promotion.classes?.reduce((acc: number, c: any) => acc + (c.count || 0), 0)) * 100).toFixed(1)
              : 0}%
          </h3>
          <p className="text-xs font-bold text-white/60 mt-2 italic">Lidga aylanish foizi</p>
        </Card>
      </div>

      {/* 📑 Tabs Area */}
      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="bg-transparent border-none p-0 h-auto gap-8 mb-6">
          <TabsTrigger value="classes" className="data-[state=active]:bg-transparent data-[state=active]:text-pink-500 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none px-0 py-2 font-black uppercase text-[11px] tracking-widest text-gray-400 border-b-2 border-transparent transition-all">
             Siniflar & Izohlar
          </TabsTrigger>
          <TabsTrigger value="leads" className="data-[state=active]:bg-transparent data-[state=active]:text-pink-500 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none px-0 py-2 font-black uppercase text-[11px] tracking-widest text-gray-400 border-b-2 border-transparent transition-all">
             Lidlar Ro'yxati
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotion.classes?.map((cls: any) => (
              <Card key={cls.id} className="p-6 bg-white border-none shadow-sm rounded-3xl relative group overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-indigo-500">
                    {cls.name}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setEditingClass(cls)}
                    className="opacity-0 group-hover:opacity-100 transition-all rounded-full"
                  >
                    <Edit2 size={16} className="text-gray-400" />
                  </Button>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-400 uppercase tracking-widest">O'quvchilar:</span>
                      <span className="text-gray-900">{cls.count || 0} ta</span>
                   </div>

                   <div className="pt-4 border-t border-gray-50">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Izoh:</p>
                      <p className="text-sm font-medium text-gray-600 leading-relaxed italic">
                        "{cls.notes || 'Izoh yozilmagan'}"
                      </p>
                   </div>
                </div>

                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              </Card>
            ))}

            <Card 
              className="p-6 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white hover:border-pink-200 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-300 group-hover:text-pink-500 transition-colors shadow-sm">
                <Plus size={24} />
              </div>
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Yangi Sinf Qo'shish</span>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="mt-0">
          <Card className="bg-white border-none shadow-sm rounded-3xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lid Ismi</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Telefon</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Bosqich</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {promotion.leads?.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => router.push(`/crm?search=${lead.phone}`)}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 text-sm">{lead.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-500 text-sm">{lead.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className="bg-indigo-50 text-indigo-600 border-none text-[10px] font-black uppercase">
                        {lead.stage?.name || 'Yangi'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-400 text-xs">{format(new Date(lead.created_at), 'dd.MM.yyyy HH:mm')}</p>
                    </td>
                  </tr>
                ))}
                {promotion.leads?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs opacity-30">
                      Ushbu tadbirdan hali lidlar kelmagan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 🔮 Edit Class Modal */}
      <AnimatePresence>
        {editingClass && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-[4px]" onClick={() => setEditingClass(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative z-10 w-full max-w-[480px]">
              <Card className="bg-white shadow-2xl rounded-[32px] border-none overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                  <h3 className="font-black text-xl text-gray-900">Sinfni Tahrirlash</h3>
                  <Button variant="ghost" size="icon" onClick={() => setEditingClass(null)} className="rounded-full">
                    <X size={20} />
                  </Button>
                </div>

                <form onSubmit={handleUpdateClass} className="p-8 space-y-6">
                   <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Sinf Nomi</label>
                        <input required value={editingClass.name} onChange={e => setEditingClass({...editingClass, name: e.target.value})} className="h-12 w-full bg-gray-50 border-none rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-pink-50 transition-all outline-none" />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">O'quvchilar Soni</label>
                        <input type="number" value={editingClass.count || ''} onChange={e => setEditingClass({...editingClass, count: parseInt(e.target.value)})} className="h-12 w-full bg-gray-50 border-none rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-pink-50 transition-all outline-none" />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Izoh / Test natijalari</label>
                        <textarea rows={4} value={editingClass.notes || ''} onChange={e => setEditingClass({...editingClass, notes: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-pink-50 transition-all outline-none resize-none" />
                      </div>
                   </div>

                   <div className="pt-6 flex justify-end gap-3 border-t border-gray-50">
                      <Button type="button" variant="ghost" onClick={() => setEditingClass(null)} className="h-12 px-6 rounded-2xl font-black text-[11px] uppercase tracking-widest text-gray-400">Bekor qilish</Button>
                      <Button type="submit" disabled={isSubmitting} className="h-12 px-8 bg-pink-500 hover:bg-pink-600 text-white font-black rounded-2xl shadow-xl shadow-pink-100 border-none transition-all uppercase tracking-widest text-[11px]">
                         {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
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
