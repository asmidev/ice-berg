"use client";

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';

// Components
import { StudentStats } from '@/components/students/StudentStats';
import { StudentAnalytics } from '@/components/students/StudentAnalytics';
import { RecentStudents } from '@/components/students/RecentStudents';
import { StudentFilters } from '@/components/students/StudentFilters';
import { StudentTable } from '@/components/students/StudentTable';
import { StudentModals } from '@/components/students/StudentModals';
import { ImportExcelModal } from '@/components/shared/ImportExcelModal';

const API_PATH = '/students';

export default function StudentsDatabasePage() {
  const searchParams = useSearchParams();
  
  // States
  const [students, setStudents] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [groupId, setGroupId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [limit, setLimit] = useState(20);
  
  // Analytics Data
  const [analytics, setAnalytics] = useState<any>(null);
  
  // Modals visibility
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Form Targets
  const [newStudent, setNewStudent] = useState({ firstName: '', lastName: '', phone: '+998', password: '', parentPhone: '+998', branchId: '', dateOfBirth: '', gender: '' });
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [archiveTarget, setArchiveTarget] = useState<any>(null);
  const [passwordTarget, setPasswordTarget] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Meta data
  const [groups, setGroups] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [archiveReasons, setArchiveReasons] = useState<any[]>([]);
  const [selectedReason, setSelectedReason] = useState('');
  
  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // 🔄 Init branch
  useEffect(() => {
    const bId = searchParams.get('branch_id') || localStorage.getItem('branch_id') || 'all';
    setBranchId(bId);
    setNewStudent(prev => ({ ...prev, branchId: bId === 'all' ? '' : bId }));
  }, [searchParams]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // 🛰️ Data Fetching
  const fetchStudents = async () => {
    setLoading(true);
    try {
      let path = `${API_PATH}?branch_id=${branchId}&search=${search}&page=${page}&limit=${limit}`;
      if (status !== 'all') path += `&status=${status}`;
      if (groupId) path += `&group_id=${groupId}`;
      if (courseId) path += `&course_id=${courseId}`;
      if (startDate) path += `&startDate=${startDate}`;
      if (endDate) path += `&endDate=${endDate}`;

      const res = await api.get(path);
      const data = res.data?.data || res.data;
      setStudents(Array.isArray(data) ? data : []);
      
      if (res.data?.meta) {
        setTotalPages(res.data.meta.totalPages);
        setTotalStudents(res.data.meta.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/analytics/dashboard?branch_id=${branchId}`);
      const data = res.data?.data || res.data;
      if (!data || !data.stats) {
        console.warn('Analytics data is missing stats:', data);
      }
      setAnalytics(data);
    } catch (err: any) {
      console.error('Analytics Fetch Error:', err);
      showToast('Statistika ma\'lumotlarini yuklab bo\'lmadi', 'error');
    }
  };

  const fetchMeta = async () => {
    try {
      const [gRes, cRes, rRes] = await Promise.all([
        api.get(`/lms/groups?branch_id=${branchId}&limit=100`),
        api.get(`/lms/courses?tenant_id=true&limit=100`),
        api.get(`${API_PATH}/archive/reasons`)
      ]);
      setGroups(gRes.data?.data || gRes.data || []);
      setCourses(cRes.data?.data || cRes.data || []);
      setArchiveReasons(rRes.data?.data || rRes.data || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchMeta();
    fetchAnalytics();
  }, [branchId]);

  useEffect(() => {
    const timeout = setTimeout(fetchStudents, 500);
    return () => clearTimeout(timeout);
  }, [search, status, groupId, courseId, branchId, page, limit, startDate, endDate]);

  // 📝 Handlers
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post(API_PATH, {
        ...newStudent,
        branchId: newStudent.branchId || (branchId === 'all' ? null : branchId)
      });
      showToast('Talaba muvaffaqiyatli qo\'shildi!');
      setIsAddModalOpen(false);
      fetchStudents();
      fetchAnalytics();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Xatolik', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`${API_PATH}/${editingStudent.id}`, {
        firstName: editingStudent.user?.first_name,
        lastName: editingStudent.user?.last_name,
        phone: editingStudent.user?.phone,
        parentPhone: editingStudent.parent_phone,
        status: editingStudent.status
      });
      showToast('Ma\'lumotlar yangilandi!');
      setIsEditModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Xatolik', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async () => {
    setIsSubmitting(true);
    try {
      await api.delete(`${API_PATH}/${deleteTarget.id}`);
      showToast('Talaba o\'chirildi!');
      setIsDeleteModalOpen(false);
      fetchStudents();
      fetchAnalytics();
    } catch (err: any) {
      showToast('O\'chirishda xatolik', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveStudent = async () => {
    if (!selectedReason) return showToast('Sababni tanlang', 'error');
    setIsSubmitting(true);
    try {
      const reasonName = archiveReasons.find(r => r.id === selectedReason)?.name || selectedReason;
      await api.put(`${API_PATH}/${archiveTarget.id}/archive`, { reason: reasonName });
      showToast('Talaba arxivlandi!');
      setIsArchiveModalOpen(false);
      fetchStudents();
      fetchAnalytics();
    } catch (err: any) {
      showToast('Arxivlashda xatolik', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword) return;
    setIsSubmitting(true);
    try {
      await api.put(`${API_PATH}/${passwordTarget.id}/password`, { password: newPassword });
      showToast('Parol yangilandi!');
      setIsPasswordModalOpen(false);
      setNewPassword('');
    } catch (err: any) {
      showToast('Xatolik', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImport = async (data: any[]) => {
    try {
      await api.post(`${API_PATH}/bulk`, { students: data });
      fetchStudents();
      fetchAnalytics();
    } catch (err) {
      throw err;
    }
  };

  const handleAction = (type: string, target: any) => {
    if (type === 'edit') { setEditingStudent(target); setIsEditModalOpen(true); }
    if (type === 'delete') { setDeleteTarget(target); setIsDeleteModalOpen(true); }
    if (type === 'archive') { setArchiveTarget(target); setIsArchiveModalOpen(true); }
    if (type === 'password') { setPasswordTarget(target); setIsPasswordModalOpen(true); }
    setActiveDropdown(null);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setGroupId('');
    setCourseId('');
  };

  const handleExport = () => {
    if (students.length === 0) return showToast('Eksport qilish uchun ma\'lumot yo\'q', 'error');
    
    const exportData = students.map(s => ({
      'ID': s.id.slice(-6).toUpperCase(),
      'F.I.SH': `${s.user?.first_name} ${s.user?.last_name}`,
      'Telefon': s.user?.phone,
      'Guruhlar': s.enrollments?.map((e: any) => e.group?.name).join(', ') || 'Yo\'q',
      'Balans': Number(s.balance).toLocaleString() + ' UZS',
      'Holati': s.status === 'ACTIVE' ? 'Faol' : s.status === 'DEBTOR' ? 'Qarzdor' : 'Nofaol',
      'Qo\'shilgan sana': new Date(s.joined_at).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Talabalar");
    XLSX.writeFile(wb, `Talabalar_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Excel fayl yuklandi!');
  };

  const handleAddArchiveReason = async (name: string) => {
    try {
      await api.post(`${API_PATH}/archive/reasons`, { name });
      const rRes = await api.get(`${API_PATH}/archive/reasons`);
      setArchiveReasons(rRes.data?.data || rRes.data || []);
      showToast('Yangi sabab qo\'shildi!');
    } catch (e) {
      showToast('Sabab qo\'shishda xatolik', 'error');
    }
  };

  // 📊 Analytics mapping
  const stats = useMemo(() => ({
    total: analytics?.stats?.students?.total || 0,
    active: analytics?.stats?.students?.active || 0,
    debtors: analytics?.stats?.debtors?.total || 0,
    debtAmount: analytics?.stats?.debtors?.amount || 0,
    joined: analytics?.stats?.students?.joined || 0
  }), [analytics]);

  const courseData = analytics?.coursePerformance || [];
  const trendData = analytics?.studentsChartData || [];
  const recentStudents = analytics?.recentActivities?.filter((a: any) => a.type === 'STUDENT' || a.type === 'LEAD' || a.type === 'PAYMENT').map((a: any) => ({
    id: a.id || Math.random().toString(),
    user: { first_name: a.title, last_name: '', phone: a.description },
    joined_at: a.date
  })).slice(0, 5) || [];

  return (
    <div className="flex flex-col space-y-6 pb-10 w-full mx-auto animate-in fade-in duration-700 h-full overflow-y-auto custom-scrollbar">
      
      {/* 🚀 Toast */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-[1000] p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300 
            ${toast.type === 'error' ? 'bg-red-600 text-white shadow-red-500/20' : 'bg-emerald-600 text-white shadow-emerald-500/20'}`}>
           {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
           <span className="font-bold text-sm tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* 1. Stats Row */}
      <StudentStats stats={stats} />

      {/* 2. Analytics Row */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <StudentAnalytics courseData={courseData} trendData={trendData} />
        </div>
        <div className="lg:w-[350px] mt-6">
          <RecentStudents students={recentStudents} />
        </div>
      </div>

      {/* 3. Filter & Table Section */}
      <div className="flex flex-col space-y-4">
        <StudentFilters 
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          groupId={groupId}
          setGroupId={setGroupId}
          courseId={courseId}
          setCourseId={setCourseId}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onClear={clearFilters}
          onAdd={() => setIsAddModalOpen(true)}
          onExport={handleExport}
          onImport={() => setIsImportModalOpen(true)}
          groups={groups}
          courses={courses}
          totalCount={totalStudents}
        />

        <StudentTable 
          students={students}
          loading={loading}
          page={page}
          totalPages={totalPages}
          totalStudents={totalStudents}
          onPageChange={setPage}
          onAction={handleAction}
          selectedIds={selectedIds}
          toggleSelect={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
          toggleSelectAll={() => setSelectedIds(selectedIds.length === students.length ? [] : students.map(s => s.id))}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
        />
      </div>

      {/* 4. Modals */}
      <StudentModals 
        isAddModalOpen={isAddModalOpen} setIsAddModalOpen={setIsAddModalOpen}
        isEditModalOpen={isEditModalOpen} setIsEditModalOpen={setIsEditModalOpen}
        isDeleteModalOpen={isDeleteModalOpen} setIsDeleteModalOpen={setIsDeleteModalOpen}
        isArchiveModalOpen={isArchiveModalOpen} setIsArchiveModalOpen={setIsArchiveModalOpen}
        isPasswordModalOpen={isPasswordModalOpen} setIsPasswordModalOpen={setIsPasswordModalOpen}
        newStudent={newStudent} setNewStudent={setNewStudent}
        editingStudent={editingStudent} setEditingStudent={setEditingStudent}
        deleteTarget={deleteTarget}
        archiveTarget={archiveTarget} selectedReason={selectedReason} setSelectedReason={setSelectedReason} archiveReasons={archiveReasons}
        newPassword={newPassword} setNewPassword={setNewPassword}
        passwordTarget={passwordTarget}
        onSubmitAdd={handleAddStudent}
        onSubmitUpdate={handleUpdateStudent}
        onSubmitDelete={handleDeleteStudent}
        onSubmitArchive={handleArchiveStudent}
        onSubmitPassword={handlePasswordUpdate}
        onAddArchiveReason={handleAddArchiveReason}
        isSubmitting={isSubmitting}
      />

      <ImportExcelModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        title="O'quvchilarni import qilish"
        description="Excel fayl orqali o'quvchilarni ommaviy ravishda bazaga qo'shing."
        templateHeaders={['Ism', 'Familiya', 'Telefon', 'Parol', 'Jinsi', 'Tug\'ilgan sana']}
        exampleData={['Ali', 'Valiyev', '+998901234567', '123456', 'Erkak', '2005-05-15']}
      />
    </div>
  );
}

