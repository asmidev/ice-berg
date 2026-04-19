"use client";

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Filter, UserX, UserCheck, CalendarDays, LineChart, Loader2, Download, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { useBranch } from '@/providers/BranchProvider';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

const INTERVALS = [
  { label: 'Oxirgi 7 kun', value: '7d' },
  { label: 'Oxirgi 30 kun', value: '30d' },
  { label: 'Oxirgi 90 kun', value: '90d' },
  { label: 'Shu yil', value: 'year' },
];

export default function StudentsAttendanceReportPage() {
  const { branchId: selectedBranch } = useBranch();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [interval, setInterval] = useState('30d');

  useEffect(() => {
    fetchAttendanceReport();
  }, [selectedBranch, interval]);

  const fetchAttendanceReport = async () => {
    try {
      setLoading(true);
      const branchId = selectedBranch === 'all' ? undefined : selectedBranch;
      
      const end = new Date();
      const start = new Date();
      if (interval === '7d') start.setDate(end.getDate() - 7);
      else if (interval === '30d') start.setDate(end.getDate() - 30);
      else if (interval === '90d') start.setDate(end.getDate() - 90);
      else if (interval === 'year') start.setMonth(0, 1);

      const res = await api.get('/attendance/report', {
        params: {
          branch_id: branchId,
          startDate: start.toISOString(),
          endDate: end.toISOString()
        }
      });
      setData(res.data.data || res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (!data?.stats) return [];
    const base = [
       { 
         title: "Umumiy Davomat", 
         value: data.stats.overall, 
         sub: "O'rtacha ko'rsatkich", 
         icon: UserCheck, 
         grad: "linear-gradient(135deg, #10b981 0%, #064e3b 100%)" 
       },
       { 
         title: "Sababsiz 'N'", 
         value: data.stats.unexcused, 
         sub: "Jami dars qoldirganlar", 
         icon: UserX, 
         grad: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)" 
       },
       { 
         title: "Jami Qaydlar", 
         value: data.stats.total, 
         sub: "Tanlangan davr", 
         icon: CalendarDays, 
         grad: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" 
       },
    ];

    const extra = [
      { 
        title: "Eng yaxshi guruh", 
        value: data.stats.bestGroup ? `${data.stats.bestGroup.rate}%` : '0%', 
        sub: data.stats.bestGroup?.name || 'Mavjud emas', 
        icon: TrendingUp, 
        grad: "linear-gradient(135deg, #059669 0%, #064e3b 100%)" 
      },
      { 
        title: "Eng sust guruh", 
        value: data.stats.worstGroup ? `${data.stats.worstGroup.rate}%` : '0%', 
        sub: data.stats.worstGroup?.name || 'Mavjud emas', 
        icon: ArrowDownRight, 
        grad: "linear-gradient(135deg, #f43f5e 0%, #881337 100%)" 
      },
      { 
        title: "O'g'il bolalar", 
        value: `${data.stats.gender?.boys || 0}%`, 
        sub: "Erkak o'quvchilar", 
        icon: Users, 
        grad: "linear-gradient(135deg, #6366f1 0%, #312e81 100%)" 
      },
      { 
        title: "Qiz bolalar", 
        value: `${data.stats.gender?.girls || 0}%`, 
        sub: "Ayol o'quvchilar", 
        icon: Users, 
        grad: "linear-gradient(135deg, #ec4899 0%, #831843 100%)" 
      },
    ];

    return [...base, ...extra];
  }, [data]);

  const handleExportExcel = () => {
    if (!data?.trend?.length) return;
    const worksheet = XLSX.utils.json_to_sheet(data.trend);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Davomat");
    XLSX.writeFile(workbook, `Davomat_Hisoboti_${new Date().toLocaleDateString()}.xlsx`);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500 pb-12 w-full mx-auto h-full overflow-y-auto custom-scrollbar pt-2">
      
      {/* 📊 WIDGETS - Expanded grid to show more cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="relative overflow-hidden rounded-[24px] p-5 shadow-sm border border-zinc-100 group transition-all duration-300 hover:shadow-md" style={{ background: stat.grad }}>
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
               <stat.icon className="w-20 h-20 text-white" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <stat.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">{stat.title}</span>
              </div>
              <div className="text-3xl font-black text-white tracking-tighter">{stat.value}</div>
              <div className="mt-1 text-[11px] text-white/70 font-bold flex items-center gap-1">
                {stat.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🧭 CHART & ACTIONS INTEGRATED */}
      <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white border border-zinc-100">
        <CardHeader className="border-b border-zinc-50 bg-zinc-50/10 px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
               <CardTitle className="text-xl font-black text-zinc-900">Oylik Davomat Tebranishi</CardTitle>
               <p className="text-sm text-zinc-500 font-medium mt-1">Siz tanlagan davr bo'yicha kelganlar va qoldirganlar statistikasi.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger className="w-[140px] h-9 rounded-xl border-zinc-200 bg-white shadow-sm ring-emerald-500/10 focus:ring-2">
                  <Calendar className="w-3.5 h-3.5 mr-2 text-zinc-500" />
                  <SelectValue placeholder="Davr" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-zinc-200 shadow-xl">
                  {INTERVALS.map(i => (
                    <SelectItem key={i.value} value={i.value} className="text-[13px] font-medium">{i.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleExportExcel}
                variant="outline" 
                className="h-9 px-4 border-zinc-200 bg-white hover:bg-zinc-50 rounded-xl text-zinc-700 font-bold shadow-sm flex items-center gap-2 group border-b-2 active:border-b-0 active:translate-y-[1px] transition-all"
              >
                <Download className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" /> 
                <span>Excel</span>
              </Button>

              <Badge variant="outline" className="hidden lg:flex bg-emerald-50 text-emerald-700 border-emerald-100 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">Dinamik</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.trend || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorKeldi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorKelmadi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
              <Tooltip 
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                cursor={{ stroke: '#10b981', strokeWidth: 2 }}
              />
              <Area type="monotone" dataKey="keldi" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorKeldi)" />
              <Area type="monotone" dataKey="kelmadi" stroke="#1e3a5f" strokeWidth={4} fillOpacity={1} fill="url(#colorKelmadi)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
}
