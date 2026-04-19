import { Award, MoreHorizontal, Printer, Archive } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bonus } from '@/types/finance';

interface BonusesTableProps {
  bonuses: Bonus[];
  loading: boolean;
  onArchive: (id: string) => void;
}

export function BonusesTable({ bonuses, loading, onArchive }: BonusesTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-[12px] p-1 shadow-sm border border-gray-100 overflow-hidden mb-12 animate-pulse">
        <div className="h-[400px] flex items-center justify-center">
           <div className="w-10 h-10 rounded-full border-4 border-gray-100 border-t-pink-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[12px] shadow-sm border border-gray-100 overflow-hidden mb-12">
      <div className="overflow-x-auto w-full min-h-[400px]">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-white border-b border-gray-50 font-black uppercase tracking-wider text-gray-400 text-[10px]">
              <th className="py-5 pl-10 w-16 text-center">T/R</th>
              <th className="py-5 px-6">XODIM</th>
              <th className="py-5 px-6">SANA</th>
              <th className="py-5 px-6">SUMMA</th>
              <th className="py-5 px-6 text-center">MANBA TURI</th>
              <th className="py-5 px-6">MUKOFOT SABABI</th>
              <th className="py-5 pr-10 text-right">AMALLAR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bonuses.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-32 text-center text-gray-300 font-bold uppercase tracking-widest opacity-40">
                   Bonuslar ma'lumotlari topilmadi
                </td>
              </tr>
            ) : (
              bonuses.map((b, idx) => {
                const employee = b.teacher || b.staff;
                const name = employee?.user 
                  ? `${employee.user.first_name} ${employee.user.last_name}`.trim() 
                  : "Noma'lum xodim";

                return (
                  <tr key={b.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="pl-10 py-5 text-center">
                      <span className="text-[11px] font-bold text-gray-300">{idx + 1}.</span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-[#EC4899]">
                            <Award size={14} />
                         </div>
                         <span className="text-[12px] font-bold text-[#1E3A5F]">{name}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-[11px] font-bold text-gray-500">
                        {new Date(b.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-[12px] font-black text-emerald-600">
                         +{Number(b.amount).toLocaleString()} <span className="text-[10px] text-gray-400">uzs</span>
                      </span>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className="text-[10px] bg-gray-100 border border-gray-200 px-3 py-1 rounded-full font-bold uppercase tracking-widest text-gray-500">
                        {b.source?.name || 'KPI'}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-gray-500 text-[11px] font-bold italic max-w-[200px] truncate leading-relaxed">
                      {b.reason || '-'}
                    </td>
                    <td className="py-5 pr-10">
                       <div className="flex justify-end gap-2">
                         <Popover>
                            <PopoverTrigger asChild>
                               <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 transition-all border border-gray-100/50">
                                  <MoreHorizontal size={14} />
                               </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-40 p-1.5 rounded-[12px] border-gray-100 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] bg-white z-[999]" align="end">
                               <button className="w-full h-10 px-3 flex items-center gap-3 text-gray-700 font-bold text-[12px] hover:bg-gray-50 rounded-[8px] transition-all">
                                  <Printer size={13} strokeWidth={2.5} className="text-gray-400" /> Chop etish
                                </button>
                                <button 
                                  onClick={() => onArchive(b.id)} 
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
