"use client";

import { useState, useEffect } from 'react';
import { X, Search, UserPlus, Users, Loader2, Check, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

interface StudentEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: any;
  onSuccess: () => void;
}

export function StudentEnrollModal({
  isOpen,
  onClose,
  group,
  onSuccess
}: StudentEnrollModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && group?.id) {
       fetchStudents();
       setSelectedIds([]);
       setSearch('');
    }
  }, [isOpen, group]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/lms/groups/${group.id}/available-students`);
      setStudents(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (selectedIds.length === 0) return;
    setSubmitting(true);
    try {
      await api.post(`/lms/groups/${group.id}/enroll`, { studentIds: selectedIds });
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = Array.isArray(students) ? students.filter(s => 
    `${s.user.first_name} ${s.user.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    s.user.phone?.includes(search)
  ) : [];

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (!group) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 rounded-2xl bg-white border-none shadow-2xl overflow-hidden focus:outline-none">
        <DialogHeader className="p-8 pb-4 flex flex-row justify-between items-center bg-cyan-50/50 border-b border-cyan-100">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-2xl flex items-center justify-center text-cyan-600 font-bold">
                 <UserPlus size={24} />
              </div>
              <div>
                 <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
                    Talaba biriktirish
                 </DialogTitle>
                 <p className="text-sm font-medium text-cyan-400 mt-1">
                    "{group.name}" guruhiga yangi talaba qo'shish
                 </p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-cyan-100 rounded-xl text-cyan-400 transition-all">
              <X size={20} />
           </button>
        </DialogHeader>

        <div className="p-8 space-y-6">
           {/* Search & Stats */}
           <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:max-w-md">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                 <Input 
                    placeholder="Talabani ismi yoki telefon raqami..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-11 h-11 bg-white border-gray-200 rounded-xl font-medium text-gray-700 focus:border-cyan-500 transition-all"
                 />
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                 <Users size={16} className="text-gray-400" />
                 <span className="text-xs font-bold text-gray-600 uppercase tracking-widest whitespace-nowrap">
                    Tanlangan: <span className="text-cyan-600">{selectedIds.length} ta</span>
                 </span>
              </div>
           </div>

           {/* Student List */}
           <div className="max-h-[350px] overflow-y-auto custom-scrollbar border border-gray-100 rounded-2xl relative">
              {loading ? (
                <div className="p-20 flex flex-col items-center justify-center space-y-4">
                   <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                   <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Yuklanmoqda...</p>
                </div>
              ) : filteredStudents.length > 0 ? (
                 <div className="divide-y divide-gray-50">
                    {filteredStudents.map(student => {
                       const isSelected = selectedIds.includes(student.id);
                       return (
                          <div 
                            key={student.id} 
                            onClick={() => toggleSelect(student.id)}
                            className={`flex items-center justify-between p-4 cursor-pointer transition-all hover:bg-cyan-50/30 ${isSelected ? 'bg-cyan-50/50' : ''}`}
                          >
                             <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${isSelected ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                   {isSelected ? <Check size={20} /> : student.user.first_name[0] + student.user.last_name[0]}
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-sm font-bold text-gray-800">{student.user.first_name} {student.user.last_name}</span>
                                   <span className="text-xs font-medium text-gray-400">{student.user.phone}</span>
                                </div>
                             </div>
                             <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-cyan-500 bg-cyan-500' : 'border-gray-200 bg-white'}`}>
                                {isSelected && <Check size={14} className="text-white" />}
                             </div>
                          </div>
                       );
                    })}
                 </div>
              ) : (
                <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
                   <AlertCircle className="w-12 h-12 text-gray-200" />
                   <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Talabalar topilmadi</p>
                </div>
              )}
           </div>
        </div>

        <DialogFooter className="p-8 pt-4 bg-gray-50/50 border-t border-gray-100 flex gap-3 sm:justify-end">
           <Button 
              variant="outline" 
              onClick={onClose}
              className="h-11 px-8 rounded-xl font-bold text-gray-400 border-none bg-white hover:bg-gray-100 transition-all"
           >
              Bekor qilish
           </Button>
           <Button 
              disabled={submitting || selectedIds.length === 0}
              onClick={handleEnroll}
              className="h-11 px-10 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-100 transition-all flex items-center gap-2"
           >
              {submitting ? 'Biriktirilmoqda...' : 'Guruhga qo\'shish'}
              <Check size={18} />
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
