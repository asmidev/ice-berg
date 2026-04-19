"use client";

import { CreditCard, MoreHorizontal, ArrowUpRight } from "lucide-react";

interface Payment {
  id: string;
  studentName: string;
  amount: number;
  date: string | Date;
  type: string;
}

interface LatestPaymentsProps {
  payments: Payment[];
}

export function LatestPayments({ payments }: LatestPaymentsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-black text-gray-900 tracking-tight uppercase">So'nggi to'lovlar</h3>
        <button className="text-gray-300 hover:text-gray-500 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {payments.length === 0 ? (
          <div className="py-10 text-center opacity-30">
            <CreditCard className="w-10 h-10 mx-auto mb-2 text-gray-400" />
            <p className="text-[12px] font-bold text-gray-400">Hali to'lovlar mavjud emas</p>
          </div>
        ) : (
          payments.map((p) => (
            <div key={p.id} className="group flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:bg-white hover:border-gray-100 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-green-500 group-hover:bg-green-50 transition-colors">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-black text-gray-800 tracking-tight uppercase truncate max-w-[150px]">{p.studentName}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(p.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })} • {p.type}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[14px] font-black text-gray-900">+{p.amount.toLocaleString()}</span>
                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-tighter">SO'M</span>
              </div>
            </div>
          ))
        )}
      </div>

      {payments.length > 0 && (
        <button className="py-3 text-[11px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-[2px] transition-colors">
          Barcha to'lovlar ›
        </button>
      )}
    </div>
  );
}
