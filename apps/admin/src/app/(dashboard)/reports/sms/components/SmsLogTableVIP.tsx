import React from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Phone, Calendar, Info, MapPin } from 'lucide-react';

interface SmsLogTableProps {
  logs: any[];
  loading: boolean;
}

export const SmsLogTableVIP = ({ logs, loading }: SmsLogTableProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((_, i) => (
          <div key={i} className="h-16 w-full bg-zinc-50 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <Card className="p-20 border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center bg-white rounded-xl">
        <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
          <Info className="w-10 h-10 text-zinc-300" />
        </div>
        <h3 className="text-lg font-black text-zinc-900 mb-2">SMS loglari topilmadi</h3>
        <p className="text-zinc-500 text-sm max-w-[280px] text-center font-medium">Bu muddat uchun hali SMS xabarlar yuborilmagan ko'rinadi.</p>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-xl shadow-zinc-200/40 bg-white rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="border-b border-zinc-100/50 hover:bg-transparent">
              <TableHead className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-8 py-5">Sana va Vaqt</TableHead>
              <TableHead className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Telefon</TableHead>
              <TableHead className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Xabar matni</TableHead>
              <TableHead className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Filial</TableHead>
              <TableHead className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pr-8 text-right">Holat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors group">
                <TableCell className="pl-8 py-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-gray-900">
                        {new Date(log.sent_at).toLocaleDateString()}
                      </p>
                      <p className="text-[11px] font-bold text-zinc-400">
                        {new Date(log.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-[13px] font-black text-gray-700">{log.phone}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <p className="text-[13px] font-medium text-gray-600 line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
                    {log.message}
                  </p>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                    <span className="text-[11px] font-bold text-cyan-600 uppercase tracking-widest">
                       {log.branch?.name || 'Bosh Filial'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="pr-8 text-right">
                  <Badge className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none
                    ${log.status === 'SENT' 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-rose-50 text-rose-600'}`}>
                    {log.status === 'SENT' ? 'Yetkazildi' : 'Xatolik'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
