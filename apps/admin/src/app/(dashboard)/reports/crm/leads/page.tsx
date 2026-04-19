'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Filter, UserCheck, PhoneCall, TrendingUp, MonitorPlay,
  Calendar, ChevronDown, Download, ArrowUpRight, ArrowDownRight,
  TrendingDown, UserPlus, Info, Search, ListFilter,
  BarChart2, PieChart as PieChartIcon, Activity, UserMinus,
  AlertTriangle, MessageSquare
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, LabelList, LineChart, Line, AreaChart, Area, PieChart, Pie
} from 'recharts';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useBranch } from '@/providers/BranchProvider';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

import * as XLSX from 'xlsx';

const INTERVALS = [
  { label: 'Oxirgi 7 kun', value: '7d' },
  { label: 'Oxirgi 30 kun', value: '30d' },
  { label: 'Oxirgi 3 oy', value: '90d' },
  { label: 'Shu yil', value: 'year' },
];

export default function LeadsReportPage() {
  const { branchId } = useBranch();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [interval, setInterval] = useState('30d');
  const [activeTab, setActiveTab] = useState('leads'); // 'leads', 'deleted', 'dropout'

  useEffect(() => {
    fetchLeadsReport();
  }, [branchId, interval]);

  const fetchLeadsReport = async () => {
    try {
      setLoading(true);
      const activeBranchId = branchId === 'all' ? undefined : branchId;
      
      const end = new Date();
      const start = new Date();
      if (interval === '7d') start.setDate(end.getDate() - 7);
      else if (interval === '30d') start.setDate(end.getDate() - 30);
      else if (interval === '90d') start.setDate(end.getDate() - 90);
      else if (interval === 'year') start.setMonth(0, 1);

      const res = await api.get('/analytics/leads-report', {
        params: {
          branch_id: activeBranchId,
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

  const handleExportExcel = () => {
    if (!data?.leads?.length) return;
    
    const excelData = data.leads.map((l: any) => ({
      'Ism': l.name,
      'Telefon': l.phone,
      'Sana': new Date(l.date).toLocaleDateString(),
      'Status': l.status,
      'Bosqich': l.stage,
      'Manba': l.source,
      'Menejer': l.manager
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lidlar");
    XLSX.writeFile(workbook, `Lidlar_Hisoboti_${new Date().toLocaleDateString()}.xlsx`);
  };

  const stats = useMemo(() => {
    if (!data?.stats) return [];
    
    if (activeTab === 'deleted') {
      return [
        { 
          title: "Eng ko'p rad etilgan", 
          value: data.dropout?.topReason || "N/A", 
          sub: "Asosiy dropout sababi", 
          icon: AlertTriangle, 
          grad: "linear-gradient(135deg, #ef4444 0%, #991b1b 100%)" 
        },
        { 
          title: "Yo'qotilgan Lidlar", 
          value: data.stats.archived, 
          sub: "Tanlangan davr bo'yicha", 
          icon: UserMinus, 
          grad: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)" 
        },
        { 
          title: "Mijoz E'tirozlari", 
          value: `${data.dropout?.notesRate || 0}%`, 
          sub: "Sotuvchilar izoh yozgan", 
          icon: MessageSquare, 
          grad: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" 
        },
        { 
          title: "Dropout Foizi", 
          value: `${data.stats.dropoutRate}%`, 
          sub: "Umumiy lidlarga nisbatan", 
          icon: TrendingDown, 
          grad: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" 
        },
      ];
    }

    if (activeTab === 'dropout') {
      return [
        { 
          title: "O'qishdan ketganlar", 
          value: "0", 
          sub: "Hozirgi davr uchun", 
          icon: UserMinus, 
          grad: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" 
        },
        { 
          title: "Retention (Saqlab qolish)", 
          value: "100%", 
          sub: "O'quvchilar turg'unligi", 
          icon: UserCheck, 
          grad: "linear-gradient(135deg, #10b981 0%, #064e3b 100%)" 
        },
        { 
          title: "Attritition Rate", 
          value: "0%", 
          sub: "Ketish koeffitsiyenti", 
          icon: ArrowDownRight, 
          grad: "linear-gradient(135deg, #f43f5e 0%, #9f1239 100%)" 
        },
        { 
          title: "Faol O'quvchilar", 
          value: data.stats.total_students || "0", 
          sub: "Tizimdagi jami", 
          icon: Users, 
          grad: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)" 
        },
      ];
    }

    return [
      { 
        title: "Umumiy Lidlar", 
        value: data.stats.total, 
        sub: "Tanlangan davrda", 
        icon: Users, 
        grad: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)" 
      },
      { 
        title: "Konvertatsiya", 
        value: `${data.stats.conversionRate}%`, 
        sub: `${data.stats.converted} ta o'quvchi`, 
        icon: TrendingUp, 
        grad: "linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)" 
      },
      { 
        title: "Faol Lidlar", 
        value: data.stats.active, 
        sub: "Jarayondagilar", 
        icon: Activity, 
        grad: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)" 
      },
      { 
        title: "Top Manba", 
        value: data.sourceData?.[0]?.name || "N/A", 
        sub: "Eng ko'p lid", 
        icon: UserPlus, 
        grad: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)" 
      },
    ];
  }, [data, activeTab]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500 pb-12 w-full mx-auto">
      
      {/* 🧭 NAVIGATION & ACTIONS (Combined) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-transparent">
        {/* 📑 TABS */}
        <div className="flex items-center gap-1 bg-zinc-100/80 p-1.5 rounded-xl w-max border border-zinc-200/40 shadow-sm backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('leads')}
            className={cn(
              "px-6 py-2 rounded-lg text-[13px] font-bold transition-all duration-200",
              activeTab === 'leads' ? "bg-white text-pink-600 shadow-sm border border-zinc-200/50" : "text-zinc-500 hover:text-zinc-800"
            )}
          >
            Lidlar Hisoboti
          </button>
          <button
            onClick={() => setActiveTab('deleted')}
            className={cn(
              "px-6 py-2 rounded-lg text-[13px] font-bold transition-all duration-200",
              activeTab === 'deleted' ? "bg-white text-pink-600 shadow-sm border border-zinc-200/50" : "text-zinc-500 hover:text-zinc-800"
            )}
          >
            Rad etilganlar
          </button>
          <button
            onClick={() => setActiveTab('dropout')}
            className={cn(
              "px-6 py-2 rounded-lg text-[13px] font-bold transition-all duration-200",
              activeTab === 'dropout' ? "bg-white text-pink-600 shadow-sm border border-zinc-200/50" : "text-zinc-500 hover:text-zinc-800"
            )}
          >
            Dropout
          </button>
        </div>

        {/* ⚙️ ACTIONS */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={interval} onValueChange={setInterval}>
            <SelectTrigger className="w-[160px] h-10 rounded-xl border-zinc-200 bg-white shadow-sm ring-pink-500/10 focus:ring-2">
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
            className="h-10 px-5 border-zinc-200 bg-white hover:bg-zinc-50 rounded-xl text-zinc-700 font-bold shadow-sm flex items-center gap-2 group border-b-2 active:border-b-0 active:translate-y-[1px] transition-all"
          >
            <Download className="w-4 h-4 text-pink-500 group-hover:scale-110 transition-transform" /> 
            <span>Eksport</span>
          </Button>
        </div>
      </div>

      {/* 📊 WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="relative overflow-hidden rounded-[16px] p-6 shadow-sm border border-zinc-100 group transition-all duration-300 hover:shadow-md" style={{ background: stat.grad }}>
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
               <stat.icon className="w-24 h-24 text-white" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-[13px] font-medium text-white/80">{stat.title}</span>
              </div>
              <div className="text-3xl font-bold text-white tracking-tight">{stat.value}</div>
              <div className="mt-2 text-[13px] text-white/70 font-medium flex items-center gap-1">
                {stat.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 📉 TREND CHART */}
        <Card className="lg:col-span-2 border-zinc-200 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-zinc-50 bg-zinc-50/10 px-6 py-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-zinc-900">
                {activeTab === 'deleted' ? "Rad Etilganlar Trendi" : activeTab === 'dropout' ? "Dropout Trendi" : "Lidlar Kelish Trendi"}
              </CardTitle>
              <Badge variant="outline" className="bg-pink-50 text-pink-600 border-pink-100 uppercase tracking-wider text-[10px]">Real-Vaqt</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeTab === 'deleted' ? (data?.dropout?.trendData || []) : activeTab === 'dropout' ? [] : (data?.trendData || [])}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeTab === 'deleted' ? "#ef4444" : "#ec4899"} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={activeTab === 'deleted' ? "#ef4444" : "#ec4899"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: activeTab === 'deleted' ? '#ef4444' : '#ec4899', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="count" stroke={activeTab === 'deleted' ? '#ef4444' : '#ec4899'} strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 🥧 SECONDARY CHART (SOURCE OR REASONS) */}
        <Card className="border-zinc-200 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-zinc-50 bg-zinc-50/10 px-6 py-5">
            <CardTitle className="text-lg font-bold text-zinc-900">
              {activeTab === 'deleted' ? "Rad etish sabablari" : activeTab === 'dropout' ? "Ketish Sabablari" : "Manbalar Bo'yicha"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center justify-center h-[350px]">
             {((activeTab === 'deleted' ? data?.dropout?.reasonsData : activeTab === 'dropout' ? [] : data?.sourceData) || []).length > 0 ? (
               <div className="w-full h-full flex flex-col">
                  <ResponsiveContainer width="100%" height="70%">
                    <PieChart>
                      <Pie
                        data={activeTab === 'deleted' ? data.dropout.reasonsData : activeTab === 'dropout' ? [] : data.sourceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[0, 1, 2, 3, 4, 5].map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={activeTab === 'deleted' ? ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#a855f7'][index % 6] : ['#ec4899', '#1e3a5f', '#06b6d4', '#8b5cf6'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-4 overflow-y-auto max-h-[100px] custom-scrollbar">
                    {((activeTab === 'deleted' ? data.dropout.reasonsData : activeTab === 'dropout' ? [] : data.sourceData) || []).map((s: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeTab === 'deleted' ? ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#a855f7'][i % 6] : ['#ec4899', '#1e3a5f', '#06b6d4', '#8b5cf6'][i % 4] }} />
                           <span className="text-zinc-500 font-medium truncate max-w-[140px]">{s.name}</span>
                        </div>
                        <span className="font-bold text-zinc-900">{s.value}</span>
                      </div>
                    ))}
                  </div>
               </div>
             ) : (
               <div className="text-zinc-400 text-sm italic">Ma'lumot mavjud emas</div>
             )}
          </CardContent>
        </Card>
      </div>

      {activeTab === 'leads' && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* 🪜 FUNNEL CHART */}
        <Card className="border-zinc-200 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-zinc-50 bg-zinc-50/10 px-6 py-5">
            <CardTitle className="text-lg font-bold text-zinc-900">Sotuv Voronkasi</CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data?.funnelData || []} layout="vertical" margin={{ left: 20, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#3f3f46', fontSize: 12, fontWeight: 600}} 
                    width={120} 
                  />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={28}>
                    {(data?.funnelData || []).map((entry: any, index: number) => (
                      <Cell key={index} fill={'#ec4899'} fillOpacity={1 - (index * 0.1)} />
                    ))}
                    <LabelList dataKey="count" position="right" fill="#18181b" fontSize={13} fontWeight={700} offset={10} />
                  </Bar>
               </BarChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 👨‍💼 MANAGER PERFORMANCE */}
        <Card className="border-zinc-200 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-zinc-50 bg-zinc-50/10 px-6 py-5">
            <CardTitle className="text-lg font-bold text-zinc-900">Menejerlar Ish Faoliyati</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <Table>
                <TableHeader className="bg-zinc-50/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider pl-6">Menejer</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider text-center">Lidlar Soni</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider text-right pr-6">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.managerData?.map((m: any, i: number) => (
                    <TableRow key={i} className="hover:bg-zinc-50/50 h-16 transition-colors duration-200">
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-bold text-xs uppercase shadow-sm">
                             {m.name.charAt(0)}
                           </div>
                           <span className="font-semibold text-zinc-800 text-[13px]">{m.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-zinc-900 text-[13px]">{m.count}</TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="w-full max-w-[120px] ml-auto space-y-1.5">
                           <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                              <span>Samaradorlik</span>
                              <span>{Math.min(100, Math.round((m.count / (data.stats.total || 1)) * 100))}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-pink-500 rounded-full transition-all duration-500" 
                                style={{ width: `${Math.min(100, Math.round((m.count / (data.stats.total || 1)) * 100))}%` }}
                              />
                           </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!data?.managerData || data.managerData.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-10 text-zinc-400 italic">Menejerlar faoliyati aniqlanmadi</TableCell>
                    </TableRow>
                  )}
                </TableBody>
             </Table>
          </CardContent>
        </Card>
      </div>
      )}

      {/* 📋 LEADS TABLE (Hidden in Dropout Tab) */}
      {activeTab === 'leads' && (
      <Card className="border-zinc-200 shadow-sm rounded-[24px] overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-3 duration-700">
        <CardHeader className="border-b border-zinc-50 bg-zinc-50/10 px-6 py-5 flex flex-row items-center justify-between">
           <CardTitle className="text-lg font-bold text-zinc-900 flex items-center gap-2">
             <ListFilter className="w-5 h-5 text-pink-500" /> Oxirgi Lidlar (Ro'yxat)
           </CardTitle>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Lid ismini qidirish..." 
                className="pl-9 pr-4 h-9 w-[240px] text-sm border-zinc-200 rounded-lg focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500 outline-none bg-zinc-50/50"
              />
           </div>
        </CardHeader>
        <CardContent className="p-0">
           <Table>
              <TableHeader className="bg-zinc-50/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider pl-6">Ism</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Telefon</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Sana</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider text-center">Bosqich</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider text-center">Manba</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider text-right pr-6">Menejer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.leads?.map((lead: any) => (
                  <TableRow key={lead.id} className="hover:bg-zinc-50/30 h-16 transition-colors duration-200 group">
                    <TableCell className="pl-6">
                      <span className="font-bold text-zinc-900 group-hover:text-pink-600 transition-colors text-[13px]">{lead.name}</span>
                    </TableCell>
                    <TableCell className="font-mono text-[12px] text-zinc-600">{lead.phone}</TableCell>
                    <TableCell className="text-zinc-500 text-[12px]">{new Date(lead.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-center">
                       <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-100 font-bold px-3 py-0.5 rounded-full text-[10px]">
                         {lead.stage}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                       <span className="text-zinc-600 font-medium text-[12px]">{lead.source}</span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                       <span className="text-zinc-500 italic text-[12px] font-medium">{lead.manager}</span>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.leads || data.leads.length === 0) && (
                   <TableRow>
                     <TableCell colSpan={6} className="text-center py-20">
                        <div className="flex flex-col items-center justify-center opacity-40">
                           <Users className="w-12 h-12 mb-4 text-zinc-300" />
                           <p className="text-zinc-500 font-medium">Bu davr uchun lidlar topilmadi</p>
                        </div>
                     </TableCell>
                   </TableRow>
                )}
              </TableBody>
           </Table>
        </CardContent>
      </Card>
      )}

    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg 
      className={cn("animate-spin", className)} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
