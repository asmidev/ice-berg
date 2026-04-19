import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PhoneCall, Clock, MoreHorizontal, User, Mail, ArchiveX } from 'lucide-react';

interface LeadsTableProps {
  leads: any[];
  onArchive: (leadId: string) => void;
  getStageColor: (order: number) => string;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({ leads, onArchive, getStageColor }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Close dropdown on click outside (simple approach for this component)
  React.useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    if (activeDropdown) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden min-h-[400px]">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-transparent border-gray-100">
            <TableHead className="w-[100px] text-[11px] font-black text-gray-400 uppercase tracking-widest px-6 py-4">ID</TableHead>
            <TableHead className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-6 py-4">Lid (Ism)</TableHead>
            <TableHead className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-6 py-4">Telefon</TableHead>
            <TableHead className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-6 py-4">Bosqich</TableHead>
            <TableHead className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-6 py-4">Kelish manbasi</TableHead>
            <TableHead className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-6 py-4">Ro'yxatdan o'tdi</TableHead>
            <TableHead className="text-right text-[11px] font-black text-gray-400 uppercase tracking-widest px-6 py-4">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-[13px] font-medium text-gray-400 italic">
                Lidlar topilmadi
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => {
              const color = getStageColor(lead.stage?.order || 0);
              return (
                <TableRow key={lead.id} className="group hover:bg-gray-50/50 transition-colors border-gray-50 h-[64px]">
                  <TableCell className="px-6 py-4">
                    <span className="text-[12px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      {lead.id.slice(0, 6).toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs border border-white shadow-sm ring-2 ring-gray-100`}>
                        {lead.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-black text-gray-900 leading-tight">{lead.name}</span>
                        <span className="text-[11px] font-medium text-gray-400">{lead.manager?.first_name || 'Boshqaruvchi biriktirilmagan'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-[13px] font-black text-gray-700">
                      <PhoneCall size={14} className="text-gray-400" />
                      {lead.phone}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge className={`bg-${color}-50 text-${color}-600 border-${color}-100 font-black text-[10px] uppercase px-2.5 py-1 rounded-full shadow-sm`}>
                      {lead.stage?.name || 'Noma\'lum'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-tighter">
                      {lead.source?.name || 'Boshqa'}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-black text-gray-700 tracking-tight">
                        {new Date(lead.created_at).toLocaleDateString('uz-UZ')}
                      </span>
                      <span className="text-[10px] font-medium text-gray-400 uppercase">
                        {new Date(lead.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right overflow-visible">
                    <div className="flex justify-end gap-2 relative">
                       <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === lead.id ? null : lead.id);
                        }}
                        className={`p-2 hover:bg-white rounded-xl text-gray-400 hover:text-pink-600 border border-transparent hover:border-pink-100 transition-all shadow-none hover:shadow-sm ${activeDropdown === lead.id ? 'bg-white border-pink-100 text-pink-600 shadow-sm' : ''}`}
                       >
                          <MoreHorizontal size={18} />
                       </button>

                       {/* Dropdown Menu */}
                       {activeDropdown === lead.id && (
                          <div 
                            className="absolute right-0 top-11 w-44 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                             <button 
                              onClick={() => { onArchive(lead.id); setActiveDropdown(null); }}
                              className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-rose-500 hover:bg-gray-50 flex items-center justify-between transition-colors"
                             >
                               <span className="flex items-center gap-2">
                                  <ArchiveX size={15} strokeWidth={2.5} /> Arxivlash
                               </span>
                             </button>
                             <div className="mx-2 my-1 border-t border-gray-50" />
                             <button className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                               <Mail size={15} /> Xabar yuborish
                             </button>
                          </div>
                       )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
