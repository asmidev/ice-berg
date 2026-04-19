'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBranch } from '@/providers/BranchProvider';

export default function StaffAttendanceReminder() {
  const [show, setShow] = useState(false);
  const { branchId } = useBranch();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const checkAttendance = async () => {
    if (!user || user.role !== 'super-admin') return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await api.get(`/staff-attendance/stats?branch_id=${branchId}&date=${today}`);
      
      const { staff, teachers } = res.data;
      
      // If no attendance marked at all (all status counts are 0 or empty)
      const isStaffMarked = staff && staff.length > 0;
      const isTeachersMarked = teachers && teachers.length > 0;

      if (!isStaffMarked || !isTeachersMarked) {
        setShow(true);
      } else {
        setShow(false);
      }
    } catch (err) {
      console.error('Failed to check attendance:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'super-admin') {
      // Initial check
      checkAttendance();

      // Check every hour (3600000 ms)
      const interval = setInterval(checkAttendance, 3600000);
      return () => clearInterval(interval);
    }
  }, [user, branchId]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-10 duration-500">
      <div className="bg-white border-2 border-pink-500 rounded-2xl shadow-2xl p-5 w-[320px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full -mr-12 -mt-12 pointer-events-none" />
        
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 flex-shrink-0 animate-bounce">
            <Bell className="w-6 h-6" />
          </div>
          
          <div className="flex-1">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-1">Davomat Eslatmasi!</h4>
            <p className="text-[12px] text-gray-500 font-bold leading-relaxed">
              Bugun uchun xodimlar va o'qituvchilar davomati hali yakunlanmagan.
            </p>
            
            <div className="flex items-center gap-2 mt-4">
              <Button 
                onClick={() => window.location.href = `/attendance/staff?branch_id=${branchId}`}
                className="h-9 px-4 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-pink-100 flex-1"
              >
                Davomat qilish
              </Button>
              <button 
                onClick={() => setShow(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors border border-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
