"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  ChevronLeft, Users, Calendar, Clock, BookOpen, MapPin, 
  CheckCircle2, XCircle, AlertCircle, MoreVertical, MessageSquare, 
  Settings, History, Star, Percent, MessageCircle, Wallet, Info, Search,
  CreditCard, Trophy, Plus, Save, Edit3, Trash2, Award, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useBranch } from '@/providers/BranchProvider';
import { toast } from 'sonner';
import { AttendanceMarkingModal } from '../../components/AttendanceMarkingModal';
import { DiscountAssignModal } from '../../components/DiscountAssignModal';

// Helper for formatting currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
};

// Helper for weekdays in Uzbek
const getUzbekDayName = (dayIndex: number) => {
  const days = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
  return days[dayIndex];
};

const formatDateUz = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function GroupDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const { branchId, isReady } = useBranch();

  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('davomat');
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedStudentsForDiscount, setSelectedStudentsForDiscount] = useState<string[]>([]);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountModalTargetIds, setDiscountModalTargetIds] = useState<string[]>([]);
  const months = [
    { value: 1, label: 'Yan' }, { value: 2, label: 'Fev' }, { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Iyun' },
    { value: 7, label: 'Iyul' }, { value: 8, label: 'Avg' }, { value: 9, label: 'Sen' },
    { value: 10, label: 'Okt' }, { value: 11, label: 'Noy' }, { value: 12, label: 'Dek' }
  ];

  const fetchGroupData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/lms/groups/${groupId}`);
      setGroup(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady && groupId) {
      fetchGroupData();
    }
  }, [isReady, groupId]);

  const fetchAttendance = async () => {
    try {
      if (!group?.start_date) return;
      
      const startDate = new Date(group.start_date);
      // Use group.end_date if exists, otherwise one month from now
      const endDate = group.end_date ? new Date(group.end_date) : new Date(new Date().setMonth(new Date().getMonth() + 1));

        const res = await api.get('/attendance/range-group-details', {
          params: { 
            groupId, 
            startDate: formatDateUz(startDate),
            endDate: formatDateUz(endDate)
          }
        });
      setAttendanceData(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (groupId && group?.start_date) {
      fetchAttendance();
    }
  }, [groupId, group?.start_date]);

  // Generate all lesson days from start to end of group
  const lessonDays = useMemo(() => {
    if (!group?.schedules || !group?.start_date) return [];
    
    const startDate = new Date(group.start_date);
    const endDate = group.end_date ? new Date(group.end_date) : new Date(new Date().setMonth(new Date().getMonth() + 1));
    const scheduledDayIndexes = group.schedules.map((s: any) => s.day_of_week);
    
    const dates = [];
    const checkDate = new Date(startDate);
    
    while (checkDate <= endDate) {
      const dayIndex = checkDate.getDay(); 
      const normalizedDayIndex = dayIndex === 0 ? 7 : dayIndex;

      if (scheduledDayIndexes.includes(normalizedDayIndex)) {
        dates.push({
          day: checkDate.getDate(),
          formatted: `${checkDate.getDate().toString().padStart(2, '0')} ${months[checkDate.getMonth()].label.toLowerCase()}`,
          dateStr: formatDateUz(checkDate)
        });
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }
    
    return dates;
  }, [group]);

  useEffect(() => {
    if (activeTab === 'davomat' && lessonDays.length > 0) {
      setTimeout(() => {
        const todayStr = formatDateUz(new Date());
        let el = document.getElementById(`day-col-${todayStr}`);
        
        if (!el) {
          const closestDay = [...lessonDays].sort((a, b) => 
            Math.abs(new Date(a.dateStr).getTime() - new Date().getTime()) - 
            Math.abs(new Date(b.dateStr).getTime() - new Date().getTime())
          )[0];
          if (closestDay) {
            el = document.getElementById(`day-col-${closestDay.dateStr}`);
          }
        }

        if (el && tableContainerRef.current) {
          const container = tableContainerRef.current;
          const containerCenter = container.clientWidth / 2;
          const elCenter = el.offsetLeft + (el.clientWidth / 2);
          
          container.scrollTo({
            left: elCenter - containerCenter,
            behavior: 'smooth'
          });
        }
      }, 300);
    }
  }, [activeTab, lessonDays]);

  const students = group?.enrollments || [];

  const toggleAllStudentsDiscount = () => {
    const allIds = students.map((e: any) => e.student.id);
    if (selectedStudentsForDiscount.length === allIds.length && allIds.length > 0) {
       setSelectedStudentsForDiscount([]);
    } else {
       setSelectedStudentsForDiscount(allIds);
    }
  };

  const toggleStudentDiscountSelect = (studentId: string) => {
    setSelectedStudentsForDiscount(prev => 
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const handleDeleteDiscount = async (assignId: string) => {
    if (!confirm("Chegirmani bekor qilishni tasdiqlaysizmi?")) return;
    try {
      await api.delete(`/discounts/assign/${assignId}`);
      toast.success("Chegirma bekor qilindi");
      fetchGroupData();
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi");
    }
  };

  if (loading) {
    return <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-zinc-400 font-bold uppercase tracking-widest animate-pulse">Ma'lumotlar yuklanmoqda...</p>
    </div>;
  }

  if (!group) return <div>Guruh topilmadi</div>;

  return (
    <div 
      className="w-full h-screen overflow-hidden animate-in fade-in duration-700 font-sans bg-gray-50 selection:bg-pink-100 selection:text-pink-600 px-2 md:px-4 py-3"
    >
      <div className="flex flex-col lg:flex-row gap-4 h-full pb-2 overflow-hidden">
        
        {/* --- LEFT SIDEBAR: GROUP INFO & STUDENTS --- */}
        <aside className="w-full lg:w-[350px] flex flex-col gap-6 shrink-0 overflow-y-auto no-scrollbar pb-8">
          
          <Card className="p-6 rounded-[24px] border-none shadow-xl shadow-gray-200/40 relative overflow-hidden bg-white">
             {/* Decorative Background */}
             <div className="absolute right-0 top-0 w-32 h-32 bg-pink-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-70"></div>
             
             <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                   <div className="flex flex-col">
                      <h2 className="text-xl font-black text-gray-800 tracking-tight leading-none mb-1">{group.name}</h2>
                      <span className="text-[10px] font-black text-pink-600 uppercase tracking-widest">{group.course?.name || 'Kurs yo\'q'} • {group.current_stage || 1}/{group.total_stages || 1}-oy</span>
                   </div>
                </div>

                <div className="space-y-4 pt-2">
                   <div className="flex flex-col gap-1.5 order-first mb-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600"><Calendar size={12}/></div>
                         <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                            {group.start_date ? new Date(group.start_date).toLocaleDateString('uz-UZ', {day: 'numeric', month: 'short', year: 'numeric'}) : '--'} - {group.end_date ? new Date(group.end_date).toLocaleDateString('uz-UZ', {day: 'numeric', month: 'short', year: 'numeric'}) : '--'}
                         </span>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600"><CreditCard size={12}/></div>
                         <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                            To'lov qilinayotgan sana : <span className="text-gray-800 font-black">{group.start_date ? new Date(group.start_date).getDate() : '--'}-sana</span>
                         </span>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><Wallet size={12}/></div>
                         <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                            Pul miqdori : <span className="text-gray-800 font-black">{formatCurrency(group.price)}</span>
                         </span>
                      </div>
                   </div>

                   <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-xl border-2 border-white shadow-sm ring-1 ring-gray-100">
                         {group.teacher?.user?.photo_url && <AvatarImage src={group.teacher.user.photo_url} />}
                         <AvatarFallback className="bg-pink-50 text-pink-600 text-[10px] font-black">
                            {group.teacher?.user?.first_name?.[0]}{group.teacher?.user?.last_name?.[0] || 'T'}
                         </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">O'qituvchi</span>
                         <span className="text-xs font-bold text-gray-700">
                           {group.teacher?.user ? `${group.teacher.user.first_name} ${group.teacher.user.last_name || ''}` : 'Tayinlanmagan'}
                         </span>
                      </div>
                   </div>

                   <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-50/50 flex items-center justify-center text-orange-500 border border-orange-100"><Clock size={16}/></div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Dars Vaqti</span>
                         <span className="text-xs font-bold text-gray-700">
                           {group.schedules?.[0]?.start_time || '--:--'} - {group.schedules?.[0]?.end_time || '--:--'}
                         </span>
                      </div>
                   </div>

                   <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50/50 flex items-center justify-center text-indigo-500 border border-indigo-100"><MapPin size={16}/></div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Xona</span>
                         <span className="text-xs font-bold text-gray-700">
                           {group.room?.name || group.schedules?.[0]?.room?.name || 'Xona tayinlanmagan'}
                         </span>
                      </div>
                   </div>
                </div>

                <div className="pt-4 border-t border-gray-100/50">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">O'tilgan darslar</span>
                      <span className="text-xs font-black text-pink-600">{group.current_stage || 0} ta</span>
                   </div>
                   <p className="text-[10px] text-gray-400 font-bold mt-1">
                     Hafta kunlari: <span className="text-emerald-500">{group.schedules?.length > 0 ? group.schedules.map((s: any) => getUzbekDayName(s.day_of_week)).join(', ') : 'Belgilanmagan'}</span>
                   </p>
                </div>
             </div>
          </Card>

          {/* Student Status Legend */}
          <div className="flex items-center gap-3 flex-wrap px-2">
             <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-600/20"></span><span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Qarzdorlar</span></div>
             <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-500/20"></span><span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">sinov darsida</span></div>
             <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-600/20"></span><span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">faol</span></div>
             <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 border border-blue-500/20"></span><span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">muzlatilgan</span></div>
          </div>

          {/* Student List */}
          <div className="flex flex-col gap-2">
             <div className="space-y-0.5">
                {students.map((e: any, idx: number) => {
                  const hasDebt = (e.student?.invoices?.length || 0) > 0;
                  const isTrial = e.student?.status === 'TRIAL';
                  const isFrozen = e.status === 'FROZEN';
                  
                  const statusColor = hasDebt 
                    ? 'bg-rose-500 border-rose-600/20' 
                    : isTrial 
                      ? 'bg-amber-400 border-amber-500/20'
                      : isFrozen 
                        ? 'bg-blue-400 border-blue-500/20' 
                        : 'bg-emerald-500 border-emerald-600/20';
                  
                  return (
                    <motion.div 
                      key={e.id} 
                      className="flex items-center justify-between p-2 rounded-xl group hover:bg-gray-50 transition-all cursor-pointer"
                    >
                       <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-gray-300 w-4">{idx + 1}</span>
                          <div className={cn("w-2.5 h-2.5 rounded-full border shadow-sm", statusColor)}></div>
                          <div className="flex flex-col">
                             <span className="text-[13px] font-bold text-gray-700 group-hover:text-pink-600 transition-colors truncate max-w-[150px]">
                               {e.student?.user?.first_name} {e.student?.user?.last_name}
                             </span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 font-bold">({e.student?.user?.phone?.substring(e.student.user.phone.length - 7) || '--- ----'})</span>
                          <Button size="icon" variant="ghost" className="h-6 w-6 rounded-lg text-gray-300 group-hover:text-pink-500 transition-all"><MoreVertical size={12}/></Button>
                       </div>
                    </motion.div>
                  );
                })}
             </div>
             <button className="w-full py-2 text-[10px] font-black text-gray-400 uppercase hover:text-pink-600 transition-all tracking-[1.5px] text-left px-4">+arxivlanganlar</button>
          </div>
        </aside>

        {/* --- RIGHT CONTENT AREA --- */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white rounded-[24px] shadow-sm border border-gray-100 relative">
           
           <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="px-8 border-b border-gray-100 bg-gray-50/30">
                 <TabsList className="bg-transparent h-[60px] p-0 flex gap-8 items-center">
                    <TabsTrigger 
                      value="davomat"
                      className="relative h-[60px] bg-transparent border-none rounded-none text-sm font-bold text-gray-400 data-[state=active]:text-pink-600 data-[state=active]:bg-transparent px-0 transition-all"
                    >
                      Davomat
                      {activeTab === 'davomat' && (
                        <motion.div 
                          layoutId="tab-underline-main"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-t-full shadow-[0_-1px_5px_rgba(236,72,153,0.3)]"
                        />
                      )}
                    </TabsTrigger>

                    <TabsTrigger 
                      value="chegirma"
                      className="relative h-[60px] bg-transparent border-none rounded-none text-sm font-bold text-gray-400 data-[state=active]:text-pink-600 data-[state=active]:bg-transparent px-0 transition-all"
                    >
                      Chegirma
                      {activeTab === 'chegirma' && (
                        <motion.div 
                          layoutId="tab-underline-main"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-t-full shadow-[0_-1px_5px_rgba(236,72,153,0.3)]"
                        />
                      )}
                    </TabsTrigger>

                    <TabsTrigger 
                      value="baholar"
                      className="relative h-[60px] bg-transparent border-none rounded-none text-sm font-bold text-gray-400 data-[state=active]:text-pink-600 data-[state=active]:bg-transparent px-0 transition-all"
                    >
                      Baholar
                      {activeTab === 'baholar' && (
                        <motion.div 
                          layoutId="tab-underline-main"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-t-full shadow-[0_-1px_5px_rgba(236,72,153,0.3)]"
                        />
                      )}
                    </TabsTrigger>
                 </TabsList>
              </div>

              <TabsContent value="davomat" className="flex-1 m-0 p-4 data-[state=active]:flex flex-col overflow-y-auto no-scrollbar min-h-0 outline-none border-none">
                    
                    {/* Attendance Grid Header */}
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-gray-800 tracking-tight">Guruh Davomadi</h3>
                       </div>

                       <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl gap-2 shadow-lg shadow-pink-200"
                            onClick={() => setIsAttendanceModalOpen(true)}
                          >
                             <Plus size={16} /> Davomat olish
                          </Button>
                       </div>
                    </div>

                    {/* The Grid Table */}
                    <div className="flex flex-col flex-1 overflow-hidden border border-gray-100 rounded-xl bg-white shadow-sm">
                       <div ref={tableContainerRef} className="flex-1 overflow-x-auto overflow-y-auto no-scrollbar scroll-smooth">
                          <table className="w-full border-collapse">
                             <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                   <th className="sticky left-0 z-20 bg-gray-50 py-4 px-6 min-w-[220px] text-left text-[11px] font-black text-gray-500 uppercase tracking-widest border-r border-gray-100">TALABALAR</th>
                                   {lessonDays.map(d => (
                                     <th 
                                       key={d.dateStr} 
                                       id={`day-col-${d.dateStr}`}
                                       className="py-4 px-2 min-w-[55px] text-center text-[10px] font-bold text-gray-400 uppercase tracking-tight border-r border-gray-100/50"
                                     >
                                       {d.formatted}
                                     </th>
                                   ))}
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-100/50">
                                {students.map((e: any, sIdx: number) => (
                                  <tr key={e.id} className="hover:bg-gray-50/30 transition-all">
                                     <td className="sticky left-0 z-10 bg-white py-3.5 px-6 border-r border-gray-100 font-bold text-gray-700 font-poppins">
                                        <div className="flex items-center gap-4">
                                           <span className="text-[10px] font-black text-gray-300 w-3">{sIdx + 1}</span>
                                           <span className="text-[13px] truncate max-w-[160px] tracking-tight">{e.student?.user?.first_name} {e.student?.user?.last_name}</span>
                                        </div>
                                     </td>
                                     {lessonDays.map(d => {
                                       const stdAtnd = attendanceData?.students?.find((s: any) => s.enrollmentId === e.id);
                                       const hasAttendance = stdAtnd?.attendances?.find((a: any) => a.date?.split('T')[0] === d.dateStr);
                                       
                                       const status = hasAttendance?.status;
                                       
                                       return (
                                         <td key={d.dateStr} className="py-3 px-2 text-center border-r border-gray-100/30">
                                            <div className="flex items-center justify-center">
                                               {status === 'PRESENT' ? (
                                                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                                                     <CheckCircle2 size={13} />
                                                  </div>
                                               ) : status === 'LATE' ? (
                                                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm">
                                                     <Clock size={13} />
                                                  </div>
                                               ) : status === 'ABSENT' ? (
                                                  <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm">
                                                     <XCircle size={15} />
                                                  </div>
                                               ) : (
                                                  <div className="w-6 h-6 rounded-lg bg-gray-50 border border-gray-100"></div>
                                               )}
                                            </div>
                                         </td>
                                       );
                                     })}
                                  </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="baholar" className="flex-1 m-0 p-8 data-[state=active]:flex flex-col overflow-y-auto no-scrollbar min-h-0 outline-none border-none">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-xl font-black text-gray-800 tracking-tight">O'quvchilar Baholari & Reytingi</h3>
                       <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="rounded-xl border-gray-200 font-bold text-gray-600">Eksport</Button>
                       </div>
                    </div>

                    <div className="flex-1 flex flex-col border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-sm">
                       <table className="w-full border-collapse">
                          <thead>
                             <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="py-4 px-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest w-16">#</th>
                                <th className="py-4 px-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Talaba</th>
                                <th className="py-4 px-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">O'rtacha Ball</th>
                                <th className="py-4 px-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Umumiy Ball</th>
                                <th className="py-4 px-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                             {students
                               .map((e: any) => {
                                 const stdAtnd = attendanceData?.students?.find((s: any) => s.enrollmentId === e.id);
                                 const totalScore = stdAtnd?.attendances?.reduce((acc: number, a: any) => acc + (a.score || 0), 0) || 0;
                                 const avgScore = stdAtnd?.attendances?.length > 0 ? totalScore / stdAtnd.attendances.filter((a: any) => a.score).length : 0;
                                 return { ...e, totalScore, avgScore: isNaN(avgScore) ? 0 : avgScore };
                               })
                               .sort((a: any, b: any) => b.totalScore - a.totalScore)
                               .map((e: any, idx: number) => (
                                 <tr key={e.id} className="hover:bg-gray-50 transition-all group">
                                    <td className="py-4 px-6 text-sm font-black text-gray-300">
                                       {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                                    </td>
                                    <td className="py-4 px-6">
                                       <div className="flex items-center gap-3">
                                          <Avatar className="h-8 w-8 rounded-xl ring-2 ring-white shadow-sm shrink-0">
                                             {e.student?.user?.photo_url && <AvatarImage src={e.student.user.photo_url} />}
                                             <AvatarFallback className="bg-gray-50 text-gray-400 text-[10px] font-bold">
                                                {e.student?.user?.first_name?.[0]}{e.student?.user?.last_name?.[0]}
                                             </AvatarFallback>
                                          </Avatar>
                                          <div className="flex flex-col">
                                             <span className="text-sm font-black text-gray-700 group-hover:text-pink-600 transition-colors">{e.student?.user?.first_name} {e.student?.user?.last_name}</span>
                                             <span className="text-[10px] font-bold text-gray-400">{e.student?.user?.phone}</span>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                       <Badge variant="outline" className="rounded-lg bg-pink-50/50 border-pink-100 text-pink-600 font-bold text-[10px]">
                                          {e.avgScore.toFixed(1)}
                                       </Badge>
                                    </td>
                                    <td className="py-4 px-6 text-center text-sm font-black text-gray-800">
                                       {e.totalScore}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                       <div className={cn(
                                          "inline-flex h-2 w-2 rounded-full",
                                          e.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-300'
                                       )}></div>
                                    </td>
                                 </tr>
                               ))
                             }
                          </tbody>
                       </table>
                    </div>
                  </TabsContent>

                 <TabsContent value="chegirma" className="flex-1 m-0 p-8 data-[state=active]:flex flex-col overflow-y-auto no-scrollbar min-h-0 outline-none border-none">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-xl font-black text-gray-800 tracking-tight">O'quvchilar Chegirmalari</h3>
                       {selectedStudentsForDiscount.length > 0 && (
                          <Button 
                            size="sm" 
                            className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold shadow-lg shadow-pink-100"
                            onClick={() => {
                               setDiscountModalTargetIds(selectedStudentsForDiscount);
                               setIsDiscountModalOpen(true);
                            }}
                          >
                             {selectedStudentsForDiscount.length} ta o'quvchiga chegirma biriktirish
                          </Button>
                       )}
                    </div>

                    <div className="flex-1 flex flex-col border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-sm">
                       <table className="w-full border-collapse">
                          <thead>
                             <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="py-4 px-6 text-left w-12">
                                   <input 
                                      type="checkbox" 
                                      className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500 cursor-pointer" 
                                      checked={selectedStudentsForDiscount.length === students.length && students.length > 0}
                                      onChange={toggleAllStudentsDiscount}
                                   />
                                </th>
                                <th className="py-4 px-2 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest w-12">#</th>
                                <th className="py-4 px-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">O'quvchi</th>
                                <th className="py-4 px-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Chegirmalar</th>
                                <th className="py-4 px-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest w-16">Harakat</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                             {students.map((e: any, sIdx: number) => {
                               const discounts = e.student?.discounts || [];
                               return (
                                 <tr key={e.id} className="hover:bg-gray-50 transition-all group">
                                    <td className="py-4 px-6">
                                       <input 
                                          type="checkbox" 
                                          className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                                          checked={selectedStudentsForDiscount.includes(e.student.id)}
                                          onChange={() => toggleStudentDiscountSelect(e.student.id)}
                                       />
                                    </td>
                                    <td className="py-4 px-2 text-[11px] font-black text-gray-300">{sIdx + 1}</td>
                                    <td className="py-4 px-6">
                                       <div className="flex flex-col">
                                          <span className="text-sm font-black text-gray-700 group-hover:text-pink-600 transition-colors">{e.student?.user?.first_name} {e.student?.user?.last_name}</span>
                                          <span className="text-[10px] font-bold text-gray-400">{e.student?.user?.phone}</span>
                                       </div>
                                    </td>
                                    <td className="py-4 px-6">
                                       {discounts.length > 0 ? (
                                          <div className="flex flex-wrap gap-2">
                                             {discounts.map((sd: any) => (
                                                <div key={sd.id} className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-2 py-1.5 rounded-lg group/badge relative overflow-hidden">
                                                   <div className="flex flex-col">
                                                      <span className="text-[10px] font-black text-emerald-700 uppercase leading-none">{sd.discount?.name}</span>
                                                      <span className="text-[9px] font-bold text-emerald-600/70 mt-0.5">
                                                         -{sd.discount?.type === 'PERCENT' ? `${sd.discount.value}%` : formatCurrency(sd.discount.value)}
                                                      </span>
                                                   </div>
                                                   <div className="w-px h-6 bg-emerald-200 mx-1"></div>
                                                   <button 
                                                     onClick={() => handleDeleteDiscount(sd.id)}
                                                     className="text-emerald-500 hover:text-rose-500 transition-colors bg-white rounded-full p-0.5 hover:bg-rose-50 border border-emerald-100 shadow-sm"
                                                   >
                                                      <XCircle size={14} />
                                                   </button>
                                                </div>
                                             ))}
                                          </div>
                                       ) : (
                                          <span className="text-[10px] font-bold text-gray-400">Yo'q</span>
                                       )}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                       <Button 
                                         size="icon" 
                                         variant="ghost" 
                                         className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 text-pink-500 hover:text-pink-600 hover:bg-pink-50 transition-all"
                                         onClick={() => {
                                            setDiscountModalTargetIds([e.student.id]);
                                            setIsDiscountModalOpen(true);
                                         }}
                                       >
                                          <Plus size={18} />
                                       </Button>
                                    </td>
                                 </tr>
                               );
                             })}
                             {students.length === 0 && (
                               <tr>
                                  <td colSpan={5} className="py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                                     O'quvchilar mavjud emas
                                  </td>
                               </tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                  </TabsContent>

              <AttendanceMarkingModal 
                isOpen={isAttendanceModalOpen}
                onClose={() => setIsAttendanceModalOpen(false)}
                group={group}
                onSuccess={() => {
                  fetchGroupData();
                  fetchAttendance();
                }}
              />
              <DiscountAssignModal
                 isOpen={isDiscountModalOpen}
                 onClose={() => {
                   setIsDiscountModalOpen(false);
                   setDiscountModalTargetIds([]);
                   setSelectedStudentsForDiscount([]);
                 }}
                 selectedStudentIds={discountModalTargetIds}
                 studentsCount={discountModalTargetIds.length}
                 onSuccess={() => {
                   fetchGroupData();
                 }}
              />
           </Tabs>
        </main>

      </div>
    </div>
  );
}
