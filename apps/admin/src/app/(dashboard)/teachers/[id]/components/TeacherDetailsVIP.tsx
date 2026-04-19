"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  Mail, Phone, MapPin, Calendar as CalendarIcon, 
  ChevronRight, Award, FileText, Download,
  CheckCircle2, Clock, MoreHorizontal, User,
  TrendingUp, Star, ShieldAlert, AlertCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

// --- LEFT COLUMN COMPONENTS ---

export const TeacherProfileCardVIP = ({ teacher }: { teacher: any }) => (
  <Card className="p-8 border-none shadow-xl shadow-zinc-200/40 bg-white rounded-3xl relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-12 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
    
    <div className="relative z-10 flex flex-col items-center">
      <div className="w-32 h-32 rounded-2xl bg-indigo-100 p-1 mb-6 rotate-3 group-hover:rotate-0 transition-all duration-500 shadow-xl shadow-indigo-100/50 overflow-hidden">
        {teacher.user?.photo_url ? (
          <img src={teacher.user.photo_url} alt="" className="w-full h-full object-cover rounded-xl" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-black text-indigo-500 bg-indigo-50">
            {teacher.user?.first_name?.[0]}
          </div>
        )}
      </div>

      <h2 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">
        {teacher.user?.first_name} {teacher.user?.last_name}
      </h2>
      
      <div className="flex items-center gap-2 mb-8">
        <span className="text-[10px] font-black px-3 py-1 bg-zinc-100 text-zinc-500 rounded-lg tracking-widest uppercase">
          T-{teacher.id.slice(0, 4).toUpperCase()}
        </span>
        <span className="text-[10px] font-black px-3 py-1 bg-cyan-50 text-cyan-600 rounded-lg tracking-widest uppercase">
          {teacher.type === 'MAIN' ? 'To\'liq stavka' : 'O\'rindosh'}
        </span>
      </div>

      <div className="w-full space-y-4 pt-6 border-t border-zinc-50">
         <div className="flex justify-between items-center bg-zinc-50/50 p-3 rounded-2xl">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Mutaxassisligi</span>
            <span className="text-[13px] font-black text-gray-800">{teacher.specialization || 'Ingliz tili'}</span>
         </div>
         <div className="flex flex-col gap-2 bg-zinc-50/50 p-3 rounded-2xl">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Guruhlar</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
               {Array.isArray(teacher.currentClasses) && teacher.currentClasses.length > 0 ? (
                 teacher.currentClasses.map((c: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-white text-[11px] font-black text-indigo-600 rounded-lg border border-indigo-50 shadow-sm">
                       {c}
                    </span>
                 ))
               ) : (
                 <span className="text-[11px] font-bold text-zinc-400">Guruhlar yo'q</span>
               )}
            </div>
         </div>
      </div>
    </div>
  </Card>
);

export const TeacherPersonalInfoVIP = ({ teacher }: { teacher: any }) => (
  <Card className="p-8 border-none shadow-xl shadow-zinc-200/40 bg-white rounded-3xl mt-6">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Shaxsiy ma'lumotlar</h3>
    </div>

    <div className="space-y-6">
       {[
         { icon: User, label: 'Jinsi', value: teacher.user?.gender === 'MALE' ? 'Erkak' : teacher.user?.gender === 'FEMALE' ? 'Ayol' : 'Noma\'lum', color: 'bg-indigo-50 text-indigo-500' },
         { icon: CalendarIcon, label: 'Tug\'ilgan sana', value: teacher.date_of_birth ? new Date(teacher.date_of_birth).toLocaleDateString() : 'Noma\'lum', color: 'bg-cyan-50 text-cyan-500' },
         { icon: Mail, label: 'Elektron pochta', value: teacher.user?.email || 'Noma\'lum', color: 'bg-teal-50 text-teal-500' },
         { icon: Phone, label: 'Telefon raqami', value: teacher.user?.phone || 'Noma\'lum', color: 'bg-amber-50 text-amber-500' },
         { icon: MapPin, label: 'Manzil', value: teacher.description || 'Noma\'lum', color: 'bg-rose-50 text-rose-500' },
       ].map((item, i) => (
         <div key={i} className="flex items-center gap-4 group">
            <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
               <item.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">{item.label}</p>
               <p className="text-[13px] font-bold text-gray-800 truncate">{item.value}</p>
            </div>
         </div>
       ))}
    </div>
  </Card>
);

// --- CENTER COLUMN COMPONENTS ---

export const WorkloadSummaryVIP = ({ data }: { data: any }) => (
  <Card className="p-8 border-none shadow-xl shadow-zinc-200/40 bg-white rounded-3xl">
    <div className="flex items-center justify-between mb-8">
       <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Ish yuklamasi tahlili</h3>
          <div className="flex items-center gap-6 mt-3">
             <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-100 border-2 border-cyan-400" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Dars soatlari</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-pink-100 border-2 border-pink-500" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">O'rtacha yuklama</span>
             </div>
          </div>
       </div>
    </div>

    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
            dy={10}
          />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '15px' }}
          />
          <Area type="monotone" dataKey="value" stroke="#0891B2" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

export const TeacherScheduleVIP = ({ schedule }: { schedule: any[] }) => (
   <Card className="p-8 border-none shadow-xl shadow-zinc-200/40 bg-white rounded-3xl mt-6">
      <div className="flex items-center justify-between mb-8">
         <h3 className="text-xl font-black text-gray-900 tracking-tight">Haftalik dars jadvali</h3>
      </div>

      <div className="overflow-x-auto">
         <table className="w-full border-separate border-spacing-2">
            <thead>
               <tr>
                  <th className="text-[10px] font-black text-zinc-300 uppercase tracking-widest text-left p-2">Vaqt</th>
                  {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map(day => (
                     <th key={day} className="text-[10px] font-black text-zinc-400 uppercase tracking-widest p-2">{day}</th>
                  ))}
               </tr>
            </thead>
            <tbody>
               {schedule && schedule.length > 0 ? (
                 schedule.map((row: any, i) => (
                    <tr key={i}>
                       <td className="text-[11px] font-bold text-zinc-400 p-2">{row.time}</td>
                       {['du', 'se', 'ch', 'pa', 'ju', 'sh', 'ya'].map(day => (
                          <td key={day}>
                             {row[day] && (
                                <div className={`p-4 rounded-2xl border bg-indigo-50 text-indigo-600 border-indigo-100 text-center font-black text-[12px] shadow-sm`}>
                                   {row[day]}
                                </div>
                             )}
                          </td>
                       ))}
                    </tr>
                 ))
               ) : (
                 <tr>
                    <td colSpan={8} className="text-center py-10 text-zinc-300 font-bold uppercase text-[10px] tracking-widest">Ma'lumot mavjud emas</td>
                 </tr>
               )}
            </tbody>
         </table>
      </div>
   </Card>
);

export const FinancialSummaryVIP = ({ summary }: { summary: any }) => (
   <Card className="p-8 border-none shadow-xl shadow-zinc-200/40 bg-white rounded-3xl mt-6">
      <div className="flex items-center justify-between mb-8">
         <h3 className="text-xl font-black text-gray-900 tracking-tight">Moliya xulosasi</h3>
         <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-lg uppercase tracking-widest">Joriy oy</span>
      </div>

      <div className="space-y-6">
         {[
            { label: 'Asosiy ish haqi', val: summary?.totalSalary || 0, color: 'text-gray-800' },
            { label: 'Bonuslar', val: summary?.bonusTotal || 0, color: 'text-emerald-500' },
            { label: 'Jarimalar', val: summary?.penaltyTotal || 0, color: 'text-rose-500', prefix: '-' },
         ].map((item, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-all">
               <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{item.label}</span>
               <span className={`text-[13px] font-black ${item.color}`}>{item.prefix || ''}{Number(item.val).toLocaleString()} UZS</span>
            </div>
         ))}
         
         <div className="pt-4 border-t border-zinc-100 flex justify-between items-center px-2">
            <span className="text-[12px] font-black text-gray-900 uppercase tracking-widest text-indigo-500">To'lanadigan</span>
            <span className="text-xl font-black text-gray-900">{Number(summary?.netPay || 0).toLocaleString()} UZS</span>
         </div>
      </div>
   </Card>
);

// --- RIGHT COLUMN COMPONENTS ---

export const TeacherCalendarVIP = ({ calendarData, onPeriodChange }: { calendarData: any, onPeriodChange: (m: number, y: number) => void }) => {
   const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
   const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
   const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay(); // 0 is Sun
   
   const month = calendarData?.month ?? new Date().getMonth();
   const year = calendarData?.year ?? new Date().getFullYear();
   const days = Array.from({ length: daysInMonth(month, year) });
   
   // Adjust firstDayOfMonth to match our D, S, C... order where D is Monday?
   // Actually D, S, C, P, J, S, Y is Du, Se, Ch, Pa, Ju, Sh, Ya. (Mon-Sun)
   let firstDayIdx = firstDayOfMonth(month, year);
   firstDayIdx = firstDayIdx === 0 ? 6 : firstDayIdx - 1; // 0=Mon, 6=Sun

   const emptySlots = Array.from({ length: firstDayIdx });

   const handlePrev = () => {
      const nm = month === 0 ? 11 : month - 1;
      const ny = month === 0 ? year - 1 : year;
      onPeriodChange(nm, ny);
   };

   const handleNext = () => {
      const nm = month === 11 ? 0 : month + 1;
      const ny = month === 11 ? year + 1 : year;
      onPeriodChange(nm, ny);
   };

   return (
      <Card className="p-6 border-none shadow-xl shadow-zinc-200/40 bg-white rounded-3xl">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-gray-400 tracking-tight uppercase tracking-widest">{months[month]} {year}</h3>
            <div className="flex items-center gap-1">
                <button onClick={handlePrev} className="p-1 hover:bg-zinc-100 rounded-lg transition-all text-zinc-400"><ChevronRight className="w-4 h-4 rotate-180" /></button>
                <button onClick={handleNext} className="p-1 hover:bg-zinc-100 rounded-lg transition-all text-zinc-400"><ChevronRight className="w-4 h-4" /></button>
            </div>
         </div>

         <div className="grid grid-cols-7 text-center gap-1 mb-4">
            {['D','S','C','P','J','S','Y'].map(d => <span key={d} className="text-[10px] font-black text-zinc-200 uppercase">{d}</span>)}
            {emptySlots.map((_, i) => <div key={`empty-${i}`} className="h-8" />)}
            {days.map((_, i) => {
               const day = i + 1;
               const status = calendarData?.days?.[day];
               
               let style = 'text-gray-600 hover:bg-zinc-50';
               if (status === 'PRESENT') style = 'bg-cyan-500 text-white shadow-lg shadow-cyan-200';
               if (status === 'LATE') style = 'bg-pink-500 text-white shadow-lg shadow-pink-200';
               if (status === 'ABSENT') style = 'bg-indigo-500 text-white shadow-lg shadow-indigo-200';

               return (
                  <div key={day} className={`h-8 flex items-center justify-center text-[11px] font-bold rounded-xl transition-all ${style}`}>
                     {day}
                  </div>
               );
            })}
         </div>

         <div className="grid grid-cols-3 gap-3 border-t border-zinc-50 pt-6">
            {[
               { label: 'Kelgan', val: calendarData?.stats?.present || 0, color: 'text-cyan-500 bg-cyan-50' },
               { label: 'Kechikkan', val: calendarData?.stats?.late || 0, color: 'text-pink-500 bg-pink-50' },
               { label: 'Kelmagan', val: calendarData?.stats?.absent || 0, color: 'text-indigo-500 bg-indigo-50' },
            ].map((s, i) => (
               <div key={i} className="text-center">
                  <p className={`text-lg font-black mb-1`}>{s.val}</p>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{s.label}</p>
               </div>
            ))}
         </div>
      </Card>
   );
};

export const GroupInsightsVIP = ({ teacher }: { teacher: any }) => (
   <Card className="p-8 border-none shadow-xl shadow-zinc-200/40 bg-white rounded-3xl mt-6 relative overflow-hidden group">
      <h3 className="text-sm font-black text-gray-900 tracking-tight mb-6 uppercase tracking-widest">Guruhlar tahlili</h3>
      
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 text-center">
            <p className="text-3xl font-black text-indigo-600 mb-1">{teacher.taughtGroups?.length + teacher.supportedGroups?.length || 0}</p>
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Jami guruhlar</p>
         </div>
         <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-center">
            <p className="text-3xl font-black text-emerald-600 mb-1">
               {teacher.performance?.retention_rate !== null ? `${teacher.performance.retention_rate}%` : '—'}
            </p>
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
               {teacher.performance?.retention_rate !== null ? 'O\'quvchilarni saqlab qolish' : 'Ma\'lumot yo\'q'}
            </p>
         </div>
      </div>

      <div className="mt-8 space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
         <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Guruh nomi</span>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">O'quvchilar</span>
         </div>
         {[...teacher.taughtGroups, ...teacher.supportedGroups].map((g, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-zinc-50/50 rounded-2xl border border-zinc-100/50">
               <span className="text-[12px] font-black text-gray-800 truncate max-w-[120px]">{g.name}</span>
               <div className="flex items-center gap-2">
                  <span className="text-[12px] font-black text-indigo-500">{g._count?.enrollments || 0}</span>
                  <div className="w-1.5 h-6 bg-indigo-100 rounded-full overflow-hidden">
                     <div className="w-full h-1/2 bg-indigo-500" />
                  </div>
               </div>
            </div>
         ))}
      </div>
   </Card>
);

export const TeacherPerformanceVIP = ({ performance }: { performance: any }) => {
   const metrics = [
      { label: 'Punktuallik (o\'z vaqtida)', val: performance?.punctuality, target: 95, color: 'from-blue-400 to-blue-600' },
      { label: 'O\'rtacha kechikish (min)', val: performance?.avg_lateness, target: 5, color: 'from-rose-400 to-rose-600', isInverse: true },
      { label: 'O\'rtacha baho (GPA)', val: performance?.avg_grade, target: 90, color: 'from-emerald-400 to-emerald-600' },
      { label: 'O\'quvchilar davomati', val: performance?.attendance_rate, target: 92, color: 'from-indigo-400 to-indigo-600' },
   ];

   return (
      <Card className="p-8 border-none shadow-xl shadow-zinc-200/40 bg-white rounded-3xl mt-6">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase tracking-widest">Ko'rsatkichlar</h3>
         </div>

         <div className="space-y-8">
            {metrics.map((m, i) => (
               <div key={i}>
                  <div className="flex justify-between items-center mb-2.5">
                     <span className="text-[11px] font-black text-gray-700">{m.label}</span>
                     {m.val !== null ? (
                        <span className="text-[11px] font-black text-gray-900">
                           {m.val}{m.isInverse ? 'm' : '%'}<span className="text-zinc-300 font-bold ml-1">/{m.target}{m.isInverse ? 'm' : '%'}</span>
                        </span>
                     ) : (
                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Ma'lumot yo'q</span>
                     )}
                  </div>
                  <div className="h-2 w-full bg-zinc-50 rounded-full relative overflow-hidden">
                     {m.val !== null && (
                        <>
                           <div 
                              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${m.color} rounded-full transition-all duration-1000`} 
                              style={{ width: `${m.isInverse ? Math.max(0, 100 - (m.val * 10)) : m.val}%` }} 
                           />
                           <div 
                              className="absolute top-0 h-full w-0.5 bg-zinc-200" 
                              style={{ left: `${m.isInverse ? 50 : m.target}%` }} 
                           />
                        </>
                     )}
                  </div>
               </div>
            ))}
         </div>
      </Card>
   );
};

export const TeacherPenaltiesVIP = ({ penalties }: { penalties: any[] }) => (
  <Card className="p-8 border-none shadow-xl shadow-zinc-200/40 bg-white rounded-3xl mt-6">
     <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-500" />
           </div>
           <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase tracking-widest">Jarimalar tarixi</h3>
        </div>
        <div className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-black rounded-lg border border-red-100 uppercase tracking-widest">
           {penalties?.length || 0} ta
        </div>
     </div>

     <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {penalties && penalties.length > 0 ? (
           penalties.map((p, i) => (
              <div key={i} className="group p-4 bg-zinc-50 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-zinc-100 transition-all duration-300 border border-transparent hover:border-red-100">
                 <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                       <span className="text-[11px] font-black text-gray-800">{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className="text-[12px] font-black text-red-600">-{Number(p.amount).toLocaleString()} UZS</span>
                 </div>
                 <p className="text-[11px] font-bold text-zinc-500 mb-2 leading-relaxed italic">{p.reason}</p>
                 <div className="flex items-center justify-between pt-2 border-t border-zinc-100/50">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Guruh: {p.group?.name || 'Noma\'lum'}</span>
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">{new Date(p.created_at).toLocaleTimeString().slice(0, 5)}</span>
                 </div>
              </div>
           ))
        ) : (
           <div className="flex flex-col items-center justify-center py-12 text-zinc-300 opacity-60">
              <AlertCircle className="w-12 h-12 mb-3" />
              <p className="text-[11px] font-black uppercase tracking-widest">Jarimalar mavjud emas</p>
           </div>
        )}
     </div>
  </Card>
);
