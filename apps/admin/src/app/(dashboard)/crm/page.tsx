"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  Search, Plus, LayoutGrid, List, 
  Filter, Calendar, ChevronRight, 
  MoreHorizontal, PhoneCall, CheckCircle2, 
  AlertCircle, X
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { AnimatePresence, motion } from 'framer-motion';
import * as XLSX from 'xlsx';

import api from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Custom Components
import { CrmStatCards } from '@/components/crm/CrmStatCards';
import { LeadCard } from '@/components/crm/LeadCard';
import { LeadsTable } from '@/components/crm/LeadsTable';
import { ImportExcelModal } from '@/components/shared/ImportExcelModal';

export default function CrmBoardPage() {
  const searchParams = useSearchParams();
  
  const [leads, setLeads] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [archiveReasons, setArchiveReasons] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('7d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [stats, setStats] = useState({
    totalLeads: 0,
    conversionRate: 0,
    activeLeads: 0,
    topSource: 'Boshqa'
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [archiveModal, setArchiveModal] = useState({ isOpen: false, leadId: '', reason: '', newCustomReason: '' });
  const [newLeadData, setNewLeadData] = useState({ name: '', phone: '+998', sourceId: '', stageId: '', newCustomSource: '', courseId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const branchId = searchParams.get('branch_id') || localStorage.getItem('branch_id') || 'all';

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Calculate dates based on period
      const end = new Date();
      const start = new Date();
      if (period === '7d') start.setDate(end.getDate() - 7);
      else if (period === '30d') start.setDate(end.getDate() - 30);
      else if (period === '90d') start.setDate(end.getDate() - 90);
      else if (period === 'year') start.setFullYear(end.getFullYear() - 1);
      
      let startStr = start.toISOString().split('T')[0];
      let endStr = end.toISOString().split('T')[0];

      if (period === 'custom' && startDate && endDate) {
        startStr = startDate;
        endStr = endDate;
      }

      const [leadsRes, stagesRes, sourcesRes, reasonsRes, statsRes, coursesRes] = await Promise.all([
        api.get(`/crm/leads?branch_id=${branchId}&search=${search}&startDate=${startStr}&endDate=${endStr}&limit=100`),
        api.get('/crm/stages'),
        api.get('/crm/sources'),
        api.get('/crm/archive-reasons'),
        api.get(`/analytics/dashboard?branch_id=${branchId}&startDate=${startStr}&endDate=${endStr}`),
        api.get(`/lms/courses?branch_id=${branchId}`)
      ]);
      
      const stagesRaw = stagesRes.data?.data || stagesRes.data || [];
      // Unikal stage'larni nomi bo'yicha ajratib olish
      const uniqueStages = stagesRaw.filter((v: any, i: number, a: any[]) => 
        a.findIndex((v2: any) => v2.name === v.name) === i
      );
      setStages(uniqueStages);

      // Dublinat stage'larni unikal ID'ga map qilish uchun lug'at (map)
      const stageMap: Record<string, string> = {};
      stagesRaw.forEach((s: any) => {
        const uniqueStage = uniqueStages.find((u: any) => u.name === s.name);
        if (uniqueStage) stageMap[s.id] = uniqueStage.id;
      });

      const rawLeads = leadsRes.data?.data || leadsRes.data || [];
      // Ldlarni unikal stage ID'larga o'tkazish
      const mappedLeads = rawLeads.map((l: any) => {
        const correctStageId = stageMap[l.stage_id] || l.stage_id;
        return { 
          ...l, 
          stage_id: correctStageId, 
          stage: uniqueStages.find((u: any) => u.id === correctStageId) || l.stage 
        };
      });
      
      setLeads(mappedLeads);
      const rawSources = sourcesRes.data?.data || sourcesRes.data || [];
      // Unikal manbalarni (safety-check) nomi bo'yicha ajratib olish
      const uniqueSources = rawSources.filter((v: any, i: number, a: any[]) => 
        a.findIndex((v2: any) => v2.name === v.name) === i
      );
      setSources(uniqueSources);
      setArchiveReasons(reasonsRes.data?.data || []);
      setCourses(coursesRes.data?.data || coursesRes.data || []);
      
      const dashboardData = statsRes.data?.data || statsRes.data;
      setStats({
        totalLeads: dashboardData.stats?.leads?.total || 0,
        conversionRate: dashboardData.stats?.leads?.conversionRate || 0,
        activeLeads: mappedLeads.length,
        topSource: dashboardData.funnelData?.[0]?.name || 'Instagram'
      });

    } catch (err) {
      console.error(err);
      showToast('Ma\'mulotlari yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [branchId, search, period, startDate, endDate]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const leadId = draggableId;
    const destStageId = destination.droppableId;
    const destStage = stages.find(s => s.id === destStageId);

    // Optimistic update
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage_id: destStageId, stage: destStage } : l));

    try {
      await api.put(`/crm/leads/${leadId}/stage`, { stageId: destStageId });
      showToast('Bosqich yangilandi!', 'success');
    } catch (err) {
      fetchData();
      showToast('Xatolik yuz berdi', 'error');
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalSourceId = newLeadData.sourceId;
      
      // Agar yangi manba qo'shilayotgan bo'lsa
      if (newLeadData.sourceId === 'NEW') {
        const res = await api.post('/crm/sources', { name: newLeadData.newCustomSource });
        finalSourceId = res.data?.id;
      }

      await api.post('/crm/leads', {
        ...newLeadData,
        sourceId: finalSourceId,
        branchId: branchId === 'all' ? null : branchId
      });
      setIsModalOpen(false);
      showToast('Lid yaratildi', 'success');
      fetchData();
    } catch (err) {
      showToast('Lid yaratishda xato', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalReason = archiveModal.reason;
      if (archiveModal.reason === 'NEW') {
        const res = await api.post('/crm/archive-reasons', { name: archiveModal.newCustomReason });
        finalReason = res.data?.name;
      }
      await api.put(`/crm/leads/${archiveModal.leadId}/archive`, { reason: finalReason });
      setArchiveModal({ isOpen: false, leadId: '', reason: '', newCustomReason: '' });
      showToast('Lid arxivlandi');
      fetchData();
    } catch (err) {
      showToast('Xatolik', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportLeads = async (data: any[]) => {
    try {
      await api.post('/crm/leads/bulk', { leads: data });
      fetchData();
    } catch (err) {
      throw err;
    }
  };

  const handleExport = () => {
    if (leads.length === 0) return showToast('Eksport qilish uchun ma\'lumot yo\'q', 'error');
    
    const exportData = leads.map(l => ({
      'Ism': l.name,
      'Telefon': l.phone,
      'Bosqich': l.stage?.name || 'Yo\'q',
      'Manba': l.source?.name || 'Yo\'q',
      'Kurs': l.course?.name || 'Yo\'q',
      'Yaratilgan sana': new Date(l.created_at).toLocaleDateString(),
      'Oxirgi izoh': l.last_comment || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lidlar");
    XLSX.writeFile(wb, `Lidlar_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Excel fayl yuklandi!');
  };

  const getStageColor = (stage: any) => {
    if (stage.name.toLowerCase().includes('aylangan')) return 'emerald';
    const colors = ['blue', 'amber', 'indigo', 'emerald', 'purple', 'rose'];
    return colors[stage.order % colors.length];
  };

  return (
    <div className="flex flex-col space-y-6 w-full mx-auto py-4 animate-in fade-in duration-700">
      
      {/* 📊 Top Stats */}
      <CrmStatCards stats={stats} />

      {/* 🔍 Filter Bar */}
      <Card className="p-4 bg-white border-none shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Ism yoki telefon orqali qidiruv..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-pink-200 transition-all outline-none text-[14px] font-medium"
            />
          </div>
          
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px] h-11 bg-gray-50 border-none rounded-xl font-bold">
              <SelectValue placeholder="Davr" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none shadow-xl">
              <SelectItem value="7d" className="font-bold">7 kunlik</SelectItem>
              <SelectItem value="30d" className="font-bold">1 oylik</SelectItem>
              <SelectItem value="90d" className="font-bold">3 oylik</SelectItem>
              <SelectItem value="year" className="font-bold">1 yillik</SelectItem>
              <SelectItem value="custom" className="font-bold text-pink-600">Ixtiyoriy davr...</SelectItem>
            </SelectContent>
          </Select>

          {period === 'custom' && (
             <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
               <input 
                 type="date" 
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
                 className="h-11 px-3 bg-gray-50 border-none rounded-xl text-[11px] font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all"
               />
               <span className="text-[10px] font-black text-gray-300 uppercase">Gacha</span>
               <input 
                 type="date" 
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
                 className="h-11 px-3 bg-gray-50 border-none rounded-xl text-[11px] font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all"
               />
             </div>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* View Switcher */}
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            <button 
              onClick={() => setView('kanban')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${view === 'kanban' ? 'bg-white text-pink-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid size={14} /> KANBAN
            </button>
            <button 
              onClick={() => setView('table')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${view === 'table' ? 'bg-white text-pink-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List size={14} /> JADVAL
            </button>
          </div>

          <Button 
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
            className="h-11 bg-emerald-50 border-emerald-100 text-emerald-600 font-black rounded-xl px-4 hover:bg-emerald-100"
          >
            <List className="w-4.5 h-4.5 mr-2" /> IMPORT
          </Button>

          <Button 
            variant="outline"
            onClick={handleExport}
            className="h-11 bg-blue-50 border-blue-100 text-blue-600 font-black rounded-xl px-4 hover:bg-blue-100"
          >
            EKSPORT
          </Button>

          <Button 
            onClick={() => { setNewLeadData({ name: '', phone: '+998', sourceId: sources[0]?.id || '', stageId: stages[0]?.id || '', newCustomSource: '', courseId: '' }); setIsModalOpen(true); }}
            className="h-11 bg-pink-500 hover:bg-pink-600 text-white font-black rounded-xl px-6 shadow-lg shadow-pink-200 border-none"
          >
            <Plus className="w-4.5 h-4.5 mr-2" /> LID QO'SHISH
          </Button>
        </div>
      </Card>

      {/* 🏔️ Core Content */}
      <div className="flex-1 min-h-[500px]">
        {loading ? (
          <div className="w-full h-64 flex flex-col items-center justify-center gap-4 opacity-50">
             <div className="w-10 h-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
             <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Ma'lumotlar yuklanmoqda...</span>
          </div>
        ) : view === 'kanban' ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar h-full min-h-[600px] items-start">
              {stages.map(stage => (
                <div key={stage.id} className="min-w-[320px] w-[320px] flex flex-col max-h-full">
                   <div className="flex items-center justify-between mb-4 px-2">
                      <div className="flex items-center gap-2">
                        {stage.name.toLowerCase().includes('aylangan') ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                              <CheckCircle2 size={12} className="text-emerald-600" />
                            </div>
                            <h3 className="font-black text-[13px] text-emerald-700 uppercase tracking-widest">{stage.name}</h3>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-${getStageColor(stage)}-500`} />
                            <h3 className="font-black text-[13px] text-gray-700 uppercase tracking-widest">{stage.name}</h3>
                          </div>
                        )}
                      </div>
                      <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-2 py-0.5 rounded-full">{leads.filter(l => l.stage_id === stage.id).length}</span>
                   </div>

                   <Droppable droppableId={String(stage.id)}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 flex flex-col gap-4 p-2 rounded-2xl transition-colors min-h-[200px] ${snapshot.isDraggingOver ? 'bg-pink-50/30 border-2 border-dashed border-pink-100' : 'bg-gray-50/50 border-2 border-transparent'}`}
                        >
                           {leads.filter(l => l.stage_id === stage.id).map((lead, index) => (
                              <Draggable key={lead.id} draggableId={String(lead.id)} index={index}>
                                 {(provided, snapshot) => (
                                    <div 
                                      ref={provided.innerRef} 
                                      {...provided.draggableProps} 
                                      {...provided.dragHandleProps}
                                      style={provided.draggableProps.style}
                                    >
                                       <LeadCard 
                                          item={lead} 
                                          isDragging={snapshot.isDragging}
                                          stageColor={getStageColor(stage)}
                                          onArchive={(id) => setArchiveModal({ ...archiveModal, isOpen: true, leadId: id })}
                                          nextStageName={stages[stages.findIndex(s => s.id === stage.id) + 1]?.name}
                                          onMoveStage={(id) => onDragEnd({ draggableId: id, source: { droppableId: stage.id, index: 0 }, destination: { droppableId: stages[stages.findIndex(s => s.id === stage.id) + 1].id, index: 0 } } as any)}
                                       />
                                    </div>
                                 )}
                              </Draggable>
                           ))}
                           {provided.placeholder}
                           {leads.filter(l => l.stage_id === stage.id).length === 0 && (
                             <div className="py-10 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl opacity-20">
                                <Plus size={24} className="text-gray-400 mb-2" />
                                <span className="text-[10px] font-black uppercase">Lid yo'q</span>
                             </div>
                           )}
                        </div>
                      )}
                   </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <LeadsTable 
              leads={leads} 
              getStageColor={(order) => getStageColor({ name: '', order })}
              onArchive={(id) => setArchiveModal({ ...archiveModal, isOpen: true, leadId: id })} 
            />
          </motion.div>
        )}
      </div>

      {/* 🔮 Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-[4px]" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative z-10 w-full max-w-[520px]">
              <Card className="bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] rounded-[16px] border-none overflow-hidden">
                 <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h3 className="font-semibold text-[18px] text-gray-900 flex items-center gap-2">Yangi Lid Qo'shish</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors hover:bg-gray-50"><X size={20} /></button>
                 </div>
                 
                 <form onSubmit={handleAddLead} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 gap-5">
                       <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-medium text-gray-700 ml-0.5">To'liq ism familiya <span className="text-red-500">*</span></label>
                          <input required type="text" placeholder="Masalan: Alijon Valiyev" value={newLeadData.name} onChange={e => setNewLeadData({...newLeadData, name: e.target.value})} className="h-[40px] w-full border border-gray-200 rounded-[8px] px-3 font-medium text-gray-900 focus:border-pink-500 focus:ring-[3px] focus:ring-pink-500/15 outline-none transition-all placeholder:text-gray-400" />
                       </div>
                       
                       <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-medium text-gray-700 ml-0.5">Telefon raqami <span className="text-red-500">*</span></label>
                          <input required type="text" value={newLeadData.phone} onChange={e => setNewLeadData({...newLeadData, phone: e.target.value})} className="h-[40px] w-full border border-gray-200 rounded-[8px] px-3 font-medium text-gray-900 focus:border-pink-500 focus:ring-[3px] focus:ring-pink-500/15 outline-none transition-all" />
                       </div>
                       <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-medium text-gray-700 ml-0.5">Kurs / Yo'nalish</label>
                          <select value={newLeadData.courseId} onChange={e => setNewLeadData({...newLeadData, courseId: e.target.value})} className="h-[40px] w-full border border-gray-200 bg-white rounded-[8px] px-3 font-medium text-gray-900 outline-none focus:border-pink-500 transition-all cursor-pointer">
                              <option value="">Tanlamaslik (Ixtiyoriy)</option>
                              {courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                             <label className="text-[13px] font-medium text-gray-700 ml-0.5">Lid manbasi</label>
                             <select value={newLeadData.sourceId} onChange={e => setNewLeadData({...newLeadData, sourceId: e.target.value})} className="h-[40px] w-full border border-gray-200 bg-white rounded-[8px] px-3 font-medium text-gray-900 outline-none focus:border-pink-500 transition-all cursor-pointer">
                                 <option value="" disabled>Tanlang...</option>
                                 {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                 <option value="NEW" className="text-pink-600 font-bold tracking-tight">+ YANGA MANBA QO'SHISH...</option>
                             </select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                             <label className="text-[13px] font-medium text-gray-700 ml-0.5">Boshlang'ich bosqich</label>
                             <select value={newLeadData.stageId} onChange={e => setNewLeadData({...newLeadData, stageId: e.target.value})} className="h-[40px] w-full border border-gray-200 bg-white rounded-[8px] px-3 font-medium text-gray-900 outline-none focus:border-pink-500 transition-all cursor-pointer">
                                 {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                             </select>
                          </div>
                       </div>

                       <AnimatePresence>
                          {newLeadData.sourceId === 'NEW' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="flex flex-col gap-1.5 pt-1">
                                <label className="text-[13px] font-medium text-gray-600 ml-0.5">Yangi manba nomi</label>
                                <input required placeholder="Manba nomi (masalan: Instagram)" value={newLeadData.newCustomSource} onChange={e => setNewLeadData({...newLeadData, newCustomSource: e.target.value})} className="h-[40px] w-full border border-gray-200 bg-white rounded-[8px] px-3 font-medium text-gray-900 outline-none focus:border-pink-500 transition-all" />
                              </div>
                            </motion.div>
                          )}
                       </AnimatePresence>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-50 mt-2">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="h-[40px] px-5 rounded-[8px] text-[14px] font-semibold text-gray-600 hover:bg-gray-100 transition-all">Bekor qilish</button>
                      <Button type="submit" disabled={isSubmitting} className="h-[40px] px-6 bg-[#EC4899] hover:bg-[#BE185D] text-white font-semibold text-[14px] rounded-[8px] shadow-sm border-none transition-all flex items-center gap-2">
                         {isSubmitting ? (
                            <> <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Yozilmoqda... </>
                         ) : (
                            <> <Plus size={18} /> Lidni Saqlash </>
                         )}
                      </Button>
                    </div>
                 </form>
              </Card>
            </motion.div>
          </div>
        )}

        {archiveModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-[4px]" onClick={() => setArchiveModal({...archiveModal, isOpen: false})} />
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative z-10 w-full max-w-[480px]">
                <Card className="bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] rounded-[16px] border-none overflow-hidden">
                   <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                      <h3 className="font-semibold text-[18px] text-gray-900 flex items-center gap-2">
                        <AlertCircle size={20} className="text-red-500" />
                        Lidni Arxivlash
                      </h3>
                      <button onClick={() => setArchiveModal({...archiveModal, isOpen: false})} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-50 transition-all"><X size={20} /></button>
                   </div>

                   <form onSubmit={handleArchiveLead} className="p-6 space-y-6">
                      <div className="p-4 bg-red-50/50 rounded-[12px] border border-red-100/50">
                        <p className="text-[13px] font-medium text-red-600 leading-relaxed text-center">Ushbu liddni chetlatish sababini ko'rsatishingiz zarur.</p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                         <label className="text-[13px] font-medium text-gray-700 ml-0.5">Arxivlash sababi</label>
                         <select value={archiveModal.reason} onChange={e => setArchiveModal({...archiveModal, reason: e.target.value})} className="h-[40px] w-full border border-gray-200 bg-white rounded-[8px] px-3 font-medium text-gray-900 outline-none focus:border-pink-500 transition-all cursor-pointer">
                            <option value="" disabled>Tanlang...</option>
                            {archiveReasons.map((r: any) => <option key={r.id} value={r.name}>{r.name}</option>)}
                            <option value="NEW" className="text-pink-600 font-bold">+ Yangi sabab qo'shish...</option>
                         </select>
                      </div>

                      <AnimatePresence>
                        {archiveModal.reason === 'NEW' && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="flex flex-col gap-1.5 pt-1">
                              <label className="text-[13px] font-medium text-gray-600 ml-0.5">Yangi sabab nomi</label>
                              <input required placeholder="Sababni yozing..." value={archiveModal.newCustomReason} onChange={e => setArchiveModal({...archiveModal, newCustomReason: e.target.value})} className="h-[40px] w-full border border-gray-200 bg-white rounded-[8px] px-3 font-medium text-gray-900 outline-none focus:border-pink-500 transition-all" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="pt-4 flex justify-end gap-3 border-t border-gray-50 mt-2">
                        <button type="button" onClick={() => setArchiveModal({...archiveModal, isOpen: false})} className="h-[40px] px-5 rounded-[8px] text-[14px] font-semibold text-gray-600 hover:bg-gray-100 transition-all">Bekor qilish</button>
                        <Button type="submit" disabled={isSubmitting || !archiveModal.reason} variant="destructive" className="h-[40px] px-6 bg-red-500 hover:bg-red-600 text-white font-semibold text-[14px] rounded-[8px] shadow-sm border-none transition-all uppercase">
                          {isSubmitting ? 'Bajarilmoqda...' : 'Tasdiqlash'}
                        </Button>
                      </div>
                   </form>
                </Card>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔔 Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 100 }}
            className={`fixed bottom-8 right-8 z-[200] p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}
          >
             {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
             <span className="font-black text-sm uppercase tracking-tight">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <ImportExcelModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportLeads}
        title="Lidlarni import qilish"
        description="Excel fayl orqali yangi lidlarni ommaviy ravishda CRM bazasiga qo'shing."
        templateHeaders={['Ism', 'Telefon', 'Izoh']}
        exampleData={['Lola Karimova', '+998950001122', 'Ingliz tili kursiga qiziqmoqda']}
      />
    </div>
  );
}
