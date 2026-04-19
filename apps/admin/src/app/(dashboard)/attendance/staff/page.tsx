"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useBranch } from "@/providers/BranchProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Filter, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { AttendanceStatsVIP } from "./components/AttendanceStatsVIP";
import { AttendanceTableVIP } from "./components/AttendanceTableVIP";
import { AttendanceCalendarVIP } from "./components/AttendanceCalendarVIP";
import { DelayMinutesModal } from "./components/DelayMinutesModal";
import { DailyAttendanceModalVIP } from "./components/DailyAttendanceModalVIP";
import { toast } from "sonner";

export default function StaffAttendancePage() {
  const { branchId, setBranchId } = useBranch();
  const [date, setDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'staff' | 'teacher'>('staff');
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [staffData, setStaffData] = useState<any[]>([]);
  const [teacherData, setTeacherData] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0 });
  const [selectedPerson, setSelectedPerson] = useState<{id: string, name: string} | null>(null);
  
  const [delayModal, setDelayModal] = useState<{ isOpen: boolean; staffId: string; name: string } | null>(null);
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; date: Date | null } | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [branchId, date, activeTab]);

  const fetchInitialData = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const [listRes, statsRes] = await Promise.all([
        api.get(`/staff-attendance/list?type=${activeTab}&branch_id=${branchId}&date=${formattedDate}`),
        api.get(`/staff-attendance/stats?branch_id=${branchId}&date=${formattedDate}`)
      ]);

      const list = Array.isArray(listRes.data) ? listRes.data : (listRes.data?.data || []);

      if (activeTab === 'staff') {
        setStaffData(list);
        if (list.length > 0 && !selectedPerson) {
          setSelectedPerson({ id: list[0].id, name: list[0].name });
        }
      } else {
        setTeacherData(list);
        if (list.length > 0 && !selectedPerson) {
          setSelectedPerson({ id: list[0].id, name: list[0].name });
        }
      }

      const s = statsRes.data?.[activeTab === 'staff' ? 'staff' : 'teachers'];
      const summary = {
        total: list.length,
        present: s?.find((i: any) => i.status === 'PRESENT')?._count || 0,
        absent: s?.find((i: any) => i.status === 'ABSENT')?._count || 0,
        late: s?.find((i: any) => i.status === 'LATE')?._count || 0,
      };
      setStats(summary);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (id: string, status: 'PRESENT' | 'ABSENT' | 'LATE', delayTime?: number) => {
    if (status === 'LATE' && delayTime === undefined) {
      const item = activeTab === 'staff' ? staffData.find(s => s.id === id) : teacherData.find(t => t.id === id);
      setDelayModal({ isOpen: true, staffId: id, name: item?.name || 'Xodim' });
      return;
    }

    try {
      await api.post('/staff-attendance/mark', {
        type: activeTab,
        staffId: activeTab === 'staff' ? id : undefined,
        teacherId: activeTab === 'teacher' ? id : undefined,
        branchId,
        date: format(date, 'yyyy-MM-dd'),
        status,
        delayTime: delayTime || 0
      });
      toast.success('Davomat saqlandi');
      fetchAttendance();
    } catch (err) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    setDate(newDate);
  };

  return (
    <div className="flex flex-col space-y-6 pb-12 w-full mx-auto animate-in fade-in duration-700 h-full overflow-y-auto custom-scrollbar px-1 pt-[5px]">
      
      {/* 📊 High-Density Stats */}
      <AttendanceStatsVIP stats={stats} loading={loading} />

      {/* 🧭 Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <AttendanceTableVIP 
            data={activeTab === 'staff' ? staffData : teacherData} 
            loading={loading} 
            onMark={markAttendance}
            type={activeTab}
            onTabChange={(tab) => { setActiveTab(tab); setSelectedPerson(null); }}
            onRowClick={(person) => setSelectedPerson(person)}
            selectedId={selectedPerson?.id}
          />
        </div>
        
        <div className="lg:col-span-1">
           {selectedPerson ? (
             <AttendanceCalendarVIP 
                staffId={selectedPerson.id} 
                name={selectedPerson.name} 
                type={activeTab} 
                onDateClick={(d) => setDetailsModal({ isOpen: true, date: d })}
             />
           ) : (
             <div className="h-[400px] bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-400 text-sm font-bold uppercase tracking-widest">
               Xodimni tanlang
             </div>
           )}
        </div>
      </div>

      {delayModal && (
        <DelayMinutesModal 
          isOpen={delayModal.isOpen}
          onClose={() => setDelayModal(null)}
          onSubmit={(min) => markAttendance(delayModal.staffId, 'LATE', min)}
          name={delayModal.name}
        />
      )}
      {detailsModal && (
        <DailyAttendanceModalVIP 
          isOpen={detailsModal.isOpen}
          onClose={() => setDetailsModal(null)}
          date={detailsModal.date}
          branchId={branchId}
        />
      )}
    </div>
  );
}
