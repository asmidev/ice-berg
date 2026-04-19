"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, CalendarDays, Filter, PieChart as PieChartIcon, 
  ChevronDown, Banknote, Briefcase, Calculator 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

const salaryDistribution = [
  { name: 'O\'qituvchilar', value: 45000000, color: '#3b82f6' },
  { name: 'Ma\'muriyat', value: 15000000, color: '#8b5cf6' },
  { name: 'Sotuv', value: 12000000, color: '#10b981' },
  { name: 'Xo\'jalik', value: 4000000, color: '#f59e0b' },
];

const totalSalary = salaryDistribution.reduce((acc, curr) => acc + curr.value, 0);

export default function SalaryReportPage() {
  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 w-full max-w-7xl mx-auto">
      
      {/* 🚀 Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-zinc-200/80 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-zinc-800/5 rounded-full blur-3xl translate-x-1/4 -translate-y-1/2 pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center">
            Ish Haqi Fondi Analitikasi <PieChartIcon className="w-6 h-6 ml-3 text-zinc-600" />
          </h1>
          <p className="text-zinc-500 text-[15px] mt-1.5 font-medium max-w-xl">
             Moddiy rag'batlantirish hamda ustozlarning oyliklariga ketgan ulushlarning Moliya byudjetiga ta'siri.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 md:mt-0 relative z-10">
           <Button className="h-12 px-6 bg-zinc-900 hover:bg-black shadow-sm text-white font-bold rounded-xl w-full sm:w-auto">
             <Filter className="w-4 h-4 mr-1.5" /> Chuqur Filtrlash
           </Button>
        </div>
      </div>

      {/* 📊 STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
           { title: "Jami Payroll", value: "76.0", sub: "Million ajratilgan", icon: Calculator, isMain: true },
           { title: "Eng O'suvchan", value: "Sotuv", sub: "KPI lar hisobiga", icon: TrendingUp, isMain: false },
           { title: "O'qituvchilar", value: "59%", sub: "Asosiy ulush", icon: Briefcase, isMain: false },
        ].map((stat, i) => (
          <Card key={i} className={`border ${stat.isMain ? 'border-zinc-300' : 'border-zinc-200'} shadow-sm bg-white hover:border-zinc-400 hover:shadow-md transition-all duration-300 rounded-3xl overflow-hidden relative group`}>
             <CardContent className="p-8 relative z-10">
                <div className="flex items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm ${stat.isMain ? 'bg-zinc-900 text-white border-zinc-700' : 'bg-zinc-50 text-zinc-600 border-zinc-100'}`}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                </div>
                <h3 className="text-zinc-500 font-bold text-sm mb-1 uppercase tracking-widest">{stat.title}</h3>
                <h2 className="text-4xl font-black text-zinc-900 tracking-tight flex items-baseline leading-none">
                  {stat.value} {stat.isMain && <span className="text-xl ml-1 opacity-50">M</span>}
                </h2>
                <p className="text-xs font-bold text-zinc-500 mt-4 bg-zinc-50 border border-zinc-100 w-max px-2.5 py-1 rounded">
                   {stat.sub}
                </p>
             </CardContent>
          </Card>
        ))}
      </div>

      {/* 🧭 CHART */}
      <Card className="border border-zinc-200 shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="border-b border-zinc-100 px-8 py-6 bg-zinc-50/50">
          <CardTitle className="text-xl font-black text-zinc-900">Jami Ajratilgan Byudjet Taqsimoti</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-8 h-[450px] w-full flex flex-col md:flex-row items-center justify-center">
          <div className="w-full md:w-1/2 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={salaryDistribution} cx="50%" cy="50%" innerRadius={80} outerRadius={140} paddingAngle={5} dataKey="value" stroke="none">
                  {salaryDistribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(val: any) => [`${(Number(val || 0) / 1000000).toFixed(1)} M`, 'Summa']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-1/2 flex flex-col gap-4 px-8 mt-6 md:mt-0 max-w-sm">
             {salaryDistribution.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-zinc-50 border border-zinc-100 p-4 rounded-xl group hover:border-zinc-300 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-bold text-zinc-700">{item.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-black">{(item.value / 1000000).toFixed(1)}M</span>
                    <span className="text-[10px] uppercase font-bold text-zinc-400">{((item.value / totalSalary) * 100).toFixed(1)}%</span>
                  </div>
                </div>
             ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
