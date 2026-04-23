"use client";

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
  Search, Filter, Plus, Printer, Wallet, ChevronDown, CheckCircle2,
  CalendarDays, Smartphone, CreditCard, RotateCcw, MoreHorizontal, FileText,
  Archive, Trash2, Package, Tags, History, Image as ImageIcon,
  User, Check, X, Pencil, ShoppingCart, LayoutGrid, AlertCircle
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ImportExcelModal } from '@/components/shared/ImportExcelModal';
import { toast as toastSonner } from 'sonner';
import * as XLSX from 'xlsx';

export default function FinanceIncomesPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState('all');
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Data States
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cashboxes, setCashboxes] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  // Search/Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [studentSearch, setStudentSearch] = useState('');
  const [isStudentSelectOpen, setIsStudentSelectOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerSelectOpen, setIsCustomerSelectOpen] = useState(false);

  // Modal States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  
  // Custom Toast & Dialog
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success'|'error'}>({show: false, message: '', type: 'success'});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: 'category'|'product', id: string} | null>(null);

  const showToast = (message: string, type: 'success'|'error' = 'success') => {
     setToast({ show: true, message, type });
     setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  // Form States
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '' });
  const [productForm, setProductForm] = useState({
    id: '', name: '', price: 0, cost_price: 0, stock: 0, category_id: '', branch_id: '', photo_url: ''
  });
  const [saleForm, setSaleForm] = useState({
    student_id: '', customer_id: '', branch_id: '', cashbox_id: '', payment_method: 'CASH',
    items: [] as any[]
  });
  const [archiveForm, setArchiveForm] = useState({ id: '', reason: '' });

  useEffect(() => {
    const bId = (typeof window !== 'undefined' ? localStorage.getItem('branch_id') : null) || 'all';
    setBranchId(bId);
    setMounted(true);
  }, [searchParams]);
  // DATA FETCHING
  const fetchData = async () => {
    if (!mounted) return;
    setLoading(true);
    try {
      const bId = branchId;
      if (activeTab === 'sales') {
        const [salesRes, teachersRes, staffRes, groupsRes, cashboxesRes, studentsRes, customersRes] = await Promise.all([
          api.get(`/finance/sales?branch_id=${bId}&search=${search}&start_date=${startDate}&end_date=${endDate}&is_archived=false`),
          api.get(`/teachers?branch_id=${bId}`),
          api.get(`/staff?branch_id=${bId}`),
          api.get(`/lms/groups?branch_id=${bId}`),
          api.get(`/finance/cashboxes?branch_id=${bId}`),
          api.get(`/students?branch_id=${bId}`),
          api.get(`/customers?branch_id=${bId}`)
        ]);
        setSales(salesRes.data?.data || salesRes.data || []);
        setTeachers(teachersRes.data?.data || teachersRes.data || []);
        setStaff(staffRes.data?.data || staffRes.data || []);
        setGroups(groupsRes.data?.data || groupsRes.data || []);
        setCashboxes(cashboxesRes.data?.data || cashboxesRes.data || []);
        setStudents(studentsRes.data?.data || studentsRes.data || []);
        setCustomers(customersRes.data?.data || customersRes.data || []);
      } else if (activeTab === 'products') {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get(`/inventory/products?branch_id=${bId}&search=${search}&category_id=${categoryFilter}`),
          api.get(`/inventory/categories`)
        ]);
        setProducts(productsRes.data?.data || productsRes.data || []);
        setCategories(categoriesRes.data?.data || categoriesRes.data || []);
      } else if (activeTab === 'categories') {
        const res = await api.get(`/inventory/categories`);
        setCategories(res.data?.data || res.data || []);
      }
    } catch (err) {
      console.error('Fetch Error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (activeTab === 'sales') {
      if (sales.length === 0) return showToast('Eksport qilish uchun ma\'lumot yo\'q', 'error');
      const exportData = sales.map(s => ({
        'Sana': new Date(s.created_at).toLocaleDateString(),
        'Mijoz': s.student ? `${s.student.user?.first_name} ${s.student.user?.last_name}` : s.customer?.name || 'Noma\'lum',
        'Maxsulotlar': s.items?.map((it: any) => `${it.product?.name} (${it.quantity})`).join(', '),
        'Summa': Number(s.total_amount).toLocaleString() + ' UZS',
        'To\'lov turi': s.payment_method
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Savdolar");
      XLSX.writeFile(wb, `Savdolar_${new Date().toISOString().split('T')[0]}.xlsx`);
    } else if (activeTab === 'products') {
      if (products.length === 0) return showToast('Eksport qilish uchun ma\'lumot yo\'q', 'error');
      const exportData = products.map(p => ({
        'Nomi': p.name,
        'Kategoriya': p.category?.name || 'Yo\'q',
        'Sotuv narxi': Number(p.price).toLocaleString() + ' UZS',
        'Tan narxi': Number(p.cost_price).toLocaleString() + ' UZS',
        'Sklad': p.stock,
        'Filial': p.branch?.name || 'Barcha'
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Maxsulotlar");
      XLSX.writeFile(wb, `Maxsulotlar_${new Date().toISOString().split('T')[0]}.xlsx`);
    }
    showToast('Excel fayl yuklandi!');
  };

  useEffect(() => {
    const timeout = setTimeout(fetchData, 400);
    return () => clearTimeout(timeout);
  }, [branchId, mounted, search, activeTab, categoryFilter, startDate, endDate]);

  const handleImportProducts = async (data: any[]) => {
    try {
      setLoading(true);
      const res = await api.post('/inventory/products/bulk', { 
        branchId: branchId || 'all',
        products: data.map(item => ({
          name: item['Nomi'] || item['Name'],
          category: item['Kategoriya'] || item['Category'],
          price: item['Sotuv Narxi'] || item['Sale Price'] || item['Price'],
          costPrice: item['Tan Narxi'] || item['Cost Price'],
          stock: item['Sklad'] || item['Stock'] || '0'
        }))
      });
      
      const { count, errors } = res.data;
      if (count > 0) {
        toastSonner.success(`${count} ta mahsulot muvaffaqiyatli import qilindi`);
        fetchData();
      }
      
      if (errors?.length > 0) {
        errors.forEach((err: string) => toastSonner.error(err));
      }
    } catch (err: any) {
      toastSonner.error(err.response?.data?.message || "Importda xatolik");
    } finally {
      setLoading(false);
    }
  };

  // CATEGORY ACTIONS
  const handleSaveCategory = async () => {
    try {
      if (categoryForm.id) {
        await api.put(`/inventory/categories/${categoryForm.id}`, { name: categoryForm.name });
      } else {
        await api.post(`/inventory/categories`, { name: categoryForm.name });
      }
      setIsCategoryModalOpen(false);
      setCategoryForm({ id: '', name: '' });
      showToast("Kategoriya saqlandi", "success");
      fetchData();
    } catch (err: any) { showToast(err.response?.data?.message || "Xatolik", "error"); }
  };

  // PRODUCT ACTIONS
  const handleSaveProduct = async () => {
    try {
      const payload = { ...productForm, branch_id: branchId };
      if (productForm.id) {
        await api.put(`/inventory/products/${productForm.id}`, payload);
      } else {
        await api.post(`/inventory/products`, payload);
      }
      setIsProductModalOpen(false);
      showToast("Maxsulot saqlandi", "success");
      fetchData();
    } catch (err: any) { showToast(err.response?.data?.message || "Xatolik yuz berdi", "error"); }
  };

  const initiateDelete = (type: 'category'|'product', id: string) => {
    setDeleteTarget({ type, id });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
       if (deleteTarget.type === 'category') {
          await api.delete(`/inventory/categories/${deleteTarget.id}`);
       } else {
          await api.delete(`/inventory/products/${deleteTarget.id}`);
       }
       showToast("Muvaffaqiyatli o'chirildi", "success");
       setIsDeleteDialogOpen(false);
       setDeleteTarget(null);
       fetchData();
    } catch (err: any) {
       showToast(err.response?.data?.message || "O'chirishda xatolik", "error");
    }
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm({...productForm, photo_url: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  // SALE ACTIONS
  const addItemToSale = (prod: any) => {
    const exists = saleForm.items.find(i => i.product_id === prod.id);
    if (exists) {
      setSaleForm({
        ...saleForm,
        items: saleForm.items.map(i => i.product_id === prod.id ? { ...i, quantity: i.quantity + 1 } : i)
      });
    } else {
      setSaleForm({
        ...saleForm,
        items: [...saleForm.items, { product_id: prod.id, name: prod.name, price: prod.price, quantity: 1, max: prod.stock }]
      });
    }
  };

  const removeItemFromSale = (id: string) => {
    setSaleForm({ ...saleForm, items: saleForm.items.filter(i => i.product_id !== id) });
  };

  const calculateTotal = () => {
    const sum = saleForm.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    return { sum };
  };

  const handleRecordSale = async () => {
      if (submitting) return;
      setSubmitting(true);
    try {
      const { sum } = calculateTotal();
      const payload = {
        branch_id: (branchId && branchId !== 'all') ? branchId : null,
        amount: sum,
        payment_method: saleForm.payment_method,
        student_id: (saleForm.student_id && saleForm.student_id !== 'none') ? saleForm.student_id : null,
        customer_id: (saleForm.customer_id && saleForm.customer_id !== 'none') ? saleForm.customer_id : null,
        cashbox_id: saleForm.cashbox_id || null,
        items: saleForm.items.map(i => ({ product_id: i.product_id, quantity: i.quantity, price: i.price }))
      };
      await api.post(`/finance/sales`, payload);
      setIsSaleModalOpen(false);
      setSaleForm({ student_id: '', customer_id: '', branch_id: '', cashbox_id: '', payment_method: 'CASH', items: [] });
      showToast("Savdo muvaffaqiyatli amalga oshirildi", "success");
      fetchData();
    } catch (err: any) { 
      console.error(err); 
      showToast(err.response?.data?.message || err.message || "Xatolik yuz berdi", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-2 w-full selection:bg-[#EC4899]/20 selection:text-[#be185d]">
      
      <ImportExcelModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportProducts}
        title="Maxsulotlarni Import Qilish"
        description="Excel fayl orqali mahsulotlarni ommaviy ravishda inventarga yuklang."
        templateHeaders={['Nomi', 'Kategoriya', 'Sotuv Narxi', 'Tan Narxi', 'Sklad']}
        exampleData={['Matematika Kitobi', 'O\'quv qurollari', '50000', '35000', '100']}
      />

      {/* --- TOAST --- */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
           <div className={cn(
              "flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border min-w-[300px]",
              toast.type === 'success' ? "bg-white border-emerald-100 text-emerald-600" : "bg-white border-rose-100 text-rose-600"
           )}>
              {toast.type === 'success' ? <CheckCircle2 size={24} className="text-emerald-500" /> : <AlertCircle size={24} className="text-rose-500" />}
              <p className="text-[13px] font-bold">{toast.message}</p>
           </div>
        </div>
      )}

      {/* 📊 SUMMARY CARDS (Top) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-2">
         <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100 flex justify-between items-center group transition-all hover:shadow-md">
            <div>
               <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-1">Jami tushum (So'm)</p>
               <h2 className="text-[26px] font-black text-[#1E3A5F]">{sales.reduce((a, b) => a + Number(b.amount || 0), 0).toLocaleString()} <span className="text-[12px] text-zinc-400">UZS</span></h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform"><Wallet size={24} /></div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100 flex justify-between items-center group transition-all hover:shadow-md">
            <div>
               <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-1">Sotilgan maxsulotlar (Soni)</p>
               <h2 className="text-[26px] font-black text-[#1E3A5F]">{sales.reduce((a, s) => a + (s.items?.reduce((iAcc: any, item: any) => iAcc + (item.quantity||0), 0) || 0), 0)} <span className="text-[12px] text-zinc-400">TA</span></h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform"><ShoppingCart size={24} /></div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100 flex justify-between items-center group transition-all hover:shadow-md">
            <div>
               <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-1">Aktiv Maxsulotlar</p>
               <h2 className="text-[26px] font-black text-[#1E3A5F]">{products.length} <span className="text-[12px] text-zinc-400">XIL</span></h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-[#EC4899] group-hover:scale-110 transition-transform"><Package size={24} /></div>
         </div>
      </div>

      {/* 🚀 Dynamic Tabs and Actions Consistent with UI Rules (Navy/Pink) */}
      <div className="flex border-b border-zinc-100 mb-8 overflow-x-auto no-scrollbar whitespace-nowrap justify-between items-center">
         <div className="flex">
            {[
              {id: 'sales', name: "Savdolar Tarixi", icon: History},
              {id: 'products', name: "Maxsulotlar", icon: Package},
              {id: 'categories', name: "Kategoriyalar", icon: Tags},
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-6 py-4 text-[13px] font-bold transition-all border-b-2
                  ${activeTab === tab.id ? 'border-[#1E3A5F] text-[#1E3A5F] bg-blue-50/30' : 'border-transparent text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'}
                `}
              >
                <tab.icon size={16} strokeWidth={activeTab === tab.id ? 3 : 2} />
                {tab.name}
              </button>
            ))}
         </div>
         <div className="flex gap-2 items-center pb-2 pr-2">
            {activeTab === 'sales' && (
              <>
                 <Input 
                   type="date"
                   value={startDate}
                   onChange={e => setStartDate(e.target.value)}
                   className="h-10 px-3 w-36 rounded-xl bg-zinc-50 border-none text-[11px] font-bold text-zinc-500 focus:ring-1 focus:ring-zinc-200 outline-none"
                 />
                 <Input 
                   type="date"
                   value={endDate}
                   onChange={e => setEndDate(e.target.value)}
                   className="h-10 px-3 w-36 rounded-xl bg-zinc-50 border-none text-[11px] font-bold text-zinc-500 focus:ring-1 focus:ring-zinc-200 outline-none"
                 />
              </>
            )}
            {activeTab === 'sales' && (
              <Button onClick={() => { 
                // Fetch products too if not available
                api.get(`/inventory/products?branch_id=${branchId}`).then(res => setProducts(res.data?.data || res.data || []));
                setIsSaleModalOpen(true); 
              }} className="h-10 px-5 rounded-full bg-[#1E3A5F] hover:bg-[#0f2442] text-white font-bold text-[12px] flex items-center gap-2 shadow-lg shadow-blue-900/20 border-none transition-all active:scale-95 ml-2">
                Savdo qilish <Plus size={14} strokeWidth={3} />
              </Button>
            )}
            {activeTab === 'products' && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsImportModalOpen(true)} className="h-10 px-5 rounded-full border-zinc-100 font-bold text-[12px] text-zinc-600 hover:bg-zinc-50 transition-all">
                  Excel Import
                </Button>
                <Button variant="outline" onClick={handleExport} className="h-10 px-5 rounded-full border-zinc-100 font-bold text-[12px] text-zinc-600 hover:bg-zinc-50 transition-all">
                  Eksport
                </Button>
                <Button onClick={() => { setProductForm({id:'', name:'', price:0, cost_price:0, stock:0, category_id:'', branch_id:'', photo_url:''}); setIsProductModalOpen(true); }} className="h-10 px-5 rounded-full bg-[#1E3A5F] hover:bg-[#0f2442] text-white font-bold text-[12px] flex items-center gap-2 shadow-lg shadow-blue-900/20 border-none transition-all active:scale-95">
                  Maxsulot qo'shish <Plus size={14} strokeWidth={3} />
                </Button>
              </div>
            )}
            {activeTab === 'sales' && (
               <Button variant="outline" onClick={handleExport} className="h-10 px-5 rounded-full border-zinc-100 font-bold text-[12px] text-zinc-600 hover:bg-zinc-50 transition-all">
                  Eksport
               </Button>
            )}
            {activeTab === 'categories' && (
              <Button onClick={() => { setCategoryForm({id:'', name:''}); setIsCategoryModalOpen(true); }} className="h-10 px-5 rounded-full bg-[#1E3A5F] hover:bg-[#0f2442] text-white font-bold text-[12px] flex items-center gap-2 shadow-lg shadow-blue-900/20 border-none transition-all active:scale-95">
                Kategoriya qo'shish <Plus size={14} strokeWidth={3} />
              </Button>
            )}
         </div>
      </div>

      {/* 🔍 Filters consistent with Image 1 (Expenses) style */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-zinc-100">
         <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-[#4465aa] transition-colors" />
            <Input 
               placeholder="Qidiruv..."
               value={search}
               onChange={e => setSearch(e.target.value)}
               className="h-10 pl-10 pr-4 text-[11px] w-64 bg-zinc-50/50 border-none rounded-xl text-zinc-600 font-bold outline-none ring-0 placeholder:text-zinc-400"
            />
         </div>
         {activeTab === 'products' && (
           <div className="w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-10 bg-zinc-50/50 border-none rounded-xl font-bold text-[11px] text-zinc-500 shadow-none ring-0 focus:ring-0">
                   <SelectValue placeholder="Kategoriya bo'yicha" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-zinc-100 shadow-2xl">
                   <SelectItem value="all">Barchasi</SelectItem>
                   {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
           </div>
         )}
          
          <div className="flex items-center gap-2 ml-2">
             <input 
               type="date" 
               value={startDate}
               onChange={(e) => setStartDate(e.target.value)}
               className="h-10 px-3 bg-zinc-50/50 border-none rounded-xl text-[11px] font-bold text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
             />
             <span className="text-[10px] font-black text-zinc-300 uppercase">Gacha</span>
             <input 
               type="date" 
               value={endDate}
               onChange={(e) => setEndDate(e.target.value)}
               className="h-10 px-3 bg-zinc-50/50 border-none rounded-xl text-[11px] font-bold text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
             />
          </div>
      </div>

      {/* --- SALES TAB CONTENT --- */}
      {activeTab === 'sales' && (
         <div className="bg-white rounded-[2rem] flex flex-col flex-1 shadow-[0_1px_10px_rgba(0,0,0,0.02)] border border-zinc-100 overflow-hidden mb-12">
           <div className="overflow-x-auto w-full min-h-[400px]">
             <table className="w-full text-left border-collapse min-w-max">
               <thead>
                 <tr className="bg-zinc-50/50 border-b border-zinc-100 font-black uppercase tracking-wider text-zinc-400 text-[10px]">
                   <th className="py-6 pl-10 w-16 text-center">T/R</th>
                   <th className="py-6 px-6">SANA</th>
                   <th className="py-6 px-6">Mijoz</th>
                   <th className="py-6 px-6">Maxsulotlar</th>
                   <th className="py-6 px-6">Summa</th>
                   <th className="py-6 px-6 text-center">TURI</th>
                   <th className="py-6 pr-10 text-right"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-zinc-50">
                 {loading ? [1,2,3, 4, 5, 6].map(i => <tr key={i} className="animate-pulse"><td colSpan={7} className="py-8 px-10 opacity-20"><div className="h-4 bg-zinc-200 rounded w-full" /></td></tr>) : 
                  sales.length === 0 ? <tr><td colSpan={7} className="py-32 text-center"><ShoppingCart className="w-16 h-16 text-zinc-100 mx-auto mb-4" /><span className="text-sm font-black uppercase tracking-widest text-zinc-300">Savdolar topilmadi</span></td></tr> :
                  sales.map((sale, idx) => (
                   <tr key={sale.id} className="group hover:bg-zinc-50/80 transition-all cursor-pointer">
                     <td className="pl-10 py-6 text-center font-bold text-[11px] text-zinc-300">{idx+1}.</td>
                     <td className="py-6 px-6 font-bold text-[11px] text-zinc-400">
                        {new Date(sale.created_at).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', year: 'numeric' })} <br/>
                        <span className="text-[10px] text-zinc-300">{new Date(sale.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                     </td>
                     <td className="py-6 px-6 text-[12px] font-bold text-zinc-600">{sale.student?.user?.first_name || sale.customer?.name}</td>
                     <td className="py-6 px-6">
                        <div className="flex flex-col gap-0.5">
                           {sale.items?.map((item: any, i: number) => (
                             <span key={i} className="text-[11px] font-medium text-zinc-400 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                               • {item.product?.name} ({item.quantity} ta)
                             </span>
                           ))}
                        </div>
                     </td>
                     <td className="py-6 px-6">
                        <div className="flex flex-col">
                           <span className="text-[15px] font-black text-[#4465aa]">{Number(sale.amount).toLocaleString()} so'm</span>
                        </div>
                     </td>
                     <td className="py-6 px-6 text-center">
                        <Badge variant="outline" className="text-[9px] font-black border-zinc-200 bg-zinc-50 text-zinc-500 uppercase tracking-widest px-2 py-0.5">{sale.payment_method}</Badge>
                     </td>
                     <td className="py-6 pr-10 text-right">
                        <div className="flex justify-end gap-2">
                           <button className="w-9 h-9 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 hover:text-blue-500 transition-all"><Printer size={16} /></button>
                           <button onClick={() => { setArchiveForm({id: sale.id, reason: ''}); setIsArchiveDialogOpen(true); }} className="w-9 h-9 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 hover:text-rose-500 hover:bg-rose-50 transition-all"><Archive size={16} /></button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
      )}

      {/* --- PRODUCTS TAB CONTENT --- */}
      {activeTab === 'products' && (
         <div className="bg-white rounded-[2rem] flex flex-col flex-1 shadow-[0_1px_10px_rgba(0,0,0,0.02)] border border-zinc-100 overflow-hidden mb-12">
           <div className="overflow-x-auto w-full min-h-[400px]">
             <table className="w-full text-left border-collapse min-w-max">
               <thead>
                 <tr className="bg-zinc-50/50 border-b border-zinc-100 font-black uppercase tracking-wider text-zinc-400 text-[10px]">
                   <th className="py-6 pl-10 w-16 text-center">T/R</th>
                   <th className="py-6 px-6 w-48">MAXSULOT NOMI</th>
                   <th className="py-6 px-6">KATEGORIYA</th>
                   <th className="py-6 px-6">NARX</th>
                   <th className="py-6 px-6">QOLDIQ</th>
                   <th className="py-6 pr-10 text-right">#</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-zinc-50">
                 {loading ? [1,2,3, 4, 5].map(i => <tr key={i} className="animate-pulse"><td colSpan={6} className="py-8 px-10 opacity-20"><div className="h-4 bg-zinc-200 rounded w-full" /></td></tr>) : 
                  products.length === 0 ? <tr><td colSpan={6} className="py-32 text-center"><Package className="w-16 h-16 text-zinc-100 mx-auto mb-4" /><span className="text-sm font-black uppercase tracking-widest text-zinc-300">Maxsulotlar topilmadi</span></td></tr> :
                  products.map((prod, idx) => (
                   <tr key={prod.id} className="group hover:bg-zinc-50/80 transition-all cursor-pointer">
                     <td className="pl-10 py-6 text-center font-bold text-[11px] text-zinc-300">{idx+1}.</td>
                     <td className="py-6 px-6">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-300 overflow-hidden shadow-inner flex-shrink-0">
                             {prod.photo_url ? <img src={prod.photo_url} className="w-full h-full object-cover" /> : <ImageIcon size={20} />}
                           </div>
                           <span className="text-[13px] font-bold text-zinc-700">{prod.name}</span>
                        </div>
                     </td>
                     <td className="py-6 px-6"><span className="text-[10px] font-black text-zinc-400 bg-zinc-50 border border-zinc-100/50 px-2.5 py-1 rounded-md uppercase tracking-wider">{prod.category?.name || '-'}</span></td>
                     <td className="py-6 px-6"><span className="text-[14px] font-black text-[#4465aa]">{Number(prod.price).toLocaleString()} so'm</span></td>
                     <td className="py-6 px-6">
                        <Badge variant={prod.stock <= 5 ? "danger" : "outline"} className={cn("text-[11px] font-black px-2 py-0.5", prod.stock <= 5 && "shadow-lg shadow-rose-100")}>
                           {prod.stock} ta
                        </Badge>
                     </td>
                     <td className="py-6 pr-10 text-right">
                        <div className="flex justify-end gap-2">
                           <button onClick={() => { setProductForm({...prod}); setIsProductModalOpen(true); }} className="w-9 h-9 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all"><Pencil size={16} /></button>
                           <button onClick={() => initiateDelete('product', prod.id)} className="w-9 h-9 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 hover:text-rose-500 hover:bg-rose-50 transition-all"><Trash2 size={16} /></button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
      )}

      {/* --- CATEGORIES TAB CONTENT --- */}
      {activeTab === 'categories' && (
         <div className="bg-white rounded-[2rem] flex flex-col flex-1 shadow-[0_1px_10px_rgba(0,0,0,0.02)] border border-zinc-100 overflow-hidden mb-12 max-w-2xl">
           <div className="overflow-x-auto w-full min-h-[400px]">
             <table className="w-full text-left border-collapse min-w-max">
               <thead>
                 <tr className="bg-zinc-50/50 border-b border-zinc-100 font-black uppercase tracking-wider text-zinc-400 text-[10px]">
                   <th className="py-6 pl-10 w-16 text-center">T/R</th>
                   <th className="py-6 px-6 flex-1">KATEGORIYA NOMI</th>
                   <th className="py-6 pr-10 text-right">#</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-zinc-50">
                 {loading ? [1,2,3, 4, 5].map(i => <tr key={i} className="animate-pulse"><td colSpan={3} className="py-8 px-10 opacity-20"><div className="h-4 bg-zinc-200 rounded w-full" /></td></tr>) : 
                  categories.length === 0 ? <tr><td colSpan={3} className="py-32 text-center"><Tags className="w-16 h-16 text-zinc-100 mx-auto mb-4" /><span className="text-sm font-black uppercase tracking-widest text-zinc-300">Kategoriyalar topilmadi</span></td></tr> :
                  categories.map((cat, idx) => (
                   <tr key={cat.id} className="group hover:bg-zinc-50/80 transition-all cursor-pointer">
                     <td className="pl-10 py-6 text-center font-bold text-[11px] text-zinc-300">{idx+1}.</td>
                     <td className="py-6 px-6">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400 shadow-sm border border-indigo-100/50"><Tags size={18} /></div>
                           <span className="text-[13px] font-bold text-zinc-700">{cat.name}</span>
                        </div>
                     </td>
                     <td className="py-6 pr-10 text-right">
                        <div className="flex justify-end gap-2">
                           <button onClick={() => { setCategoryForm({id: cat.id, name: cat.name}); setIsCategoryModalOpen(true); }} className="w-9 h-9 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all"><Pencil size={16} /></button>
                           <button onClick={() => initiateDelete('category', cat.id)} className="w-9 h-9 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 hover:text-rose-500 hover:bg-rose-50 transition-all"><Trash2 size={16} /></button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
      )}

      {/* --- CATEGORY MODAL --- */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-[3.5rem] p-10 border-none shadow-2xl bg-white">
           <DialogHeader className="items-center text-center space-y-4 mb-4">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 shadow-inner"><Tags size={40} /></div>
              <DialogTitle className="text-2xl font-black text-zinc-900 tracking-tight">{categoryForm.id ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}</DialogTitle>
              <DialogDescription className="text-sm font-medium text-zinc-400">Kategoriya ma'lumotlarini kiriting.</DialogDescription>
           </DialogHeader>
           
           <div className="space-y-4 py-2">
              <div className="space-y-2">
                 <Label className="text-[12px] font-black text-zinc-400 uppercase tracking-widest ml-4">Nomi</Label>
                 <Input 
                   value={categoryForm.name} 
                   onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} 
                   placeholder="Masalan: Kitoblar" 
                   className="h-14 px-6 rounded-[2rem] bg-zinc-50 border-none text-zinc-800 font-bold focus-visible:ring-1 focus-visible:ring-indigo-400 transition-all placeholder:text-zinc-300" 
                 />
              </div>
           </div>

           <DialogFooter className="mt-8 flex gap-3 w-full sm:justify-center">
              <Button onClick={() => setIsCategoryModalOpen(false)} variant="ghost" className="h-16 flex-1 rounded-[2.5rem] font-bold text-zinc-500 bg-zinc-50 hover:bg-zinc-100 uppercase tracking-widest text-[12px]">Bekor qilish</Button>
              <Button onClick={handleSaveCategory} className="h-16 flex-1 rounded-[2.5rem] font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 uppercase tracking-widest text-[12px]">
                 {categoryForm.id ? "Saqlash" : "Qo'shish"}
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* --- SALE MODAL --- */}
      <Dialog open={isSaleModalOpen} onOpenChange={setIsSaleModalOpen}>
        <DialogContent className="sm:max-w-4xl rounded-[3rem] p-0 border-none shadow-2xl bg-white overflow-hidden">
           <div className="flex h-[600px]">
              {/* Left: Product Selection */}
              <div className="w-[55%] p-8 border-r border-zinc-100 flex flex-col bg-white">
                 <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-black text-zinc-900 flex items-center gap-3">
                       <ShoppingCart className="text-blue-500 w-8 h-8" /> 
                       Savdo Oynasi
                    </DialogTitle>
                 </DialogHeader>

                <div className="relative mb-4">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                   <Input 
                     placeholder="Maxsulot qidirish..." 
                     onChange={(e) => {
                       const s = e.target.value.toLowerCase();
                       setProducts(prev => prev.map(p => ({...p, hidden: !p.name.toLowerCase().includes(s)})));
                     }}
                     className="pl-10 h-11 bg-zinc-50 border-none rounded-xl" 
                   />
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                   {products.filter(p => !p.hidden).map(prod => (
                     <div 
                       key={prod.id} 
                       onClick={() => addItemToSale(prod)}
                       className="p-3 rounded-xl border border-zinc-50 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all flex items-center gap-3 group"
                     >
                        <div className="w-12 h-12 rounded-lg bg-white border border-zinc-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                           {prod.photo_url ? <img src={prod.photo_url} className="w-full h-full object-cover" /> : <Package size={20} className="text-zinc-200" />}
                        </div>
                        <div className="flex-1">
                           <p className="text-[13px] font-bold text-zinc-700">{prod.name}</p>
                           <p className="text-[11px] font-black text-indigo-500 mt-0.5">{Number(prod.price).toLocaleString()} so'm</p>
                        </div>
                        <div className="text-right">
                           <Badge variant="outline" className="text-[10px] bg-white">{prod.stock} ta</Badge>
                           <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mt-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"><Plus size={12} /></div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             {/* Right: Cart & Details */}
             <div className="w-[45%] bg-zinc-50/50 p-8 flex flex-col">
                <div className="space-y-4 mb-6">
                   <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                         <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Kassa</Label>
                         <Select value={saleForm.cashbox_id} onValueChange={v => setSaleForm({...saleForm, cashbox_id: v})}>
                           <SelectTrigger className="h-11 bg-white border-zinc-100/50 rounded-2xl shadow-sm px-4 font-bold text-[12px]"><SelectValue placeholder="Kassa tanlang" /></SelectTrigger>
                           <SelectContent className="rounded-2xl border-zinc-100 shadow-2xl">{cashboxes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-1.5">
                         <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">To'lov usuli</Label>
                         <Select value={saleForm.payment_method} onValueChange={v => setSaleForm({...saleForm, payment_method: v})}>
                           <SelectTrigger className="h-11 bg-white border-zinc-100/50 rounded-2xl shadow-sm px-4 font-bold text-[12px]"><SelectValue /></SelectTrigger>
                           <SelectContent className="rounded-2xl border-zinc-100 shadow-2xl">
                              <SelectItem value="CASH">Naqd</SelectItem>
                              <SelectItem value="CARD">Karta</SelectItem>
                              <SelectItem value="TRANSFER">O'tkazma</SelectItem>
                           </SelectContent>
                         </Select>
                      </div>
                   </div>

                   <div className="space-y-1.5">
                      <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Xaridor (Tanlash yoxud qidirish)</Label>
                      <div className="grid grid-cols-2 gap-3">
                         {/* STUDENT COMBOBOX */}
                         <Popover open={isStudentSelectOpen} onOpenChange={setIsStudentSelectOpen}>
                           <PopoverTrigger asChild>
                             <button className="flex h-11 w-full items-center justify-between rounded-2xl border border-zinc-100 bg-white px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-[12px] truncate">
                               {saleForm.student_id ? 
                                 (saleForm.student_id === 'none' ? 'Mijoz emas' : (students.find(s => s.id === saleForm.student_id)?.user?.first_name + ' ' + (students.find(s => s.id === saleForm.student_id)?.user?.last_name || ''))) 
                                 : <span className="text-zinc-500">Talabani izlash...</span>}
                               <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                             </button>
                           </PopoverTrigger>
                           <PopoverContent className="w-[300px] p-2 rounded-2xl z-[99999]" align="start">
                              <div className="relative mb-2">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input 
                                  placeholder="Ism bo'yicha qidirish..." 
                                  value={studentSearch} 
                                  onChange={e => setStudentSearch(e.target.value)}
                                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-medium outline-none focus:border-blue-300 transition-colors"
                                />
                              </div>
                              <div className="max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                                <button 
                                  onClick={() => { setSaleForm({...saleForm, student_id: 'none', customer_id: ''}); setIsStudentSelectOpen(false); }}
                                  className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-semibold mb-1 hover:bg-zinc-100 transition-colors ${saleForm.student_id === 'none' ? 'bg-blue-50 text-blue-600' : 'text-zinc-700'}`}
                                >Mijoz emas (Tanlanmagan)</button>
                                {students.filter(s => (s.user?.first_name + ' ' + s.user?.last_name).toLowerCase().includes(studentSearch.toLowerCase())).map(s => (
                                  <button 
                                    key={s.id}
                                    onClick={() => { setSaleForm({...saleForm, student_id: s.id, customer_id: ''}); setIsStudentSelectOpen(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-medium mb-1 hover:bg-zinc-100 transition-colors ${saleForm.student_id === s.id ? 'bg-blue-50 text-blue-600 font-bold' : 'text-zinc-700'}`}
                                  >
                                    {s.user?.first_name} {s.user?.last_name}
                                  </button>
                                ))}
                              </div>
                           </PopoverContent>
                         </Popover>

                         {/* CUSTOMER COMBOBOX */}
                         <Popover open={isCustomerSelectOpen} onOpenChange={setIsCustomerSelectOpen}>
                           <PopoverTrigger asChild>
                             <button className="flex h-11 w-full items-center justify-between rounded-2xl border border-zinc-100 bg-white px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-[12px] truncate">
                               {saleForm.customer_id ? 
                                 (saleForm.customer_id === 'none' ? 'Mijoz emas' : customers.find(c => c.id === saleForm.customer_id)?.name) 
                                 : <span className="text-zinc-500">Tashqi mijozni izlash...</span>}
                               <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                             </button>
                           </PopoverTrigger>
                           <PopoverContent className="w-[300px] p-2 rounded-2xl z-[99999]" align="start">
                              <div className="relative mb-2">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input 
                                  placeholder="Ism bo'yicha qidirish..." 
                                  value={customerSearch} 
                                  onChange={e => setCustomerSearch(e.target.value)}
                                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-medium outline-none focus:border-blue-300 transition-colors"
                                />
                              </div>
                              <div className="max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                                <button 
                                  onClick={() => { setSaleForm({...saleForm, customer_id: 'none', student_id: ''}); setIsCustomerSelectOpen(false); }}
                                  className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-semibold mb-1 hover:bg-zinc-100 transition-colors ${saleForm.customer_id === 'none' ? 'bg-blue-50 text-blue-600' : 'text-zinc-700'}`}
                                >Mijoz emas (Tanlanmagan)</button>
                                {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).map(c => (
                                  <button 
                                    key={c.id}
                                    onClick={() => { setSaleForm({...saleForm, customer_id: c.id, student_id: ''}); setIsCustomerSelectOpen(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-medium mb-1 hover:bg-zinc-100 transition-colors ${saleForm.customer_id === c.id ? 'bg-blue-50 text-blue-600 font-bold' : 'text-zinc-700'}`}
                                  >
                                    {c.name} {c.phone ? `(${c.phone})` : ''}
                                  </button>
                                ))}
                              </div>
                           </PopoverContent>
                         </Popover>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                   <ShoppingCart size={14} className="text-zinc-400" />
                   <Label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Savatdagi maxsulotlar</Label>
                </div>
                <div className="flex-1 overflow-y-auto mb-4 space-y-2 pr-2 custom-scrollbar">
                   {saleForm.items.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center opacity-20 italic text-sm">Savat bo'sh</div>
                   ) : saleForm.items.map(item => (
                     <div key={item.product_id} className="bg-white p-3 rounded-xl border border-zinc-100 flex items-center gap-3">
                        <div className="flex-1">
                           <p className="text-[12px] font-bold text-zinc-700">{item.name}</p>
                           <p className="text-[10px] text-zinc-400">{Number(item.price).toLocaleString()} so'm</p>
                        </div>
                        <div className="flex items-center gap-2 bg-zinc-50 rounded-lg p-1">
                           <button onClick={() => {
                             if (item.quantity > 1) {
                               setSaleForm({...saleForm, items: saleForm.items.map(i => i.product_id === item.product_id ? {...i, quantity: i.quantity - 1} : i)});
                             } else {
                               removeItemFromSale(item.product_id);
                             }
                           }} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-zinc-400 transition-colors"><X size={12} /></button>
                           <span className="text-xs font-black min-w-[20px] text-center">{item.quantity}</span>
                           <button onClick={() => {
                             if (item.quantity < item.max) {
                               setSaleForm({...saleForm, items: saleForm.items.map(i => i.product_id === item.product_id ? {...i, quantity: i.quantity + 1} : i)});
                             }
                           }} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-zinc-400 transition-colors"><Plus size={12} /></button>
                        </div>
                     </div>
                   ))}
                </div>
                 <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm space-y-3 mt-auto relative z-10">

                   <div className="pt-4 border-t border-zinc-100/60 flex justify-between items-end">
                      <div>
                         <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">To'lov summasi</p>
                         <p className="text-[28px] font-black text-[#4465aa] tracking-tighter leading-none">{calculateTotal().sum.toLocaleString()} <span className="text-sm font-bold text-zinc-300">UZS</span></p>
                      </div>
                      <Button onClick={handleRecordSale} disabled={submitting || saleForm.items.length === 0} className="h-14 px-8 bg-[#4465aa] hover:bg-blue-700 rounded-[2rem] font-bold shadow-lg shadow-blue-100 min-w-[140px] tracking-widest uppercase text-[12px] active:scale-95 transition-all">
                         {submitting ? "Kutilmoqda..." : "Sotish"}
                      </Button>
                   </div>
                </div>
             </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* --- PRODUCT MODAL --- */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="sm:max-w-2xl rounded-[3.5rem] p-10 border-none shadow-2xl bg-white">
          <DialogHeader className="items-center text-center space-y-4 mb-4">
             <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-inner"><Package size={40} /></div>
             <DialogTitle className="text-2xl font-black text-zinc-900 tracking-tight">{productForm.id ? 'Maxsulotni tahrirlash' : 'Yangi maxsulot'}</DialogTitle>
             <DialogDescription className="text-sm font-medium text-zinc-400">Maxsulot ma'lumotlarini to'ldiring.</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 py-2">
             <div className="col-span-2 flex items-center gap-6 bg-zinc-50/50 p-5 rounded-[2rem] border border-zinc-100">
                <div className="w-24 h-24 rounded-2xl bg-white border border-dashed border-zinc-200 flex items-center justify-center text-zinc-300 relative overflow-hidden group shadow-sm transition-all hover:border-emerald-400">
                  {productForm.photo_url ? (
                    <img src={productForm.photo_url} className="w-full h-full object-cover" />
                  ) : <ImageIcon size={28} className="text-zinc-200" />}
                  <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div>
                   <p className="text-[14px] font-black text-zinc-800">Maxsulot rasmi</p>
                   <p className="text-[11px] text-zinc-400 uppercase tracking-widest mt-1.5 leading-relaxed">Kompyuterdan tanlang,<br/>maksimal hajmi 5MB</p>
                </div>
             </div>

             <div className="space-y-2">
                <Label className="text-[12px] font-black text-zinc-400 uppercase tracking-widest ml-4">Nomi</Label>
                <Input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="h-14 px-6 rounded-[2rem] bg-zinc-50 border-none font-bold text-zinc-800 focus-visible:ring-1 focus-visible:ring-emerald-400" />
             </div>
             <div className="space-y-2">
                <Label className="text-[12px] font-black text-zinc-400 uppercase tracking-widest ml-4">Kategoriya</Label>
                <Select value={productForm.category_id} onValueChange={v => setProductForm({...productForm, category_id: v})}>
                  <SelectTrigger className="h-14 px-6 rounded-[2rem] bg-zinc-50 border-none font-bold text-zinc-800 focus:ring-1 focus:ring-emerald-400"><SelectValue placeholder="Tanlang" /></SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-100 shadow-2xl">{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <Label className="text-[12px] font-black text-zinc-400 uppercase tracking-widest ml-4">Sotuv Narxi (UZS)</Label>
                <Input type="number" value={productForm.price || ''} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} className="h-14 px-6 rounded-[2rem] bg-zinc-50 border-none font-black text-emerald-600 focus-visible:ring-1 focus-visible:ring-emerald-400 text-lg" />
             </div>
             <div className="space-y-2">
                <Label className="text-[12px] font-black text-zinc-400 uppercase tracking-widest ml-4">Tan narx (UZS)</Label>
                <Input type="number" value={productForm.cost_price || ''} onChange={e => setProductForm({...productForm, cost_price: Number(e.target.value)})} className="h-14 px-6 rounded-[2rem] bg-zinc-50 border-none font-black text-zinc-800 focus-visible:ring-1 focus-visible:ring-emerald-400 text-lg" />
             </div>
             <div className="space-y-2">
                <Label className="text-[12px] font-black text-zinc-400 uppercase tracking-widest ml-4">Qoldiq</Label>
                <Input type="number" value={productForm.stock || ''} onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})} className="h-14 px-6 rounded-[2rem] bg-zinc-50 border-none font-black text-zinc-800 focus-visible:ring-1 focus-visible:ring-emerald-400 text-lg" />
             </div>
          </div>

          <DialogFooter className="mt-8 flex gap-3 w-full sm:justify-center">
             <Button onClick={() => setIsProductModalOpen(false)} variant="ghost" className="h-16 flex-1 rounded-[2.5rem] font-bold text-zinc-500 bg-zinc-50 hover:bg-zinc-100 uppercase tracking-widest text-[12px]">Bekor qilish</Button>
             <Button onClick={handleSaveProduct} className="h-16 flex-1 rounded-[2.5rem] font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-100 uppercase tracking-widest text-[12px]">Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- ARCHIVE DIALOG --- */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[3.5rem] p-10 border-none shadow-2xl bg-white">
          <DialogHeader className="items-center text-center space-y-4 mb-4">
             <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 shadow-inner"><Archive size={40} /></div>
             <DialogTitle className="text-2xl font-black text-zinc-900 tracking-tight">Savdoni arxivlash</DialogTitle>
             <DialogDescription className="text-sm font-medium text-zinc-400">Arxivlash sababini kiriting. Asosli bo'lishi kerak.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
             <div className="space-y-2">
                <Label className="text-[12px] font-black text-zinc-400 uppercase tracking-widest ml-4">Sabab:</Label>
                <Input value={archiveForm.reason} onChange={e => setArchiveForm({...archiveForm, reason: e.target.value})} placeholder="Xato urilgan, qaytarildi..." className="h-14 px-6 rounded-[2rem] bg-zinc-50 border-none text-zinc-800 font-bold focus-visible:ring-1 focus-visible:ring-rose-400" />
             </div>
          </div>
          <DialogFooter className="mt-8 gap-3 sm:justify-center w-full flex">
             <Button onClick={() => setIsArchiveDialogOpen(false)} variant="ghost" className="h-16 flex-1 rounded-[2.5rem] font-bold text-zinc-500 bg-zinc-50 hover:bg-zinc-100 tracking-widest uppercase text-[12px]">Bekor qilish</Button>
             <Button disabled={!archiveForm.reason} onClick={async () => {
                try {
                  await api.post(`/finance/sales/${archiveForm.id}/archive`, { reason: archiveForm.reason });
                  showToast("Arxivga ko'chirildi", "success");
                  setIsArchiveDialogOpen(false);
                  fetchData();
                } catch(err: any) { showToast(err.response?.data?.message || "Xatolik", "error"); }
             }} className="h-16 flex-1 rounded-[2.5rem] font-black bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-100 tracking-widest uppercase text-[12px]">
                Arxivlash
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
