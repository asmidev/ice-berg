"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  TeacherProfileCardVIP, 
  TeacherPersonalInfoVIP, 
  WorkloadSummaryVIP,
  TeacherScheduleVIP,
  FinancialSummaryVIP,
  TeacherCalendarVIP,
  GroupInsightsVIP,
  TeacherPerformanceVIP,
  TeacherPenaltiesVIP
} from './components/TeacherDetailsVIP';

export default function TeacherDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const branchId = searchParams.get('branch_id') || 'all';
  
  const now = new Date();
  const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : now.getMonth();
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : now.getFullYear();

  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];

  useEffect(() => {
    const fetchTeacher = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/teachers/${id}?branch_id=${branchId}&month=${month}&year=${year}`);
        setTeacher(res.data?.data || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [id, branchId, month, year]);

  const handlePeriodChange = (newMonth: number, newYear: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('month', newMonth.toString());
    params.set('year', newYear.toString());
    router.push(`?${params.toString()}`);
  };

  if (loading && !teacher) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  if (!teacher && !loading) return <div className="p-20 text-center font-black uppercase text-zinc-400 tracking-widest">Ustoz topilmadi</div>;

  return (
    <div className="w-full mx-auto pb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000 p-0 lg:p-4">
      
      {/* 📅 PERIOD SELECTOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-3xl shadow-sm border border-zinc-50">
          <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">Ustoz tahlili: {months[month]} {year}</h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Davriy statistika va tahlillar</p>
          </div>
          
          <div className="flex items-center gap-2">
              <select 
                value={month} 
                onChange={(e) => handlePeriodChange(parseInt(e.target.value), year)}
                className="bg-zinc-50 border-none text-[12px] font-black text-gray-700 p-2.5 px-4 rounded-2xl focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
              >
                  {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select 
                value={year} 
                onChange={(e) => handlePeriodChange(month, parseInt(e.target.value))}
                className="bg-zinc-50 border-none text-[12px] font-black text-gray-700 p-2.5 px-4 rounded-2xl focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
              >
                  {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 📋 LEFT COLUMN (3/12) - Profile & Basic Info */}
        <div className="lg:col-span-3 space-y-6 animate-in slide-in-from-left-10 duration-700">
          <TeacherProfileCardVIP teacher={teacher} />
          <TeacherPersonalInfoVIP teacher={teacher} />
          <TeacherPenaltiesVIP penalties={teacher.penalties || []} />
        </div>

        {/* 📊 MIDDLE COLUMN (6/12) - Main Stats & Schedule */}
        <div className="lg:col-span-6 space-y-6 animate-in zoom-in-95 duration-700">
          {loading ? (
             <div className="bg-white p-20 rounded-3xl flex items-center justify-center opacity-40">
                <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
             </div>
          ) : (
            <>
              <WorkloadSummaryVIP data={teacher.workloadStats || []} />
              <TeacherScheduleVIP schedule={teacher.weeklySchedule || []} />
              <FinancialSummaryVIP summary={teacher.financialSummary} />
            </>
          )}
        </div>

        {/* 📈 RIGHT COLUMN (3/12) - Performance & Calendar */}
        <div className="lg:col-span-3 space-y-6 animate-in slide-in-from-right-10 duration-700">
          <TeacherCalendarVIP calendarData={teacher.calendarData} onPeriodChange={handlePeriodChange} />
          <GroupInsightsVIP teacher={teacher} />
          <TeacherPerformanceVIP performance={teacher.performance} />
        </div>

      </div>
    </div>
  );
}
