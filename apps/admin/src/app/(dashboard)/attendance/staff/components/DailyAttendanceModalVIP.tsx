'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { Loader2, User, CheckCircle2, XCircle, Clock, Users, GraduationCap } from "lucide-react";

const getAvatarUrl = (name: string) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
};

interface DailyAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  branchId: string;
}

export const DailyAttendanceModalVIP = ({ isOpen, onClose, date, branchId }: DailyAttendanceModalProps) => {
  const [loading, setLoading] = useState(false);
  const [staffData, setStaffData] = useState<any[]>([]);
  const [teacherData, setTeacherData] = useState<any[]>([]);
  const [stats, setStats] = useState({ staff: { present: 0, absent: 0, late: 0, total: 0 }, teachers: { present: 0, absent: 0, late: 0, total: 0 } });

  useEffect(() => {
    if (isOpen && date) {
      fetchData();
    }
  }, [isOpen, date, branchId]);

  const fetchData = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const [staffRes, teacherRes, statsRes] = await Promise.all([
        api.get(`/staff-attendance/list?type=staff&branch_id=${branchId}&date=${formattedDate}`),
        api.get(`/staff-attendance/list?type=teacher&branch_id=${branchId}&date=${formattedDate}`),
        api.get(`/staff-attendance/stats?branch_id=${branchId}&date=${formattedDate}`)
      ]);

      setStaffData(Array.isArray(staffRes.data) ? staffRes.data : staffRes.data?.data || []);
      setTeacherData(Array.isArray(teacherRes.data) ? teacherRes.data : teacherRes.data?.data || []);
      
      const s = statsRes.data;
      setStats({
        staff: {
          present: s?.staff?.find((i: any) => i.status === 'PRESENT')?._count || 0,
          absent: s?.staff?.find((i: any) => i.status === 'ABSENT')?._count || 0,
          late: s?.staff?.find((i: any) => i.status === 'LATE')?._count || 0,
          total: staffRes.data?.length || 0
        },
        teachers: {
          present: s?.teachers?.find((i: any) => i.status === 'PRESENT')?._count || 0,
          absent: s?.teachers?.find((i: any) => i.status === 'ABSENT')?._count || 0,
          late: s?.teachers?.find((i: any) => i.status === 'LATE')?._count || 0,
          total: teacherRes.data?.length || 0
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderList = (data: any[]) => {
    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
          <User className="w-12 h-12 mb-3 opacity-20" />
          <p className="text-sm font-bold uppercase tracking-widest">Ma'lumot topilmadi</p>
        </div>
      );
    }

    return (
      <div className="space-y-2 pr-2">
        {data.map((item) => (
          <div key={item.id} className="bg-white border border-zinc-100 rounded-2xl p-4 flex items-center justify-between group hover:border-zinc-200 transition-all hover:shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-xl border border-zinc-100 font-black relative overflow-hidden group-hover:bg-zinc-100 transition-colors shadow-sm">
                 {item.photo_url ? (
                   <img src={item.photo_url} alt="" className="w-full h-full object-cover" />
                 ) : (
                   <img src={getAvatarUrl(item.name)} alt="" className="w-full h-full object-contain p-1" />
                 )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-zinc-900 leading-none mb-1">{item.name}</span>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{item.position || item.specialization || 'Xodim'}</span>
              </div>
            </div>

            <div>
              {item.attendance ? (
                <Badge variant="outline" className={`
                  ${item.attendance.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    item.attendance.status === 'ABSENT' ? 'bg-[#1e3a5f]/5 text-[#1e3a5f] border-[#1e3a5f]/10' : 
                    'bg-amber-50 text-amber-600 border-amber-100'} 
                  font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-[0.1em]
                `}>
                  {item.attendance.status === 'PRESENT' ? 'Keldi' : 
                   item.attendance.status === 'ABSENT' ? 'Kelmadi' : 
                   `Kechikdi (${item.attendance.delay_time || item.attendance.late_minutes || 0} min)`}
                </Badge>
              ) : (
                <span className="text-[10px] text-zinc-300 font-black uppercase tracking-widest">Belgilanmagan</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStats = (s: any) => (
    <div className="grid grid-cols-3 gap-2 mb-6">
       <div className="bg-emerald-50/50 rounded-2xl p-3 border border-emerald-100/50 flex flex-col items-center">
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest opacity-80 mb-1">Keldi</span>
          <span className="text-lg font-black text-emerald-600 leading-none">{s.present}</span>
       </div>
       <div className="bg-amber-50/50 rounded-2xl p-3 border border-amber-100/50 flex flex-col items-center">
          <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest opacity-80 mb-1">Kechikdi</span>
          <span className="text-lg font-black text-amber-600 leading-none">{s.late}</span>
       </div>
       <div className="bg-[#1e3a5f]/5 rounded-2xl p-3 border border-[#1e3a5f]/10 flex flex-col items-center">
          <span className="text-[9px] font-black text-[#1e3a5f] uppercase tracking-widest opacity-80 mb-1">Kelmadi</span>
          <span className="text-lg font-black text-[#1e3a5f] leading-none">{s.absent}</span>
       </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden bg-zinc-50">
        <DialogHeader className="p-8 bg-white border-b border-zinc-100 relative">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-100">
                <Users className="w-6 h-6" />
             </div>
             <div>
                <DialogTitle className="text-xl font-black text-zinc-900 leading-none mb-1.5 uppercase tracking-tight">KUNLIK DAVOMAT</DialogTitle>
                {date && (
                  <p className="text-[13px] text-zinc-400 font-bold uppercase tracking-[0.1em]">
                    {format(date, 'd MMMM yyyy', { locale: uz })}
                  </p>
                )}
             </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-pink-500 mb-4" />
              <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Yuklanmoqda...</p>
            </div>
          ) : (
            <Tabs defaultValue="staff" className="w-full">
              <TabsList className="w-full h-14 bg-zinc-100 p-1.5 rounded-2xl mb-6">
                <TabsTrigger value="staff" className="flex-1 rounded-xl h-full font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" /> Xodimlar
                </TabsTrigger>
                <TabsTrigger value="teacher" className="flex-1 rounded-xl h-full font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5" /> O'qituvchilar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="staff">
                {renderStats(stats.staff)}
                <div className="overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                  {renderList(staffData)}
                </div>
              </TabsContent>

              <TabsContent value="teacher">
                {renderStats(stats.teachers)}
                <div className="overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                  {renderList(teacherData)}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
