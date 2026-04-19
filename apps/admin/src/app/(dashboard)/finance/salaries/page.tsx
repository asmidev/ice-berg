"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Wallet, CheckCircle2, AlertCircle, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useSalaries } from '@/hooks/useSalaries';
import { SalariesFilters } from '@/components/finance/salaries/SalariesFilters';
import { SalariesTable } from '@/components/finance/salaries/SalariesTable';
import { AddSalaryModal } from '@/components/finance/salaries/AddSalaryModal';
import { PaySalaryModal } from '@/components/finance/salaries/PaySalaryModal';
import { ArchiveSalaryModal } from '@/components/finance/salaries/ArchiveSalaryModal';
import { PayrollFilters, AddSalaryFormData, PaySalaryFormData, ArchiveSalaryFormData } from '@/types/finance';

export default function FinanceSalariesPage() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [branchId, setBranchId] = useState('all');

  // Filters State
  const [filters, setFilters] = useState<PayrollFilters>({
    search: '',
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    type: 'all'
  });

  // Modals Visibility
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // Form Data
  const [addForm, setAddForm] = useState<AddSalaryFormData>({ 
    employee_id: '', employee_type: 'TEACHER', amount: '', 
    deduction: '0', period: '2026-04', 
    type: 'FIXED', description: '' 
  });
  const [payForm, setPayForm] = useState<PaySalaryFormData>({ id: '', cashbox_id: '', method: 'CASH' });
  const [archiveForm, setArchiveForm] = useState<ArchiveSalaryFormData>({ id: '', reason: '' });

  // Custom Toast state
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success'|'error'}>({show: false, message: '', type: 'success'});

  // Hook for Logic
  const { 
    payrolls, teachers, staff, cashboxes, loading, submitting, totalPaidAmount,
    createSalary, processPay, archiveSalary 
  } = useSalaries(branchId, filters);

  useEffect(() => {
    const bId = (typeof window !== 'undefined' ? localStorage.getItem('branch_id') : null) || 'all';
    setBranchId(bId);
    setMounted(true);
  }, [searchParams]);

  const showToast = (message: string, type: 'success'|'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const handleClearFilters = () => {
    setFilters({ search: '', startDate: '2026-04-01', endDate: '2026-04-30', type: 'all' });
  };

  const onAddSubmit = async () => {
    if (!addForm.employee_id || !addForm.amount) return showToast("Barcha maydonlarni to'ldiring", "error");
    const res = await createSalary(addForm);
    if (res.success) {
      showToast("Ish haqi muvaffaqiyatli generatsiya qilindi", "success");
      setIsAddModalOpen(false);
    } else {
      showToast(res.error || "Xatolik", "error");
    }
  };

  const onPaySubmit = async () => {
    if (!payForm.cashbox_id) return showToast("Kassani tanlang", "error");
    const res = await processPay(payForm);
    if (res.success) {
      showToast("Ish haqi muvaffaqiyatli to'landi", "success");
      setIsPayModalOpen(false);
    } else {
      showToast(res.error || "Xatolik", "error");
    }
  };

  const onArchiveSubmit = async () => {
    const res = await archiveSalary(archiveForm);
    if (res.success) {
      showToast("Ish haqi arxivlandi", "success");
      setIsArchiveModalOpen(false);
    } else {
      showToast(res.error || "Xatolik", "error");
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 w-full selection:bg-indigo-100 selection:text-indigo-900">
      
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
      
      {/* 📊 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 mt-4">
         <div className="bg-white p-6 rounded-[12px] shadow-sm border border-gray-100 flex justify-between items-center group transition-all hover:shadow-md">
            <div>
               <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Jami to'langan</p>
               <h2 className="text-[24px] font-black text-[#1E3A5F]">{totalPaidAmount.toLocaleString()} <span className="text-[12px] text-gray-400 uppercase">uzs</span></h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-[#EC4899] group-hover:scale-110 transition-transform"><Wallet size={20} /></div>
         </div>
         <div className="bg-white p-6 rounded-[12px] shadow-sm border border-gray-100 flex justify-between items-center group transition-all hover:shadow-md opacity-60 grayscale-[0.5]">
            <div>
               <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Kutilmoqda</p>
               <h2 className="text-[24px] font-black text-[#1E3A5F]">{payrolls.filter(p=>p.status==='PENDING').length} <span className="text-[12px] text-gray-400 uppercase">TA</span></h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform"><AlertCircle size={20} /></div>
         </div>
      </div>

      {/* 🔍 Filters */}
      <SalariesFilters 
        filters={filters} 
        setFilters={setFilters} 
        onClear={handleClearFilters} 
        onAdd={() => setIsAddModalOpen(true)}
        onReport={() => console.log('Report logic')}
      />

      {/* 📊 Table */}
      <SalariesTable 
        payrolls={payrolls} 
        loading={loading} 
        onPay={(id) => { setPayForm({...payForm, id}); setIsPayModalOpen(true); }}
        onArchive={(id) => { setArchiveForm({...archiveForm, id, reason: ''}); setIsArchiveModalOpen(true); }}
      />

      {/* --- MODALS --- */}
      <AddSalaryModal 
        isOpen={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen} 
        formData={addForm} 
        setFormData={setAddForm} 
        teachers={teachers} 
        staff={staff} 
        onSubmit={onAddSubmit} 
        submitting={submitting} 
      />

      <PaySalaryModal 
        isOpen={isPayModalOpen} 
        onOpenChange={setIsPayModalOpen} 
        formData={payForm} 
        setFormData={setPayForm} 
        cashboxes={cashboxes} 
        onSubmit={onPaySubmit} 
        submitting={submitting} 
      />

      <ArchiveSalaryModal 
        isOpen={isArchiveModalOpen} 
        onOpenChange={setIsArchiveModalOpen} 
        formData={archiveForm} 
        setFormData={setArchiveForm} 
        onSubmit={onArchiveSubmit} 
        submitting={submitting} 
      />

    </div>
  );
}
