"use client";

import { useEffect, useState } from 'react';
import { useBranch } from '@/providers/BranchProvider';
import api from '@/lib/api';
import { 
  Users, PhoneCall, Wallet, AlertCircle, Search, RefreshCw, 
  ChevronRight, Calendar, MessageSquare, Clock, Filter, 
  CheckCircle2, Building2, User2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import InteractionModal from './components/InteractionModal';
import { cn } from '@/lib/utils';

type TabType = 'DEBTOR' | 'NEW_LEAD' | 'ABSENTEE' | 'LEAD';

export default function CallCenterPage() {
  const { branchId, isReady } = useBranch();
  const [activeTab, setActiveTab] = useState<TabType>('DEBTOR');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    if (!isReady) return;
    setLoading(true);
    try {
      const endpointMap = {
        'DEBTOR': '/call-center/debtors',
        'NEW_LEAD': '/call-center/new-leads',
        'ABSENTEE': '/call-center/absentees',
        'LEAD': '/call-center/leads'
      };
      
      const res = await api.get(`${endpointMap[activeTab]}?branch_id=${branchId}&search=${search}&page=${page}&limit=20`);
      setData(res.data?.data || []);
      setMeta(res.data?.meta || { total: 0, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [branchId, isReady, activeTab, search, page]);

  const stats = [
    { title: 'Qarzdorlar', type: 'DEBTOR', icon: Wallet, color: 'rose' },
    { title: 'Yangi o\'quvchilar', type: 'NEW_LEAD', icon: Users, color: 'blue' },
    { title: 'Dars qoldirganlar', type: 'ABSENTEE', icon: AlertCircle, color: 'amber' },
    { title: 'Lidlar (CRM)', type: 'LEAD', icon: User2, color: 'pink' }
  ];

  return (
    <div className="flex flex-col w-full mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* 📊 Stat Cards Overview (Gradient Variant - ui_rules.md 3.1) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#ec4899] to-[#be185d] rounded-[12px] p-5 text-white shadow-lg overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full transition-transform group-hover:scale-125 duration-500" />
          <div className="relative z-10 flex items-center gap-4 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <p className="text-[13px] font-medium text-white/70">Qarzdorlar</p>
          </div>
          <h3 className="text-[28px] font-bold relative z-10">
            {activeTab === 'DEBTOR' ? meta.total : '...'}
          </h3>
          <p className="text-[12px] text-white/60 mt-1">To'lov qilinmagan invoices</p>
        </div>

        <div className="bg-gradient-to-br from-[#06b6d4] to-[#0284c7] rounded-[12px] p-5 text-white shadow-lg overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full transition-transform group-hover:scale-125 duration-500" />
          <div className="relative z-10 flex items-center gap-4 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Users size={20} />
            </div>
            <p className="text-[13px] font-medium text-white/70">Yangi o'quvchilar</p>
          </div>
          <h3 className="text-[28px] font-bold relative z-10">
            {activeTab === 'NEW_LEAD' ? meta.total : '...'}
          </h3>
          <p className="text-[12px] text-white/60 mt-1">To'lov kutayotganlar</p>
        </div>

        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0f172a] rounded-[12px] p-5 text-white shadow-lg overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full transition-transform group-hover:scale-125 duration-500" />
          <div className="relative z-10 flex items-center gap-4 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <p className="text-[13px] font-medium text-white/70">Dars qoldirganlar</p>
          </div>
          <h3 className="text-[28px] font-bold relative z-10">
            {activeTab === 'ABSENTEE' ? meta.total : '...'}
          </h3>
          <p className="text-[12px] text-white/60 mt-1">Muzlatilgan o'quvchilar</p>
        </div>

        <div className="bg-gradient-to-br from-[#ec4899] to-[#be185d] rounded-[12px] p-5 text-white shadow-lg overflow-hidden relative group md:hidden lg:block">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full transition-transform group-hover:scale-125 duration-500" />
          <div className="relative z-10 flex items-center gap-4 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <User2 size={20} />
            </div>
            <p className="text-[13px] font-medium text-white/70">CRM Lidlar</p>
          </div>
          <h3 className="text-[28px] font-bold relative z-10">
            {activeTab === 'LEAD' ? meta.total : '...'}
          </h3>
          <p className="text-[12px] text-white/60 mt-1">Aylanmagan lidlar</p>
        </div>
      </div>

      {/* 🔍 Filter Bar (Tabs + Search + Actions) */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 flex-1">
            {/* 🗂 Tabs (Pill style) */}
            <div className="bg-gray-50 p-1 rounded-full border border-gray-100 flex items-center w-fit shrink-0">
              {stats.map((s) => (
                <button
                  key={s.type}
                  onClick={() => { setActiveTab(s.type as TabType); setPage(1); }}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300",
                    activeTab === s.type 
                      ? "bg-[#ec4899] text-white shadow-sm" 
                      : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  {s.title}
                </button>
              ))}
            </div>

            {/* 🔍 Search Input (Reduced width) */}
            <div className="relative group w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#ec4899] transition-colors" />
              <Input 
                placeholder="Qidirish..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-9 pl-10 pr-4 bg-gray-50/50 border-gray-200 rounded-lg text-xs focus:bg-white focus:ring-pink-500/10 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={fetchData} variant="outline" size="sm" className="h-9 rounded-lg border-gray-200 bg-white text-xs text-gray-600">
              <RefreshCw size={14} className={cn("mr-2 text-gray-400", loading && "animate-spin")} />
              Yangilash
            </Button>
            <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg border-gray-200 text-gray-600 text-xs shadow-sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtrlar
            </Button>
          </div>
        </div>
      </div>

      {/* 🚀 Main Data Table (Universal Standart - ui_rules.md 3.2) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 font-semibold uppercase text-gray-500 text-[12px] tracking-wider">
                <th className="py-4 pl-6 w-16 text-center">T/R</th>
                <th className="py-4 px-4">O'quvchi</th>
                <th className="py-4 px-4">Aloqa</th>
                <th className="py-4 px-4">
                  {activeTab === 'DEBTOR' ? 'Qarzdorlik' : (activeTab === 'NEW_LEAD' || activeTab === 'LEAD') ? 'Kurs/Guruh' : 'Holat'}
                </th>
                <th className="py-4 px-4">Xodim</th>
                <th className="py-4 px-4">Oxirgi aloqa</th>
                <th className="py-4 pr-6 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-6 px-6"><div className="h-4 bg-gray-50 rounded w-full" /></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center"><Users size={32} /></div>
                      <span className="text-sm font-medium uppercase tracking-wider">Ma'lumot topilmadi</span>
                    </div>
                  </td>
                </tr>
              ) : data.map((item, idx) => {
                const student = item;
                const lastTask = student.callCenterTasks?.[0];
                const invoiceDebt = student.invoices?.reduce((sum: number, inv: any) => 
                  sum + (Number(inv.amount || 0) - Number(inv.paid_amount || 0)), 0) || 0;

                const totalDebt = Math.max(
                  Math.abs(
                    Number(student.balance || 0) + 
                    Number(student.course_balance || 0) + 
                    Number(student.book_balance || 0) + 
                    Number(student.mock_balance || 0)
                  ),
                  invoiceDebt
                );
                
                return (
                  <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors h-[56px]">
                    <td className="py-4 pl-6 text-center text-xs text-gray-400 font-mono">
                      {(page - 1) * 20 + idx + 1}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center text-[#ec4899] font-semibold text-xs border border-pink-100">
                          {student.user?.first_name?.[0]}{student.user?.last_name?.[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-semibold text-gray-900 leading-tight">
                            {student.user?.first_name} {student.user?.last_name}
                          </span>
                          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mt-0.5">
                            {student.branch?.name || 'Noma\'lum filial'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium text-gray-700">
                          +(998) {student.user?.phone?.substring(0,2)} {student.user?.phone?.substring(2,5)}-{student.user?.phone?.substring(5,7)}-{student.user?.phone?.substring(7,9)}
                        </span>
                        {student.user?.email && <span className="text-[11px] text-gray-400 font-mono truncate max-w-[150px]">{student.user.email}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {activeTab === 'DEBTOR' ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-red-500">
                            -{totalDebt.toLocaleString()} so'm
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {student.invoices?.slice(0, 1).map((inv: any) => (
                              <span key={inv.id} className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded border border-red-100">
                                {inv.group?.name || inv.month}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : activeTab === 'NEW_LEAD' || activeTab === 'LEAD' ? (
                        <div className="flex flex-col gap-1">
                          {student.enrollments?.length > 0 ? (
                            <span className="text-[12px] font-medium text-gray-600 flex items-center gap-1.5">
                              <Building2 size={12} className="text-gray-400" />
                              {student.enrollments[0].group?.name}
                              {student.enrollments.length > 1 && <span className="text-[10px] text-gray-400">(+{student.enrollments.length - 1})</span>}
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-300 italic">Ma'lumot yo'q</span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full uppercase border border-amber-100">
                            {student.status === 'FROZEN' ? 'Muzlatilgan' : 'Dars qoldirgan'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {lastTask?.staff ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                            <User2 size={12} />
                          </div>
                          <span className="text-[12px] font-medium text-gray-600">
                            {lastTask.staff.first_name} {lastTask.staff.last_name?.[0]}.
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {lastTask ? (
                        <div className="flex flex-col max-w-[180px] gap-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                            <Clock size={11} />
                            {new Date(lastTask.last_call_at || lastTask.created_at).toLocaleDateString()}
                          </div>
                          <p className="text-[11px] text-gray-600 truncate">"{lastTask.note || 'Izohsiz'}"</p>
                          
                          {activeTab === 'DEBTOR' && lastTask.promised_date && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100 w-fit mt-0.5">
                              <CheckCircle2 size={10} />
                              <span className="text-[10px] font-bold">To'lov: {new Date(lastTask.promised_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-300 italic">Bog'lanilmagan</span>
                      )}
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <Button 
                        size="sm"
                        onClick={() => { setSelectedStudent(student); setIsModalOpen(true); }}
                        className="h-9 px-4 bg-[#1e3a5f] hover:bg-[#0f172a] text-white rounded-lg gap-2 shadow-sm transition-all"
                      >
                        <PhoneCall size={14} />
                        <span className="text-xs">Qo'ng'iroq</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* 🚀 Pagination (ui_rules.md 3.2) */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
          <div className="text-[12px] text-gray-500">
            Jami: <span className="font-semibold text-gray-900">{meta.total}</span> mijoiz • <span className="font-medium">Sahifa {page}/{meta.totalPages}</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setPage(page - 1)} 
              disabled={page === 1}
              className="h-8 rounded-lg px-3 font-medium border-gray-200"
            >
              Oldingi
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setPage(page + 1)} 
              disabled={page === meta.totalPages}
              className="h-8 rounded-lg px-3 font-medium border-gray-200"
            >
              Keyingi
            </Button>
          </div>
        </div>
      </div>

      {/* 🚀 Interaction Modal */}
      {selectedStudent && (
        <InteractionModal 
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          student={selectedStudent}
          taskType={activeTab}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
