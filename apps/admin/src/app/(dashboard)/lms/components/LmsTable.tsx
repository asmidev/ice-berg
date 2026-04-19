"use client";

import { MoreHorizontal, Edit2, Trash2, Archive, MessageCircle, MoreVertical, Calendar as CalendarIcon, UserPlus, Users, CheckSquare } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LmsTableProps {
  groups: any[];
  isLoading: boolean;
  onEdit: (group: any) => void;
  onArchive: (group: any) => void;
  onDelete: (group: any) => void;
  onViewCalendar: (group: any) => void;
  onSms: (group: any) => void;
  onEnroll: (group: any) => void;
  onAttendance?: (group: any) => void;
  onManageStudents?: (group: any) => void;
}

const getProgressColor = (progress: number) => {
  if (progress < 40) return 'bg-cyan-500';
  if (progress < 70) return 'bg-warning';
  if (progress < 100) return 'bg-pink-500';
  return 'bg-navy-800';
};

export function LmsTable({ groups, isLoading, onEdit, onArchive, onDelete, onViewCalendar, onSms, onEnroll, onAttendance, onManageStudents }: LmsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-4 bg-gray-50 rounded w-full animate-pulse" />)}
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="p-4 border-b border-gray-100 flex gap-4">
            {[1, 2, 3, 4, 5, 6].map(j => <div key={j} className="h-8 bg-gray-50 rounded w-full animate-pulse" />)}
          </div>
        ))}
      </div>
    );
  }

  if (!groups?.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-20 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Archive className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Guruhlar topilmadi</h3>
        <p className="text-gray-500 text-sm max-w-xs">Guruhlar ro'yxati bo'sh. Yangi guruh qo'shish yoki filtrlarni tekshirib ko'ring.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Guruh</th>
              <th className="py-3 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider">O'qituvchi</th>
              <th className="py-3 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Dars Vaqti</th>
              <th className="py-3 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider">O'quvchilar</th>
              <th className="py-3 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-48">Progress</th>
              <th className="py-3 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="py-3 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {groups.map((group) => {
              const progress = Math.round((group.current_stage / group.total_stages) * 100) || 0;
              const studentsCount = group._count?.enrollments || 0;
              const teacherName = `${group.teacher?.user?.first_name || ''} ${group.teacher?.user?.last_name || ''}`.trim() || 'Tayinlanmagan';
              const startTime = group.schedules?.[0]?.start_time || '--:--';
              const endTime = group.schedules?.[0]?.end_time || '--:--';

              return (
                <tr key={group.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                        {group.name}
                      </span>
                      <span className="text-xs text-gray-400">{group.course?.name || 'Kurs yo\'q'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 rounded-full">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacherName}`} />
                        <AvatarFallback className="bg-pink-100 text-pink-600 font-bold text-[10px]">
                          {teacherName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-xs">
                        <span className="font-semibold text-gray-700">{teacherName}</span>
                        {group.support_teacher && (
                          <span className="text-[10px] text-gray-400">Assistent: {group.support_teacher.user?.first_name}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col text-xs font-medium text-gray-600">
                      <span>{startTime} - {endTime}</span>
                      <span className="text-[10px] text-gray-400">
                        {group.schedules?.length > 0 ? `${group.schedules.length} kun/hafta` : 'Jadval yo\'q'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{studentsCount}</span>
                        <span className="text-xs text-gray-400">/ {group.capacity}</span>
                      </div>
                      {group.invoices?.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-emerald-600">
                            To'lagan: {group.invoices.length}
                          </span>
                        </div>
                      )}
                      {group.invoices?.length === 0 && studentsCount > 0 && (
                        <span className="text-[10px] font-bold text-rose-500">
                          To'lov kutilmoqda
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${getProgressColor(progress)}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-500 min-w-[35px]">{progress}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      group.is_online 
                      ? 'bg-cyan-50 text-cyan-600' 
                      : 'bg-pink-50 text-pink-600'
                    }`}>
                      {group.is_online ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                         onClick={() => onAttendance?.(group)}
                         className="h-8 w-8 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-emerald-600 transition-colors"
                         title="Davomat qilish"
                      >
                        <CheckSquare size={16} />
                      </button>
                      <button 
                         onClick={() => onEnroll(group)}
                         className="h-8 w-8 rounded-lg hover:bg-cyan-50 flex items-center justify-center text-cyan-600 transition-colors"
                         title="Talaba qo'shish"
                      >
                        <UserPlus size={16} />
                      </button>
                      <button 
                         onClick={() => onManageStudents?.(group)}
                         className="h-8 w-8 rounded-lg hover:bg-indigo-50 flex items-center justify-center text-indigo-600 transition-colors"
                         title="Guruh O'quvchilari"
                      >
                        <Users size={16} />
                      </button>
                      <button 
                         onClick={() => onViewCalendar(group)}
                         className="h-8 w-8 rounded-lg hover:bg-pink-50 flex items-center justify-center text-pink-500 transition-colors"
                         title="Jadvalni ko'rish"
                      >
                        <CalendarIcon size={16} />
                      </button>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </PopoverTrigger>
                      <PopoverContent className="w-40 p-1 rounded-xl" align="end">
                        <button 
                          onClick={() => onEdit(group)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                        >
                          <Edit2 size={14} className="text-gray-400" /> Tahrirlash
                        </button>
                        <button 
                          onClick={() => onArchive(group)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                        >
                          <Archive size={14} className="text-gray-400" /> Arxivlash
                        </button>
                        <button 
                          onClick={() => onSms(group)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                        >
                          <MessageCircle size={14} className="text-gray-400" /> SMS yuborish
                        </button>
                        <div className="h-px bg-gray-100 my-1" />
                        <button 
                          onClick={() => onDelete(group)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={14} /> O'chirish
                        </button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
