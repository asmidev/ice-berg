"use client";

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Search, Filter, Plus, Printer, Wallet, ChevronDown, CheckCircle2,
  CalendarDays, RotateCcw, MoreHorizontal, FileText, Send, Archive, Trash2, 
  Settings2, LayoutGrid, Clock, Users2, Building2, CreditCard, ArrowRightLeft,
  Pencil, X
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function FinanceExpensesPage() {
  const confirm = useConfirm();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('variable');
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState('all');
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data States
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [cashboxes, setCashboxes] = useState<any[]>([]);
  const [staffUsers, setStaffUsers] = useState<any[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [staffFilter, setStaffFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  // Modal States
  const [isVariableModalOpen, setIsVariableModalOpen] = useState(false);
  const [isFixedModalOpen, setIsFixedModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

  // Form States
  const [expenseForm, setExpenseForm] = useState({
    id: '', amount: '', description: '', category_id: '', cashbox_id: '', 
    type: 'VARIABLE', payment_method: 'CASH', source_type: 'KASSA',
    staff_id: '', responsible_id: '', department_id: '', date: new Date().toISOString().split('T')[0]
  });
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '' });
  const [deptForm, setDeptForm] = useState({ id: '', name: '' });
  const [planForm, setPlanForm] = useState({
    id: '', amount: '', category_id: '', branch_id: '', date: '', description: ''
  });
  const [archiveForm, setArchiveForm] = useState({ id: '', reason: '' });

  useEffect(() => {
    const bId = (typeof window !== 'undefined' ? localStorage.getItem('branch_id') : null) || 'all';
    setBranchId(bId);
    setMounted(true);
  }, [searchParams]);

  const fetchData = async () => {
    if (!mounted) return;
    setLoading(true);
    try {
      const bId = branchId;
      const commonParams = `branch_id=${bId}&search=${search}&startDate=${startDate}&endDate=${endDate}`;

      if (['variable', 'fixed', 'other_staff'].includes(activeTab)) {
        let type = 'VARIABLE';
        if (activeTab === 'fixed') type = 'FIXED';
        
        let path = `/finance/expenses?${commonParams}&type=${type}`;
        if (activeTab === 'other_staff') {
            path = `/finance/expenses?${commonParams}`;
        }
        if (staffFilter !== 'all') path += `&staff_id=${staffFilter}`;
        if (deptFilter !== 'all') path += `&department_id=${deptFilter}`;
        if (methodFilter !== 'all') path += `&payment_method=${methodFilter}`;

        const [expensesRes, catsRes, deptsRes, cashboxesRes, staffRes, teachersRes] = await Promise.all([
          api.get(path),
          api.get(`/finance/expense-categories`),
          api.get(`/finance/departments`),
          api.get(`/finance/cashboxes?branch_id=${bId}`),
          api.get(`/staff?branch_id=${bId}`),
          api.get(`/teachers?branch_id=${bId}`)
        ]);

        const combinedStaff = [
          ...(staffRes.data?.data || staffRes.data || []).map((u: any) => ({
             id: u.id,
             name: `${u.first_name} ${u.last_name}`
          })),
          ...(teachersRes.data?.data || teachersRes.data || []).map((t: any) => ({
             id: t.user_id,
             name: `${t.user?.first_name} ${t.user?.last_name}`
          }))
        ];

        setExpenses(expensesRes.data?.data || expensesRes.data || []);
        setCategories(catsRes.data?.data || catsRes.data || []);
        setDepartments(deptsRes.data?.data || deptsRes.data || []);
        setCashboxes(cashboxesRes.data?.data || cashboxesRes.data || []);
        setStaffUsers(combinedStaff);
      } else if (activeTab === 'categories') {
        const res = await api.get(`/finance/expense-categories`);
        setCategories(res.data?.data || res.data || []);
      } else if (activeTab === 'plans') {
        const res = await api.get(`/finance/expense-plans?branch_id=${bId}`);
        setPlans(res.data?.data || res.data || []);
        const cats = await api.get(`/finance/expense-categories`);
        setCategories(cats.data?.data || cats.data || []);
      }
    } catch (err) {
      console.error('Fetch Error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchData, 400);
    return () => clearTimeout(timeout);
  }, [branchId, mounted, search, activeTab, startDate, endDate, staffFilter, deptFilter, methodFilter]);

  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  }, [expenses]);

  // ACTIONS
  const handleSaveExpense = async (typeOverride?: 'VARIABLE' | 'FIXED') => {
    if (!expenseForm.amount || !expenseForm.cashbox_id) return toast.error("Summa va kassani tanlang");
    
    // Validation for Staff expenses
    if (activeTab === 'other_staff' && !expenseForm.staff_id) return toast.error("Xodimni tanlang");

    setSubmitting(true);
    try {
      const type = typeOverride || (activeTab === 'fixed' ? 'FIXED' : 'VARIABLE');
      
      const payload = { 
        ...expenseForm, 
        amount: Number(expenseForm.amount), 
        branch_id: branchId === 'all' ? undefined : branchId,
        type: type,
        // Best practice: Clean IDs
        staff_id: expenseForm.staff_id || null,
        responsible_id: (type === 'FIXED') ? null : (expenseForm.responsible_id || null),
        department_id: (type === 'FIXED') ? null : (expenseForm.department_id || null),
        category_id: expenseForm.category_id || null
      };

      await api.post('/finance/expenses', payload);
      
      // Close all possible expense modals
      setIsVariableModalOpen(false);
      setIsFixedModalOpen(false);
      setIsStaffModalOpen(false);
      
      resetExpenseForm();
      fetchData();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleArchive = async () => {
     if (!archiveForm.reason) return toast.error("Sababni kiriting");
     setSubmitting(true);
     try {
       await api.post(`/finance/expenses/${archiveForm.id}/archive`, { reason: archiveForm.reason });
       setIsArchiveDialogOpen(false);
       fetchData();
     } catch (err) { console.error(err); }
     finally { setSubmitting(false); }
  };

  const resetExpenseForm = () => {
    setExpenseForm({
        id: '', amount: '', description: '', category_id: '', cashbox_id: '', 
        type: activeTab === 'fixed' ? 'FIXED' : 'VARIABLE', 
        payment_method: 'CASH', source_type: 'KASSA',
        staff_id: '', responsible_id: '', department_id: '', date: new Date().toISOString().split('T')[0]
    });
  };

  const resetPlanForm = () => {
    setPlanForm({ id: '', amount: '', category_id: '', branch_id: '', date: new Date().toISOString().split('T')[0], description: '' });
  };

  const resetCategoryForm = () => {
    setCategoryForm({ id: '', name: '' });
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 w-full selection:bg-pink-100 selection:text-pink-900 animate-in fade-in duration-500">
      
      {/* 🚀 Dynamic Tabs */}
      <div className="flex border-b border-gray-100 mb-2 overflow-x-auto no-scrollbar whitespace-nowrap">
         {[
           {id: 'variable', name: "O'zgaruvchi xarajatlar", icon: ArrowRightLeft},
           {id: 'fixed', name: "O'zgarmas xarajatlar", icon: Building2},
           {id: 'categories', name: "Xarajat turlari", icon: LayoutGrid},
           {id: 'plans', name: "Xarajatlarni rejalashtirish", icon: Clock},
           {id: 'other_staff', name: "Boshqa xodimlar", icon: Users2},
         ].map(tab => (
           <button 
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`flex items-center gap-2.5 px-6 py-4 text-[13px] font-bold transition-all border-b-2
               ${activeTab === tab.id ? 'border-[#EC4899] text-[#EC4899] bg-pink-50/30' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}
             `}
           >
             <tab.icon size={16} strokeWidth={activeTab === tab.id ? 3 : 2} />
             {tab.name}
           </button>
         ))}
      </div>

      {/* 📊 Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
         <div className="bg-white p-6 rounded-[12px] shadow-sm border border-gray-100 flex justify-between items-center group transition-all hover:shadow-md">
            <div>
               <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Jami xarajatlar</p>
               <h2 className="text-[24px] font-black text-[#1E3A5F]">{totalAmount.toLocaleString()} <span className="text-[12px] text-gray-400 uppercase font-bold text-[10px]">uzs</span></h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-[#EC4899] group-hover:scale-110 transition-transform shadow-inner"><Wallet size={20} /></div>
         </div>
         <div className="bg-white p-6 rounded-[12px] shadow-sm border border-gray-100 flex justify-between items-center group transition-all hover:shadow-md">
            <div>
               <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Filtrlandi</p>
               <h2 className="text-[24px] font-black text-[#1E3A5F]">{expenses.length} <span className="text-[12px] text-gray-400 uppercase font-bold text-[10px]">yozuv</span></h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#1E3A5F]/5 flex items-center justify-center text-[#1E3A5F] group-hover:scale-110 transition-transform"><CheckCircle2 size={20} /></div>
         </div>
         <div className="bg-white p-6 rounded-[12px] shadow-sm border border-gray-100 flex justify-between items-center group transition-all hover:shadow-md">
            <div>
               <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">O'rtacha chiqim</p>
               <h2 className="text-[24px] font-black text-[#1E3A5F]">
                  {(expenses.length > 0 ? Math.round(totalAmount / expenses.length) : 0).toLocaleString()} 
                  <span className="text-[12px] text-gray-400 uppercase font-bold text-[10px]"> uzs</span>
               </h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform"><Send size={18} /></div>
         </div>
      </div>

      {/* 🔍 Filters Section */}
      <div className="flex flex-wrap items-center gap-2 mb-2 bg-white p-2 rounded-[12px] shadow-sm border border-gray-100">
         <div className="w-44">
            <Input 
              placeholder="Sabab bo'yicha" 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="h-10 px-4 text-[11px] bg-gray-50/50 border-none rounded-[8px] text-gray-600 outline-none font-bold placeholder:text-gray-300"
            />
         </div>
         <div className="w-44">
            <Select value={staffFilter} onValueChange={setStaffFilter}>
               <SelectTrigger className="h-10 bg-gray-50/50 border-none rounded-[8px] text-[11px] text-gray-600 font-bold">
                  <SelectValue placeholder="Xodim bo'yicha" />
               </SelectTrigger>
               <SelectContent className="rounded-xl border-gray-100 shadow-2xl">
                  <SelectItem value="all">Barcha xodimlar</SelectItem>
                  {staffUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
               </SelectContent>
            </Select>
         </div>
         <div className="w-44">
            <Select value={deptFilter} onValueChange={setDeptFilter}>
               <SelectTrigger className="h-10 bg-gray-50/50 border-none rounded-[8px] text-[11px] text-gray-600 font-bold">
                  <SelectValue placeholder="Bo'lim bo'yicha" />
               </SelectTrigger>
               <SelectContent className="rounded-xl border-gray-100 shadow-2xl">
                  <SelectItem value="all">Barcha bo'limlar</SelectItem>
                  {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
               </SelectContent>
            </Select>
         </div>
         <div className="w-44">
            <Select value={methodFilter} onValueChange={setMethodFilter}>
               <SelectTrigger className="h-10 bg-gray-50/50 border-none rounded-[8px] text-[11px] text-gray-600 font-bold">
                  <SelectValue placeholder="To'lov usuli" />
               </SelectTrigger>
               <SelectContent className="rounded-xl border-gray-100 shadow-2xl">
                  <SelectItem value="all">To'lov usuli</SelectItem>
                  <SelectItem value="CASH">Naqd pul</SelectItem>
                  <SelectItem value="CARD">Plastik karta</SelectItem>
                  <SelectItem value="TRANSFER">O'tkazma</SelectItem>
               </SelectContent>
            </Select>
         </div>
         <div className="w-36">
            <Input 
              type="date"
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="h-10 px-4 text-[11px] bg-gray-50/50 border-none rounded-[8px] text-gray-600 font-bold"
            />
         </div>
         <div className="w-36 text-center text-gray-300 font-bold text-[10px] uppercase tracking-widest leading-10">Gacha</div>
         <div className="w-36">
            <Input 
              type="date"
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="h-10 px-4 text-[11px] bg-gray-50/50 border-none rounded-[8px] text-gray-600 font-bold"
            />
         </div>
         <Button onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); setStaffFilter('all'); setDeptFilter('all'); setMethodFilter('all'); }} variant="ghost" className="h-10 px-5 text-[11px] font-black text-gray-400 hover:text-[#EC4899] uppercase tracking-widest transition-all">
            Tozalash
         </Button>
         
         <div className="ml-auto pr-1">
            {activeTab === 'categories' ? (
                <Button onClick={() => { resetCategoryForm(); setIsCategoryModalOpen(true); }} className="h-10 px-6 rounded-[8px] bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-[12px] flex items-center gap-2 shadow-lg shadow-pink-100 border-none transition-all active:scale-95">
                    Tur qo'shish
                    <Plus size={14} strokeWidth={3} />
                </Button>
            ) : activeTab === 'plans' ? (
                <Button onClick={() => { resetPlanForm(); setIsPlanModalOpen(true); }} className="h-10 px-6 rounded-[8px] bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-[12px] flex items-center gap-2 shadow-lg shadow-pink-100 border-none transition-all active:scale-95">
                    Reja qo'shish
                    <Plus size={14} strokeWidth={3} />
                </Button>
            ) : activeTab === 'fixed' ? (
                <Button onClick={() => { resetExpenseForm(); setIsFixedModalOpen(true); }} className="h-10 px-6 rounded-[8px] bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-[12px] flex items-center gap-2 shadow-lg shadow-pink-100 border-none transition-all active:scale-95">
                    O'zgarmas xarajat
                    <Plus size={14} strokeWidth={3} />
                </Button>
            ) : activeTab === 'other_staff' ? (
                <Button onClick={() => { resetExpenseForm(); setIsStaffModalOpen(true); }} className="h-10 px-6 rounded-[8px] bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-[12px] flex items-center gap-2 shadow-lg shadow-pink-100 border-none transition-all active:scale-95">
                    Xodim uchun xarajat
                    <Plus size={14} strokeWidth={3} />
                </Button>
            ) : (
                <Button onClick={() => { resetExpenseForm(); setIsVariableModalOpen(true); }} className="h-10 px-6 rounded-[8px] bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-[12px] flex items-center gap-2 shadow-lg shadow-pink-100 border-none transition-all active:scale-95">
                    Xarajat yozish
                    <Plus size={14} strokeWidth={3} />
                </Button>
            )}
         </div>
      </div>

      {/* 📊 Main Table Container */}
      <div className="bg-white rounded-[12px] shadow-sm border border-gray-100 overflow-hidden mb-12 flex-1">
        <div className="overflow-x-auto w-full min-h-[500px]">
          {['variable', 'fixed', 'other_staff'].includes(activeTab) && (
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-white border-b border-gray-50 font-black uppercase tracking-wider text-gray-400 text-[10px]">
                  <th className="py-6 pl-10 w-16 text-center">T/R</th>
                  <th className="py-6 px-6">SABAB</th>
                  <th className="py-6 px-6">XARAJAT TURLARI</th>
                  <th className="py-6 px-6">SANA</th>
                  <th className="py-6 px-6">NARX</th>
                  <th className="py-6 px-6 text-center">XODIM</th>
                  <th className="py-6 px-6">To'lov usuli</th>
                  <th className="py-6 px-6">Qayerdan olinganligi</th>
                  <th className="py-6 pr-10 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {loading ? (
                  [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={9} className="py-8 px-10 opacity-20"><div className="h-4 bg-zinc-200 rounded w-full" /></td></tr>)
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-40 text-center">
                       <LayoutGrid size={64} className="text-zinc-100 mx-auto mb-4" />
                       <span className="text-sm font-black uppercase tracking-widest text-zinc-300">Xarajatlar mavjud emas</span>
                    </td>
                  </tr>
                ) : expenses.map((e, idx) => (
                  <tr key={e.id} className="group hover:bg-zinc-50/80 transition-all cursor-pointer">
                    <td className="pl-10 py-6 text-center font-bold text-zinc-300 text-[11px]">{idx + 1}.</td>
                    <td className="py-6 px-6 font-bold text-zinc-700 text-[13px]">{e.description || '-'}</td>
                    <td className="py-6 px-6 font-bold text-zinc-400 text-[11px] uppercase tracking-tight">{e.categoryRel?.name || e.category}</td>
                    <td className="py-6 px-6 font-bold text-zinc-400 text-[11px]">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="py-6 px-6 font-black text-rose-500 text-[14px]">{Number(e.amount).toLocaleString()} so'm</td>
                    <td className="py-6 px-6 text-center font-bold text-gray-500 text-[11px]">
                      <span className="bg-gray-100 px-2 py-1 rounded-lg">
                        {e.staff?.first_name || 'Husanboy'}
                      </span>
                    </td>
                    <td className="py-6 px-6 font-bold text-gray-400 text-[11px]">{e.payment_method}</td>
                    <td className="py-6 px-6 font-bold text-gray-400 text-[11px]">{e.cashbox?.name || 'kassa'}</td>
                    <td className="py-6 pr-10 text-right">
                       <Popover>
                          <PopoverTrigger>
                             <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 hover:bg-gray-100 transition-all"><MoreHorizontal size={16} /></div>
                          </PopoverTrigger>
                          <PopoverContent className="w-32 p-1.5 rounded-[12px] border-gray-100 shadow-xl bg-white focus:outline-none">
                            <button onClick={() => { setArchiveForm({ id: e.id, reason: '' }); setIsArchiveDialogOpen(true); }} className="w-full text-left p-2.5 text-rose-500 font-bold text-[11px] hover:bg-rose-50 rounded-[8px] flex items-center gap-2">
                              <Archive size={14}/> Arxivlash
                            </button>
                          </PopoverContent>
                       </Popover>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'categories' && (
            <div className="p-10 max-w-4xl mx-auto">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map(c => (
                    <div key={c.id} className="bg-white p-5 rounded-[12px] flex justify-between items-center group border border-gray-100 hover:border-pink-200 transition-all shadow-sm">
                       <span className="font-black text-gray-600 uppercase tracking-widest text-[11px]">{c.name}</span>
                       <button onClick={async () => {
                         if (!await confirm({ title: "O'chirish", message: "Ushbu xarajat toifasini o'chirishni tasdiqlaysizmi?", type: "danger" })) return;
                         await api.delete(`/finance/expense-categories/${c.id}`);
                         fetchData();
                       }} className="w-9 h-9 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-rose-100"><Trash2 size={16}/></button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'plans' && (
             <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {plans.map(p => (
                     <div key={p.id} className="bg-white p-6 rounded-[12px] border border-gray-100 shadow-sm relative group overflow-hidden transition-all hover:shadow-md">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gray-50 rounded-bl-[20px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                           <button onClick={async () => {
                             if (!await confirm({ title: "Rejani o'chirish", message: "Ushbu xarajat rejasini o'chirishni tasdiqlaysizmi?", type: "danger" })) return;
                             await api.delete(`/finance/expense-plans/${p.id}`);
                             fetchData();
                           }} className="text-rose-400 hover:text-rose-600"><Trash2 size={18}/></button>
                        </div>
                        <div className="text-[10px] font-black text-[#EC4899] uppercase tracking-widest mb-2 border-b border-gray-50 pb-2">{p.category?.name || 'Toifa'}</div>
                        <div className="text-xl font-black text-[#1E3A5F] mb-1">{Number(p.amount).toLocaleString()} <span className="text-[10px] text-gray-400 font-bold uppercase">uzs</span></div>
                        <div className="text-[11px] font-bold text-gray-400 mb-4 flex items-center gap-2"><CalendarDays size={14}/> {new Date(p.date).toLocaleDateString()}</div>
                        <p className="text-[11px] text-gray-500 italic font-semibold leading-relaxed">"{p.description || 'Izoh yo\'q'}"</p>
                     </div>
                   ))}
                </div>
             </div>
          )}
        </div>
      </div>

      {/* --- 1. VARIABLE EXPENSE MODAL --- */}
      <Dialog open={isVariableModalOpen} onOpenChange={setIsVariableModalOpen}>
         <DialogContent className="sm:max-w-xl rounded-[16px] p-8 border-none shadow-2xl bg-white focus:outline-none overflow-y-auto max-h-[90vh] custom-scrollbar text-center">
            <DialogHeader className="items-center space-y-3">
               <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center text-[#EC4899] shadow-inner"><ArrowRightLeft size={32} /></div>
               <DialogTitle className="text-xl font-black text-[#1E3A5F]">O'zgaruvchi xarajat</DialogTitle>
               <DialogDescription className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Operatsion chiqimlarni ro'yxatdan o'tkazish</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-5 py-6 text-left">
               <div className="col-span-1 space-y-1.5">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Xarajat turi</Label>
                  <Select value={expenseForm.category_id} onValueChange={v => setExpenseForm({...expenseForm, category_id: v})}>
                     <SelectTrigger className="h-11 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold text-gray-700 focus:ring-1 focus:ring-pink-100"><SelectValue placeholder="Tanlang..." /></SelectTrigger>
                     <SelectContent className="rounded-xl border-gray-100">
                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                     </SelectContent>
                  </Select>
               </div>
               <div className="col-span-1 space-y-1.5">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Summa</Label>
                  <Input type="number" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} className="h-11 rounded-[8px] bg-gray-50/50 border-gray-100 font-black text-gray-700" placeholder="0.00" />
               </div>
               <div className="col-span-2 space-y-1.5">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kassa (Chiqim)</Label>
                  <Select value={expenseForm.cashbox_id} onValueChange={v => setExpenseForm({...expenseForm, cashbox_id: v})}>
                     <SelectTrigger className="h-11 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold text-gray-700 focus:ring-1 focus:ring-pink-100"><SelectValue placeholder="Kassani tanlang" /></SelectTrigger>
                     <SelectContent className="rounded-xl border-gray-100">
                        {cashboxes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({Number(c.balance).toLocaleString()} so'm)</SelectItem>)}
                     </SelectContent>
                  </Select>
               </div>
               <div className="col-span-1 space-y-1.5">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mas'ul shaxs</Label>
                  <Select value={expenseForm.responsible_id} onValueChange={v => setExpenseForm({...expenseForm, responsible_id: v})}>
                     <SelectTrigger className="h-11 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold text-gray-700"><SelectValue placeholder="Tanlang..." /></SelectTrigger>
                     <SelectContent>{staffUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                  </Select>
               </div>
               <div className="col-span-1 space-y-1.5">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bo'lim</Label>
                  <Select value={expenseForm.department_id} onValueChange={v => setExpenseForm({...expenseForm, department_id: v})}>
                     <SelectTrigger className="h-11 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold text-gray-700"><SelectValue placeholder="Tanlang..." /></SelectTrigger>
                     <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                  </Select>
               </div>
               <div className="col-span-2 space-y-1.5">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Izoh</Label>
                  <Input value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} className="h-11 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold" placeholder="..." />
               </div>
            </div>

            <DialogFooter className="flex gap-3">
               <Button variant="outline" className="h-11 px-8 rounded-[8px] font-bold text-gray-400 flex-1" onClick={() => setIsVariableModalOpen(false)}>Bekor qilish</Button>
               <Button className="h-11 px-10 rounded-[8px] font-bold bg-[#EC4899] hover:bg-pink-600 text-white flex-1 transition-all" onClick={() => handleSaveExpense('VARIABLE')} disabled={submitting}>Saqlash</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* --- 2. FIXED EXPENSE MODAL --- */}
      <Dialog open={isFixedModalOpen} onOpenChange={setIsFixedModalOpen}>
         <DialogContent className="sm:max-w-md rounded-[16px] p-8 border-none shadow-2xl bg-white focus:outline-none text-center">
            <DialogHeader className="items-center space-y-3">
               <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center text-[#1E3A5F] shadow-inner"><Building2 size={32} /></div>
               <DialogTitle className="text-xl font-black text-[#1E3A5F]">O'zgarmas xarajat</DialogTitle>
               <DialogDescription className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Ijara, soliq va boshqa oylik to'lovlar</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4 py-6 text-left">
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Xarajat turi</Label>
                  <Select value={expenseForm.category_id} onValueChange={v => setExpenseForm({...expenseForm, category_id: v})}>
                     <SelectTrigger className="h-11 rounded-[8px] bg-gray-50/50 border-gray-100 font-bold"><SelectValue placeholder="Toifani tanlang" /></SelectTrigger>
                     <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Summa</Label>
                  <Input type="number" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} className="h-11 font-black" placeholder="0.00" />
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kassa</Label>
                  <Select value={expenseForm.cashbox_id} onValueChange={v => setExpenseForm({...expenseForm, cashbox_id: v})}>
                     <SelectTrigger className="h-11"><SelectValue placeholder="Kassani tanlang" /></SelectTrigger>
                     <SelectContent>{cashboxes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sana</Label>
                  <Input type="date" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} className="h-11 font-bold" />
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Izoh</Label>
                  <Input value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} className="h-11 font-bold" placeholder="..." />
               </div>
            </div>

            <DialogFooter className="flex gap-4">
               <Button variant="outline" className="h-11 flex-1 font-bold" onClick={() => setIsFixedModalOpen(false)}>Bekor qilish</Button>
               <Button className="h-11 flex-1 font-bold bg-[#1E3A5F] hover:bg-navy-900 text-white" onClick={() => handleSaveExpense('FIXED')} disabled={submitting}>Saqlash</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* --- 3. STAFF EXPENSE MODAL --- */}
      <Dialog open={isStaffModalOpen} onOpenChange={setIsStaffModalOpen}>
         <DialogContent className="sm:max-w-md rounded-[16px] p-8 border-none shadow-2xl bg-white focus:outline-none text-center">
            <DialogHeader className="items-center space-y-3">
               <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shadow-inner"><Users2 size={32} /></div>
               <DialogTitle className="text-xl font-black text-[#1E3A5F]">Xodim uchun xarajat</DialogTitle>
               <DialogDescription className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Avans, bonus yoki boshqa to'lovlar</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4 py-6 text-left">
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Xodim tanlash *</Label>
                  <Select value={expenseForm.staff_id} onValueChange={v => setExpenseForm({...expenseForm, staff_id: v})}>
                     <SelectTrigger className="h-11 border-rose-100 bg-rose-50/20 font-bold"><SelectValue placeholder="Xodimni tanlang" /></SelectTrigger>
                     <SelectContent>{staffUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                  </Select>
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Xarajat turi</Label>
                  <Select value={expenseForm.category_id} onValueChange={v => setExpenseForm({...expenseForm, category_id: v})}>
                     <SelectTrigger className="h-11"><SelectValue placeholder="Tanlang..." /></SelectTrigger>
                     <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Summa</Label>
                  <Input type="number" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} className="h-11 font-black" placeholder="0.00" />
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kassa</Label>
                  <Select value={expenseForm.cashbox_id} onValueChange={v => setExpenseForm({...expenseForm, cashbox_id: v})}>
                     <SelectTrigger className="h-11"><SelectValue placeholder="Kassani tanlang" /></SelectTrigger>
                     <SelectContent>{cashboxes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Izoh</Label>
                  <Input value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} className="h-11 font-bold" placeholder="..." />
               </div>
            </div>

            <DialogFooter className="flex gap-4">
               <Button variant="outline" className="h-11 flex-1 font-bold" onClick={() => setIsStaffModalOpen(false)}>Bekor qilish</Button>
               <Button className="h-11 flex-1 font-bold bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleSaveExpense('VARIABLE')} disabled={submitting}>Saqlash</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* --- ARCHIVE DIALOG --- */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
         <DialogContent className="sm:max-w-md rounded-[16px] p-10 border-none shadow-2xl bg-white text-center focus:outline-none">
            <DialogHeader className="items-center space-y-4">
               <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-2 shadow-inner"><Archive size={40} /></div>
               <DialogTitle className="text-2xl font-black text-[#1E3A5F] tracking-tight">Xarajatni arxivlash</DialogTitle>
               <DialogDescription className="text-[12px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Sababni kiriting. Kassa balansi qayta tiklanadi.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-8">
               <Input 
                 value={archiveForm.reason} 
                 onChange={e => setArchiveForm({...archiveForm, reason: e.target.value})} 
                 placeholder="Arxivlash sababi..." 
                 className="h-12 rounded-[8px] bg-gray-50 border-gray-100 font-bold text-center text-gray-700 focus:ring-1 focus:ring-rose-100"
               />
            </div>
            <DialogFooter className="flex gap-4">
               <Button variant="outline" className="h-12 px-8 rounded-[8px] font-bold text-gray-400 flex-1 border-gray-100 hover:bg-gray-50 transition-all" onClick={() => setIsArchiveDialogOpen(false)}>Bekor qilish</Button>
               <Button className="h-12 px-10 rounded-[8px] font-bold bg-rose-600 hover:bg-rose-700 text-white border-none shadow-xl shadow-rose-100 flex-1 transition-all" onClick={handleArchive} disabled={submitting}>Arxivga o'tkazish</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* --- ADD PLAN MODAL --- */}
      <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
         <DialogContent className="sm:max-w-md rounded-[16px] p-10 bg-white border-none shadow-2xl focus:outline-none">
            <DialogHeader className="items-center space-y-4">
               <div className="w-20 h-20 bg-navy-50 rounded-full flex items-center justify-center text-[#1E3A5F] mb-2 shadow-inner transition-transform hover:scale-110"><Clock size={40} /></div>
               <DialogTitle className="text-2xl font-black text-[#1E3A5F] tracking-tight">Xarajatni rejalashtirish</DialogTitle>
               <DialogDescription className="text-[12px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Kelajakdagi operatsion chiqimni belgilang</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-5 py-6 font-bold text-[11px] uppercase text-gray-400">
               <div className="space-y-2">
                  <Label className="ml-1 tracking-widest">Xarajat turi</Label>
                  <Select value={planForm.category_id} onValueChange={v => setPlanForm({...planForm, category_id: v})}>
                     <SelectTrigger className="h-12 bg-gray-50/50 border-gray-100 rounded-[8px] font-bold text-gray-700 focus:ring-1 focus:ring-navy-100"><SelectValue placeholder="Tanlang..." /></SelectTrigger>
                     <SelectContent className="rounded-xl shadow-2xl border-gray-100">{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <Label className="ml-1 tracking-widest">Plan Summa</Label>
                  <Input type="number" value={planForm.amount} onChange={e => setPlanForm({...planForm, amount: e.target.value})} className="h-12 bg-gray-50/50 border-gray-100 rounded-[8px] font-bold text-gray-700 focus:ring-1 focus:ring-navy-100" />
               </div>
               <div className="space-y-2">
                  <Label className="ml-1 tracking-widest">Taxminiy sana</Label>
                  <Input type="date" value={planForm.date} onChange={e => setPlanForm({...planForm, date: e.target.value})} className="h-12 bg-gray-50/50 border-gray-100 rounded-[8px] font-bold text-gray-700 focus:ring-1 focus:ring-navy-100" />
               </div>
               <div className="space-y-2">
                  <Label className="ml-1 tracking-widest">Izoh</Label>
                  <Input value={planForm.description} onChange={e => setPlanForm({...planForm, description: e.target.value})} className="h-12 bg-gray-50/50 border-gray-100 rounded-[8px] font-bold text-gray-700 focus:ring-1 focus:ring-navy-100" />
               </div>
            </div>

            <DialogFooter className="mt-4 flex gap-3">
               <Button variant="outline" className="h-12 px-6 rounded-[8px] font-bold text-gray-400 border-gray-100 hover:bg-gray-50 transition-all flex-1" onClick={() => setIsPlanModalOpen(false)}>Bekor qilish</Button>
               <Button className="h-12 px-8 rounded-[8px] font-bold bg-[#1E3A5F] hover:bg-navy-900 text-white border-none shadow-lg shadow-navy-100 flex-1 transition-all" onClick={async () => {
                  if (!planForm.category_id || !planForm.amount) return toast.error("Barcha maydonlarni to'ldiring");
                  setSubmitting(true);
                  try {
                    await api.post('/finance/expense-plans', { ...planForm, branch_id: branchId === 'all' ? undefined : branchId });
                    setIsPlanModalOpen(false);
                    fetchData();
                  } catch (err) { console.error(err); }
                  finally { setSubmitting(false); }
               }} disabled={submitting}>Saqlash</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>


      {/* --- ADD CATEGORY MODAL --- */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
         <DialogContent className="sm:max-w-md rounded-[16px] p-10 bg-white border-none shadow-2xl focus:outline-none text-center">
            <DialogHeader className="items-center space-y-4">
               <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center text-[#EC4899] mb-2 shadow-inner transition-transform hover:scale-110"><LayoutGrid size={40} /></div>
               <DialogTitle className="text-2xl font-black text-[#1E3A5F] tracking-tight">Xarajat turi qo'shish</DialogTitle>
               <DialogDescription className="text-[12px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Yangi xarajat kategoriyasini yarating</DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-8 text-left">
               <Label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Tur nomi</Label>
               <Input 
                 placeholder="Masalan: Ijara, Oziq-ovqat..." 
                 value={categoryForm.name} 
                 onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}
                 className="h-12 rounded-[8px] bg-gray-50 font-bold text-gray-700 border-gray-100 focus:ring-1 focus:ring-pink-100"
               />
            </div>

            <DialogFooter className="flex gap-4">
               <Button variant="outline" className="h-12 px-8 rounded-[8px] font-bold text-gray-400 flex-1 border-gray-100 hover:bg-gray-50 transition-all font-bold" onClick={() => setIsCategoryModalOpen(false)}>Bekor qilish</Button>
               <Button className="h-12 px-10 rounded-[8px] font-bold bg-[#EC4899] hover:bg-pink-600 text-white border-none shadow-xl shadow-pink-100 flex-1 transition-all" onClick={async () => {
                  if (!categoryForm.name) return toast.error("Nomini kiriting");
                  setSubmitting(true);
                  try {
                    await api.post('/finance/expense-categories', { name: categoryForm.name });
                    setIsCategoryModalOpen(false);
                    fetchData();
                  } catch (err) { console.error(err); }
                  finally { setSubmitting(false); }
               }} disabled={submitting}>Saqlash</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
