"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Trophy, Medal, GraduationCap, TrendingUp, CalendarDays, BarChart4
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const scoresData = [
  { group: 'IELTS-21', ovg: 8.5 },
  { group: 'Web-05', ovg: 9.2 },
  { group: 'Kids-12', ovg: 7.8 },
  { group: 'Math-03', ovg: 6.4 },
  { group: 'IELTS-22', ovg: 5.1 },
];

export default function StudentsScoresReportPage() {
  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 w-full max-w-7xl mx-auto">
      
      {/* 🚀 Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-zinc-200/80 overflow-hidden relative">
        <div className="absolute left-1/2 bottom-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center">
            O'rtacha O'zlashtirish Ballari <Trophy className="w-6 h-6 ml-3 text-amber-500" />
          </h1>
          <p className="text-zinc-500 text-[15px] mt-1.5 font-medium max-w-xl">
             Ustozlar qaysi guruhlarining o'zlashtirish va baholari yuqori, va qaysilari past ekanligini fosh etuvchi graf.
          </p>
        </div>
      </div>

      {/* 📊 WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
           { title: "Eng Zo'r O'zlashtirgan", value: "Web-05", sub: "9.2/10 O'rtacha reyting", icon: Medal, color: "amber" },
           { title: "Umumiy Reyting", value: "7.4 / 10", sub: "Markaz miqyosida o'sish", icon: TrendingUp, color: "emerald" },
           { title: "Eng Past Natija", value: "IELTS-22", sub: "Sifat tushib ketgan", icon: BarChart4, color: "red" },
        ].map((stat, i) => (
          <Card key={i} className={`border border-zinc-200 shadow-sm bg-white hover:border-${stat.color}-300 hover:shadow-md transition-all duration-300 rounded-3xl group`}>
             <CardContent className="p-8 relative z-10">
                <div className="flex items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm bg-white border-${stat.color}-100 text-${stat.color}-600`}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                </div>
                <h3 className="text-zinc-500 font-bold text-sm mb-1 uppercase tracking-widest">{stat.title}</h3>
                <h2 className="text-4xl font-black text-zinc-900 tracking-tight leading-none">
                  {stat.value}
                </h2>
                <p className="text-xs font-bold text-zinc-500 mt-4 bg-zinc-50 border border-zinc-100 w-max px-2.5 py-1 rounded">
                   {stat.sub}
                </p>
             </CardContent>
          </Card>
        ))}
      </div>

      {/* 🧭 CHART */}
      <Card className="border border-zinc-200 shadow-sm bg-white rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-zinc-100 px-8 py-6 bg-zinc-50/50">
          <CardTitle className="text-xl font-black text-zinc-900">Guruhlar O'zlashtirish Ustuni (10 ballik tizim)</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-10 h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoresData} margin={{ top: 0, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
              <XAxis dataKey="group" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 13, fontWeight: 700}} dy={10} />
              <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 13, fontWeight: 700}} />
              <Tooltip cursor={{fill: '#f4f4f5'}} contentStyle={{ borderRadius: '12px', fontWeight: 'bold' }} />
              <Bar dataKey="ovg" fill="#f59e0b" radius={[8, 8, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
}
