import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

interface SmsTrafficChartProps {
  data: any[];
  loading: boolean;
}

export const SmsTrafficChartVIP = ({ data, loading }: SmsTrafficChartProps) => {
  if (loading) {
    return (
      <Card className="border-none shadow-xl shadow-zinc-200/40 bg-white rounded-xl h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-zinc-100 border-t-pink-500 rounded-full animate-spin" />
          <p className="text-zinc-400 font-bold text-sm tracking-widest uppercase">Grafik yuklanmoqda...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-xl shadow-zinc-200/40 bg-white rounded-xl overflow-hidden">
      <CardHeader className="border-b border-zinc-50 px-8 py-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-black text-gray-900 uppercase tracking-widest">Xabarlar Trafigi</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Yetkazildi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-800" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Xatolik</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-10 h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={Array.isArray(data) ? data : []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#a1a1aa', fontSize: 11, fontWeight: 700}} 
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#d4d4d8', fontSize: 11, fontWeight: 700}} 
            />
            <Tooltip 
              cursor={{fill: '#fdf2f8'}} 
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                padding: '12px 16px'
              }} 
              itemStyle={{ fontWeight: 800, fontSize: '12px' }}
              labelStyle={{ color: '#71717a', marginBottom: '4px', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}
            />
            <Bar dataKey="sent" name="Muvaffaqiyatli" fill="#ec4899" radius={[6, 6, 0, 0]} barSize={40} />
            <Bar dataKey="failed" name="Xatolik" fill="#1e293b" radius={[6, 6, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
