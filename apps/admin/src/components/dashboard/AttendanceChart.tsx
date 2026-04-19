import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { MoreHorizontal } from 'lucide-react';

const STATIC_DATA = [
  { name: '01', value: 850 },
  { name: '02', value: 720 },
  { name: '03', value: 940 },
  { name: '04', value: 1043 },
  { name: '05', value: 1144 },
  { name: '06', value: 980 },
  { name: '07', value: 1089 }, // Today highlight
  { name: '08', value: 1020 },
  { name: '09', value: 890 },
  { name: '10', value: 950 },
  { name: '11', value: 1010 },
  { name: '12', value: 1100 },
];

export const AttendanceChart = () => {
  const currentDay = '07'; // Mocking today for visual match

  return (
    <div className="border-none shadow-[0_2px_12px_rgba(0,0,0,0.04)] bg-white rounded-[24px] overflow-hidden p-8 flex flex-col gap-8 h-full">
      <div className="flex flex-row items-center justify-between">
        <div>
           <h3 className="text-[18px] font-black text-gray-900 uppercase tracking-tight">O'quvchilar davomati</h3>
           <p className="text-[12px] font-medium text-gray-400 mt-1">Kunlik qatnashish ko'rsatkichi</p>
        </div>
        <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      <div className="h-[220px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={STATIC_DATA} margin={{ top: 0, right: 0, left: -35, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#CBD5E1', fontSize: 10, fontWeight: 700}} 
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#CBD5E1', fontSize: 10, fontWeight: 700}}
            />
            <Tooltip 
              cursor={{fill: '#F8FAFC', radius: 10}}
              contentStyle={{
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
                padding: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={26}>
              {STATIC_DATA.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.name === currentDay ? '#0F172A' : '#FDF2F8'} 
                  className="transition-all duration-500"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-between items-center pt-2">
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#0F172A]"></div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Bugun</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#FDF2F8]"></div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Boshqa kunlar</span>
         </div>
      </div>
    </div>
  );
};
