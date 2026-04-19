"use client";

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Percent, Users, Activity, Tag, Sparkles, Plus, 
  Settings, Loader2, TrendingDown, ArrowRight, Trash2, Edit2
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import api from '@/lib/api';
import { useBranch } from '@/providers/BranchProvider';
import { useConfirm } from '@/hooks/use-confirm';
import { DiscountTypeDialog } from './components/DiscountTypeDialog';
import { toast } from "sonner";

export default function DiscountsReportPage() {
  const confirm = useConfirm();
  const { branchId } = useBranch();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [discountTypes, setDiscountTypes] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [branchId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, typesRes] = await Promise.all([
        api.get('/discounts/analytics', { params: { branch_id: branchId } }),
        api.get('/discounts')
      ]);
      
      // Ensure data is mapped correctly based on common API wrapper patterns
      const analyticsData = analyticsRes.data?.data || analyticsRes.data || {};
      const typesData = Array.isArray(typesRes.data) ? typesRes.data : (typesRes.data?.data || []);
      
      setAnalytics(analyticsData);
      setDiscountTypes(typesData);
    } catch (e) {
      console.error(e);
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (discount: any) => {
    setSelectedDiscount(discount);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Chegirmani o'chirish",
      message: "Ushbu chegirmani o'chirib tashlamoqchimisiz?",
      type: "danger"
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/discounts/${id}`);
      toast.success("Muvaffaqiyatli o'chirildi");
      fetchData();
    } catch (e) {
      toast.error("O'chirishda xatolik");
    }
  };

  const COLORS = ['#1e3a5f', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500 pb-12 w-full mx-auto pt-4">
      
      {/* 📊 WIDGETS - UI Rules Gradient Order */}

      {/* 📊 WIDGETS - UI Rules Gradient Order */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Total Loss - Navy Gradient (Type 3) */}
         <Card className="relative overflow-hidden rounded-[24px] p-8 shadow-sm border-none group transition-all duration-300" 
               style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)' }}>
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
               <TrendingDown className="w-24 h-24 text-white" />
            </div>
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                 </div>
                 <span className="text-[12px] font-bold text-white/70 uppercase tracking-widest">Jami Yo'qotish</span>
              </div>
              <div className="text-4xl font-black text-white tracking-tighter">
                {analytics?.totalLoss?.toLocaleString()} <span className="text-sm font-bold opacity-70">sum</span>
              </div>
              <p className="text-white/60 text-xs font-bold pt-2">Active o'quvchilar uchun oylik chegirmalar</p>
            </div>
         </Card>

         {/* Students Count - Purple Gradient (Type 4) */}
         <Card className="relative overflow-hidden rounded-[24px] p-8 shadow-sm border-none group transition-all duration-300" 
               style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}>
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
               <Users className="w-24 h-24 text-white" />
            </div>
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                 </div>
                 <span className="text-[12px] font-bold text-white/70 uppercase tracking-widest">Imtiyozli O'quvchilar</span>
              </div>
              <div className="text-4xl font-black text-white tracking-tighter">
                {analytics?.studentCount} <span className="text-sm font-bold opacity-70">ta</span>
              </div>
              <p className="text-white/60 text-xs font-bold pt-2">Jami {analytics?.activeDiscountsCount} ta aktiv chegirma</p>
            </div>
         </Card>

         {/* Plain Stat - White Variant */}
         <Card className="rounded-[24px] p-8 border border-zinc-100 shadow-sm bg-white hover:shadow-md transition-all group">
            <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-500">
                  <Tag className="w-6 h-6" />
               </div>
               <div>
                  <div className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Eng mashhur chegirma</div>
                  <div className="text-xl font-black text-zinc-900 truncate">
                    {analytics?.breakdown?.[0]?.name || "Noma'lum"}
                  </div>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div className="space-y-1">
                 <div className="text-2xl font-black text-zinc-900 tracking-tighter">
                    {analytics?.breakdown?.[0]?.count || 0} ta <span className="text-xs text-zinc-400">foydalanuvchi</span>
                 </div>
                 <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full w-max flex items-center gap-1">
                   Oylik {analytics?.breakdown?.[0]?.amount?.toLocaleString()} sum
                 </div>
               </div>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 🧭 CHART AREA */}
        <Card className="lg:col-span-4 border border-zinc-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="border-b border-zinc-50 bg-zinc-50/10 px-8 py-6">
             <CardTitle className="text-lg font-black text-zinc-900">Ulushlar Tahlili</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[280px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={analytics?.breakdown || []} 
                    cx="50%" cy="50%" 
                    innerRadius={65} outerRadius={100} 
                    paddingAngle={3} dataKey="amount" stroke="none"
                  >
                    {analytics?.breakdown?.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -12px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">Yo'qotish</span>
                 <span className="text-[15px] font-black text-zinc-900">
                    {((analytics?.totalLoss || 0) / 1_000_000).toFixed(1)}M
                 </span>
              </div>
            </div>
            
            <div className="mt-6 space-y-2.5">
               {analytics?.breakdown?.slice(0, 4).map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm font-bold bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                    <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                       <span className="text-zinc-600 truncate max-w-[120px]">{item.name}</span>
                    </div>
                    <span className="text-zinc-900">
                      {analytics?.totalLoss ? ((item.amount / analytics.totalLoss) * 100).toFixed(1) : "0"}%
                    </span>
                  </div>
               ))}
            </div>
          </CardContent>
        </Card>

        {/* 📋 MANAGEMENT TABLE */}
        <Card className="lg:col-span-8 border border-zinc-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="border-b border-zinc-50 bg-zinc-50/10 px-8 py-6 flex flex-row items-center justify-between">
             <div>
                <CardTitle className="text-lg font-black text-zinc-900">Chegirma Statuslari</CardTitle>
                <p className="text-xs text-zinc-400 font-bold mt-1 uppercase tracking-widest">Boshqaruv paneli</p>
             </div>
             <div className="flex items-center gap-3">
               <Button 
                 onClick={() => { setSelectedDiscount(null); setDialogOpen(true); }}
                 className="h-10 px-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all active:scale-95"
               >
                 <Plus className="w-4 h-4" />
                 <span className="text-xs">Yangi qo'shish</span>
               </Button>
               <Settings className="w-5 h-5 text-zinc-400" />
             </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-zinc-50/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px] text-[11px] font-black text-zinc-400 uppercase tracking-widest pl-8">ID</TableHead>
                  <TableHead className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Nomi</TableHead>
                  <TableHead className="text-[11px] font-black text-zinc-400 uppercase tracking-widest text-center">Qiymati</TableHead>
                  <TableHead className="text-[11px] font-black text-zinc-400 uppercase tracking-widest text-center">O'quvchilar</TableHead>
                  <TableHead className="text-[11px] font-black text-zinc-400 uppercase tracking-widest text-center">Status</TableHead>
                  <TableHead className="text-[11px] font-black text-zinc-400 uppercase tracking-widest text-right pr-8">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(discountTypes) && discountTypes.length > 0 ? (
                  discountTypes.map((dt) => (
                    <TableRow key={dt.id} className="group h-16 transition-all hover:bg-zinc-50/80">
                      <TableCell className="font-mono text-[13px] text-zinc-400 pl-8">{dt.id.slice(0, 6)}</TableCell>
                      <TableCell className="font-black text-zinc-900">{dt.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-white border-zinc-200 text-zinc-900 font-black rounded-lg">
                          {dt.type === 'PERCENT' ? `${dt.value}%` : `${Number(dt.value).toLocaleString()} sum`}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-bold text-zinc-600">
                        {dt._count?.appliedTo || 0} ta
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(
                          "rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest border",
                          dt.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-zinc-100 text-zinc-500 border-zinc-200"
                        )}>
                          {dt.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button onClick={() => handleEdit(dt)} variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-pink-50 hover:text-pink-500 text-zinc-400">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button onClick={() => handleDelete(dt.id)} variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-red-50 hover:text-red-500 text-zinc-400">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-zinc-400 font-bold">
                       Chegirma turlari topilmadi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <DiscountTypeDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        discount={selectedDiscount} 
        onSuccess={fetchData} 
      />
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
