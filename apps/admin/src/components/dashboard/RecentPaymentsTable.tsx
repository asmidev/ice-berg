import React from 'react';
import { Card } from "@/components/ui/card";
import { Wallet } from 'lucide-react';

interface Payment {
  id: string;
  studentName: string;
  amount: number;
  date: string | Date;
}

interface RecentPaymentsTableProps {
  payments: Payment[];
}

export const RecentPaymentsTable: React.FC<RecentPaymentsTableProps> = ({ payments }) => {
  return (
    <Card className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border-none flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-black text-gray-900 uppercase tracking-tight">So'nggi to'lovlar</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">Talaba</th>
              <th className="px-4 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">Summa</th>
              <th className="px-4 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Sana</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-[13px] font-medium text-gray-400 italic">
                  Hozircha to'lovlar yo'q
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center shrink-0">
                        <Wallet size={14} />
                      </div>
                      <span className="text-[14px] font-black text-gray-800 uppercase tracking-tight">{p.studentName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[14px] font-black text-indigo-600">
                      {p.amount.toLocaleString()} UZS
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-[12px] font-bold text-gray-400 uppercase">
                      {new Date(p.date).toLocaleDateString('uz-UZ')}
                    </span>
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
