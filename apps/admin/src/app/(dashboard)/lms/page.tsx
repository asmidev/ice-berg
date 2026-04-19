"use client";

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';

// Components
import { LmsStatCards } from './components/LmsStatCards';
import { LmsFilterBar } from './components/LmsFilterBar';
import { LmsTable } from './components/LmsTable';
import { LmsCalendarView } from './components/LmsCalendarView';
import { GroupModals } from './components/GroupModals';
import { GroupCalendarModal } from './components/GroupCalendarModal';
import { ArchiveGroupModal } from './components/ArchiveGroupModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { SmsGroupModal } from './components/SmsGroupModal';
import { StudentEnrollModal } from './components/StudentEnrollModal';
import { EnrolledStudentsModal } from './components/EnrolledStudentsModal';
import { AttendanceMarkingModal } from './components/AttendanceMarkingModal';
import { useBranch } from '@/providers/BranchProvider';

export default function LmsDashboardPage() {
  const searchParams = useSearchParams();
  
  // --- States ---
  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const { branchId, isReady } = useBranch();
  
  const [groups, setGroups] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalGroups: 0, activeStudents: 0, activeCourses: 0, totalRooms: 0 });
  const [archiveReasons, setArchiveReasons] = useState<string[]>(["Kurs yakunlandi", "O'quvchilar kamligi", "O'qituvchi ketishi", "Boshqa"]);

  // --- Filter States ---
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');

  // --- Modal States ---
  const [activeModal, setActiveModal] = useState<string | null>(null); // 'form', 'calendar', 'archive', 'delete', 'sms', 'enroll', 'attendance'
  const [targetGroup, setTargetGroup] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [groupData, setGroupData] = useState({
    id: '', name: '', courseId: '', price: '', capacity: 15,
    startDate: new Date().toISOString().split('T')[0],
    teacherId: '', supportTeacherId: 'none', roomId: '',
    selectedDays: [] as number[], startTime: '09:00', endTime: '11:00',
    is_vip: false,
    teacher_salary_type: 'PERCENT_REVENUE', teacher_salary_value: '',
    support_salary_type: 'FIXED', support_salary_value: '',
    main_teacher_days: 0, support_teacher_days: 0
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // --- Initialization ---
  // initialization is now handled by Context
  useEffect(() => {
    if (isReady && branchId) fetchMeta(branchId);
  }, [branchId, isReady]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchMeta = async (bId: string) => {
    try {
      const [cRes, tRes, rRes, arcRes] = await Promise.all([
        api.get(`/lms/courses?branch_id=${bId}`),
        api.get(`/lms/teachers?branch_id=${bId}`),
        api.get(`/lms/rooms?branch_id=${bId}`),
        api.get(`/students/archive/reasons`).catch(() => ({ data: [] }))
      ]);
      setCourses(cRes.data?.data || cRes.data || []);
      setTeachers(tRes.data?.data || tRes.data || []);
      setRooms(rRes.data?.data || rRes.data || []);
      if (arcRes.data?.length > 0) {
          setArchiveReasons(arcRes.data.map((r: any) => r.name));
      }
    } catch (e) {}
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await api.get(`/lms/stats?branch_id=${branchId}`);
      const data = res.data?.data || res.data;
      if (data) {
        setStats({
          totalGroups: data.totalGroups || 0,
          activeStudents: data.enrollments || 0,
          activeCourses: data.activeCourses || 0,
          totalRooms: data.totalRooms || 0
        });
      }
    } catch (err) { console.error(err); }
    finally { setStatsLoading(false); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let path = `/lms/groups?branch_id=${branchId}&search=${search}`;
      if (courseFilter !== 'all') path += `&course_id=${courseFilter}`;
      if (teacherFilter !== 'all') path += `&teacher_id=${teacherFilter}`;
      if (roomFilter !== 'all') path += `&room_id=${roomFilter}`;

      const res = await api.get(path);
      setGroups(res.data?.data || res.data || []);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Ma\'lumotlarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady) {
      fetchStats();
      fetchData();
    }
  }, [branchId, isReady, search, courseFilter, teacherFilter, roomFilter]);

  // --- Handlers ---
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...groupData,
        branch_id: branchId === 'all' ? null : branchId,
        schedules: groupData.selectedDays.map(day => ({
          day_of_week: day,
          start_time: groupData.startTime,
          end_time: groupData.endTime,
          room_id: groupData.roomId
        }))
      };

      if (isEditMode) {
        await api.post(`/lms/groups/${groupData.id}`, payload);
        showToast('Guruh yangilandi');
      } else {
        await api.post('/lms/groups', payload);
        showToast('Guruh yaratildi');
      }
      setActiveModal(null);
      fetchData();
      fetchStats();
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Saqlashda xatolik yuz berdi', 'error');
    } finally { setIsSubmitting(false); }
  };

  const handleArchive = async (reason: string) => {
    setIsSubmitting(true);
    try {
      await api.post(`/lms/groups/${targetGroup.id}/archive`, { reason });
      showToast('Guruh arxivlandi');
      setActiveModal(null);
      fetchData();
      fetchStats();
    } catch (err: any) { 
      showToast(err.response?.data?.message || 'Arxivlashda xatolik yuz berdi', 'error'); 
    }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await api.delete(`/lms/groups/${targetGroup.id}`);
      showToast('Guruh o\'chirildi');
      setActiveModal(null);
      fetchData();
      fetchStats();
    } catch (err: any) { 
      showToast(err.response?.data?.message || 'O\'chirishda xatolik yuz berdi', 'error'); 
    }
    finally { setIsSubmitting(false); }
  };

  const handleSendSms = async (message: string) => {
     setIsSubmitting(true);
     try {
        // SMS logikasi Eskiz.uz ulanganidan so'ng API orqali ishlaydi
        await new Promise(r => setTimeout(r, 1000));
        showToast('SMS yuborish navbatga qo\'yildi');
        setActiveModal(null);
     } catch (err: any) { 
        showToast(err.response?.data?.message || 'SMS yuborishda xatolik yuz berdi', 'error'); 
     }
     finally { setIsSubmitting(false); }
  };

  const handleAddArchiveReason = async (name: string) => {
    try {
      await api.post(`/students/archive/reasons`, { name });
      setArchiveReasons(prev => [...prev, name]);
    } catch (e) {}
  };

  const handleExport = () => {
    if (groups.length === 0) return showToast('Eksport qilish uchun ma\'lumot yo\'q', 'error');
    
    const exportData = groups.map(g => ({
      'Guruh nomi': g.name,
      'Asosiy o\'qituvchi': g.teacher?.user ? `${g.teacher.user.first_name} ${g.teacher.user.last_name}` : 'Biriktirilmagan',
      'Yordamchi o\'qituvchi': g.support_teacher?.user ? `${g.support_teacher.user.first_name} ${g.support_teacher.user.last_name}` : 'Yo\'q',
      'Kurs': g.course?.name || 'Noma\'lum',
      'O\'quvchilar': g._count?.enrollments || 0,
      'Sig\'imi': g.capacity || 0,
      'Narxi': g.price ? Number(g.price).toLocaleString() : '0',
      'Boshlanish sanasi': g.start_date ? new Date(g.start_date).toLocaleDateString('uz-UZ') : '',
      'Holati': g.is_archived ? 'Arxiv' : 'Faol'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guruhlar");

    // Ustun kengliklarini sozlash
    const max_width = exportData.reduce((w, r) => Math.max(w, r['Guruh nomi'].length), 15);
    worksheet['!cols'] = [ { wch: max_width + 5 }, { wch: 25 }, { wch: 25 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 10 } ];

    XLSX.writeFile(workbook, `LMS_Guruhlar_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Excel fayli yuklandi');
  };

  return (
    <div className="flex flex-col space-y-6 pb-10 w-full mx-auto animate-in fade-in duration-700 h-full overflow-y-auto custom-scrollbar">
      
      {toast.show && (
        <div className={`fixed bottom-8 right-8 z-[1000] p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 
            ${toast.type === 'error' ? 'bg-red-600 text-white shadow-red-500/20' : 'bg-pink-600 text-white shadow-pink-500/20'}`}>
           {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
           <span className="font-bold text-sm tracking-wide">{toast.message}</span>
        </div>
      )}

      <LmsStatCards stats={stats} isLoading={statsLoading} />

      <LmsFilterBar 
        search={search} onSearchChange={setSearch}
        courseFilter={courseFilter} onCourseFilterChange={setCourseFilter}
        teacherFilter={teacherFilter} onTeacherFilterChange={setTeacherFilter}
        roomFilter={roomFilter} onRoomFilterChange={setRoomFilter}
        activeView={activeView} onViewChange={setActiveView}
        onAddClick={() => {
           setGroupData({
             id: '', name: '', courseId: '', price: '', capacity: 15,
             startDate: new Date().toISOString().split('T')[0],
             teacherId: '', supportTeacherId: 'none', roomId: '',
             selectedDays: [], startTime: '09:00', endTime: '11:00',
             is_vip: false,
             teacher_salary_type: 'PERCENT_REVENUE', teacher_salary_value: '',
             support_salary_type: 'FIXED', support_salary_value: '',
             main_teacher_days: 0, support_teacher_days: 0
           });
           setIsEditMode(false);
           setActiveModal('form');
        }}
        courses={courses} teachers={teachers} rooms={rooms}
        onExport={handleExport}
      />

      {activeView === 'list' ? (
        <LmsTable 
          groups={groups} isLoading={loading}
          onEdit={(g) => {
             setGroupData({
               id: g.id, name: g.name, courseId: g.course_id, price: g.price?.toString() || '', capacity: g.capacity,
               startDate: g.start_date ? new Date(g.start_date).toISOString().split('T')[0] : '',
               teacherId: g.teacher_id || '', supportTeacherId: g.support_teacher_id || 'none', roomId: g.room_id || '',
               selectedDays: g.schedules?.map((s: any) => s.day_of_week) || [],
               startTime: g.schedules?.[0]?.start_time || '09:00', endTime: g.schedules?.[0]?.end_time || '11:00',
               is_vip: g.is_vip || false,
               teacher_salary_type: g.teacher_salary_type || 'PERCENT_REVENUE',
               teacher_salary_value: g.teacher_salary_value?.toString() || '',
               support_salary_type: g.support_salary_type || 'FIXED',
               support_salary_value: g.support_salary_value?.toString() || '',
               main_teacher_days: g.main_teacher_days || 0,
               support_teacher_days: g.support_teacher_days || 0
             });
             setIsEditMode(true);
             setActiveModal('form');
          }}
          onArchive={(g) => { setTargetGroup(g); setActiveModal('archive'); }}
          onDelete={(g) => { setTargetGroup(g); setActiveModal('delete'); }}
          onViewCalendar={(g) => { setTargetGroup(g); setActiveModal('calendar'); }}
          onSms={(g) => { setTargetGroup(g); setActiveModal('sms'); }}
          onEnroll={(g) => { setTargetGroup(g); setActiveModal('enroll'); }}
          onAttendance={(g) => { setTargetGroup(g); setActiveModal('attendance'); }}
          onManageStudents={(g) => { setTargetGroup(g); setActiveModal('manage_students'); }}
        />
      ) : (
        <LmsCalendarView groups={groups} isLoading={loading} />
      )}

      {/* --- Modals --- */}
      <GroupModals 
        isOpen={activeModal === 'form'} onClose={() => setActiveModal(null)}
        isEditMode={isEditMode} groupData={groupData} setGroupData={setGroupData}
        onSave={handleSave} isSubmitting={isSubmitting}
        courses={courses} teachers={teachers} rooms={rooms}
      />

      <GroupCalendarModal 
        isOpen={activeModal === 'calendar'} onClose={() => setActiveModal(null)}
        group={targetGroup}
      />

      <ArchiveGroupModal 
        isOpen={activeModal === 'archive'} onClose={() => setActiveModal(null)}
        group={targetGroup} reasons={archiveReasons}
        onConfirm={handleArchive} onAddReason={handleAddArchiveReason}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmModal 
        isOpen={activeModal === 'delete'} onClose={() => setActiveModal(null)}
        title="Guruhni o'chirish"
        description={`Haqiqatan ham "${targetGroup?.name}" guruhini o'chirmoqchimisiz? Guruhda o'quvchilar bo'lsa uni o'chirib bo'lmaydi.`}
        onConfirm={handleDelete} isSubmitting={isSubmitting}
      />

      <SmsGroupModal 
        isOpen={activeModal === 'sms'} onClose={() => setActiveModal(null)}
        group={targetGroup} onSend={handleSendSms} isSubmitting={isSubmitting}
      />

      <StudentEnrollModal 
        isOpen={activeModal === 'enroll'}
        onClose={() => setActiveModal(null)}
        group={targetGroup}
        onSuccess={() => {
           showToast('Talabalar muvaffaqiyatli biriktirildi');
           fetchData();
           fetchStats();
        }}
      />

      <EnrolledStudentsModal 
         isOpen={activeModal === 'manage_students'}
         onClose={() => setActiveModal(null)}
         group={targetGroup}
         onSuccess={() => {
            showToast("O'quvchilar tarkibi yangilandi");
            fetchData();
            fetchStats();
         }}
      />

      <AttendanceMarkingModal 
         isOpen={activeModal === 'attendance'}
         onClose={() => setActiveModal(null)}
         group={targetGroup}
         onSuccess={() => {
            showToast("Davomat muvaffaqiyatli saqlandi");
         }}
      />
    </div>
  );
}
