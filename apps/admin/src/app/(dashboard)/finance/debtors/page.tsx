"use client";

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
  Search, Filter, Plus, User, Phone, Wallet, MessageSquare, MoreHorizontal, 
  RotateCcw, Trash2, ArrowRight, CheckCircle2, AlertCircle, Calendar, GraduationCap,
  CreditCard, Banknote, History, Sparkles, Building2, LayoutGrid, X, Mail, Send, Info, Flag, RefreshCw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Popover, PopoverContent, PopoverTrigger 
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { useBranch } from '@/providers/BranchProvider';

export default function FinanceDebtorsPage() {
  const searchParams = useSearchParams();
  const [debtors, setDebtors] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, totalDebt: 0, chartData: [] as any[] });
  const [loading, setLoading] = useState(true);
  const { branchId, isReady } = useBranch();
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  
  // Filters Consistent with Screenshot
  const [search, setSearch] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [period, setPeriod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Update date ranges based on period selection
  useEffect(() => {
     if (period === 'all') {
        setStartDate('');
        setEndDate('');
     } else {
        const end = new Date();
        const start = new Date();
        if (period === '1_day') start.setDate(start.getDate() - 1);
        else if (period === '1_week') start.setDate(start.getDate() - 7);
        else if (period === '1_month') start.setMonth(start.getMonth() - 1);
        else if (period === '3_months') start.setMonth(start.getMonth() - 3);
        else if (period === '6_months') start.setMonth(start.getMonth() - 6);
        else if (period === '9_months') start.setMonth(start.getMonth() - 9);
        else if (period === '12_months') start.setMonth(start.getMonth() - 12);
        
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
     }
  }, [period]);
  const [groupFilter, setGroupFilter] = useState('all');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  
  // Data for selects
  const [groups, setGroups] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [cashboxes, setCashboxes] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [paymentCategories, setPaymentCategories] = useState<any[]>([]);
  const [gateways, setGateways] = useState<any>({});

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  // Forms
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    debt_type: '', // will be category_id
    cashbox_id: '',
    payment_method: 'cash',
    description: ''
  });

  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [studentDiscounts, setStudentDiscounts] = useState<any[]>([]);

  const [smsForm, setSmsForm] = useState({
    templateId: '',
    customMessage: ''
  });

  const [submitting, setSubmitting] = useState(false);
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const s = searchParams.get('search');
      const p = searchParams.get('phone');
      
      if (p) {
        setPhoneSearch(p);
        setSearch(''); // Clear name search if phone is provided
      } else if (s) {
        setSearch(s);
        setPhoneSearch(''); // Clear phone search if name is provided
      }
    }
  }, [mounted, searchParams]);

  const fetchData = async () => {
    if (!mounted) return;
    setLoading(true);
    try {
      const bId = branchId;
      let path = `/finance/debtors?branch_id=${bId}&search=${search}&phone=${phoneSearch}&startDate=${startDate}&endDate=${endDate}`;
      if (groupFilter !== 'all') path += `&group_id=${groupFilter}`;
      if (teacherFilter !== 'all') path += `&teacher_id=${teacherFilter}`;
      if (roomFilter !== 'all') path += `&room_id=${roomFilter}`;
      path += `&page=${page}&limit=20`;

      const [debtorsRes, groupsRes, teachersRes, roomsRes, cashRes, tempRes, categoriesRes, branchRes] = await Promise.all([
        api.get(path),
        api.get(`/lms/groups?branch_id=${bId}`),
        api.get(`/lms/teachers?branch_id=${bId}`),
        api.get(`/lms/rooms?branch_id=${bId}`),
        api.get(`/finance/cashboxes?branch_id=${bId}`),
        api.get(`/sms/templates`),
        api.get(`/finance/payment-categories?branch_id=${bId}`),
        api.get(`/branches/${bId}`)
      ]);

      setDebtors(debtorsRes.data?.data || debtorsRes.data || []);
      if (debtorsRes.data?.meta) {
        setMeta(debtorsRes.data.meta);
      }
      setGroups(groupsRes.data?.data || groupsRes.data || []);
      setTeachers(teachersRes.data?.data || teachersRes.data || []);
      setRooms(roomsRes.data?.data || roomsRes.data || []);
      setCashboxes(cashRes.data?.data || cashRes.data || []);
      setTemplates(tempRes.data?.data || tempRes.data || []);
      setPaymentCategories(categoriesRes.data || []);
      setGateways(branchRes.data?.settings?.gateways || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [branchId, mounted, search, phoneSearch, groupFilter, teacherFilter, roomFilter, period]);

  useEffect(() => {
    if (mounted && isReady) {
      fetchData();
    }
  }, [branchId, isReady, mounted, search, phoneSearch, groupFilter, teacherFilter, roomFilter, startDate, endDate, page]);

  // Total debt endi API dan keladi: meta.totalDebt
  const totalDebt = meta.totalDebt || 0;

  useEffect(() => {
    if (isPaymentModalOpen && selectedStudent) {
       api.get(`/finance/invoices/unpaid/${selectedStudent.id}`).then(res => {
          setUnpaidInvoices(res.data?.data || res.data || []);
          setStudentDiscounts(res.data?.discounts || []);
       }).catch(err => console.error(err));
    } else {
       setUnpaidInvoices([]);
       setSelectedInvoices([]);
       setStudentDiscounts([]);
    }
  }, [isPaymentModalOpen, selectedStudent]);

  const handlePayment = async () => {
    if (selectedInvoices.length === 0) return showToast("Kamida 1 ta to'lov oyni tanlang", 'error');
    if (!paymentForm.cashbox_id) return showToast("Kassani tanlang", 'error');
    setSubmitting(true);
    
    // Yigilgan summani hisoblash
    const totalAmount = unpaidInvoices
       .filter(inv => selectedInvoices.includes(inv.id))
       .reduce((sum, inv) => sum + (Number(inv.amount) - Number(inv.paid_amount)), 0);

    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    try {
      await api.post('/finance/payments', {
        ...paymentForm,
        student_id: selectedStudent.id,
        amount: totalAmount,
        invoice_ids: selectedInvoices,
        category_id: isUuid(paymentForm.debt_type) ? paymentForm.debt_type : null,
        type: paymentForm.payment_method,
        branch_id: selectedStudent.branch_id
      });
      setIsPaymentModalOpen(false);
      fetchData();
      showToast("To'lov muvaffaqiyatli qabul qilindi", 'success');
    } catch (err) { console.error(err); showToast("Xatolik yuz berdi", 'error'); }
    finally { setSubmitting(false); }
  };

  const clearFilters = () => {
    setSearch('');
    setPhoneSearch('');
    setPeriod('all');
    setGroupFilter('all');
    setTeacherFilter('all');
    setRoomFilter('all');
    setPage(1);
  };

  const handleSendSms = async () => {
    if (!selectedStudent) return;
    if (!smsForm.templateId && !smsForm.customMessage) {
        return showToast("Shablon yoki matnni kiriting", 'error');
    }
    setSubmitting(true);
    try {
        let message = smsForm.customMessage;
        if (smsForm.templateId && !smsForm.customMessage) {
            const tmpl = templates.find(t => t.id === smsForm.templateId);
            if (tmpl) message = tmpl.text;
        }

        await api.post('/sms/manual-send', {
            phone: selectedStudent.user?.phone,
            message: message,
            branch_id: selectedStudent.branch_id
        });
        showToast("SMS muvaffaqiyatli yuborildi", 'success');
        setIsSmsModalOpen(false);
        setSmsForm({ templateId: '', customMessage: '' });
    } catch (err) {
        console.error(err);
        showToast("Xatolik yuz berdi", 'error');
    } finally {
        setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col w-full mx-auto animate-in fade-in duration-700 selection:bg-[#EC4899]/20 selection:text-[#be185d]">
      
      {/* 🚀 Toast */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-[1000] p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300 
            ${toast.type === 'error' ? 'bg-red-600 text-white shadow-red-500/20' : 'bg-emerald-600 text-white shadow-emerald-500/20'}`}>
           {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
           <span className="font-bold text-sm tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* 🚀 Header & Stat Cards Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
         {/* Title Card */}
         <div className="col-span-1 rounded-2xl bg-white border border-zinc-100 p-6 flex flex-col justify-center shadow-sm relative overflow-hidden">
             <div className="absolute -right-6 -top-6 w-32 h-32 bg-zinc-50 rounded-full opacity-50"></div>
             <div className="flex justify-between items-start relative z-10 w-full">
               <div>
                 <h1 className="text-[22px] font-black text-[#1E3A5F] tracking-tight mb-1">Qarzdorlar</h1>
                 <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">Markaz nazorati</p>
               </div>
               <div className="flex gap-2">
                 <button onClick={fetchData} className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-[#1E3A5F] hover:bg-zinc-100 transition-all border border-zinc-100 shadow-sm">
                    <RefreshCw size={16} />
                 </button>
               </div>
             </div>
         </div>

         {/* Stat Card 1 - Jami Qarzdorlar */}
         <div className="rounded-2xl p-6 relative overflow-hidden shadow-md group" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)' }}>
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
               <div className="flex justify-between items-start mb-4">
                  <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest">Jami Qarzdorlar</span>
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white backdrop-blur-md shadow-inner border border-white/10">
                     <User size={18} />
                  </div>
               </div>
               <div>
                  <span className="text-3xl font-black text-white">{meta.total}</span>
                  <span className="text-[11px] font-bold text-white/50 ml-2 uppercase tracking-widest">Ta</span>
               </div>
            </div>
         </div>

         {/* Stat Card 2 - Jami Qarz */}
         <div className="rounded-2xl p-6 relative overflow-hidden shadow-md group" style={{ background: 'linear-gradient(135deg, #EC4899 0%, #be185d 100%)' }}>
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
               <div className="flex justify-between items-start mb-4">
                  <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest">Jami Qarz Miqdori</span>
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md shadow-inner border border-white/20">
                     <Wallet size={18} />
                  </div>
               </div>
               <div>
                  <span className="text-2xl font-black text-white tracking-tight">{totalDebt.toLocaleString()}</span>
                  <span className="text-[11px] font-bold text-white/70 ml-1 uppercase tracking-widest">UZS</span>
               </div>
            </div>
         </div>

      </div>

      {/* 📈 Qarz Dinamikasi Full Width Chart */}
      <div className="w-full bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm mb-6 flex flex-col overflow-hidden">
         <span className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest mb-6 px-1">Qarz Dynamikasi (Guruhlar Kesimida)</span>
         <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={meta.chartData || []}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                 <XAxis 
                   dataKey="name" 
                   tick={{fontSize: 11, fill: '#9CA3AF', fontWeight: 'bold'}} 
                   axisLine={false} 
                   tickLine={false} 
                   dy={10} 
                   height={40}
                 />
                 <YAxis 
                   tick={{fontSize: 11, fill: '#9CA3AF', fontWeight: 'bold'}} 
                   axisLine={false} 
                   tickLine={false} 
                   tickFormatter={(val) => `${(val / 1000).toLocaleString()} ming`}
                   dx={-10}
                 />
                 <Tooltip 
                   cursor={{ stroke: '#f4f4f5', strokeWidth: 2 }} 
                   contentStyle={{ borderRadius: '12px', borderColor: '#f4f4f5', fontSize: '13px', fontWeight: 'bold', padding: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                   formatter={(value: any) => [`${Number(value || 0).toLocaleString()} UZS`, 'Qarz miqdori']}
                 />
                 <Line 
                   type="monotone" 
                   dataKey="debt" 
                   stroke="#EC4899" 
                   strokeWidth={4} 
                   activeDot={{r: 8, fill: '#EC4899', stroke: '#fff', strokeWidth: 3}} 
                   dot={{r: 4, fill: '#1E3A5F', stroke: 'none'}}
                 />
              </LineChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* 🔍 Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 mb-6">
         <div className="flex flex-wrap flex-row items-center gap-3 w-full">
            <Select value={period} onValueChange={setPeriod}>
               <SelectTrigger className="w-36 h-11 bg-white border hover:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 border-zinc-100 shadow-sm rounded-xl text-[12px] font-bold text-zinc-600 transition-all shrink-0">
                  <SelectValue placeholder="Davrni tanlang" />
               </SelectTrigger>
               <SelectContent className="rounded-xl border-zinc-100 shadow-xl">
                  <SelectItem value="all" className="font-bold cursor-pointer">Barcha vaqtlar</SelectItem>
                  <SelectItem value="1_day" className="font-bold cursor-pointer">1 Kun</SelectItem>
                  <SelectItem value="1_week" className="font-bold cursor-pointer">1 Hafta</SelectItem>
                  <SelectItem value="1_month" className="font-bold cursor-pointer">1 Oy</SelectItem>
                  <SelectItem value="3_months" className="font-bold cursor-pointer">3 Oy</SelectItem>
                  <SelectItem value="6_months" className="font-bold cursor-pointer">6 Oy</SelectItem>
                  <SelectItem value="9_months" className="font-bold cursor-pointer">9 Oy</SelectItem>
                  <SelectItem value="12_months" className="font-bold cursor-pointer">12 Oy</SelectItem>
               </SelectContent>
            </Select>

            <div className="relative group flex-1 min-w-[150px]">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-[#1E3A5F] transition-colors" />
               <Input 
                 placeholder="Ism qidirish..." 
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 className="h-11 pl-9 pr-4 bg-zinc-50 border border-zinc-100 rounded-xl text-[12px] font-bold text-zinc-700 hover:border-zinc-200 focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 transition-all placeholder:text-zinc-400 shadow-sm"
               />
            </div>
            
            <div className="relative group flex-1 min-w-[150px]">
               <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-[#1E3A5F] transition-colors" />
               <Input 
                 placeholder="Raqam..." 
                 value={phoneSearch}
                 onChange={e => setPhoneSearch(e.target.value)}
                 className="h-11 pl-9 pr-4 bg-zinc-50 border border-zinc-100 rounded-xl text-[12px] font-bold text-zinc-700 hover:border-zinc-200 focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 transition-all placeholder:text-zinc-400 shadow-sm"
                />
            </div>

            <Select value={groupFilter} onValueChange={setGroupFilter}>
               <SelectTrigger className="w-40 h-11 bg-white border hover:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 border-zinc-100 shadow-sm rounded-xl text-[12px] font-bold text-zinc-600 transition-all shrink-0">
                  <SelectValue placeholder="Guruhni tanlang" />
               </SelectTrigger>
               <SelectContent className="rounded-xl border-zinc-100 shadow-xl">
                  <SelectItem value="all">Barcha guruhlar</SelectItem>
                  {groups.map(g => <SelectItem key={g.id} value={g.id} className="font-bold cursor-pointer">{g.name}</SelectItem>)}
               </SelectContent>
            </Select>

            <Select value={teacherFilter} onValueChange={setTeacherFilter}>
               <SelectTrigger className="w-40 h-11 bg-white border hover:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 border-zinc-100 shadow-sm rounded-xl text-[12px] font-bold text-zinc-600 transition-all shrink-0">
                  <SelectValue placeholder="O'qituvchi bo'yicha" />
               </SelectTrigger>
               <SelectContent className="rounded-xl border-zinc-100 shadow-xl">
                  <SelectItem value="all">Barcha o'qituvchilar</SelectItem>
                  {teachers.map(t => <SelectItem key={t.id} value={t.id} className="font-bold cursor-pointer">{t.user?.first_name} {t.user?.last_name}</SelectItem>)}
               </SelectContent>
            </Select>

            <Select value={roomFilter} onValueChange={setRoomFilter}>
               <SelectTrigger className="w-32 h-11 bg-white border hover:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 border-zinc-100 shadow-sm rounded-xl text-[12px] font-bold text-zinc-600 transition-all shrink-0">
                  <SelectValue placeholder="Xona bo'yicha" />
               </SelectTrigger>
               <SelectContent className="rounded-xl border-zinc-100 shadow-xl">
                  <SelectItem value="all" className="font-bold cursor-pointer">Barcha xonalar</SelectItem>
                  {rooms.map(r => <SelectItem key={r.id} value={r.id} className="font-bold cursor-pointer">{r.name}</SelectItem>)}
               </SelectContent>
            </Select>

            <Button onClick={clearFilters} variant="ghost" className="h-11 px-4 ml-auto rounded-xl text-[11px] font-black tracking-widest uppercase text-zinc-400 hover:text-[#EC4899] hover:bg-rose-50 border border-transparent transition-all shrink-0">
               Tozalash
            </Button>
         </div>
      </div>

      {/* 📊 High-Density Table with Screenshot Styling */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-zinc-100 overflow-hidden mb-12 flex-1">
        <div className="overflow-x-auto w-full min-h-[500px]">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-[#f8f9fa] border-b border-zinc-100 font-bold uppercase text-[#8392ab] text-[11px]">
                <th className="py-4 pl-6 w-16 text-center">T/R</th>
                <th className="py-4 px-4 w-4 text-center"><input type="checkbox" className="rounded" /></th>
                <th className="py-4 px-4">FISH</th>
                <th className="py-4 px-4">TELEFON RAQAM</th>
                <th className="py-4 px-4">GURUH</th>
                <th className="py-4 px-4">BALANS <button className="ml-2 inline-flex border border-[#17c1e8] rounded p-0.5 text-[#17c1e8]"><RefreshCw size={10} /></button></th>
                <th className="py-4 px-4">IZOH</th>
                <th className="py-4 pr-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan={8} className="py-6 px-10 opacity-20"><div className="h-4 bg-zinc-200 rounded w-full" /></td></tr>)
              ) : debtors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-40 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30 gap-4">
                      <LayoutGrid size={60} />
                      <span className="text-sm font-bold uppercase tracking-widest text-zinc-400">Hech qanday qarzdor topilmadi</span>
                    </div>
                  </td>
                </tr>
              ) : debtors.map((d, idx) => (
                <tr key={d.id} className="group hover:bg-[#f8f9fa] transition-colors">
                  <td className="py-5 pl-6 text-center text-[12px] text-zinc-400 font-bold">{idx + 1}.</td>
                  <td className="py-5 px-4 text-center"><input type="checkbox" className="rounded border-zinc-300" /></td>
                  <td className="py-5 px-4 max-w-[200px]">
                    <p className="text-[13px] font-bold text-[#17c1e8] cursor-pointer hover:underline uppercase truncate">
                      {d.user?.first_name} {d.user?.last_name}
                    </p>
                  </td>
                  <td className="py-5 px-4">
                    <span className="text-[12px] font-bold text-[#67748e]">
                       +(998) {d.user?.phone?.substring(0,2)} {d.user?.phone?.substring(2,5)}-{d.user?.phone?.substring(5,7)}-{d.user?.phone?.substring(7,9)}
                    </span>
                  </td>
                  <td className="py-5 px-4 min-w-[250px]">
                    <div className="flex flex-col gap-1">
                      {d.enrollments?.slice(0, 2).map((e: any) => (
                         <div key={e.id} className="text-[12px] font-bold text-[#67748e] leading-tight">
                            {e.group?.name} {e.group?.schedules?.[0] ? `(${e.group.schedules[0].start_time})` : ''}
                         </div>
                      ))}
                      {d.enrollments?.length > 2 && <span className="text-[10px] text-zinc-400">+{d.enrollments.length - 2} yana...</span>}
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <span className="text-[13px] font-black text-[#f5365c] tracking-tight">
                       {(
                         d.invoices?.reduce((sum: number, inv: any) => sum + (Number(inv.amount) - (Number(inv.paid_amount) || 0)), 0) || 0
                       ).toLocaleString()} so'm
                    </span>
                  </td>
                  <td className="py-5 px-4">
                     <div className="flex items-center gap-2">
                        {d.archive_reason ? <span className="text-[11px] text-zinc-400 italic truncate max-w-[150px]">{d.archive_reason}</span> : '--'}
                     </div>
                  </td>
                  <td className="py-5 pr-6 text-right">
                    <div className="flex justify-end items-center gap-2 opacity-60 group-hover:opacity-100 transition-all">
                       <button 
                         onClick={() => { setSelectedStudent(d); setIsSmsModalOpen(true); }}
                         className="w-8 h-8 rounded-lg border border-zinc-200 text-teal-500 flex items-center justify-center hover:bg-teal-50 shadow-sm"
                         title="SMS yuborish"
                       >
                          <MessageSquare size={14} />
                       </button>
                       <button 
                         onClick={() => { setSelectedStudent(d); setIsPaymentModalOpen(true); }}
                         className="w-8 h-8 rounded-lg border border-zinc-200 text-indigo-500 flex items-center justify-center hover:bg-indigo-50 shadow-sm"
                         title="To'lov qilish"
                       >
                          <Wallet size={14} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- PAYMENT MODAL (Same logic, modernized styling) --- */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
         <DialogContent className="sm:max-w-[450px] rounded-[1.5rem] p-10 border-none shadow-2xl bg-white overflow-hidden">
            <DialogHeader className="items-center space-y-3 mb-6">
               <div className="w-16 h-16 bg-[#17c1e8]/10 rounded-2xl flex items-center justify-center text-[#17c1e8]">
                  <Wallet size={32} />
               </div>
               <DialogTitle className="text-2xl font-bold text-[#344767]">To'lov qabul qilish</DialogTitle>
               <DialogDescription className="text-sm font-bold text-zinc-400 text-center uppercase">
                  {selectedStudent?.user?.first_name} {selectedStudent?.user?.last_name}
               </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 mb-8">
               <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">To'lov turi</Label>
                  <Select value={paymentForm.debt_type} onValueChange={v => setPaymentForm({...paymentForm, debt_type: v})}>
                     <SelectTrigger className="h-12 rounded-xl bg-[#f8f9fa] border-none font-bold text-zinc-700">
                        <SelectValue placeholder="To'lov turini tanlang" />
                     </SelectTrigger>
                     <SelectContent className="rounded-xl">
                        {paymentCategories.length > 0 ? (
                           paymentCategories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)
                        ) : (
                           <>
                              <SelectItem value="COURSE">Kurs To'lovi</SelectItem>
                           </>
                        )}
                     </SelectContent>
                  </Select>
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">To'lov usuli</Label>
                  <Select value={paymentForm.payment_method} onValueChange={v => setPaymentForm({...paymentForm, payment_method: v})}>
                     <SelectTrigger className="h-12 rounded-xl bg-[#f8f9fa] border-none font-bold text-zinc-700">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="rounded-xl">
                        <SelectItem value="cash">Naqd Pul</SelectItem>
                        <SelectItem value="card">Plastik Karta</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
                <div className="space-y-2">
                   <Label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Qaysi oylar (qarzlar) uchun?</Label>
                   <div className="bg-[#f8f9fa] rounded-xl p-3 max-h-[160px] overflow-y-auto space-y-2">
                      {unpaidInvoices.length === 0 ? (
                         <div className="text-sm font-bold text-zinc-400 text-center py-4">To'lanmagan oylar topilmadi guruhdan qarzi yo'q.</div>
                      ) : (
                         unpaidInvoices.map(inv => {
                            const leftToPay = Number(inv.amount) - Number(inv.paid_amount);
                            const isChecked = selectedInvoices.includes(inv.id);
                            return (
                               <label key={inv.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${isChecked ? 'bg-white border-[#17c1e8] shadow-sm' : 'bg-transparent border-zinc-200 hover:border-zinc-300'}`}>
                                  <input 
                                     type="checkbox" 
                                     checked={isChecked}
                                     onChange={(e) => {
                                        if (e.target.checked) setSelectedInvoices([...selectedInvoices, inv.id]);
                                        else setSelectedInvoices(selectedInvoices.filter(id => id !== inv.id));
                                     }}
                                     className="rounded text-[#17c1e8] focus:ring-[#17c1e8]"
                                  />
                                  <div className="flex-1 flex flex-col">
                                     <span className="text-[13px] font-bold text-zinc-700">{inv.month} ({inv.type === 'COURSE' ? 'Kurs' : inv.type})</span>
                                  </div>
                                  <span className="text-[14px] font-black text-rose-500">{leftToPay.toLocaleString()}</span>
                               </label>
                            )
                         })
                      )}
                   </div>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-zinc-100">
                   <div className="flex justify-between items-center px-1">
                      <Label className="text-[11px] font-bold text-zinc-400 uppercase">Jami Kiritilayotgan Summa</Label>
                      <span className="text-xl font-black text-[#1E3A5F]">
                         {unpaidInvoices.filter(i => selectedInvoices.includes(i.id)).reduce((sum, inv) => sum + (Number(inv.amount) - Number(inv.paid_amount)), 0).toLocaleString()} so'm
                      </span>
                   </div>
                   {studentDiscounts.length > 0 && (
                      <div className="flex gap-2 items-center px-1 mt-2 p-2 bg-emerald-50 rounded-xl">
                         <Sparkles className="w-4 h-4 text-emerald-500" />
                         <span className="text-[12px] font-bold text-emerald-600">
                             Talabaga chegirma qo'llanilgan ({studentDiscounts.map(sd => sd.discount?.name).join(', ')})!
                         </span>
                      </div>
                   )}
                </div>
               <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Kassa</Label>
                  <Select value={paymentForm.cashbox_id} onValueChange={v => setPaymentForm({...paymentForm, cashbox_id: v})}>
                     <SelectTrigger className="h-12 rounded-xl bg-[#f8f9fa] border-none font-bold text-zinc-700"><SelectValue placeholder="Kassani tanlang" /></SelectTrigger>
                     <SelectContent className="rounded-xl">
                        {cashboxes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({Number(c.balance).toLocaleString()})</SelectItem>)}
                     </SelectContent>
                  </Select>
               </div>
            </div>

            <div className="flex gap-3">
               <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)} className="h-12 rounded-xl font-bold flex-1 border-zinc-100">Bekor qilish</Button>
               <Button onClick={handlePayment} disabled={submitting} className="h-12 rounded-xl font-bold bg-[#EC4899] hover:bg-[#be185d] text-white flex-1 border-none transition-all shadow-md shadow-[#EC4899]/20">TO'LOVNI SAQLASH</Button>
            </div>
         </DialogContent>
      </Dialog>

      {/* --- MANUAL SMS MODAL --- */}
      <Dialog open={isSmsModalOpen} onOpenChange={setIsSmsModalOpen}>
         <DialogContent className="sm:max-w-[500px] rounded-[1.5rem] p-10 border-none shadow-2xl bg-white border border-zinc-50">
            <DialogHeader className="items-center space-y-3 mb-6 text-center">
               <div className="w-16 h-16 bg-[#fbcf33]/10 rounded-2xl flex items-center justify-center text-[#fbcf33]">
                  <Flag size={32} />
               </div>
               <DialogTitle className="text-2xl font-bold text-[#344767]">SMS yuborish</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mb-8">
               <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Tayyor shablon</Label>
                  <Select value={smsForm.templateId} onValueChange={v => setSmsForm({...smsForm, templateId: v})}>
                     <SelectTrigger className="h-12 rounded-xl bg-[#f8f9fa] border-none font-bold text-zinc-700"><SelectValue placeholder="Barcha shablonlar" /></SelectTrigger>
                     <SelectContent className="rounded-xl">
                        {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                     </SelectContent>
                  </Select>
               </div>

               <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Maxsus matn</Label>
                  <textarea 
                    value={smsForm.customMessage}
                    onChange={e => setSmsForm({...smsForm, customMessage: e.target.value})}
                    placeholder="Xabar matnini kiriting..."
                    className="w-full h-32 rounded-xl bg-[#f8f9fa] border-none p-4 text-[13px] font-bold text-zinc-600 focus:ring-1 focus:ring-[#fbcf33] resize-none"
                  />
               </div>
            </div>

            <div className="flex gap-3">
               <Button variant="outline" onClick={() => setIsSmsModalOpen(false)} className="h-12 rounded-xl font-bold flex-1 border-zinc-100">Yopish</Button>
               <Button onClick={handleSendSms} disabled={submitting} className="h-12 rounded-xl font-bold bg-[#EC4899] hover:bg-[#be185d] text-white flex-1 border-none transition-all shadow-md shadow-[#EC4899]/20">SMS YUBORISH</Button>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
