"use client";

import { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Filter, Plus, Printer, Archive, Trash2, MoreHorizontal, FileText, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export default function FinancePaymentsPage() {
  const searchParams = useSearchParams();
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalSum: 0, todaySum: 0, archivedSum: 0, monthlyTrend: [] });
  const [teachers, setTeachers] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState('all');
  
  // Filters
  const [search, setSearch] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [gateways, setGateways] = useState<any>({});
  const [amountFilter, setAmountFilter] = useState('');
  
  const [chartPeriod, setChartPeriod] = useState('6_months');
  
  const [mounted, setMounted] = useState(false);
  
  // Archive State
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [archiveForm, setArchiveForm] = useState({ id: '', reason: '' });
  
  // Change Method State
  const [isChangeMethodModalOpen, setIsChangeMethodModalOpen] = useState(false);
  const [changeMethodForm, setChangeMethodForm] = useState({ id: '', type: '', reason: '' });

  const [submitting, setSubmitting] = useState(false);
  const [printPayment, setPrintPayment] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });
  const [branchSettings, setBranchSettings] = useState<any>({});

  useEffect(() => {
    const bId = (typeof window !== 'undefined' ? localStorage.getItem('branch_id') : null) || 'all';
    setBranchId(bId);
    setMounted(true);
  }, [searchParams]);

  const fetchData = async () => {
    if (!mounted) return;
    setLoading(true);
    try {
      let path = `/finance/transactions?branch_id=${branchId}&search=${search}`;
      if (teacherFilter !== 'all') path += `&teacher_id=${teacherFilter}`;
      if (staffFilter !== 'all') path += `&cashier_id=${staffFilter}`;
      if (groupFilter !== 'all') path += `&group_id=${groupFilter}`;
      if (typeFilter !== 'all') path += `&type=${typeFilter}`;

      const [paymentsRes, statsRes, teachersRes, staffRes, groupsRes, branchRes] = await Promise.all([
        api.get(path),
        api.get(`/finance/payments/stats?branch_id=${branchId}&period=${chartPeriod}&search=${search}&teacher_id=${teacherFilter !== 'all' ? teacherFilter : ''}&staff_id=${staffFilter !== 'all' ? staffFilter : ''}&group_id=${groupFilter !== 'all' ? groupFilter : ''}&type=${typeFilter !== 'all' ? typeFilter : ''}`),
        api.get(`/lms/teachers?branch_id=${branchId}`),
        api.get(`/staff?branch_id=${branchId}`),
        api.get(`/lms/groups?branch_id=${branchId}`),
        api.get(`/branches/${branchId}`)
      ]);
      
      setPayments(paymentsRes.data?.data || paymentsRes.data || []);
      setStats(statsRes.data?.data || statsRes.data || {});
      setTeachers(teachersRes.data?.data || teachersRes.data || []);
      setStaff(staffRes.data?.data || staffRes.data || []);
      setGroups(groupsRes.data?.data || groupsRes.data || []);
      setGateways(branchRes.data?.settings?.gateways || {});
      setBranchSettings(branchRes.data?.settings || {
        receipt_branch_name: branchRes.data?.name || '',
        receipt_header: '⭐⭐⭐ ICE BERG ⭐⭐⭐',
        receipt_footer: 'Bizni tanlaganingiz uchun tashakkur!\nIjtimoiy tarmoqlar: @ice_berg_edu',
      });
    } catch (err) {
      console.error('Fetch Error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchData, 500);
    return () => clearTimeout(timeout);
  }, [branchId, mounted, search, teacherFilter, staffFilter, groupFilter, typeFilter, chartPeriod]);

  const clearFilters = () => {
    setSearch('');
    setTeacherFilter('all');
    setStaffFilter('all');
    setGroupFilter('all');
    setTypeFilter('all');
    setAmountFilter('');
  };

  const handleArchive = async () => {
    if (!archiveForm.reason) return toast.error("Sababni kiriting");
    setSubmitting(true);
    try {
      await api.post(`/finance/payments/${archiveForm.id}/archive`, { reason: archiveForm.reason });
      setIsArchiveDialogOpen(false);
      setArchiveForm({ id: '', reason: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeMethod = async () => {
    if (!changeMethodForm.type) return toast.error("Turni tanlang");
    setSubmitting(true);
    try {
      const type = changeMethodForm.type === 'cash' ? 'CASH' : changeMethodForm.type === 'card' ? 'CARD' : changeMethodForm.type;
      await api.put(`/finance/payments/${changeMethodForm.id}/change-method`, { type: type, reason: changeMethodForm.reason });
      setIsChangeMethodModalOpen(false);
      setChangeMethodForm({ id: '', type: '', reason: '' });
      fetchData();
      toast.success("To'lov turi muvaffaqiyatli o'zgartirildi");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const formatUZS = (num: number) => {
    return new Intl.NumberFormat('uz-UZ').format(num) + ' UZS';
  };

  const exportToExcel = () => {
    const formattedData = payments.map((pmt, index) => ({
      'T/r': index + 1,
      'ID': pmt.id.split('-')[0].toUpperCase(),
      'Sana': new Date(pmt.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      'Mijoz / O\'quvchi': `${pmt.student?.user?.first_name || ''} ${pmt.student?.user?.last_name || ''}`.trim(),
      'Summa': pmt.amount,
      'To\'lov usuli': pmt.type === 'CASH' ? 'Naqd' : pmt.type === 'CARD' ? 'Karta' : 'O\'tkazma',
      'Holat': pmt.status === 'SUCCESS' || !pmt.status ? 'Tasdiqlangan' : 'Qaytarilgan',
      'O\'qituvchi': `${pmt.group?.teacher?.user?.first_name || ''} ${pmt.group?.teacher?.user?.last_name || ''}`.trim() || '-',
      'Guruh': pmt.group?.name || 'Guruhsiz',
      'Qabul qildi': pmt.cashier?.first_name || 'Admin',
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "To'lovlar Hisoboti");
    XLSX.writeFile(workbook, `Tolovlar_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 w-full selection:bg-pink-100 selection:text-pink-900">
      
      {/* 📊 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card className="p-[24px] border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] bg-white rounded-[12px] flex items-center gap-4">
            <div className="w-[48px] h-[48px] rounded-full bg-pink-50 flex items-center justify-center text-[#EC4899] shrink-0">
               <Wallet className="w-6 h-6" />
            </div>
            <div>
               <h3 className="text-[14px] font-semibold text-gray-500 mb-1 leading-none">Umumiy Tushum</h3>
               <p className="text-[24px] font-bold text-gray-900 leading-none">{formatUZS(stats?.totalSum || 0)}</p>
            </div>
         </Card>
         <Card className="p-[24px] border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] bg-white rounded-[12px] flex items-center gap-4">
            <div className="w-[48px] h-[48px] rounded-full bg-[#ECFEFF] flex items-center justify-center text-[#06B6D4] shrink-0">
               <ArrowUpCircle className="w-6 h-6" />
            </div>
            <div>
               <h3 className="text-[14px] font-semibold text-gray-500 mb-1 leading-none">Bugungi Qabul</h3>
               <p className="text-[24px] font-bold text-gray-900 leading-none">{formatUZS(stats?.todaySum || 0)}</p>
            </div>
         </Card>
         <Card className="p-[24px] border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] bg-white rounded-[12px] flex items-center gap-4">
            <div className="w-[48px] h-[48px] rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
               <Archive className="w-6 h-6" />
            </div>
            <div>
               <h3 className="text-[14px] font-semibold text-gray-500 mb-1 leading-none">Arxivlangan Summalar</h3>
               <p className="text-[24px] font-bold text-gray-900 leading-none">{formatUZS(stats?.archivedSum || 0)}</p>
            </div>
         </Card>
      </div>

      {/* 📈 Trend Chart */}
      <Card className="p-6 border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] bg-white rounded-[12px]">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-semibold text-gray-700">Tushum dinamikasi</h3>
            
            <div className="w-[150px]">
               <Select value={chartPeriod} onValueChange={setChartPeriod}>
                 <SelectTrigger className="h-[36px] bg-white border-gray-200 rounded-[8px] font-semibold text-[12px] text-gray-600 shadow-sm ring-0 focus:ring-0">
                    <SelectValue placeholder="Davrni tanlang" />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl border-gray-100 shadow-dropdown">
                    <SelectItem value="1_week">Oxirgi 1 hafta</SelectItem>
                    <SelectItem value="1_month">Oxirgi 1 oy</SelectItem>
                    <SelectItem value="3_months">Oxirgi 3 oy</SelectItem>
                    <SelectItem value="6_months">Oxirgi 6 oy</SelectItem>
                    <SelectItem value="1_year">Oxirgi 1 yil</SelectItem>
                 </SelectContent>
               </Select>
            </div>
         </div>
         <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={stats?.monthlyTrend || []} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                  <YAxis tickFormatter={(val) => (val / 1000000).toFixed(1) + 'M'} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip 
                     cursor={{ fill: '#FDF2F8' }}
                     contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                     formatter={(value: any) => [`${new Intl.NumberFormat('uz-UZ').format(value)} UZS`, 'Tushum']}
                  />
                  <Bar dataKey="Kirim" fill="#1E3A5F" radius={[4, 4, 0, 0]} maxBarSize={50} />
               </BarChart>
            </ResponsiveContainer>
         </div>
      </Card>

      <div className="flex flex-col gap-3 bg-white/50 p-1 rounded-2xl">
         <div className="flex flex-wrap items-center justify-between gap-3 relative">
            <div className="flex flex-wrap items-center gap-3">
               <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#EC4899] transition-colors" />
                  <Input 
                    placeholder="Id yoki Ism orqali qidirish..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="h-[38px] pl-10 pr-4 text-[13px] font-semibold w-[220px] bg-white border border-gray-200 rounded-[8px] text-gray-900 focus-visible:ring-0 focus-visible:border-[#EC4899] placeholder:text-gray-400 shadow-sm transition-all"
                  />
               </div>

               <div className="w-[170px]">
                  <Select value={teacherFilter} onValueChange={setTeacherFilter}>
                    <SelectTrigger className="h-[38px] bg-white border-gray-200 rounded-[8px] font-semibold text-[13px] text-gray-700 shadow-sm ring-0 focus:ring-0">
                       <SelectValue placeholder="O'qituvchi bo'yicha" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-100 shadow-dropdown">
                       <SelectItem value="all">Barcha o'qituvchilar</SelectItem>
                       {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.user?.first_name} {t.user?.last_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
               </div>

               <div className="w-[170px]">
                  <Select value={groupFilter} onValueChange={setGroupFilter}>
                    <SelectTrigger className="h-[38px] bg-white border-gray-200 rounded-[8px] font-semibold text-[13px] text-gray-700 shadow-sm ring-0 focus:ring-0">
                       <SelectValue placeholder="Guruhni tanlang" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-100 shadow-dropdown">
                       <SelectItem value="all">Barcha guruhlar</SelectItem>
                       {groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
               </div>

               <div className="w-[160px]">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-[38px] bg-white border-gray-200 rounded-[8px] font-semibold text-[13px] text-gray-700 shadow-sm ring-0 focus:ring-0">
                       <SelectValue placeholder="To'lov usuli" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-100 shadow-dropdown">
                       <SelectItem value="all">To'lov usuli: Barchasi</SelectItem>
                       <SelectItem value="cash">Naqd pul</SelectItem>
                       <SelectItem value="card">Plastik Karta</SelectItem>
                    </SelectContent>
                  </Select>
               </div>

               <Button onClick={clearFilters} variant="ghost" className="h-[38px] px-4 text-[13px] font-bold text-[#EC4899] hover:bg-pink-50 rounded-[8px]">
                  Tozalash
               </Button>
            </div>

            <div className="flex items-center gap-2">
               <Button onClick={exportToExcel} variant="outline" className="h-[38px] px-4 rounded-[8px] border-gray-200 text-gray-700 font-semibold text-[13px] flex items-center gap-2 bg-white hover:bg-gray-50 shadow-sm transition-all">
                  <FileText size={15} />
                  Hisobot
               </Button>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto w-full min-h-[500px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 pl-6 text-[12px] font-bold text-gray-500 uppercase tracking-[0.05em] w-24">ID</th>
                <th className="py-4 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-[0.05em] w-32">SANA</th>
                <th className="py-4 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-[0.05em]">MIJOZ / O'QUVCHI</th>
                <th className="py-4 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-[0.05em] text-right w-36">SUMMA</th>
                <th className="py-4 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-[0.05em] text-center">USUL</th>
                <th className="py-4 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-[0.05em] text-center">HOLAT</th>
                <th className="py-4 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-[0.05em]">O'QITUVCHI & GURUH</th>
                <th className="py-4 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-[0.05em]">QABUL QILDI</th>
                <th className="py-4 pr-6 text-right w-16"></th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                 [1,2,3,4,5].map(i => (
                   <tr key={i} className="animate-pulse">
                      <td colSpan={9} className="py-6 px-6"><div className="h-4 bg-gray-100 rounded-full w-full" /></td>
                   </tr>
                 ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                       <Wallet className="w-12 h-12 text-gray-300 mb-4" />
                       <p className="text-[14px] font-medium text-gray-600">To'lovlar topilmadi</p>
                       <p className="text-[12px] text-gray-400 mt-1">Filterni o'zgartiring yoki yangi to'lov qo'shing</p>
                    </div>
                  </td>
                </tr>
              ) : payments.map((pmt, idx) => (
                <tr key={pmt.id} className="group hover:bg-gray-50 transition-colors h-[56px]">
                  <td className="pl-6 py-4">
                    <span className="text-[13px] font-mono font-medium text-blue-600">
                      {pmt.id.split('-')[0].toUpperCase()}
                    </span>
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className="text-[13px] font-medium text-gray-600">
                       {new Date(pmt.created_at).toLocaleDateString('uz-UZ', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    </span>
                  </td>
                  
                  <td className="py-4 px-4 flex items-center gap-3">
                     <div className="w-[32px] h-[32px] rounded-full bg-pink-100 text-pink-600 font-bold text-[12px] flex items-center justify-center">
                        {pmt.student?.user?.first_name?.charAt(0) || 'U'}
                     </div>
                     <span className="text-[14px] font-semibold text-gray-900 group-hover:text-pink-600 cursor-pointer transition-colors">
                        {pmt.student?.user?.first_name} {pmt.student?.user?.last_name}
                     </span>
                  </td>
                  
                  <td className="py-4 px-4 text-right">
                    <span className="text-[14px] font-bold text-gray-900">
                       {formatUZS(Number(pmt.amount))}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-center">
                     <span className="inline-flex items-center px-[8px] py-[2px] rounded-[9999px] text-[12px] font-semibold bg-gray-100 text-gray-600">
                        {pmt.type === 'cash' || pmt.type === 'CASH' ? 'Naqd' : pmt.type === 'card' || pmt.type === 'CARD' ? 'Karta' : pmt.type?.toUpperCase() || 'Boshqa'}
                     </span>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center px-[10px] py-[2px] rounded-[9999px] text-[12px] font-semibold ${pmt.status === 'SUCCESS' || !pmt.status ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                       {pmt.status === 'SUCCESS' || !pmt.status ? '✓ Tasdiqlangan' : '✗ Qaytarilgan'}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                     <div className="flex flex-col">
                        <span className="text-[13px] font-medium text-gray-900">
                           {pmt.group?.teacher?.user?.first_name} {pmt.group?.teacher?.user?.last_name || '-'}
                        </span>
                        <span className="text-[11px] text-gray-500">{pmt.group?.name || 'Guruhsiz'}</span>
                     </div>
                  </td>

                  <td className="py-4 px-4">
                     <span className="text-[13px] font-medium text-gray-600">
                        {pmt.cashier?.first_name || 'Admin'}
                     </span>
                  </td>

                  <td className="py-4 pr-6">
                    <div className="flex justify-end relative">
                      <Popover>
                        <PopoverTrigger asChild>
                           <button className="text-gray-400 hover:text-gray-900 transition-colors p-2">
                              <MoreHorizontal className="w-[18px] h-[18px]" />
                           </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[160px] p-2 rounded-[12px] border-gray-200 shadow-dropdown bg-white" align="end">
                           <button onClick={() => setPrintPayment(pmt)} className="w-full h-[36px] px-3 flex items-center gap-2 text-gray-700 font-medium text-[13px] hover:bg-gray-50 rounded-[6px] transition-colors">
                              <Printer className="w-[16px] h-[16px]" /> Chop etish
                           </button>
                           <button onClick={() => { setChangeMethodForm({ id: pmt.id, type: pmt.type === 'cash' ? 'CASH' : pmt.type === 'card' ? 'CARD' : pmt.type, reason: '' }); setIsChangeMethodModalOpen(true); }} className="w-full h-[36px] px-3 flex items-center gap-2 text-blue-500 font-medium text-[13px] hover:bg-blue-50 rounded-[6px] transition-colors mt-1">
                              <Wallet className="w-[16px] h-[16px]" /> Turini o'zgartirish
                           </button>
                           <button onClick={() => { setArchiveForm({ id: pmt.id, reason: '' }); setIsArchiveDialogOpen(true); }} className="w-full h-[36px] px-3 flex items-center gap-2 text-red-500 font-medium text-[13px] hover:bg-red-50 rounded-[6px] transition-colors mt-1">
                              <Archive className="w-[16px] h-[16px]" /> Arxivlash
                           </button>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ARCHIVE DIALOG --- */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[16px] p-6 border-none shadow-modal bg-white">
          <DialogHeader className="space-y-4">
             <div className="w-[48px] h-[48px] bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto">
                <Trash2 className="w-[24px] h-[24px]" />
             </div>
             <DialogTitle className="text-[18px] font-semibold text-center text-gray-900">Arxivlashni tasdiqlaysizmi?</DialogTitle>
             <DialogDescription className="text-[14px] text-center text-gray-500 leading-relaxed">
               Bu amaliyot tanlangan ro'yxatni arxivga o'tkazadi va summani kassadan (balansdan) onlayn ayirib tashlaydi.
             </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
             <Label className="text-[13px] font-medium text-gray-700">Bekor qilish sababi <span className="text-red-500">*</span></Label>
             <Input 
               value={archiveForm.reason} 
               onChange={e => setArchiveForm({...archiveForm, reason: e.target.value})}
               placeholder="Masalan: O'quvchi xato to'lov qildi..." 
               className="h-[44px] rounded-[8px] bg-white border border-gray-200 text-[14px] px-3 focus-visible:ring-1 focus-visible:ring-red-500" 
             />
          </div>

          <DialogFooter className="mt-2 flex gap-3 sm:justify-center w-full">
             <Button 
               variant="outline" 
               className="h-[40px] flex-1 rounded-[8px] font-medium text-gray-700 border-gray-200 hover:bg-gray-50" 
               onClick={() => setIsArchiveDialogOpen(false)}
             >
               Bekor qilish
             </Button>
             <Button 
               className="h-[40px] flex-1 rounded-[8px] font-medium bg-red-500 hover:bg-red-600 text-white border-none"
               onClick={handleArchive}
               disabled={submitting}
             >
               {submitting ? "Kutilmoqda..." : "Ha, arxivlash"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- CHANGE METHOD MODAL --- */}
      <Dialog open={isChangeMethodModalOpen} onOpenChange={setIsChangeMethodModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[16px] p-6 border-none shadow-modal bg-white">
          <DialogHeader className="space-y-4">
             <div className="w-[48px] h-[48px] bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mx-auto">
                <Wallet className="w-[24px] h-[24px]" />
             </div>
             <DialogTitle className="text-[18px] font-semibold text-center text-gray-900">To'lov turini o'zgartirish</DialogTitle>
             <DialogDescription className="text-[14px] text-center text-gray-500 leading-relaxed">
               Ushbu amaliyot orqali siz to'lovni "Naqd" dan "Karta" ga yoki aksincha o'zgartirishingiz mumkin va tegishli pullar avtomatik kassa balansidan tranzaksiya qilinadi.
             </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
             <div className="space-y-3">
               <Label className="text-[13px] font-medium text-gray-700">Yangi to'lov turi <span className="text-red-500">*</span></Label>
               <Select value={changeMethodForm.type} onValueChange={(val) => setChangeMethodForm({...changeMethodForm, type: val})}>
                 <SelectTrigger className="h-[44px] rounded-[8px] bg-white border border-gray-200">
                    <SelectValue placeholder="Turni tanlang" />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl border-gray-100 shadow-dropdown z-50">
                    <SelectItem value="CASH">Naqd pul</SelectItem>
                    <SelectItem value="CARD">Plastik karta</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="space-y-3">
               <Label className="text-[13px] font-medium text-gray-700">Izoh (ixtiyoriy)</Label>
               <Input 
                 value={changeMethodForm.reason} 
                 onChange={e => setChangeMethodForm({...changeMethodForm, reason: e.target.value})}
                 placeholder="Masalan: Aslida karta orqali to'langan ekan..." 
                 className="h-[44px] rounded-[8px] bg-white border border-gray-200 text-[14px] px-3 focus-visible:ring-1 focus-visible:ring-blue-500" 
               />
             </div>
          </div>

          <DialogFooter className="mt-2 flex gap-3 sm:justify-center w-full">
             <Button 
               variant="outline" 
               className="h-[40px] flex-1 rounded-[8px] font-medium text-gray-700 border-gray-200 hover:bg-gray-50" 
               onClick={() => setIsChangeMethodModalOpen(false)}
             >
               Bekor qilish
             </Button>
             <Button 
               className="h-[40px] flex-1 rounded-[8px] font-medium bg-blue-500 hover:bg-blue-600 text-white border-none"
               onClick={handleChangeMethod}
               disabled={submitting}
             >
               {submitting ? "Saqlanmoqda..." : "Saqlash"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- RECEIPT MODAL --- */}
      <Dialog open={!!printPayment} onOpenChange={o => !o && setPrintPayment(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-[16px] p-6 border-none shadow-modal bg-white flex flex-col items-center">
            <DialogHeader className="w-full mb-4">
              <DialogTitle className="text-center text-xl font-bold">To'lov cheki</DialogTitle>
            </DialogHeader>

            <div className="w-full overflow-hidden border border-gray-200 shadow-sm rounded-lg relative flex flex-col items-center p-4">
                <div ref={printRef} className="w-[300px] p-4 bg-white text-black font-mono text-[11px] leading-snug">
                   <p className="text-sm font-black text-center mb-1">{branchSettings?.receipt_header || '⭐⭐⭐ ICE BERG ⭐⭐⭐'}</p>
                   <p className="text-[10px] font-bold uppercase text-center mb-4 text-gray-500">{branchSettings?.receipt_branch_name || printPayment?.branch?.name || 'ICE BERG FILIALI'}</p>
                   
                   <div className="w-full border-t border-dashed border-gray-400 pt-4 mb-3 space-y-1 text-center">
                      <div className="font-black text-[13px] uppercase">{printPayment?.group?.name || 'Guruhsiz'}</div>
                      
                      {printPayment?.group?.start_date && printPayment?.group?.end_date ? (
                          <div className="text-[11px] uppercase font-bold">{new Date(printPayment.group.start_date).toLocaleDateString('uz-UZ')} - {new Date(printPayment.group.end_date).toLocaleDateString('uz-UZ')}</div>
                      ) : printPayment?.paid_for_month ? (
                          <div className="text-[11px] uppercase font-bold">{printPayment.paid_for_month} oyi uchun</div>
                      ) : (
                          <div className="text-[11px] uppercase font-bold">To'liq to'lov</div>
                      )}
                      
                      <div className="text-[11px] uppercase font-bold mt-1">To'lov qilingan sana : {new Date(printPayment?.created_at || Date.now()).toLocaleDateString('uz-UZ')}</div>
                      
                      <div className="font-black text-[15px] pt-2 pb-2 uppercase">
                         {new Intl.NumberFormat('uz-UZ').format(printPayment?.amount || 0)} UZS
                      </div>
                   </div>
                   
                   <div className="w-full border-t border-gray-400 pt-3 space-y-1">
                      <div className="flex justify-between uppercase"><span>Chek kodi:</span> <span className="font-black">#{printPayment?.id?.split('-')[0].toUpperCase()}</span></div>
                      <div className="flex justify-between uppercase"><span>Mijoz:</span> <span>{printPayment?.student?.user?.first_name} {printPayment?.student?.user?.last_name}</span></div>
                      <div className="flex justify-between uppercase"><span>Kassir:</span> <span>{printPayment?.cashier?.first_name || 'Admin'}</span></div>
                   </div>

                   <div className="w-full space-y-3 mt-1">
                      
                      <div className="w-full border-t border-dashed border-gray-400 pt-3 text-center">
                         <p className="text-[10px] whitespace-pre-wrap leading-relaxed font-bold text-gray-500">
                            {branchSettings?.receipt_footer || 'Bizni tanlaganingiz uchun tashakkur!'}
                         </p>
                      </div>
                   </div>
                </div>
            </div>

            <DialogFooter className="mt-6 w-full flex gap-3 sm:justify-center">
              <Button variant="outline" onClick={() => setPrintPayment(null)} className="flex-1 rounded-[8px] font-medium border-gray-200">Yopish</Button>
              <Button onClick={() => handlePrint()} className="flex-1 rounded-[8px] font-medium bg-[#1E3A5F] text-white hover:bg-navy-900 border-none">
                 <Printer className="w-4 h-4 mr-2" /> Chop etish
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
