import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import { Card } from '@/components/ui/card';

interface LeadSourceChartProps {
  data: Array<{ name: string; count: number }>;
}

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

export const LeadSourceChart: React.FC<LeadSourceChartProps> = ({ data = [] }) => {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="p-8 bg-white border-none shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-[32px] h-[400px] flex flex-col group hover:shadow-xl transition-all duration-500">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-[18px] font-black text-gray-900 tracking-tight flex items-center gap-2">
            Lidlar manbalari
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] rounded-full uppercase">Marketing</span>
          </h3>
          <p className="text-[13px] font-medium text-gray-400 mt-1">Lidlar qayerdan kelayotgani tahlili</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.length > 0 ? data : [{ name: 'Ma\'lumot yo\'q', count: 1 }]}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={100}
              paddingAngle={8}
              dataKey="count"
              stroke="none"
              animationDuration={1500}
            >
              {(data.length > 0 ? data : [{ name: '', count: 1 }]).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={data.length > 0 ? COLORS[index % COLORS.length] : '#f1f5f9'} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                padding: '12px 16px',
                fontWeight: '700',
                fontSize: '12px'
              }} 
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Central Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[32px] font-black text-gray-900 tracking-tighter leading-none">
            {total}
          </span>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            Jami
          </span>
        </div>
      </div>

      {/* Custom Legend at Bottom */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6">
        {data.slice(0, 4).map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2 overflow-hidden">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="text-[12px] font-bold text-gray-600 truncate">{entry.name}</span>
            <span className="text-[11px] font-medium text-gray-400 ml-auto shrink-0">
               {total > 0 ? Math.round((entry.count / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
