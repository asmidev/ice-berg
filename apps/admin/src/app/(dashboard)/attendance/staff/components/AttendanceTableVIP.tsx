'use client';


import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Search, MoreHorizontal, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";

const getAvatarUrl = (name: string) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
};

interface AttendanceTableProps {
  data: any[];
  loading: boolean;
  onMark: (id: string, status: 'PRESENT' | 'ABSENT' | 'LATE', delayTime?: number) => void;
  type: 'staff' | 'teacher';
  onRowClick?: (person: {id: string, name: string}) => void;
  selectedId?: string;
  onTabChange?: (tab: 'staff' | 'teacher') => void;
}

export function AttendanceTableVIP({ data = [], loading, onMark, type, onRowClick, selectedId, onTabChange }: AttendanceTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const safeData = Array.isArray(data) ? data : [];

  const filteredData = safeData.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <Card className="p-20 border-none shadow-xl shadow-zinc-200/40 bg-white rounded-xl flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-zinc-100 border-t-pink-500 rounded-full animate-spin mb-4" />
        <p className="text-zinc-400 font-bold text-sm tracking-widest uppercase">Yuklanmoqda...</p>
      </Card>
    );
  } else {
    return (
      <div className="bg-white rounded-xl shadow-xl shadow-zinc-200/40 border border-zinc-100 overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-zinc-50 bg-zinc-50/30 flex flex-col xl:flex-row justify-between items-center gap-4">
          
          {/* Tabs inside Table */}
          <div className="flex bg-zinc-100 p-1.5 rounded-2xl w-full xl:w-auto h-14">
            <button 
              onClick={() => onTabChange?.('staff')}
              className={`flex-1 xl:w-32 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${type === 'staff' ? 'bg-pink-500 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Xodimlar
            </button>
            <button 
              onClick={() => onTabChange?.('teacher')}
              className={`flex-1 xl:w-32 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${type === 'teacher' ? 'bg-pink-500 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              O&apos;qituvchilar
            </button>
          </div>

          <div className="relative flex-1 max-w-sm w-full group">
            <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-pink-500 transition-colors" />
            <input 
              type="text" 
              placeholder={type === 'staff' ? "Xodim bo'yicha qidiruv..." : "O'qituvchi bo'yicha qidiruv..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-zinc-200 rounded-2xl text-[13px] font-bold focus:border-pink-300 focus:ring-4 focus:ring-pink-50 transition-all outline-none text-zinc-800 placeholder:font-medium shadow-sm" 
            />
          </div>
          
          <div className="flex items-center gap-2">
             <Badge variant="outline" className="h-10 px-4 rounded-xl border-zinc-200 bg-white font-black text-[10px] text-zinc-400 uppercase tracking-widest">
               Jami: {filteredData.length} ta
             </Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full whitespace-nowrap">
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-zinc-50/50 border-b border-zinc-100">
                <TableHead className="py-4 pl-8 text-[12px] font-semibold text-zinc-500 uppercase tracking-widest">Xodim Ma&apos;lumotlari</TableHead>
                <TableHead className="py-4 text-[12px] font-semibold text-zinc-500 uppercase tracking-widest text-center">
                  {type === 'staff' ? 'Lavozim' : 'Mutaxassislik'}
                </TableHead>
                <TableHead className="py-4 text-[12px] font-semibold text-zinc-500 uppercase tracking-widest text-center">Holat</TableHead>
                <TableHead className="py-4 pr-8 text-right text-[12px] font-semibold text-zinc-500 uppercase tracking-widest">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <User className="w-12 h-12 mb-4 text-zinc-300" />
                      <p className="text-zinc-600 font-black text-sm uppercase tracking-widest">Ma&apos;lumot topilmadi</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => {
                  const isSelected = selectedId === item.id;
                  const rowBg = isSelected ? 'bg-zinc-100/50' : 'bg-white hover:bg-zinc-50';

                  return (
                    <TableRow 
                      key={item.id} 
                      className={`transition-all duration-200 border-b border-zinc-100 last:border-0 cursor-pointer min-h-[56px] ${rowBg}`}
                      onClick={() => onRowClick?.({id: item.id, name: item.name})}
                    >
                    <TableCell className="pl-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-2xl shadow-sm group-hover:bg-white group-hover:border-zinc-300 transition-all duration-300">
                          {item.photo_url ? (
                            <img src={item.photo_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                          ) : (
                            <img src={getAvatarUrl(item.name)} alt="" className="w-full h-full object-contain p-1" />
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className={`font-black text-[15px] transition-colors text-zinc-900 group-hover:text-pink-600`}>{item.name}</div>
                          <div className={`text-[11px] font-bold tracking-wide text-zinc-400`}>{item.phone}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-5">
                      <Badge className={`border-none font-bold px-3 py-1 rounded-lg uppercase text-[10px] tracking-wider bg-white text-zinc-600 shadow-sm`}>
                        {type === 'staff' ? item.position || 'Xodim' : item.specialization || "O'qituvchi"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center py-5">
                      {item.attendance ? (
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant="outline" className={`
                            ${item.attendance.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                              item.attendance.status === 'ABSENT' ? 'bg-white text-[#1e3a5f] border-[#1e3a5f]/30' : 
                              'bg-amber-50 text-amber-600 border-amber-100'} 
                            font-semibold text-[12px] px-3 py-0.5 rounded-full uppercase tracking-wider
                          `}>
                             {item.attendance.status === 'PRESENT' ? 'KELDI' : 
                              item.attendance.status === 'ABSENT' ? 'KELMADI' : 
                              `KECHIKDI (${item.attendance.delay_time || item.attendance.late_minutes || 0} MIN)`}
                          </Badge>
                        </div>
                      ) : (
                        <div className={`font-bold text-[10px] uppercase tracking-widest text-zinc-400`}>Belgilanmagan</div>
                      )}
                    </TableCell>
                    <TableCell className="pr-8 py-5 text-right relative z-10">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          size="sm"
                          onClick={() => onMark(item.id, 'PRESENT')}
                          className={`h-9 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all
                            ${item.attendance?.status === 'PRESENT' 
                              ? 'bg-emerald-600 text-white shadow-lg' 
                              : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50'}`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Keldi
                        </Button>
                         <Button 
                          size="sm"
                          onClick={() => onMark(item.id, 'ABSENT')}
                          className={`h-9 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all
                            ${item.attendance?.status === 'ABSENT' 
                              ? 'bg-[#1e3a5f] text-white shadow-lg' 
                              : 'bg-white text-[#1e3a5f] border border-[#1e3a5f]/20 hover:bg-[#1e3a5f]/5'}`}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-2" /> Kelmadi
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => onMark(item.id, 'LATE')}
                          className={`h-9 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all
                            ${item.attendance?.status === 'LATE' 
                              ? 'bg-amber-500 text-white shadow-lg' 
                              : 'bg-white text-amber-600 border border-amber-200 hover:bg-amber-50'}`}
                        >
                          <Clock className="w-3.5 h-3.5 mr-2" /> Kechikdi
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
}
