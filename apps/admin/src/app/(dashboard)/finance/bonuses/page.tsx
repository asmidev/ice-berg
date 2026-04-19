"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
import { BonusFilters, AddBonusFormData } from '@/types/finance';

// Hook
import { useBonuses } from '@/hooks/useBonuses';

// Components
import { BonusesFilters } from '@/components/finance/bonuses/BonusesFilters';
import { BonusesTable } from '@/components/finance/bonuses/BonusesTable';
import { AddBonusModal } from '@/components/finance/bonuses/AddBonusModal';
import { BonusSourcesModal } from '@/components/finance/bonuses/BonusSourcesModal';
import { ArchiveBonusModal } from '@/components/finance/bonuses/ArchiveBonusModal';

export default function FinanceBonusesPage() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [branchId, setBranchId] = useState('all');

  // Filters State
  const [filters, setFilters] = useState<BonusFilters>({
    search: '',
    startDate: '',
    endDate: '',
    source_id: 'all'
  });

  // Modal Visibility
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // Form Data
  const [addForm, setAddForm] = useState<AddBonusFormData>({
    employee_id: '',
    employee_type: 'TEACHER',
    amount: '',
    reason: '',
    source_id: '',
    cashbox_id: '',
    method: 'CASH',
    date: new Date().toISOString().split('T')[0]
  });

  const [archiveTarget, setArchiveTarget] = useState({ id: '', reason: '' });

  // Custom Toast state
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success'|'error'}>({show: false, message: '', type: 'success'});

  // Hook for logic
  const {
    bonuses, teachers, staff, cashboxes, sources,
    loading, submitting, totalAmount,
    createBonus, createSource, deleteSource, archiveBonus
  } = useBonuses(branchId, filters);

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
    setFilters({ search: '', startDate: '', endDate: '', source_id: 'all' });
  };

  const onAddSubmit = async () => {
    if (!addForm.employee_id || !addForm.amount || !addForm.cashbox_id) {
       return showToast("Barcha maydonlarni to'ldiring", "error");
    }
    const res = await createBonus(addForm);
    if (res.success) {
      showToast("Bonus muvaffaqiyatli qo'shildi");
      setIsAddModalOpen(false);
      setAddForm({ ...addForm, employee_id: '', amount: '', reason: '' });
    } else {
      showToast(res.error || "Xatolik", "error");
    }
  };

  const onArchiveSubmit = async () => {
    if (!archiveTarget.reason) return showToast("Sababni kiriting", "error");
    const res = await archiveBonus(archiveTarget.id, archiveTarget.reason);
    if (res.success) {
      showToast("Bonus arxivlandi");
      setIsArchiveModalOpen(false);
    } else {
      showToast(res.error || "Xatolik", "error");
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 w-full selection:bg-pink-100 selection:text-pink-900">
      
      {/* --- TOAST --- */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
           <div className={cn(
              "flex items-center gap-3 px-6 py-4 rounded-[12px] shadow-2xl border min-w-[300px]",
              toast.type === 'success' ? "bg-white border-emerald-100 text-emerald-600" : "bg-white border-rose-100 text-rose-600"
           )}>
              {toast.type === 'success' ? <CheckCircle2 size={24} className="text-emerald-500" /> : <AlertCircle size={24} className="text-rose-500" />}
              <p className="text-[13px] font-bold">{toast.message}</p>
           </div>
        </div>
      )}

      {/* 📊 Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2 mt-2">
         <div className="bg-white p-6 rounded-[12px] shadow-sm border border-gray-100 flex justify-between items-center group transition-all hover:shadow-md">
            <div>
               <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Jami bonuslar summasi</p>
               <h2 className="text-[24px] font-black text-[#1E3A5F]">{totalAmount.toLocaleString()} <span className="text-[12px] text-gray-400 uppercase">uzs</span></h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-[#EC4899] group-hover:scale-110 transition-transform shadow-inner"><Wallet size={20} /></div>
         </div>
         <div className="bg-white p-6 rounded-[12px] shadow-sm border border-gray-100 flex justify-between items-center group transition-all hover:shadow-md opacity-60 grayscale-[0.5]">
            <div>
               <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Jadvalda filtrlandi</p>
               <h2 className="text-[24px] font-black text-[#1E3A5F]">{bonuses.length} <span className="text-[12px] text-gray-400 uppercase">yozuv</span></h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform"><CheckCircle2 size={20} /></div>
         </div>
      </div>

      {/* 🔍 Filters */}
      <BonusesFilters 
        filters={filters} 
        setFilters={setFilters} 
        sources={sources}
        onClear={handleClearFilters}
        onAdd={() => setIsAddModalOpen(true)}
        onManageSources={() => setIsSourceModalOpen(true)}
      />

      {/* 📊 Table */}
      <BonusesTable 
        bonuses={bonuses}
        loading={loading}
        onArchive={(id) => { setArchiveTarget({ id, reason: '' }); setIsArchiveModalOpen(true); }}
      />

      {/* --- MODALS --- */}
      <AddBonusModal 
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        formData={addForm}
        setFormData={setAddForm}
        teachers={teachers}
        staff={staff}
        cashboxes={cashboxes}
        sources={sources}
        onSubmit={onAddSubmit}
        submitting={submitting}
      />

      <BonusSourcesModal 
        isOpen={isSourceModalOpen}
        onOpenChange={setIsSourceModalOpen}
        sources={sources}
        onCreate={(name) => createSource(name)}
        onDelete={(id) => deleteSource(id)}
        submitting={submitting}
      />

      <ArchiveBonusModal 
        isOpen={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        reason={archiveTarget.reason}
        setReason={(r) => setArchiveTarget({ ...archiveTarget, reason: r })}
        onSubmit={onArchiveSubmit}
        submitting={submitting}
      />

    </div>
  );
}
