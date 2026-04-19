"use client";

import React from 'react';
import { Target, TrendingUp, UserCheck, Users, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CrmStatCardsProps {
  stats: {
    totalLeads: number;
    conversionRate: number;
    activeLeads: number;
    topSource: string;
  };
}

export const CrmStatCards: React.FC<CrmStatCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: "Jami Lidlar",
      value: stats.totalLeads,
      icon: Users,
      gradient: "from-[#ec4899] to-[#be185d]", // Card Grad 1 (Pink)
      subtitle: "Tanlangan davrda",
      trend: "+12.5%",
      id: "students"
    },
    {
      title: "Konversiya",
      value: `${stats.conversionRate}%`,
      icon: Target,
      gradient: "from-[#06b6d4] to-[#0284c7]", // Card Grad 2 (Cyan)
      subtitle: "Lid -> O'quvchi",
      trend: "↑ Trend",
      id: "teachers"
    },
    {
      title: "Faol Lidlar",
      value: stats.activeLeads,
      icon: UserCheck,
      gradient: "from-[#1e3a5f] to-[#0f172a]", // Card Grad 3 (Navy)
      subtitle: "Hozirda jarayonda",
      trend: "8 ta yangi",
      id: "finance"
    },
    {
      title: "Samarali Kanal",
      value: stats.topSource || "Boshqa",
      icon: TrendingUp,
      gradient: "from-[#8b5cf6] to-[#6d28d9]", // Card Grad 4 (Purple)
      subtitle: "Eng ko'p lid kelgan",
      trend: "Instagram",
      id: "bonus"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {cards.map((card, i) => (
        <motion.div 
          key={i} 
          variants={item}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className={`relative overflow-hidden p-[20px] rounded-[12px] bg-gradient-to-br ${card.gradient} text-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300 group`}
        >
          {/* Header Qismi (Rule 218) */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-[40px] h-[40px] rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner group-hover:scale-105 transition-transform duration-500">
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-medium text-white/70 uppercase tracking-wider">{card.title}</span>
                <span className="text-[11px] font-medium text-white/50">{card.subtitle}</span>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-white/10 hidden group-hover:flex items-center justify-center transition-opacity">
               <ArrowUpRight size={12} className="text-white/80" />
            </div>
          </div>
          
          {/* Qiymat Qismi (Rule 219) */}
          <div className="mt-4 flex flex-col">
            <span className="text-[28px] font-bold tracking-tight leading-none drop-shadow-sm">
              {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
            </span>
            
            <div className="flex items-center gap-2 mt-3">
              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/15 border border-white/10 text-[10px] font-bold uppercase tracking-wide">
                {card.trend}
              </div>
              <div className="flex-1 h-[2px] bg-white/10 rounded-full overflow-hidden">
                 <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '45%' }}
                  transition={{ duration: 1, delay: i * 0.15 }}
                  className="h-full bg-white/40 rounded-full"
                 />
              </div>
            </div>
          </div>

          {/* Fon dekoratsiyasi (Soft) */}
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-700" />
          <card.icon className="absolute -left-6 -bottom-6 w-28 h-28 opacity-[0.05] group-hover:scale-110 transition-all duration-700" />
        </motion.div>
      ))}
    </motion.div>
  );
};
