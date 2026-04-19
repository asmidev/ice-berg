import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal, User, Wallet } from 'lucide-react';
import { LatestPayments } from './LatestPayments';

interface Activity {
  type: string;
  title: string;
  description: string;
  date: string | Date;
  icon: string;
}

interface RightSidebarProps {
  activities: Activity[];
  latestPayments: any[];
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ activities, latestPayments }) => {
  const currentMonth = new Date().toLocaleString('uz-UZ', { month: 'long', year: 'numeric' });
  
  return (
    <div className="flex flex-col gap-10 w-full">
      {/* 📅 Calendar Widget */}
      <div className="border-none shadow-[0_2px_12px_rgba(0,0,0,0.04)] bg-white rounded-[24px] overflow-hidden p-6">
        <div className="flex flex-row items-center justify-between pb-6">
          <h3 className="text-[17px] font-black text-gray-900 uppercase tracking-tight">{currentMonth}</h3>
          <div className="flex gap-2">
            <button className="p-1.5 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"><ChevronLeft size={18} /></button>
            <button className="p-1.5 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"><ChevronRight size={18} /></button>
          </div>
        </div>
        <div>
          <div className="grid grid-cols-7 gap-1 text-center">
             {['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha'].map((day, i) => (
               <span key={i} className="text-[10px] font-black text-gray-300 uppercase py-2 tracking-widest">{day}</span>
             ))}
             {Array.from({ length: 31 }).map((_, i) => {
               const day = i + 1;
               const today = new Date().getDate();
               const isToday = day === today;
               return (
                 <button 
                   key={i} 
                   className={`h-9 w-9 flex items-center justify-center rounded-xl text-[12px] font-bold transition-all
                     ${isToday ? 'bg-pink-500 text-white shadow-lg shadow-pink-200 scale-110' : 'text-gray-600'}
                     hover:bg-gray-50
                   `}
                 >
                   {day}
                 </button>
               );
             })}
          </div>
        </div>
      </div>

      {/* 🎪 Latest Payments (instead of Events) */}
      <LatestPayments payments={latestPayments || []} />

      {/* 🚀 Recent Activity */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[17px] font-black text-gray-900 uppercase tracking-tight">So'nggi faollik</h3>
          <button className="p-2 hover:bg-white rounded-xl transition-colors"><MoreHorizontal size={18} className="text-gray-300" /></button>
        </div>
        <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
           {activities.length === 0 ? (
              <p className="text-[12px] font-bold text-gray-400 italic">Faollik hali yo'q</p>
           ) : (
             activities.map((act, i) => (
               <div key={i} className="relative group">
                  <div className={`absolute -left-9 top-1 w-6 h-6 rounded-lg flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110
                    ${act.type === 'PAYMENT' ? 'bg-indigo-600 text-white' : 'bg-pink-500 text-white'}`}>
                     {act.type === 'PAYMENT' ? <Wallet size={12} /> : <User size={12} />}
                  </div>
                  <div className="flex flex-col gap-1">
                     <h5 className="text-[14px] font-black text-gray-800 leading-tight uppercase tracking-tight">{act.title}</h5>
                     <p className="text-[13px] font-medium text-gray-400 group-hover:text-gray-500 transition-colors">{act.description}</p>
                     <span className="text-[10px] font-bold text-gray-300 uppercase mt-1">
                        {new Date(act.date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })} • {new Date(act.date).toLocaleDateString('uz-UZ')}
                     </span>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
};
