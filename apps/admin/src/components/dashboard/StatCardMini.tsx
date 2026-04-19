import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardMiniProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export const StatCardMini: React.FC<StatCardMiniProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  iconBg, 
  iconColor 
}) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border-none flex items-center gap-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm shrink-0`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-[22px] font-black text-gray-900 tracking-tighter truncate leading-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
      </div>
    </div>
  );
};
