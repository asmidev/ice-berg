"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Mail, Phone, MapPin, Calendar as CalendarIcon, 
  ChevronRight, ChevronLeft, Award, FileText, Download,
  MoreHorizontal, User, Activity, ShieldAlert,
  Eye, EyeOff, Lock, Edit, CheckCircle2, AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { Switch } from "@/components/ui/switch";
import { useConfirm } from '@/hooks/use-confirm';
import api from "@/lib/api";

// ==============================================
// 1. LEFT COLUMN 
// ==============================================

export const StudentProfileCardVIP = ({ student, onResetPassword }: { student: any, onResetPassword?: () => void }) => {
  const formatDOB = (dStr: string) => {
    if (!dStr) return '18/05/2022';
    const d = new Date(dStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const infoItems = [
    { icon: User, label: 'Jinsi', value: student?.user?.gender === 'female' ? 'Qiz bola' : 'O\'g\'il bola' },
    { icon: CalendarIcon, label: 'Tug\'ilgan sanasi', value: formatDOB(student?.date_of_birth) },
    { icon: Phone, label: 'Telefon raqami', value: student?.user?.phone || '+998 90 998 7766' },
    { icon: Phone, label: 'Ota-ona telefoni', value: student?.parent_phone || '+998 90 123 4567' },
  ];

  return (
    <Card className="p-6 border border-zinc-200 shadow-sm bg-white rounded-[12px] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 bg-pink-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-32 h-32 rounded-[2.5rem] bg-pink-100 p-1 mb-4 rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-xl shadow-pink-100/50 overflow-hidden">
          {student?.user?.photo_url ? (
            <img src={student.user.photo_url} alt="" className="w-full h-full object-cover rounded-[2.2rem]" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl font-black text-pink-500 bg-pink-50 rounded-[2.2rem]">
              {student?.user?.first_name?.[0] || 'I'}
            </div>
          )}
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
          {student?.user?.first_name || 'Isabella'} {student?.user?.last_name || 'Rossi'}
        </h2>
        
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[10px] font-black px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full tracking-widest uppercase">
          S-{student?.id?.slice(0, 4).toUpperCase() || '2106'}
        </span>
        <span className="text-[10px] font-black px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full tracking-widest uppercase">
          {student?.branch?.name || 'Filial kiritilmagan'}
        </span>
        <span className="text-[10px] font-black px-3 py-1 bg-emerald-500 text-white rounded-full tracking-widest uppercase shadow-sm shadow-emerald-500/20">
            Faol
          </span>
          {student?.is_vip && (
            <span className="text-[10px] font-black px-3 py-1 bg-amber-500 text-white rounded-full tracking-widest uppercase shadow-sm shadow-amber-500/20 flex items-center gap-1 ml-1">
              <Award size={10} className="fill-white" />
              VIP
            </span>
          )}
         </div>

        <div className="w-full space-y-4 pt-6 border-t border-zinc-50 relative">
           {infoItems.map((item, i) => (
             <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                   <item.icon className="w-4 h-4 text-zinc-300" />
                   <span className="text-[12px] font-bold text-zinc-400 capitalize">{item.label}</span>
                </div>
                <span className="text-[12px] font-black text-gray-800 text-right max-w-[120px] truncate">{item.value}</span>
             </div>
           ))}
           
           {/* Password Field */}
           <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                 <Lock className="w-4 h-4 text-zinc-300" />
                 <span className="text-[12px] font-bold text-zinc-400 capitalize">Parol</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer group/pwd" onClick={onResetPassword}>
                 <span className="text-[12px] font-black text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md min-w-[70px] text-center tracking-wider transition-colors group-hover/pwd:bg-pink-100" title="Parolni o'zgartirish">
                    **************
                 </span>
                 <button className="text-zinc-400 group-hover/pwd:text-pink-500 transition-colors">
                    <Edit className="w-3.5 h-3.5" />
                 </button>
              </div>
           </div>

           {/* VIP Status Toggle */}
           <div className="flex items-center justify-between group pt-4 border-t border-zinc-50 mt-4">
              <div className="flex items-center gap-3">
                 <Award className={`w-4 h-4 ${student?.is_vip ? 'text-amber-500' : 'text-zinc-300'}`} />
                 <span className="text-[12px] font-bold text-zinc-400 capitalize">VIP Status</span>
              </div>
              <Switch 
                checked={student?.is_vip || false} 
                onCheckedChange={async (checked: boolean) => {
                   try {
                     await api.patch(`/students/${student.id}`, { is_vip: checked });
                     window.location.reload();
                   } catch (err) {
                     console.error('VIP status update failed:', err);
                   }
                }}
              />
           </div>
        </div>
      </div>
    </Card>
  );
};

export const StudentPaymentHistoryVIP = ({ student }: { student: any }) => {
  const formatAmount = (amt: any) => {
    return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', minimumFractionDigits: 0 }).format(Number(amt || 0));
  };
  
  const formatDate = (dStr: string) => {
    const d = new Date(dStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const payments = student?.payments || [];

  return (
    <Card className="p-6 border border-zinc-200 shadow-sm bg-white rounded-[12px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-gray-900 tracking-tight">To'lov Tarixi</h3>
        {payments.length > 0 && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">{payments.length} ta to'lov</span>}
      </div>

      {payments.length === 0 ? (
        <div className="py-6 text-center text-zinc-400 text-[12px] font-bold">To'lovlar mavjud emas</div>
      ) : (
        <div className="space-y-0 divide-y divide-zinc-50 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
          {payments.map((payment: any, i: number) => (
            <div key={payment.id || i} className="flex justify-between py-4 first:pt-0 last:pb-0 group hover:bg-zinc-50/50 rounded-lg -mx-2 px-2 transition-colors">
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold text-zinc-400 mt-1 max-w-[120px] leading-tight">
                    {payment.type === 'CASH' ? 'Naqd' : payment.type === 'CARD' ? 'Karta orqali' : 'O\'tkazma'}
                  </span>
                  <span className="text-[10px] font-semibold text-zinc-300">{formatDate(payment.created_at)}</span>
                </div>
                <div className="text-right">
                  <p className={`text-[13px] font-black ${payment.status === 'SUCCESS' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {payment.status === 'SUCCESS' ? '+' : ''} {formatAmount(payment.amount)}
                  </p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{payment.status === 'SUCCESS' ? 'To\'langan' : 'Qaytarilgan'}</p>
                </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export const StudentPurchasesVIP = ({ student }: { student: any }) => {
  const sales = student?.saleTransactions || [];

  const formatAmount = (amt: any) => {
    return new Intl.NumberFormat('uz-UZ', { style: 'decimal', minimumFractionDigits: 0 }).format(Number(amt || 0));
  };

  const formatDate = (dStr: string) => {
    const d = new Date(dStr);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  };

  return (
    <Card className="p-6 border border-zinc-200 shadow-sm bg-white rounded-[12px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-gray-900 tracking-tight">Xaridlar va Xizmatlar</h3>
        {sales.length > 0 && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">{sales.length} ta xarid</span>}
      </div>

      <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
         {sales.length === 0 ? (
            <div className="py-4 text-center text-zinc-400 text-[12px] font-bold">Hech qanday xarid yo'q</div>
         ) : sales.map((sale: any, i: number) => (
           <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4 min-w-0">
                 <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                    <span className="text-[14px]">🛍️</span>
                 </div>
                 <div className="min-w-0">
                    <p className="text-[12px] font-black text-gray-800 truncate mb-0.5">
                       {sale.items?.length > 0 ? sale.items.map((it:any) => it.product?.name).join(', ') : 'Umumiy to\'lov'}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{formatDate(sale.created_at)}</p>
                 </div>
              </div>
              <div className="text-right shrink-0">
                 <p className="text-[13px] font-black text-gray-900">{formatAmount(sale.amount)} so'm</p>
                 <p className="text-[9px] font-black text-zinc-400 mt-0.5 uppercase tracking-widest">{sale.payment_method}</p>
              </div>
           </div>
         ))}
      </div>
    </Card>
  );
};

// ==============================================
// 2. MIDDLE COLUMN 
// ==============================================

export const StudentMiniCalendarVIP = ({ student }: { student: any }) => {
   const [currentDate, setCurrentDate] = useState(new Date());

   const attendances = student?.enrollments?.flatMap((e: any) => e.attendances || []) || [];

   const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
   const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

   const year = currentDate.getFullYear();
   const month = currentDate.getMonth();
   const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

   const daysInMonth = new Date(year, month + 1, 0).getDate();
   const firstDayIndex = new Date(year, month, 1).getDay();
   const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // 0 = Dushanba
   const prevMonthDays = new Date(year, month, 0).getDate();

   const daysArray = [];
   for (let i = 0; i < adjustedFirstDayIndex; i++) {
      daysArray.push({ day: prevMonthDays - adjustedFirstDayIndex + i + 1, isCurrentMonth: false });
   }

   let counts = { PRESENT: 0, LATE: 0, ABSENT: 0 };

   for (let i = 1; i <= daysInMonth; i++) {
      const dailyAtts = attendances.filter((att: any) => {
         const attD = new Date(att.date);
         return attD.getFullYear() === year && attD.getMonth() === month && attD.getDate() === i;
      });

      let status = null;
      if (dailyAtts.length > 0) {
         status = dailyAtts[dailyAtts.length - 1].status;
         counts[status as keyof typeof counts] = (counts[status as keyof typeof counts] || 0) + 1;
      }
      daysArray.push({ day: i, isCurrentMonth: true, status });
   }

   const totalSlots = daysArray.length > 35 ? 42 : 35;
   let nextDay = 1;
   while (daysArray.length < totalSlots) {
      daysArray.push({ day: nextDay++, isCurrentMonth: false });
   }

   return (
      <Card className="p-6 border border-zinc-200 shadow-sm bg-white rounded-[12px]">
         <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-sm font-black text-gray-900 tracking-tight">{monthNames[month]} {year}</h3>
            <div className="flex gap-2">
               <button onClick={prevMonth} className="text-zinc-400 hover:text-zinc-800"><ChevronLeft className="w-4 h-4" /></button>
               <button onClick={nextMonth} className="text-zinc-400 hover:text-zinc-800"><ChevronRight className="w-4 h-4" /></button>
            </div>
         </div>

         <div className="grid grid-cols-7 text-center gap-y-2 mb-4">
            {['D','S','Ch','P','J','Sh','Ya'].map(d => <span key={d} className="text-[10px] font-black text-zinc-300 uppercase">{d}</span>)}
            {daysArray.map((d, i) => {
               if(!d.isCurrentMonth) return <div key={i} className="text-[12px] font-bold text-zinc-300 opacity-50">{d.day}</div>;

               let style = "text-gray-600 hover:bg-zinc-100 rounded-lg";
               if (d.status === 'ABSENT' || d.status === 'kelmagan') style = "bg-[#1e3a5f]/5 text-[#1e3a5f] rounded-lg";
               else if (d.status === 'LATE' || d.status === 'kechikkan') style = "bg-amber-50 text-amber-600 rounded-lg";
               else if (d.status === 'PRESENT' || d.status === 'kelgan') style = "bg-emerald-50 text-emerald-600 rounded-lg";
               
               let displayStatusText = "";
               if(d.status) {
                   if(d.status === 'ABSENT') displayStatusText = 'Kelmagan';
                   if(d.status === 'LATE') displayStatusText = 'Kechikkan';
                   if(d.status === 'PRESENT') displayStatusText = 'Kelgan';
               }

               return (
                  <div key={i} title={displayStatusText} className={`h-8 flex items-center justify-center text-[12px] font-bold mx-1 cursor-pointer transition-all ${style}`}>
                     {d.day}
                  </div>
               );
            })}
         </div>

         <div className="grid grid-cols-3 gap-2 pt-2">
            {[
               { label: 'Kelgan', val: counts.PRESENT || 0, color: 'bg-emerald-50 text-emerald-600' },
               { label: 'Kechikkan', val: counts.LATE || 0, color: 'bg-amber-50 text-amber-600' },
               { label: 'Kelmagan', val: counts.ABSENT || 0, color: 'bg-[#1e3a5f]/5 text-[#1e3a5f]' },
            ].map((s, i) => (
               <div key={i} className={`p-2 rounded-xl flex flex-col items-center justify-center ${s.color}`}>
                  <span className="text-[8px] font-bold uppercase tracking-widest opacity-80 mb-1">{s.label}</span>
                  <span className="text-sm font-black">{s.val}</span>
               </div>
            ))}
         </div>
      </Card>
   );
};

import { Button } from '@/components/ui/button';
import { Plus, Tag, Trash2, Clock, Calendar, Percent } from 'lucide-react';
import { AssignDiscountDialog } from '../../../reports/discounts/components/AssignDiscountDialog';
import { toast } from 'sonner';

export const StudentDiscountsVIP = ({ student }: { student: any }) => {
   const confirm = useConfirm();
   const [discounts, setDiscounts] = useState(student?.discounts || []);
   const [dialogOpen, setDialogOpen] = useState(false);
   
   const handleDelete = async (sdId: string) => {
      const isConfirmed = await confirm({
         title: "Chegirmani o'chirish",
         message: "Ushbu chegirmadan o'quvchini mahrum qilmoqchimisiz?",
         type: "danger"
      });
      if (!isConfirmed) return;
      try {
         await api.delete(`/discounts/assign/${sdId}`);
         toast.success("O'chirildi");
         setDiscounts(discounts.filter((d: any) => d.id !== sdId));
      } catch (e: any) {
         toast.error(e.response?.data?.message || "Xatolik");
      }
   };

   // Helper to format date and check if expired
   const getExpiryStatus = (dateStr: string | null) => {
      if (!dateStr) return { label: "Cheksiz", color: "text-emerald-600 bg-emerald-50" };
      const date = new Date(dateStr);
      const now = new Date();
      const diff = date.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 3600 * 24));
      
      const formatted = date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' });
      
      if (diff < 0) return { label: `Muddati o'tgan (${formatted})`, color: "text-red-600 bg-red-50", expired: true };
      if (days < 5) return { label: `${days} kun qoldi (${formatted})`, color: "text-amber-600 bg-amber-50" };
      return { label: formatted, color: "text-zinc-500 bg-zinc-50" };
   };

   return (
      <Card className="p-6 border border-zinc-200 shadow-sm bg-white rounded-[12px]">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-2">
               <Tag className="w-4 h-4 text-pink-500" />
               Chegirmalar va Imtiyozlar
            </h3>
            <div className="flex items-center gap-2">
               {discounts.length > 0 && <span className="text-[10px] bg-pink-50 text-pink-600 px-2.5 py-1 rounded-full font-black uppercase tracking-widest leading-none">{discounts.length} ta aktiv</span>}
               <Button 
                  onClick={() => setDialogOpen(true)}
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8 rounded-lg bg-pink-50 text-pink-500 hover:bg-pink-100 transition-all"
               >
                  <Plus className="w-4 h-4" />
               </Button>
            </div>
         </div>

         <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
            {discounts.length === 0 ? (
               <div className="py-8 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl">
                  <Percent className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-[11px] font-bold text-zinc-400">Hozircha chegirmalar yo'q</p>
                  <Button 
                     onClick={() => setDialogOpen(true)} 
                     variant="link" 
                     className="text-[11px] font-black p-0 h-auto text-pink-500 mt-1"
                  >
                     Chegirma biriktirish
                  </Button>
               </div>
            ) : discounts.map((d: any, i: number) => {
               const status = getExpiryStatus(d.expires_at);
               return (
                  <div key={i} className={`flex items-center justify-between group p-3 rounded-2xl border transition-all ${status.expired ? 'bg-red-50/30 border-red-100 opacity-70' : 'hover:bg-zinc-50 border-transparent hover:border-zinc-100'}`}>
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${status.expired ? 'bg-red-100 text-red-600' : 'bg-cyan-50 text-cyan-600'}`}>
                           <Tag className="w-4 h-4" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h4 className="text-[13px] font-black text-gray-900 group-hover:text-pink-600 transition-colors uppercase tracking-tight">{d.discount?.name}</h4>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${status.color}`}>
                                 {status.label}
                              </span>
                           </div>
                           <p className="text-[11px] font-bold text-zinc-500 mt-0.5 uppercase tracking-widest flex items-center gap-1.5">
                              {d.discount?.type === 'PERCENT' ? `${d.discount?.value}% chegirma` : `${new Intl.NumberFormat('uz-UZ').format(Number(d.discount?.value || 0))} so'm`}
                              <span className="text-zinc-300">•</span>
                              <Clock className="w-3 h-3 text-zinc-400" />
                              <span className="text-[10px]">{status.label === 'Cheksiz' ? 'Doimiy' : 'Muddatli'}</span>
                           </p>
                        </div>
                     </div>
                     <button onClick={() => handleDelete(d.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-zinc-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               );
            })}
         </div>

         <AssignDiscountDialog 
            open={dialogOpen} 
            onOpenChange={setDialogOpen}
            studentId={student?.id}
            onSuccess={() => {
               toast.info("Ma'lumotlar yangilandi, ko'rish uchun sahifani yangilang");
            }}
         />
      </Card>
   );
};

export const TeacherFeedbacksVIP = ({ student }: { student: any }) => {
   const feedbacks = student?.teacherFeedbacks || [];

   const formatDate = (dStr: string) => {
      const d = new Date(dStr);
      return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
   };

   return (
      <Card className="p-6 border border-zinc-200 shadow-sm bg-white rounded-[12px]">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-gray-900 tracking-tight">O'qituvchilar Fikri</h3>
            {feedbacks.length > 0 && <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold">{feedbacks.length} ta sharh</span>}
         </div>

         <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {feedbacks.length === 0 ? (
               <div className="py-4 text-center text-zinc-400 text-[12px] font-bold">Hozircha izohlar qoldirilmagan</div>
            ) : feedbacks.map((fb: any, i: number) => (
               <div key={i} className="bg-[#F8FAFC] p-4 rounded-3xl border border-blue-50/50 relative">
                  <div className="flex justify-between items-start mb-2">
                     <span className="inline-block px-3 py-1 bg-[#E0F2FE] text-[#0284C7] rounded-md text-[10px] font-black uppercase tracking-widest leading-none">
                        {fb.teacher?.user?.first_name} {fb.teacher?.user?.last_name}
                     </span>
                     <span className="text-[9px] font-bold text-zinc-400">{formatDate(fb.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                     {Array.from({ length: 5 }).map((_, rIdx) => (
                        <span key={rIdx} className={`text-[12px] ${rIdx < fb.rating ? 'text-yellow-400' : 'text-zinc-200'}`}>⭐</span>
                     ))}
                  </div>
                  <p className="text-[12px] font-semibold text-[#334155] leading-relaxed">
                     {fb.comment || "Izoh yozilmagan."}
                  </p>
               </div>
            ))}
         </div>
      </Card>
   );
};

// ==============================================
// 3. RIGHT COLUMN 
// ==============================================

export const AcademicPerformanceVIP = ({ student }: { student: any }) => {
   const [period, setPeriod] = useState<number>(6); // 0: 1 hafta, 1: 1 oy, 3, 6, 12 months

   const grades = student?.grades || [];
   const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
   const dayNames = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan'];
   
   const now = new Date();
   const barData = [];
   
   if (period === 0) {
      // Joriy hafta (Dushanbadan Yakshanbagacha)
      const currentDay = now.getDay();
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay; // 0=Sunday
      const mondayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);

      for (let i = 0; i < 7; i++) {
         const d = new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() + i);
         const dayGrades = grades.filter((g: any) => {
            const gD = new Date(g.date);
            return gD.getFullYear() === d.getFullYear() && gD.getMonth() === d.getMonth() && gD.getDate() === d.getDate();
         });
         let avg = 0;
         if (dayGrades.length > 0) {
            const totalScore = dayGrades.reduce((sum: number, g: any) => sum + (Number(g.score) / (Number(g.max_score) || 100)) * 100, 0);
            avg = Math.round(totalScore / dayGrades.length);
         }
         barData.push({ name: dayNames[d.getDay()], value: avg });
      }
   } else if (period === 1) {
      // Oxirgi 1 oy (oxirgi 4 hafta)
      for (let i = 3; i >= 0; i--) {
         const startD = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7 + 7));
         const endD = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7));
         const weekGrades = grades.filter((g: any) => {
            const gD = new Date(g.date);
            return gD >= startD && gD < endD;
         });
         let avg = 0;
         if (weekGrades.length > 0) {
            const totalScore = weekGrades.reduce((sum: number, g: any) => sum + (Number(g.score) / (Number(g.max_score) || 100)) * 100, 0);
            avg = Math.round(totalScore / weekGrades.length);
         }
         barData.push({ name: `${4-i}-hafta`, value: avg });
      }
   } else {
      // 3, 6, 12 oylar
      for (let i = period - 1; i >= 0; i--) {
         const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
         const mName = monthNames[d.getMonth()];
         
         const monthGrades = grades.filter((g: any) => {
            const gD = new Date(g.date);
            return gD.getFullYear() === d.getFullYear() && gD.getMonth() === d.getMonth();
         });

         let avg = 0;
         if (monthGrades.length > 0) {
            const totalScore = monthGrades.reduce((sum: number, g: any) => sum + (Number(g.score) / (Number(g.max_score) || 100)) * 100, 0);
            avg = Math.round(totalScore / monthGrades.length);
         }
         barData.push({ name: mName, value: avg });
      }
   }

   // Total Average Calculation (GPA out of 5.0)
   let overallAvg = 0;
   const validGrades = grades.filter((g: any) => Number(g.max_score) > 0);
   if (validGrades.length > 0) {
       const sumPct = validGrades.reduce((sum: number, g: any) => sum + (Number(g.score) / Number(g.max_score)), 0);
       overallAvg = (sumPct / validGrades.length) * 5.0;
   }
   
   const formattedGpa = overallAvg > 0 ? overallAvg.toFixed(1) : "0.0";
   const radialData = [
      { name: 'Achieved', value: overallAvg > 0 ? overallAvg : 0.1, fill: '#1E3A5F' },
      { name: 'Remaining', value: 5.0 - overallAvg, fill: '#F1F5F9' }
   ];

   const getFeedbackText = () => {
      if (overallAvg >= 4.5) return "O'quvchi darslarida barqaror a'lo natijalar qayd etmoqda va guruh ishlarida doim faol. Olg'a!";
      if (overallAvg >= 3.5) return "O'zlashtirish yaxshi holatda. Ba'zi fanlarda qo'shimcha shug'ullanish orqali A'lo darajaga yetish mumkin.";
      if (overallAvg > 0) return "O'zlashtirish qoniqarli emas. Diqqatni jamlash va qo'shimcha darslarga qatnashish tavsiya etiladi.";
      return "Hozircha o'zlashtirish va baholar bo'yicha yetarli ma'lumot mavjud emas.";
   };

   return (
      <Card className="p-6 border border-zinc-200 shadow-sm bg-white rounded-[12px]">
         <div className="flex items-center justify-between mb-8 relative">
            <h3 className="text-sm font-black text-gray-900 tracking-tight">O'zlashtirish ko'rsatkichlari</h3>
            <select 
               className="appearance-none bg-cyan-50 text-[10px] font-bold text-cyan-700 rounded-lg px-3 py-1.5 outline-none cursor-pointer pr-6"
               value={period}
               onChange={(e) => setPeriod(Number(e.target.value))}
            >
               <option value={0}>Oxirgi 1 hafta</option>
               <option value={1}>Oxirgi 1 oy</option>
               <option value={3}>Oxirgi 3 oy</option>
               <option value={6}>Oxirgi 6 oy</option>
               <option value={12}>Barchasi (1 yil)</option>
            </select>
            <ChevronRight className="w-3 h-3 rotate-90 absolute right-2 text-cyan-700 pointer-events-none" />
         </div>

         <div className="flex gap-4 items-center h-[180px]">
            {/* Donut Chart Block */}
            <div className="w-[180px] h-full flex flex-col items-center justify-start shrink-0 pt-2">
               <div className="relative w-[180px] h-[95px] mb-2">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={radialData}
                           cx="50%" cy="100%" startAngle={180} endAngle={0}
                           innerRadius={65} outerRadius={85} stroke="none"
                           dataKey="value"
                        >
                           {radialData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                           ))}
                        </Pie>
                     </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="absolute bottom-1 left-0 right-0 flex flex-col items-center justify-end">
                     <div className="flex items-baseline gap-0.5">
                        <span className="text-[26px] font-black text-[#1E3A5F] leading-none">{formattedGpa}</span>
                        <span className="text-[12px] font-bold text-zinc-400">/5.0</span>
                     </div>
                     <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">O'rtacha Ball</p>
                  </div>
               </div>
               
               <p className="text-[10px] text-zinc-500 text-center leading-relaxed font-medium mt-3">
                  {getFeedbackText()}
               </p>
            </div>

            {/* Bar Chart Block */}
            <div className="flex-1 h-full pl-2">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} tickLine={false} 
                        tick={{ fill: '#A1A1AA', fontSize: 10, fontWeight: 700 }} 
                        dy={10} 
                     />
                     <Tooltip cursor={{fill: 'transparent'}} content={() => null} />
                     <Bar 
                        dataKey="value" 
                        radius={[6, 6, 6, 6]} 
                        barSize={32}
                        background={{ fill: '#FDF4FF', radius: 6 }}
                        label={{ position: 'top', fill: '#1E3A5F', fontSize: 10, fontWeight: 800, dy: -6 }}
                     >
                         {barData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.value > 0 ? "#F9A8D4" : "transparent"} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </Card>
   );
};

export const GroupRankingVIP = ({ student }: { student: any }) => {
   const [activeGroupIndex, setActiveGroupIndex] = useState(0);
   const rankings = student?.groupRankings || [];

   if (rankings.length === 0) {
      return (
         <Card className="p-6 border border-zinc-200 shadow-sm bg-white rounded-[12px] h-[380px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-sm font-black text-gray-900 tracking-tight">Guruhdagi Reytingi</h3>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 font-medium text-[12px]">
                Guruh biriktirilmagan yoki reyting shakllanmagan.
            </div>
         </Card>
      );
   }

   const activeGroup = rankings[activeGroupIndex];

   return (
      <Card className="p-6 border border-zinc-200 shadow-sm bg-white rounded-[12px] h-[380px] flex flex-col">
         <div className="flex items-center justify-between mb-4 relative shrink-0">
            <h3 className="text-sm font-black text-gray-900 tracking-tight">Guruhdagi Reytingi</h3>
            {rankings.length > 0 && (
               <div className="relative">
                  <select 
                     className="appearance-none bg-indigo-50 text-[10px] font-bold text-indigo-700 rounded-lg px-3 py-1.5 outline-none cursor-pointer pr-6 w-[120px] truncate"
                     value={activeGroupIndex}
                     onChange={(e) => setActiveGroupIndex(Number(e.target.value))}
                  >
                     {rankings.map((r: any, idx: number) => (
                        <option key={idx} value={idx}>{r.group_name}</option>
                     ))}
                  </select>
                  <ChevronRight className="w-3 h-3 rotate-90 absolute right-2 top-1/2 -translate-y-1/2 text-indigo-700 pointer-events-none" />
               </div>
            )}
         </div>

         <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 mb-4 flex gap-4 divide-x divide-zinc-200 shrink-0">
            <div className="flex-1">
                <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest mb-1">Kurs va O'qituvchi</p>
                <p className="text-[12px] font-black text-gray-800 line-clamp-1">{activeGroup.course_name}</p>
                <p className="text-[10px] font-bold text-indigo-500 mt-0.5 line-clamp-1">{activeGroup.teacher_name}</p>
            </div>
            <div className="flex-1 pl-4 flex flex-col justify-center">
                <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest mb-1">O'rningiz</p>
                <p className="text-[13px] font-black text-gray-800"><span className="text-[18px] text-indigo-600">{activeGroup.rank}</span> / {activeGroup.total_students}</p>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-zinc-100">
                     <th className="pb-2 pt-1 z-10 sticky top-0 bg-white text-[9px] font-black text-zinc-400 uppercase tracking-widest w-[10%]">#</th>
                     <th className="pb-2 pt-1 z-10 sticky top-0 bg-white text-[9px] font-black text-zinc-400 uppercase tracking-widest">O'quvchi</th>
                     <th className="pb-2 pt-1 z-10 sticky top-0 bg-white text-[9px] font-black text-zinc-400 uppercase tracking-widest text-right">O'rtacha Ball</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-zinc-50">
                  {activeGroup.ranking_list.map((rk: any, i: number) => {
                     const isMe = rk.student_id === student?.id;
                     return (
                        <tr key={i} className={`transition-colors ${isMe ? 'bg-indigo-50/40' : 'hover:bg-zinc-50'}`}>
                           <td className={`py-2 px-1 ${isMe ? 'rounded-l-lg' : ''}`}>
                              <span className={`text-[12px] font-black ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-600' : 'text-zinc-400'}`}>{i + 1}</span>
                           </td>
                           <td className="py-2">
                              <div className="flex items-center gap-3">
                                 <img src={rk.photo_url || '/placeholder-user.jpg'} alt="avatar" className="w-7 h-7 rounded-full border border-zinc-200 shadow-sm object-cover bg-white" />
                                 <div>
                                     <span className={`text-[11px] font-bold block leading-none ${isMe ? 'text-indigo-700' : 'text-gray-800'}`}>{rk.name}</span>
                                     {isMe && <span className="text-[8px] bg-indigo-100/80 text-indigo-700 px-1.5 py-0.5 rounded flex w-max mt-1 font-black uppercase tracking-widest">Siz</span>}
                                 </div>
                              </div>
                           </td>
                           <td className={`py-2 text-right px-2 ${isMe ? 'rounded-r-lg' : ''}`}>
                              <span className="text-[12px] font-black text-gray-800">{rk.score}%</span>
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </Card>
   );
};

export const HomeworksVIP = ({ student }: { student: any }) => {
   const homeworks = student?.homeworks || [];

   return (
      <Card className="p-6 border border-zinc-200 shadow-sm bg-white rounded-[12px]">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-gray-900 tracking-tight">Uyga Vazifalar</h3>
            <button className="text-zinc-300 hover:text-zinc-600"><MoreHorizontal className="w-5 h-5" /></button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-zinc-100">
                     <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Muddat <ChevronRight className="w-3 h-3 inline rotate-90" /></th>
                     <th className="pb-3 w-[40%] text-[10px] font-black text-gray-400 uppercase tracking-widest">Topshiriq va Kurs <ChevronRight className="w-3 h-3 inline rotate-90" /></th>
                     <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">O'qituvchi <ChevronRight className="w-3 h-3 inline rotate-90" /></th>
                     <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Holati <ChevronRight className="w-3 h-3 inline rotate-90" /></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-zinc-50">
                  {homeworks.length === 0 ? (
                     <tr>
                        <td colSpan={4} className="py-8 text-center text-zinc-400 font-medium text-[12px]">Hozircha uyga vazifalar mavjud emas</td>
                     </tr>
                  ) : homeworks.map((hw: any, i: number) => {
                     const isLate = hw.status === 'Kechikkan';
                     const isDone = hw.status === 'Topshirilgan';

                     return (
                        <tr key={i} className="hover:bg-zinc-50 transition-colors">
                           <td className="py-4 pr-3">
                              <p className={`text-[12px] font-black ${isLate ? 'text-red-600' : 'text-gray-800'}`}>
                                 {new Date(hw.deadline).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </p>
                           </td>
                           <td className="py-4 pr-4">
                              <p className="text-[13px] font-black text-gray-900 mb-0.5">{hw.title}</p>
                              <p className="text-[11px] font-bold text-indigo-500 leading-tight block truncate max-w-[200px]">{hw.course_name} • {hw.group_name}</p>
                           </td>
                           <td className="py-4 text-[12px] font-bold text-zinc-600">{hw.teacher_name}</td>
                           <td className="py-4 text-right">
                              {isDone ? (
                                 <div className="inline-flex flex-col items-end">
                                    <span className="inline-flex py-1 flex items-center justify-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 rounded-md text-[9px] font-black uppercase tracking-widest mb-1.5">
                                       <CheckCircle2 className="w-3 h-3" /> topshirilgan
                                    </span>
                                    {hw.score !== null && (
                                       <span className="text-[13px] font-black text-gray-900">{hw.score} <span className="text-[10px] text-zinc-400 font-bold">/ {hw.max_score}</span></span>
                                    )}
                                 </div>
                              ) : isLate ? (
                                 <div className="inline-flex flex-col items-end">
                                    <span className="inline-flex py-1 flex items-center justify-center gap-1.5 text-red-600 bg-red-50 px-2.5 rounded-md text-[9px] font-black uppercase tracking-widest mb-1.5">
                                       <AlertCircle className="w-3 h-3" /> kechikkan
                                    </span>
                                 </div>
                              ) : (
                                 <div className="inline-flex flex-col items-end">
                                    <span className="inline-flex py-1 flex items-center justify-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 rounded-md text-[9px] font-black uppercase tracking-widest mb-1.5">
                                       Kutilmoqda 
                                    </span>
                                 </div>
                              )}
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </Card>
   );
};
