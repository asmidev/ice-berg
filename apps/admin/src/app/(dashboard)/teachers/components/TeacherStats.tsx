"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, BookOpen, UserCheck, GraduationCap } from 'lucide-react';

interface TeacherStatsProps {
  stats: {
    total: number;
    main: number;
    support: number;
    interns: number;
  };
}

export const TeacherStats = ({ stats }: TeacherStatsProps) => {
  const items = [
    {
      title: "Jami O'qituvchilar",
      value: stats.total,
      icon: <Users className="w-5 h-5 text-[#1E3A5F]" />,
      bg: "bg-[#E0F2FE]", // Light blue
      iconColor: "#1E3A5F"
    },
    {
      title: "Asosiy O'qituvchilar",
      value: stats.main,
      icon: <UserCheck className="w-5 h-5 text-[#9333EA]" />,
      bg: "bg-[#F3E8FF]", // Light purple
      iconColor: "#9333EA"
    },
    {
      title: "Yordamchi O'qituvchilar",
      value: stats.support,
      icon: <BookOpen className="w-5 h-5 text-[#06B6D4]" />,
      bg: "bg-[#E0F7FA]", // Light cyan
      iconColor: "#06B6D4"
    },
    {
      title: "Amaliyotchilar",
      value: stats.interns,
      icon: <GraduationCap className="w-5 h-5 text-[#DB2777]" />,
      bg: "bg-[#FCE7F3]", // Light pink
      iconColor: "#DB2777"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {items.map((item, i) => (
        <Card key={i} className="p-4 border border-zinc-100 shadow-sm rounded-md bg-white flex items-center justify-between hover:shadow-md transition-shadow duration-300">
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{item.title}</p>
            <p className="text-2xl font-black text-[#1E3A5F]">{item.value}</p>
          </div>
          <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center`}>
            {item.icon}
          </div>
        </Card>
      ))}
    </div>
  );
};
