import React from 'react';
import { Card } from "@/components/ui/card";
import { User, Wallet, Activity as ActivityIcon } from 'lucide-react';

interface Activity {
  type: string;
  title: string;
  description: string;
  date: string | Date;
  icon: string;
}

interface RecentActivitiesTableProps {
  activities: Activity[];
}

export const RecentActivitiesTable: React.FC<RecentActivitiesTableProps> = ({ activities }) => {
  return (
    <Card className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border-none flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-black text-gray-900 uppercase tracking-tight">So'nggi faollik</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">Turi</th>
              <th className="px-4 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">Tavsif</th>
              <th className="px-4 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Vaqt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {activities.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-[13px] font-medium text-gray-400 italic">
                  Hozircha faollik yo'q
                </td>
              </tr>
            ) : (
              activities.map((act, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm shrink-0 text-white
                        ${act.type === 'PAYMENT' ? 'bg-indigo-600' : 'bg-pink-500'}`}>
                        {act.type === 'PAYMENT' ? <Wallet size={12} /> : <User size={12} />}
                      </div>
                      <span className="text-[14px] font-black text-gray-800 uppercase tracking-tight">{act.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-[13px] font-medium text-gray-400 group-hover:text-gray-500 transition-colors">{act.description}</p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] font-bold text-gray-500 uppercase">
                        {new Date(act.date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] font-bold text-gray-300 uppercase">
                        {new Date(act.date).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
