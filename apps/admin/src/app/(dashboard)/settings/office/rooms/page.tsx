"use client";

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Building, Plus, LayoutGrid, Users, Pencil, Trash2, Search, 
  CheckCircle2, AlertCircle, MoreHorizontal, Settings2, Power
} from 'lucide-react';
import { useConfirm } from '@/hooks/use-confirm';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export default function OfficeRoomsSettingsPage() {
  const confirm = useConfirm();
  const searchParams = useSearchParams();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [activeModal, setActiveModal] = useState<'CREATE' | 'EDIT' | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    capacity: 20,
    description: '',
    is_active: true
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    const bId = searchParams?.get('branch_id') || (typeof window !== 'undefined' ? localStorage.getItem('branch_id') : null) || 'all';
    setBranchId(bId);
  }, [searchParams]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/lms/rooms?branch_id=${branchId}`);
      setRooms(res.data?.data || res.data || []);
    } catch (err) {
      showToast('Xonalarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (branchId !== 'all') {
      fetchRooms();
    }
  }, [branchId]);

  // Statistics
  const stats = useMemo(() => {
    const total = rooms.length;
    const active = rooms.filter(r => r.is_active).length;
    const capacity = rooms.reduce((acc, r) => acc + (Number(r.capacity) || 0), 0);
    const avg = total > 0 ? Math.round(capacity / total) : 0;
    return { total, active, capacity, avg };
  }, [rooms]);

  // Filtered Rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => 
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rooms, searchTerm]);

  const handleOpenCreate = () => {
    if (branchId === 'all') return showToast('Iltimos, avval filialni tanlang', 'error');
    setFormData({ name: '', capacity: 20, description: '', is_active: true });
    setActiveModal('CREATE');
  };

  const handleOpenEdit = (room: any) => {
    setSelectedRoom(room);
    setFormData({
      name: room.name,
      capacity: Number(room.capacity) || 0,
      description: room.description || '',
      is_active: room.is_active !== false
    });
    setActiveModal('EDIT');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (activeModal === 'CREATE') {
        await api.post('/lms/rooms', { ...formData, branch_id: branchId });
        showToast('Xona muvaffaqiyatli qo\'shildi');
      } else {
        await api.post(`/lms/rooms/${selectedRoom.id}`, formData);
        showToast('Xona ma\'lumotlari yangilandi');
      }
      setActiveModal(null);
      fetchRooms();
    } catch (err) {
      showToast('Xatolik yuz berdi', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Xonani o'chirish",
      message: "Haqiqatan ham bu xonani o'chirmoqchimisiz?",
      type: "danger"
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/lms/rooms/${id}`);
      showToast('Xona o\'chirildi');
      fetchRooms();
    } catch (err) {
      showToast('O\'chirishda xatolik', 'error');
    }
  };

  if (branchId === 'all') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 bg-white rounded-2xl border border-dashed border-gray-200">
         <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
            <Building size={32} />
         </div>
         <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-gray-900">Filial Tanlanmagan</h3>
            <p className="text-gray-500 text-sm max-w-[280px]">Xonalarni ko'rish va boshqarish uchun yuqoridagi menyudan filialni tanlang.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-20">
      
      {/* --- TOAST --- */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
           <div className={cn("flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border min-w-[300px]", toast.type === 'success' ? "bg-white border-emerald-100 text-emerald-600" : "bg-white border-rose-100 text-rose-600")}>
              {toast.type === 'success' ? <CheckCircle2 size={24} className="text-emerald-500" /> : <AlertCircle size={24} className="text-rose-500" />}
              <span className="font-bold text-[13px]">{toast.message}</span>
           </div>
        </div>
      )}

      {/* 📊 Stat Cards (Plain Variant) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[12px] shadow-sm border border-gray-100 flex items-center gap-5 group transition-all hover:bg-navy-50/30">
          <div className="w-12 h-12 rounded-xl bg-navy-50 text-[#1E3A5F] flex items-center justify-center group-hover:bg-[#1E3A5F] group-hover:text-white transition-all">
            <LayoutGrid size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Jami Xonalar</p>
            <h2 className="text-2xl font-black text-[#1E3A5F] leading-none">{stats.total}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[12px] shadow-sm border border-gray-100 flex items-center gap-5 group transition-all hover:bg-pink-50/30">
          <div className="w-12 h-12 rounded-xl bg-pink-50 text-[#EC4899] flex items-center justify-center group-hover:bg-[#EC4899] group-hover:text-white transition-all">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Jami Sig'im</p>
            <h2 className="text-2xl font-black text-[#1E3A5F] leading-none">{stats.capacity}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[12px] shadow-sm border border-gray-100 flex items-center gap-5 group transition-all hover:bg-emerald-50/30">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">O'rtacha Sig'im</p>
            <h2 className="text-2xl font-black text-[#1E3A5F] leading-none">{stats.avg} <span className="text-xs text-gray-400 font-bold ml-1">kishi</span></h2>
          </div>
        </div>
      </div>

      {/* 🔍 Filter Bar */}
      <div className="bg-white p-4 rounded-[12px] shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Xona nomi bo'yicha qidirish..." 
            className="pl-10 h-10 rounded-[8px] border-gray-100 bg-gray-50 focus:ring-1 focus:ring-pink-100 placeholder:text-gray-400 text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleOpenCreate} className="w-full sm:w-auto h-10 px-6 rounded-[8px] bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-pink-100">
          <Plus size={18} strokeWidth={3} /> Xona Qo'shish
        </Button>
      </div>

      {/* 📋 Data Table */}
      <div className="bg-white rounded-[12px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-50/50 border-bottom border-gray-100">
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">ID</th>
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Xona Nomi</th>
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Sig'im</th>
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Izoh</th>
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Holat</th>
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i} className="animate-pulse">
                  {Array(6).fill(0).map((_, j) => (
                    <td key={j} className="px-6 py-5"><div className="h-4 bg-gray-100 rounded-md w-full" /></td>
                  ))}
                </tr>
              ))
            ) : filteredRooms.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                   <div className="flex flex-col items-center gap-3">
                      <LayoutGrid size={48} className="text-gray-200" />
                      <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Xonalar topilmadi</p>
                   </div>
                </td>
              </tr>
            ) : filteredRooms.map((room) => (
              <tr key={room.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase">
                    RM-{room.name.slice(0, 3).toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-black text-[#1E3A5F]">{room.name}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Users size={14} className="text-[#EC4899]" />
                    <span className="text-sm font-black text-[#1E3A5F]">{room.capacity}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[12px] font-medium text-gray-500 line-clamp-1">{room.description || '—'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    room.is_active !== false 
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                      : "bg-gray-50 text-gray-400 border border-gray-100 opacity-60"
                  )}>
                    {room.is_active !== false ? 'Faol' : 'Nofaol'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
                    <Button onClick={() => handleOpenEdit(room)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                      <Pencil size={14} />
                    </Button>
                    <Button onClick={() => handleDelete(room.id)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- CREATE / EDIT MODAL --- */}
      <Dialog open={activeModal !== null} onOpenChange={o => !o && setActiveModal(null)}>
        <DialogContent className="sm:max-w-[480px] rounded-[16px] p-0 border-none shadow-2xl bg-white overflow-hidden">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="p-8 pb-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-xl bg-pink-50 text-[#EC4899] flex items-center justify-center">
                   <Settings2 size={24} />
                </div>
                <div>
                  <DialogTitle className="text-xl font-black text-[#1E3A5F] tracking-tight">
                    {activeModal === 'CREATE' ? 'Yangi Xona' : 'Xonani Tahrirlash'}
                  </DialogTitle>
                  <DialogDescription className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Xona ma'lumotlarini {activeModal === 'CREATE' ? 'qo\'shish' : 'yangilash'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="px-8 py-4 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Xona Nomi *</Label>
                <Input 
                   required 
                   value={formData.name} 
                   onChange={e => setFormData({...formData, name: e.target.value})} 
                   placeholder="Masalan: 101, IELTS Lab" 
                   className="h-10 rounded-[8px] bg-gray-50 border-gray-100 font-bold text-sm focus:ring-1 focus:ring-pink-100" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sig'im (Kishi)</Label>
                  <Input 
                     type="number" 
                     value={formData.capacity} 
                     onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} 
                     className="h-10 rounded-[8px] bg-gray-50 border-gray-100 font-black text-sm text-[#EC4899]" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Holat</Label>
                  <div className="flex items-center gap-3 h-10 px-3 bg-gray-50 rounded-[8px] border border-gray-100 transition-all hover:bg-white group">
                    <span className={cn("text-[11px] font-black uppercase tracking-widest", formData.is_active ? "text-emerald-500" : "text-gray-400")}>
                      {formData.is_active ? 'Faol' : 'Nofaol'}
                    </span>
                    <Switch 
                       checked={formData.is_active} 
                       onCheckedChange={v => setFormData({...formData, is_active: v})} 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Izoh (Tavsif)</Label>
                <Input 
                   value={formData.description} 
                   onChange={e => setFormData({...formData, description: e.target.value})} 
                   placeholder="..." 
                   className="h-10 rounded-[8px] bg-gray-50 border-gray-100 font-medium text-sm" 
                />
              </div>
            </div>

            <DialogFooter className="p-8 pt-4 flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setActiveModal(null)} className="flex-1 h-11 rounded-[8px] font-bold text-gray-500 hover:bg-gray-100">
                Bekor qilish
              </Button>
              <Button disabled={isSubmitting} type="submit" className="flex-[2] h-11 rounded-[8px] bg-[#1E3A5F] hover:bg-navy-900 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-navy-100 transition-all active:scale-95">
                {isSubmitting ? 'Saqlanmoqda...' : (activeModal === 'CREATE' ? 'Tasdiqlash' : 'Yangilash')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Support Components
function TrendingUp(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
  );
}
