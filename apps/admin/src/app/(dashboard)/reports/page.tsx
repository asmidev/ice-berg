'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, CalendarIcon, ChevronDown, PieChart as PieChartIcon, Target, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
const RADAR_DATA = [
  { subject: 'English', A: 120, B: 110, fullMark: 150 },
  { subject: 'Math', A: 98, B: 130, fullMark: 150 },
  { subject: 'IT', A: 86, B: 130, fullMark: 150 },
  { subject: 'Business', A: 99, B: 100, fullMark: 150 },
  { subject: 'SMM', A: 85, B: 90, fullMark: 150 },
  { subject: 'Design', A: 65, B: 85, fullMark: 150 },
];

const PIE_DATA = [
  { name: 'Instagram Lids', value: 400 },
  { name: 'Telegram Lids', value: 300 },
  { name: 'Facebook Lids', value: 300 },
  { name: 'Direct (Tanishlar)', value: 200 },
];

export default function ReportsPage() {
  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50 p-6 rounded-2xl shadow-sm border border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800 tracking-tight">Chuqurlashtirilgan Hisobotlar</h1>
          <p className="text-zinc-500 text-sm mt-1">Sotuvlar, yo'nalishlar va manbalar bo'yicha tahlil</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="h-10 border-zinc-200 text-zinc-500 hover:bg-white shadow-sm font-medium">
            <CalendarIcon className="w-4 h-4 mr-2" /> Joriy Oy <ChevronDown className="w-3 h-3 ml-2" />
          </Button>
          <Button className="h-10 bg-blue-600/90 hover:bg-blue-600 hover:bg-blue-600 shadow-sm shadow-blue-500/20 text-zinc-800 font-medium">
            <Download className="w-4 h-4 mr-2" /> PDF Yuklash
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radar Chart */}
        <Card className="border-0 shadow-sm bg-zinc-50 overflow-hidden relative group">
          <CardHeader className="border-b border-zinc-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50/40 text-blue-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <CardTitle className="text-lg text-zinc-800">Yo'nalishlar Bo'yicha Qiziqish</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_DATA}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fill: '#cbd5e1', fontSize: 10 }} />
                <Radar name="2025 YoY" dataKey="B" stroke="#94a3b8" fill="#e2e8f0" fillOpacity={0.6} />
                <Radar name="2026 Joriy" dataKey="A" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.6} />
                <RechartsTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border-0 shadow-sm bg-zinc-50 overflow-hidden relative group">
          <CardHeader className="border-b border-zinc-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/40 text-emerald-400 flex items-center justify-center">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <CardTitle className="text-lg text-zinc-800">Lidlar Manzili (Sourcelar)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 h-[400px] flex flex-col items-center relative">
            
            <div className="absolute inset-0 flex items-center justify-center mt-6 z-0">
              <div className="text-center bg-zinc-50 rounded-full p-6 shadow-sm border border-zinc-200 flex items-center justify-center w-32 h-32 flex-col z-10">
                <span className="text-xs font-bold text-zinc-500 tracking-wider mb-1">Jami</span>
                <span className="text-2xl font-bold text-zinc-800">1.2K</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height="100%" className="z-10 absolute pointer-events-none">
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  className="pointer-events-auto filter drop-shadow-sm"
                >
                  {PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="w-full mt-auto grid grid-cols-2 gap-4 pt-4 z-20">
              {PIE_DATA.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-zinc-200">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i] }} />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-zinc-500">{item.name}</div>
                    <div className="text-sm font-bold text-zinc-800">{item.value} ta</div>
                  </div>
                </div>
              ))}
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
