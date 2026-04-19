"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecentStudent {
  id: string;
  user: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  joined_at: string;
}

interface RecentStudentsProps {
  students: RecentStudent[];
}

export const RecentStudents: React.FC<RecentStudentsProps> = ({ students }) => {
  return (
    <Card className="p-6 rounded-[12px] border-zinc-100 shadow-sm bg-white h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-[16px] font-semibold text-zinc-800">Yangi Talabalar</h3>
          <p className="text-[12px] text-zinc-500">So'nggi qo'shilganlar ro'yxati</p>
        </div>
      </div>

      <div className="space-y-4">
        {students.length === 0 ? (
          <div className="text-center py-10 text-zinc-400 text-sm">
            Hozircha ma'lumot yo'q
          </div>
        ) : (
          students.map((student, i) => (
            <motion.div 
              key={student.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-zinc-100"
            >
              <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 font-bold group-hover:scale-110 transition-transform">
                {student.user.first_name[0]}{student.user.last_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-zinc-800 truncate">
                  {student.user.first_name} {student.user.last_name}
                </div>
                <div className="text-[11px] text-zinc-500 truncate">
                  {new Date(student.joined_at).toLocaleDateString()} • {student.user.phone}
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-pink-400" />
            </motion.div>
          ))
        )}
      </div>

      <button className="w-full mt-6 py-2.5 text-[12px] font-bold text-pink-500 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
        Barchasini ko'rish
      </button>
    </Card>
  );
};
