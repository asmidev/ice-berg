"use client";

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useConfirm } from '@/hooks/use-confirm';
import { toast } from 'sonner';
import { TeacherStats } from './components/TeacherStats';
import { TeacherFilters } from './components/TeacherFilters';
import { TeacherGrid } from './components/TeacherGrid';
import { TeacherModals } from './components/TeacherModals';
import { AcademicPerformanceChart } from './components/AcademicPerformanceChart';
import { AttendanceTrendChart } from './components/AttendanceTrendChart';
import { DepartmentStats } from './components/DepartmentStats';

export default function TeachersDatabasePage() {
  const confirm = useConfirm();
  const searchParams = useSearchParams();
  const [branchId, setBranchId] = useState('all');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [stats, setStats] = useState({ 
    total: 0, main: 0, support: 0, interns: 0, 
    departmentStats: [] as any[], 
    academicSuccess: [] as any[], 
    attendanceTrend: [] as any[] 
  });
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTeacherId, setEditTeacherId] = useState('');

  // Archiving
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveTeacherId, setArchiveTeacherId] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [archiveReasons, setArchiveReasons] = useState<any[]>([]);
  const [specializations, setSpecializations] = useState<any[]>([]);
  const [isArchiving, setIsArchiving] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message: any, type: 'success' | 'error' = 'success') => {
    const msg = typeof message === 'string' ? message : (message?.message || JSON.stringify(message) || 'Xatolik yuz berdi');
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', phone: '+998', password: '', role: 'TEACHER', 
    branchId: '', specialization: '', salaryType: 'FIXED', salaryAmount: '0', 
    gender: 'Erkak', dateOfBirth: '', photoUrl: '', description: '', type: 'MAIN', email: ''
  });

  useEffect(() => {
    let bId = searchParams?.get('branch_id') || (typeof window !== 'undefined' ? localStorage.getItem('branch_id') : null) || 'all';
    if (bId === 'null' || bId === 'undefined' || !bId) bId = 'all';
    setBranchId(bId);
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let path = `/teachers?branch_id=${branchId === 'all' ? '' : branchId}&search=${search}`;
      
      const [teachersRes, branchesRes, groupsRes, statsRes] = await Promise.all([
        api.get(path),
        api.get('/branches'),
        api.get(`/lms/groups?branch_id=${branchId === 'all' ? '' : branchId}`),
        api.get(`/teachers/stats?branch_id=${branchId === 'all' ? '' : branchId}`)
      ]);
      setTeachers(teachersRes.data?.data || teachersRes.data || []);
      setBranches(branchesRes.data?.data || branchesRes.data || []);
      setGroups(groupsRes.data?.data || groupsRes.data || []);
      setStats(statsRes.data?.data || statsRes.data || { 
        total: 0, main: 0, support: 0, interns: 0, 
        departmentStats: [], academicSuccess: [], attendanceTrend: [] 
      });
    } catch (err) {
      showToast("Ma'lumotlarni yuklashda xatolik", 'error');
    } finally { setLoading(false); }
  }, [branchId, search]);

  useEffect(() => {
    fetchArchiveReasons();
    fetchSpecializations();
  }, []);

  useEffect(() => {
     const timeout = setTimeout(fetchData, 500);
     return () => clearTimeout(timeout);
  }, [fetchData]);

  const fetchArchiveReasons = async () => {
    try {
      const res = await api.get('/teachers/archive-reasons');
      setArchiveReasons(res.data?.data || res.data || []);
    } catch (err) { setArchiveReasons([]); }
  };

  const fetchSpecializations = async () => {
    try {
      const res = await api.get('/teachers/specializations');
      setSpecializations(res.data?.data || res.data || []);
    } catch (err) { setSpecializations([]); }
  };

  const handleAddSpecialization = async (name: string) => {
    try {
      await api.post('/teachers/specializations', { name });
      fetchSpecializations();
    } catch (err) { showToast("Yo'nalish qo'shishda xatolik", 'error'); }
  };

  const handleArchiveTeacher = async () => {
    const reason = selectedReason === 'other' ? customReason : selectedReason;
    if (!reason) return showToast('Sababini kiriting', 'error');

    setIsArchiving(true);
    try {
      await api.put(`/teachers/${archiveTeacherId}/archive`, { reason });
      showToast("O'qituvchi arxivlandi");
      setIsArchiveModalOpen(false);
      fetchData();
    } catch (err: any) { showToast(err.response?.data?.message, 'error'); } 
    finally { setIsArchiving(false); }
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData, salaryAmount: formData.salaryAmount.replace(/,/g, '') };
      if (isEditMode) {
        await api.put(`/teachers/${editTeacherId}`, payload);
        showToast('Yangilandi!');
      } else {
        await api.post('/teachers', payload);
        showToast('Qo\'shildi!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) { showToast(err.response?.data?.message, 'error'); }
    finally { setIsSubmitting(false); }
  };

  const resetForm = () => {
    setIsEditMode(false);
    setEditTeacherId('');
    setFormData({
      firstName: '', lastName: '', phone: '+998', password: '', role: 'TEACHER', 
      branchId: '', specialization: '', salaryType: 'FIXED', salaryAmount: '0', 
      gender: 'Erkak', dateOfBirth: '', photoUrl: '', description: '', type: 'MAIN', email: ''
    });
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 w-full mx-auto p-0 pt-[15px] text-zinc-800">
      
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[9999] p-4 rounded-md shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-10 duration-300 bg-[#1E3A5F] text-white">
           {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-400" /> : <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
           <span className="font-bold text-sm tracking-tight">{toast.message}</span>
        </div>
      )}

      {/* 🚀 Stats & Analytics Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-start">
         {/* Left Side: Stats + Charts */}
         <div className="lg:col-span-9 space-y-6">
            <TeacherStats stats={stats} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <AcademicPerformanceChart data={stats.academicSuccess} />
               <AttendanceTrendChart data={stats.attendanceTrend} />
            </div>
         </div>

         <div className="lg:col-span-3 h-full">
            <DepartmentStats data={stats.departmentStats} total={stats.total} />
         </div>
      </div>

      {/* 🔍 Filters & Header Action Bar */}
      <TeacherFilters 
        search={search} 
        setSearch={setSearch} 
        onAdd={() => { resetForm(); setIsModalOpen(true); }}
      />

      {/* 🧑‍🏫 Teacher Grid View */}
      <TeacherGrid 
        teachers={teachers} 
        loading={loading}
        onEdit={(t) => {
          setIsEditMode(true);
          setEditTeacherId(t.id);
          setFormData({
            firstName: t.user?.first_name, lastName: t.user?.last_name, phone: t.user?.phone, role: 'TEACHER',
            branchId: t.branch_id, specialization: t.specialization, salaryType: t.salary_type,
            salaryAmount: t.salary_amount?.toString(), gender: t.user?.gender,
            dateOfBirth: t.date_of_birth ? new Date(t.date_of_birth).toISOString().split('T')[0] : '',
            photoUrl: t.user?.photo_url, description: t.description, password: '', type: t.type || 'MAIN',
            email: t.user?.email || ''
          });
          setIsModalOpen(true);
        }}
        onDelete={async (id) => { 
          const isConfirmed = await confirm({
            title: "O'qituvchini o'chirish",
            message: "Ushbu o'qituvchini o'chirishni tasdiqlaysizmi?",
            type: "danger"
          });
          if(isConfirmed) { await api.delete(`/teachers/${id}`); fetchData(); } 
        }}
        onArchive={(id) => { setArchiveTeacherId(id); setIsArchiveModalOpen(true); }}
      />

      {/* 🗂 Modals */}
      <TeacherModals 
        isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}
        isEditMode={isEditMode} formData={formData} setFormData={setFormData}
        isSubmitting={isSubmitting} onSave={handleSaveTeacher} branches={branches}
        isArchiveModalOpen={isArchiveModalOpen} setIsArchiveModalOpen={setIsArchiveModalOpen}
        archiveReasons={archiveReasons} selectedReason={selectedReason} 
        setSelectedReason={setSelectedReason} customReason={customReason} 
        setCustomReason={setCustomReason} isArchiving={isArchiving} 
        onArchive={handleArchiveTeacher} onAddArchiveReason={async () => {
          await api.post('/teachers/archive-reasons', { name: customReason });
          fetchArchiveReasons();
          setSelectedReason(customReason);
        }}
        specializations={specializations}
        onAddSpecialization={handleAddSpecialization}
      />

    </div>
  );
}
