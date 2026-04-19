import { Printer, Archive, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Payroll } from '@/types/finance';

interface SalariesTableProps {
  payrolls: Payroll[];
  loading: boolean;
  onPay: (id: string) => void;
  onArchive: (id: string) => void;
}

export function SalariesTable({ payrolls, loading, onPay, onArchive }: SalariesTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-100 overflow-hidden mb-12 relative z-10 animate-pulse">
        <div className="h-[500px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
             <div className="w-12 h-12 rounded-full border-4 border-zinc-100 border-t-indigo-500 animate-spin" />
             <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Yuklanmoqda...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-100 overflow-hidden mb-12 relative z-10">
      <div className="overflow-x-auto w-full min-h-[500px]">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-white border-b border-gray-50 font-black uppercase tracking-wider text-gray-400 text-[10px]">
              <th className="py-5 pl-10 w-16 text-center">T/R</th>
              <th className="py-5 px-6">HODIM</th>
              <th className="py-5 px-6">SANA</th>
              <th className="py-5 px-6">NARX</th>
              <th className="py-5 px-6">TO'LOV USULI</th>
              <th className="py-5 px-6">QAYERDAN OLINGANLIGI</th>
              <th className="py-5 px-6">IZOH</th>
              <th className="py-5 pr-10 text-right">AMAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {payrolls.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-32 text-center text-zinc-300 font-bold uppercase tracking-widest opacity-40">
                   Ma'lumot topilmadi
                </td>
              </tr>
            ) : (
              payrolls.map((p, idx) => {
                const employee = p.teacher || p.staff;
                const name = employee?.user 
                  ? `${employee.user.first_name} ${employee.user.last_name}`.trim() 
                  : "Noma'lum xodim";
                const total = Number(p.amount) + Number(p.bonus) - Number(p.deduction);

                return (
                  <tr key={p.id} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="pl-10 py-5 text-center">
                      <span className="text-[11px] font-bold text-zinc-300">{idx + 1}.</span>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-[12px] font-bold text-[#1E3A5F]">{name}</span>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-[11px] font-bold text-zinc-500">
                        {new Date(p.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-[12px] font-black text-zinc-700">{total.toLocaleString()} so'm</span>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight">
                        {p.payment_method === 'CASH' ? 'Naqd pul' : p.payment_method === 'CARD' ? 'Plastik karta' : p.payment_method === 'TRANSFER' ? 'O\'tkazma' : p.payment_method || '-'}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-zinc-400 text-[11px] font-bold italic">
                      {p.cashbox?.name || '-'}
                    </td>
                    <td className="py-5 px-6 text-zinc-400 text-[11px] max-w-[150px] truncate">
                      {p.description || '-'}
                    </td>
                    <td className="py-5 pr-10">
                       <div className="flex justify-end gap-2">
                         {p.status === 'PENDING' ? (
                           <Button 
                             onClick={() => onPay(p.id)} 
                             size="sm" 
                             className="h-8 px-4 bg-teal-500 hover:bg-teal-600 text-white font-bold text-[10px] rounded-lg border-none shadow-sm transition-all active:scale-95"
                           >
                              To'lov qilish
                           </Button>
                         ) : (
                           <span className="h-8 px-4 flex items-center justify-center bg-zinc-100 text-zinc-400 font-bold text-[10px] rounded-lg border border-zinc-200/50 uppercase tracking-widest scale-90 opacity-60">To'langan</span>
                         )}

                         <Popover>
                            <PopoverTrigger asChild>
                               <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-[#1E3A5F] cursor-pointer hover:bg-zinc-100 transition-all border border-zinc-100/50">
                                  <MoreHorizontal size={14} />
                               </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-40 p-1.5 rounded-[12px] border-gray-100 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] bg-white z-[999]" align="end">
                               <button className="w-full h-10 px-3 flex items-center gap-3 text-gray-700 font-bold text-[12px] hover:bg-gray-50 rounded-[8px] transition-all">
                                  <Printer size={13} strokeWidth={2.5} className="text-gray-400" /> Chop etish
                                </button>
                                <button 
                                  onClick={() => onArchive(p.id)} 
                                  className="w-full h-10 px-3 flex items-center gap-3 text-rose-500 font-bold text-[12px] hover:bg-rose-50 rounded-[8px] transition-all"
                                >
                                   <Archive size={13} strokeWidth={2.5} /> Arxivlash
                                </button>
                            </PopoverContent>
                         </Popover>
                       </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
