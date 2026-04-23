'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, Search, Plus, Filter, CheckCircle2, 
  XCircle, Loader2, Phone, KeyRound, 
  Trash2, Settings2, X, Check, AlertCircle, Archive
} from 'lucide-react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { useConfirm } from '@/hooks/use-confirm';
import { toast as toastSonner } from 'sonner';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ImportExcelModal } from '@/components/shared/ImportExcelModal';
import { useBranch } from '@/providers/BranchProvider';
import * as XLSX from 'xlsx';

export default function OfficeStaffSettingsPage() {
  const confirm = useConfirm();
  const { branchId } = useBranch();
  const [staff, setStaff] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<any>(null);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    role_id: '',
    branch_ids: [] as string[],
    is_active: true
  });

  useEffect(() => {
    fetchInitialData();
  }, [startDate, endDate]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [staffRes, rolesRes, branchesRes] = await Promise.all([
        api.get(`/staff?startDate=${startDate}&endDate=${endDate}`),
        api.get('/roles'),
        api.get('/branches')
      ]);
      setStaff(Array.isArray(staffRes.data.data) ? staffRes.data.data : staffRes.data);
      setRoles(Array.isArray(rolesRes.data.data) ? rolesRes.data.data : rolesRes.data);
      setBranches(Array.isArray(branchesRes.data.data) ? branchesRes.data.data : branchesRes.data);
    } catch (e) {
      showToast("Ma'lumotlarni yuklashda xato", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleImportStaff = async (data: any[]) => {
    try {
      setLoading(true);
      const res = await api.post('/staff/bulk', { 
        branchId: branchId || 'all',
        staff: data.map(item => ({
          first_name: item['Ism'] || item['First Name'],
          last_name: item['Familiya'] || item['Last Name'],
          phone: item['Telefon'] || item['Phone'],
          role: item['Rol'] || item['Role'],
          password: item['Parol'] || item['Password']
        }))
      });
      
      const { count, errors } = res.data;
      if (count > 0) {
        toastSonner.success(`${count} ta xodim muvaffaqiyatli import qilindi`);
        fetchInitialData();
      }
      
      if (errors?.length > 0) {
        errors.forEach((err: string) => toastSonner.error(err));
      }
    } catch (err: any) {
      toastSonner.error(err.response?.data?.message || "Importda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (staff.length === 0) return showToast('Eksport qilish uchun ma\'lumot yo\'q', 'error');
    
    const exportData = staff.map(s => ({
      'F.I.SH': `${s.first_name} ${s.last_name}`,
      'Telefon': s.phone,
      'Lavozim': s.role?.name || 'Yo\'q',
      'Filiallar': s.branches?.map((b: any) => b.name).join(', ') || 'Barcha',
      'Status': s.is_active ? 'Faol' : 'Nofaol'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Xodimlar");
    XLSX.writeFile(wb, `Xodimlar_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Excel fayl yuklandi!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role_id || form.branch_ids.length === 0) {
      showToast("Lavozim va filialni tanlash majburiy", "error");
      return;
    }

    try {
      setLoading(true);
      if (isEditing) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...updateData } = form;
        const payload = form.password ? form : updateData;
        await api.put(`/staff/${isEditing.id}`, payload);
        showToast("Xodim ma'lumotlari yangilandi");
      } else {
        if (!form.password) {
          showToast("Yangi xodim uchun parol kiritish majburiy", "error");
          setLoading(false);
          return;
        }
        await api.post('/staff', form);
        showToast("Yangi xodim qo'shildi");
      }
      fetchInitialData();
      setIsModalOpen(false);
      resetForm();
    } catch (e: any) {
      const errorData = e.response?.data?.message;
      const errorMessage = typeof errorData === 'object' ? errorData.message : errorData;
      showToast(errorMessage || "Xatolik yuz berdi", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Xodimni arxivlash",
      message: "Ushbu xodimni arxivlashga ishonchingiz komilmi?",
      type: "danger"
    });
    if (!isConfirmed) return;
    try {
      await api.put(`/staff/${id}/archive`, { reason: "Settings sahifasidan arxivlandi" });
      showToast("Xodim muvaffaqiyatli arxivlandi");
      fetchInitialData();
    } catch (e: any) {
      const errorData = e.response?.data?.message;
      const errorMessage = typeof errorData === 'object' ? errorData.message : errorData;
      showToast(errorMessage || "Xatolik", "error");
    }
  };

  const resetForm = () => {
    setForm({
      first_name: '',
      last_name: '',
      phone: '',
      password: '',
      role_id: '',
      branch_ids: [],
      is_active: true
    });
    setIsEditing(null);
  };

  const filteredStaff = staff.filter(s => 
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
  );

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 w-full mx-auto">
      
      <ImportExcelModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportStaff}
        title="Xodimlarni Import Qilish"
        description="Excel fayl orqali xodimlarni ommaviy ravishda tizimga yuklang."
        templateHeaders={['BranchID', 'Ism', 'Familiya', 'Telefon', 'Rol', 'Parol']}
        exampleData={['b1', 'Zuhra', 'Karimova', '+998934445566', 'Menejer', 'staff789']}
      />

      {/* 🚀 Toast */}
      {toast.show && (
        <div className={`fixed bottom-8 right-8 z-[1000] p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 
            ${toast.type === 'error' ? 'bg-red-600 text-white shadow-red-500/20' : 'bg-pink-600 text-white shadow-pink-500/20'}`}>
           {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
           <span className="font-bold text-sm tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* 🚀 Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-white p-6 sm:p-8 rounded-2xl border-none shadow-[0_2px_12px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-pink-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center">
            Xodimlar va Parollar <Users className="w-6 h-6 ml-3 text-pink-500" />
          </h1>
          <p className="text-zinc-500 text-sm mt-1.5 font-bold uppercase tracking-widest">
             Tizimga kirish huquqiga ega bo'lgan ishchilar bazasi
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 md:mt-0 relative z-10">
           <Button 
             variant="outline"
             onClick={() => setIsImportModalOpen(true)}
             className="h-11 px-6 border-zinc-100 font-bold rounded-xl shadow-sm bg-white hover:bg-zinc-50 transition-all w-full sm:w-auto text-zinc-600"
           >
             Excel Import
           </Button>
           <Button 
             variant="outline"
             onClick={handleExport}
             className="h-11 px-6 border-zinc-100 font-bold rounded-xl shadow-sm bg-white hover:bg-zinc-50 transition-all w-full sm:w-auto text-zinc-600"
           >
             Eksport
           </Button>
           <Button 
             onClick={() => { resetForm(); setIsModalOpen(true); }}
             className="h-11 px-6 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-200 active:scale-95 transition-all w-full sm:w-auto border-none"
           >
             <Plus className="w-5 h-5 mr-1.5" /> Xodim Qo'shish
           </Button>
        </div>
      </div>

      {/* 🧭 TABLE SECTION */}
      <div className="bg-white rounded-2xl border-none shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-zinc-50 bg-zinc-50/20 flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="relative flex-1 max-w-md w-full group">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-pink-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Xodim yoki telefon bo'yicha qidirish..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-white border border-zinc-100 rounded-xl text-sm font-bold focus:border-pink-200 focus:ring-4 focus:ring-pink-50/50 outline-none transition-all shadow-sm" 
              />
           </div>
           
           <div className="flex items-center gap-2">
               <input 
                 type="date" 
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
                 className="h-11 px-3 bg-white border border-zinc-100 rounded-xl text-[11px] font-bold text-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-sm"
               />
               <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Gacha</span>
               <input 
                 type="date" 
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
                 className="h-11 px-3 bg-white border border-zinc-100 rounded-xl text-[11px] font-bold text-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-sm"
               />
            </div>
           
           <div className="flex gap-2 w-full sm:w-auto">
             <Button variant="outline" className="h-11 px-4 text-zinc-600 border-zinc-100 font-bold shadow-sm bg-white hover:bg-zinc-50 rounded-xl">
               <Filter className="w-4 h-4 mr-2" /> Lavozim Filitri
             </Button>
           </div>
        </div>
        
        {loading && staff.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
             <Loader2 className="w-8 h-8 text-zinc-300 animate-spin" />
             <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest text-center px-6">Ma'lumotlar yuklanmoqda...</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full whitespace-nowrap">
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-zinc-50/50 border-b border-zinc-100">
                  <TableHead className="py-4 pl-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Xodim Ma'lumotlari</TableHead>
                  <TableHead className="py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Lavozimi (Role)</TableHead>
                  <TableHead className="py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Biriktirilgan Filiallar</TableHead>
                  <TableHead className="py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Status</TableHead>
                  <TableHead className="py-4 pr-8 text-right text-[10px] font-black text-zinc-400 uppercase tracking-widest">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {filteredStaff.map((person) => (
                  <TableRow key={person.id} className="group hover:bg-zinc-50/80 transition-colors border-b border-zinc-50 last:border-0">
                    <TableCell className="pl-8 py-4">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 font-bold">
                             {person.first_name?.[0]}{person.last_name?.[0]}
                          </div>
                          <div>
                            <span className="font-black text-[14px] text-zinc-900 block leading-tight">{person.first_name} {person.last_name}</span>
                            <span className="text-[12px] font-bold text-zinc-400 flex items-center mt-1">
                               <Phone className="w-3 h-3 mr-1" /> {person.phone}
                            </span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="py-4">
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-zinc-100 text-zinc-700 border border-zinc-200 uppercase tracking-widest shadow-sm">
                         {person.role?.name || "Rol belgilanmagan"}
                       </span>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-[200px] mx-auto">
                         {person.branches?.length > 0 ? person.branches.map((br: any) => (
                            <Badge key={br.id} variant="outline" className="text-[9px] font-black px-2 py-0.5 bg-zinc-50 text-zinc-500 border-zinc-200 uppercase tracking-tighter">
                               {br.name}
                            </Badge>
                         )) : <span className="text-[10px] font-bold text-zinc-300 italic">Filialga ulanmagan</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className={cn(
                        "inline-flex items-center text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border",
                        person.is_active ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                      )}>
                        {person.is_active ? <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> : <XCircle className="w-3.5 h-3.5 mr-1.5" />}
                        {person.is_active ? 'Aktiv' : 'Arxivlandi'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-8 py-4">
                       <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" size="icon" 
                            title="Tahrirlash"
                            onClick={() => {
                              setIsEditing(person);
                              setForm({
                                first_name: person.first_name,
                                last_name: person.last_name,
                                phone: person.phone,
                                password: '', 
                                role_id: person.role_id,
                                branch_ids: person.branches?.map((b: any) => b.id) || [],
                                is_active: person.is_active
                              });
                              setIsModalOpen(true);
                            }}
                            className="h-9 w-9 text-zinc-400 hover:text-pink-500 hover:bg-pink-50 rounded-lg"
                          >
                             <Settings2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" size="icon" 
                            title="Arxivlash"
                            onClick={() => handleDelete(person.id)}
                            className="h-9 w-9 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                             <Archive className="w-4 h-4" />
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* 🛠 MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                 <div>
                    <h3 className="text-xl font-black text-zinc-900 tracking-tight">{isEditing ? "Xodim Ma'lumotlarini Yangilash" : "Yangi Xodim Qo'shish"}</h3>
                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mt-1">Barcha maydonlarni to'ldiring</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-xl bg-white border border-zinc-100 text-zinc-400 hover:text-pink-500 flex items-center justify-center transition-all shadow-sm">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Ismi</Label>
                       <Input 
                         value={form.first_name}
                         onChange={e => setForm({...form, first_name: e.target.value})}
                         required
                         className="h-11 rounded-xl border-zinc-100 bg-zinc-50/30 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 font-bold outline-none transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Familiyasi</Label>
                       <Input 
                         value={form.last_name}
                         onChange={e => setForm({...form, last_name: e.target.value})}
                         required
                         className="h-11 rounded-xl border-zinc-100 bg-zinc-50/30 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 font-bold outline-none transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Telefon Raqami (Login)</Label>
                       <Input 
                         value={form.phone}
                         onChange={e => setForm({...form, phone: e.target.value})}
                         required
                         placeholder="+998"
                         className="h-11 rounded-xl border-zinc-100 bg-zinc-50/30 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 font-bold outline-none transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">{isEditing ? "Yangi Parol (Ixtiyoriy)" : "Parol"}</Label>
                       <div className="relative">
                          <Input 
                            type="password"
                            value={form.password}
                            onChange={e => setForm({...form, password: e.target.value})}
                            required={!isEditing}
                            className="h-11 rounded-xl border-zinc-100 bg-zinc-50/30 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 font-bold outline-none transition-all pl-10"
                          />
                          <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                       </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Lavozimi (Role)</Label>
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {roles.filter(r => r.slug !== 'student' && r.slug !== 'teacher').map(role => (
                            <button
                              key={role.id}
                              type="button"
                              onClick={() => setForm({...form, role_id: role.id})}
                              className={cn(
                                "flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all",
                                form.role_id === role.id 
                                  ? "bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-200" 
                                  : "bg-white border-zinc-100 text-zinc-600 hover:border-pink-200"
                              )}
                            >
                               {role.name}
                               {form.role_id === role.id && <Check className="w-3 h-3 ml-2" />}
                            </button>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Mas'ul Filiallari</Label>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 bg-zinc-50 border-none rounded-2xl">
                          {branches.map(branch => {
                            const isSelected = form.branch_ids.includes(branch.id);
                            return (
                              <button
                                key={branch.id}
                                type="button"
                                onClick={() => {
                                  const newIds = isSelected 
                                    ? form.branch_ids.filter(id => id !== branch.id)
                                    : [...form.branch_ids, branch.id];
                                  setForm({...form, branch_ids: newIds});
                                }}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left",
                                  isSelected ? "bg-white shadow-sm border border-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-600 hover:bg-white/50"
                                )}
                              >
                                 <div className={cn(
                                   "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                   isSelected ? "bg-pink-500 border-pink-500 text-white" : "border-zinc-300"
                                 )}>
                                    {isSelected && <Check className="w-3 h-3" />}
                                 </div>
                                 <span className="text-xs font-bold">{branch.name}</span>
                              </button>
                            );
                          })}
                       </div>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-zinc-50 flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-xl border-zinc-200 font-bold hover:bg-zinc-50 transition-all">Bekor Qilish</Button>
                    <Button type="submit" disabled={loading} className="flex-1 h-12 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-black shadow-lg shadow-pink-200 border-none active:scale-95 transition-all text-sm">
                       {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditing ? "Saqlash" : "Qo'shish")}
                    </Button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
