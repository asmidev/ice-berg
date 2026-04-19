'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle2, XCircle, Clock } from "lucide-react";

interface StatsProps {
  stats: {
    total: number;
    present: number;
    absent: number;
    late: number;
  };
  loading?: boolean;
}

export const AttendanceStatsVIP = ({ stats, loading }: StatsProps) => {
  const items = [
    { 
      label: 'Jami Xodimlar', 
      value: stats.total, 
      icon: Users, 
      color: 'text-white', 
      bg: 'bg-white/20',
      gradient: 'from-[#1e293b] to-[#0f172a]',
      textWhite: true
    },
    { 
      label: 'Kelganlar', 
      value: stats.present, 
      icon: CheckCircle2, 
      color: 'text-white', 
      bg: 'bg-white/20',
      gradient: 'from-[#10b981] to-[#059669]',
      textWhite: true
    },
    { 
      label: 'Kelmaganlar', 
      value: stats.absent, 
      icon: XCircle, 
      color: 'text-white', 
      bg: 'bg-white/20',
      gradient: 'from-[#e11d48] to-[#be123c]',
      textWhite: true
    },
    { 
      label: 'Kechikkanlar', 
      value: stats.late, 
      icon: Clock, 
      color: 'text-white', 
      bg: 'bg-white/20',
      gradient: 'from-[#0891b2] to-[#0e7490]',
      textWhite: true
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <Card key={i} className={`border-none shadow-sm bg-gradient-to-br ${item.textWhite ? item.gradient : 'from-white to-zinc-50'} rounded-2xl overflow-hidden relative group transition-all duration-300 hover:shadow-md`}>
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-4 flex items-center justify-between relative z-10 w-full h-full">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white shadow-sm border border-white/10 backdrop-blur-md`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col flex-1 truncate">
                <p className={`text-[10px] font-black uppercase tracking-widest ${item.textWhite ? 'text-white/80' : 'text-zinc-400'} truncate`}>
                  {item.label}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className={`text-2xl font-black tracking-tight leading-none ${item.textWhite ? 'text-white' : 'text-zinc-900'}`}>
                    {loading ? (
                       <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin block mt-1 opacity-50" />
                    ) : item.value}
                  </h3>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
