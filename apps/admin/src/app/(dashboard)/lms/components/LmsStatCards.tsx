"use client";

import { useMemo } from 'react';
import { Users, LayoutGrid, BookOpen, Warehouse, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

interface LmsStatCardsProps {
  stats: {
    totalGroups: number;
    activeStudents: number;
    activeCourses: number;
    totalRooms: number;
  };
  isLoading: boolean;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  gradient, 
  index 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  gradient: number;
  index: number;
}) => {
  const gradients = [
    'from-[#ec4899] to-[#be185d]', // Pink
    'from-[#06b6d4] to-[#0284c7]', // Cyan
    'from-[#1e3a5f] to-[#0f172a]', // Navy
    'from-[#8b5cf6] to-[#6d28d9]', // Purple
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative overflow-hidden rounded-[20px] p-6 text-white shadow-lg bg-gradient-to-br ${gradients[gradient - 1]}`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-white/70 text-sm font-medium tracking-tight uppercase">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
        </div>
        <div className="p-3 bg-white/20 rounded-md backdrop-blur-sm">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute -right-4 -bottom-4 opacity-10">
        <Icon className="w-24 h-24 rotate-12" />
      </div>
    </motion.div>
  );
};

export function LmsStatCards({ stats, isLoading }: LmsStatCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-[20px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard 
        index={0}
        title="Jami Guruhlar" 
        value={stats.totalGroups} 
        icon={LayoutGrid} 
        gradient={1} 
      />
      <StatCard 
        index={1}
        title="O'quvchilar" 
        value={stats.activeStudents} 
        icon={Users} 
        gradient={2} 
      />
      <StatCard 
        index={2}
        title="Aktiv Kurslar" 
        value={stats.activeCourses} 
        icon={BookOpen} 
        gradient={3} 
      />
      <StatCard 
        index={3}
        title="Xonalar" 
        value={stats.totalRooms} 
        icon={Warehouse} 
        gradient={4} 
      />
    </div>
  );
}
