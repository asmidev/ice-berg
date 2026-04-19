import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal } from 'lucide-react';

const STATIC_DATA = [
  { name: 'Yan', g7: 82, g8: 75, g9: 78 },
  { name: 'Fev', g7: 78, g8: 82, g9: 72 },
  { name: 'Mar', g7: 85, g8: 70, g9: 80 },
  { name: 'Apr', g7: 72, g8: 85, g9: 75 },
  { name: 'May', g7: 90, g8: 78, g9: 82 },
  { name: 'Iyun', g7: 85, g8: 80, g9: 88 },
];

interface StudentPerformanceChartProps {
  data?: Array<{ name: string; avg: number }>;
}

export const StudentPerformanceChart: React.FC<StudentPerformanceChartProps> = ({ data = [] }) => {
  // Use last 6 months if we have data
  const chartData = data.length > 0 ? data.slice(-8) : STATIC_DATA.map(d => ({ name: d.name, avg: d.g7 }));

  return (
    <div className="border-none shadow-[0_2px_12px_rgba(0,0,0,0.04)] bg-white rounded-[32px] overflow-hidden p-8 flex flex-col gap-8 h-[400px] group hover:shadow-xl transition-all duration-500">
      <div className="flex flex-row items-center justify-between">
        <div>
           <h3 className="text-[18px] font-black text-gray-900 uppercase tracking-tight">O'quvchilar samaradorligi</h3>
           <p className="text-[12px] font-medium text-gray-400 mt-1">Oylik o'zlashtirish ko'rsatkichi (%)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            Real vaqtda
          </div>
        </div>
      </div>

      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}} 
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              domain={[0, 100]}
              tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip 
              cursor={{fill: '#F8FAFC', radius: 12}}
              contentStyle={{
                borderRadius: '20px', 
                border: 'none', 
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', 
                padding: '15px',
                fontWeight: 'bold'
              }}
              formatter={(value: any) => [`${value}%`, "O'rtacha ball"]}
            />
            <Bar 
              dataKey="avg" 
              name="Samaradorlik" 
              fill="#6366F1" 
              radius={[10, 10, 10, 10]} 
              barSize={32}
              className="hover:fill-indigo-400 transition-colors"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
