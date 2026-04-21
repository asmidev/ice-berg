'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import api from '@/lib/api';
import { 
  Plus, ShieldCheck, Trash2, 
  Settings, Loader2, CheckCircle2, AlertCircle, X, Search,
  Lock, Users, Shield, Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/hooks/use-confirm';

export default function OfficeRolesSettingsPage() {
  const confirm = useConfirm();
  const [roles, setRoles] = useState<any[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [permSearchTerm, setPermSearchTerm] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<any>(null);
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });
  
  // Permissions Modal State
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [draftPermissions, setDraftPermissions] = useState<string[]>([]);
  const [savingPermissions, setSavingPermissions] = useState(false);
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/roles'),
        api.get('/roles/permissions')
      ]);
      setRoles(Array.isArray(rolesRes.data.data) ? rolesRes.data.data : rolesRes.data);
      setAvailablePermissions(Array.isArray(permsRes.data.data) ? permsRes.data.data : permsRes.data);
    } catch (e: any) {
      console.error(e);
      showToast(e?.response?.data?.message || "Ma'lumotlarni yuklashda xatolik yuz berdi", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name) return;
    
    try {
      setLoading(true);
      if (isEditing) {
        await api.put(`/roles/${isEditing.id}`, roleForm);
        showToast("Lavozim muvaffaqiyatli yangilandi");
      } else {
        const slug = roleForm.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
        await api.post('/roles', { ...roleForm, slug, permissions: [] });
        showToast("Yangi lavozim muvaffaqiyatli yaratildi");
      }
      await fetchInitialData();
      setIsAddOpen(false);
      setIsEditing(null);
      setRoleForm({ name: '', description: '' });
    } catch (e: any) {
      console.error(e);
      const errorData = e.response?.data?.message;
      const errorMessage = typeof errorData === 'object' ? errorData.message : errorData;
      showToast(errorMessage || "Amalni bajarishda xatolik yuz berdi", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, roleName: string) => {
    try {
      const isConfirmed = await confirm({
        title: "Lavozimni o'chirish",
        message: `${roleName} lavozimini o'chirishga ishonchingiz komilmi? Bu amalni ortga qaytarib bo'lmaydi.`,
        type: "danger"
      });
      if (!isConfirmed) return;
      
      await api.delete(`/roles/${id}`);
      showToast("Lavozim muvaffaqiyatli o'chirildi");
      await fetchInitialData();
    } catch (e: any) {
      console.error(e);
      const errorData = e.response?.data?.message;
      const errorMessage = typeof errorData === 'object' ? errorData.message : errorData;
      showToast(errorMessage || "Lavozimni o'chirishda xatolik yuz berdi", "error");
    }
  };

  const openPermissionsModal = (role: any) => {
    if (role.slug === 'super-admin') {
       showToast("Super admin lavozimining ruxsatlarini tahrirlash mumkin emas. Unda avtomatik ravishda barcha huquqlar mujassam.", "error");
       return;
    }
    try {
      setSelectedRole(role);
      setDraftPermissions(role.permissions || []);
      setPermSearchTerm('');
      setIsPermissionsModalOpen(true);
    } catch(e) {
      console.error(e);
      showToast("Modalni ochishda noma'lum xatolik yuz berdi", "error");
    }
  };

  const closePermissionsModal = () => {
    setIsPermissionsModalOpen(false);
    setSelectedRole(null);
    setDraftPermissions([]);
  };

  const togglePermission = (slug: string) => {
    try {
      setDraftPermissions(prev => 
        prev.includes(slug) ? prev.filter(p => p !== slug) : [...prev, slug]
      );
    } catch (e) {
      console.error(e);
      showToast("Ruxsatni o'zgartirishda xatolik yuz berdi", "error");
    }
  };

  const toggleAllInCategory = (category: string, attach: boolean) => {
    try {
      const categorySlugs = availablePermissions.filter(p => p.category === category).map(p => p.slug);
      if (attach) {
        setDraftPermissions(prev => Array.from(new Set([...prev, ...categorySlugs])));
      } else {
        setDraftPermissions(prev => prev.filter(slug => !categorySlugs.includes(slug)));
      }
    } catch(e) {
      console.error(e);
      showToast("Guruh ruxsatlarini o'zgartirishda xatolik", "error");
    }
  };

  const toggleGlobalAll = (attach: boolean) => {
    try {
      if (attach) {
        setDraftPermissions(availablePermissions.map(p => p.slug));
      } else {
        setDraftPermissions([]);
      }
    } catch(e) {
      console.error(e);
      showToast("Barcha ruxsatlarni o'zgartirishda xatolik", "error");
    }
  };

  const savePermissions = async () => {
    if (!selectedRole) return;
    try {
      setSavingPermissions(true);
      await api.put(`/roles/${selectedRole.id}`, { permissions: draftPermissions });
      showToast("Ruxsatnomalar muvaffaqiyatli saqlandi!");
      await fetchInitialData();
      closePermissionsModal();
    } catch (e: any) {
      console.error(e);
      const errorData = e.response?.data?.message;
      const errorMessage = typeof errorData === 'object' ? errorData.message : errorData;
      showToast(errorMessage || "Ruxsatlarni saqlashda xatolik yuz berdi", "error");
    } finally {
      setSavingPermissions(false);
    }
  };

  // Group permissions by category
  const categorizedPermissions = useMemo(() => {
    try {
      const groups: Record<string, any[]> = {};
      availablePermissions.forEach(perm => {
        if (!groups[perm.category]) groups[perm.category] = [];
        if (!permSearchTerm || 
            perm.name.toLowerCase().includes(permSearchTerm.toLowerCase()) || 
            perm.category.toLowerCase().includes(permSearchTerm.toLowerCase())) {
          groups[perm.category].push(perm);
        }
      });
      return groups;
    } catch(e) {
      console.error(e);
      return {};
    }
  }, [availablePermissions, permSearchTerm]);

  const filteredRoles = useMemo(() => {
    try {
      return roles.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
    } catch(e) {
      console.error(e);
      return [];
    }
  }, [roles, searchTerm]);

  const stats = [
    { label: 'Jami Lavozimlar', value: roles.length, icon: Shield, color: 'text-pink-500' },
    { label: 'Super Adminlar', value: roles.filter(r => r.slug === 'super-admin').reduce((acc, r) => acc + (r._count?.users || 0), 0), icon: Lock, color: 'text-amber-500' },
    { label: 'Faol Xodimlar', value: roles.reduce((acc, r) => acc + (r._count?.users || 0), 0), icon: Users, color: 'text-blue-500' },
    { label: 'Jami Ruxsatlar (API)', value: availablePermissions.length, icon: ShieldCheck, color: 'text-green-500' },
  ];

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 w-full mx-auto">
      
      {/* 🚀 Toast */}
      {toast.show && (
        <div className={`fixed bottom-8 right-8 z-[2000] p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 min-w-[300px] border
            ${toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
           {toast.type === 'error' ? <AlertCircle className="w-6 h-6 shrink-0" /> : <CheckCircle2 className="w-6 h-6 shrink-0" />}
           <span className="font-bold text-[13px] leading-tight">{toast.message}</span>
        </div>
      )}
      
      {/* 📊 STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border border-zinc-100 shadow-sm rounded-2xl bg-white overflow-hidden group hover:shadow-xl hover:shadow-zinc-200/50 transition-all">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:scale-110 transition-transform">
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-black text-zinc-900 mt-0.5">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 📋 ROLES SECTION (MODIFIED FOR FULL WIDTH) */}
      <div className="flex flex-col gap-6 w-full">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
            <div>
               <h2 className="text-xl font-black text-zinc-900 tracking-tight">Lavozimlar Bazasi</h2>
               <p className="text-zinc-500 text-xs font-bold mt-1">Rollarni boshqarish va xodimlarni biriktirish. Barcha huquqlar shu yerdan boshqariladi.</p>
            </div>
            <Button 
               onClick={() => { setIsEditing(null); setRoleForm({ name: '', description: '' }); setIsAddOpen(true); }}
               className="h-11 px-6 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl border-0 shadow-lg shadow-pink-200 active:scale-95 transition-all text-sm"
            >
               <Plus className="w-4 h-4 mr-2" /> Yangi Lavozim
            </Button>
         </div>

         <div className="relative group">
            <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-pink-500 transition-colors" />
            <input 
               type="text" 
               placeholder="Lavozim nomini qidirish..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full h-14 pl-12 pr-4 bg-white border-zinc-200 border rounded-xl text-sm font-bold focus:border-pink-300 focus:ring-4 focus:ring-pink-50 outline-none shadow-sm transition-all"
            />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading && roles.length === 0 ? (
               <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 bg-white rounded-2xl border border-zinc-100 border-dashed">
                  <Loader2 className="w-8 h-8 text-zinc-300 animate-spin" />
                  <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Yuklanmoqda...</p>
               </div>
            ) : (
               filteredRoles.map((role) => (
                  <div 
                     key={role.id}
                     onClick={() => openPermissionsModal(role)}
                     className="group bg-white p-6 rounded-2xl border border-zinc-200 transition-all cursor-pointer hover:border-pink-200 hover:shadow-xl hover:shadow-pink-100 flex flex-col"
                  >
                     <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center border border-pink-100 text-pink-500">
                           <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-1">
                           <Button 
                              variant="ghost" size="icon" 
                              disabled={role.slug === 'super-admin'}
                              onClick={(e) => { e.stopPropagation(); setIsEditing(role); setRoleForm({ name: role.name, description: role.description || '' }); setIsAddOpen(true); }}
                              className="h-8 w-8 rounded-lg border-0 bg-zinc-50 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700"
                           >
                              <Settings className="w-4 h-4" />
                           </Button>
                           <Button 
                              variant="ghost" size="icon" 
                              disabled={role.slug === 'super-admin'}
                              onClick={(e) => { e.stopPropagation(); handleDelete(role.id, role.name); }}
                              className="h-8 w-8 rounded-lg border-0 bg-zinc-50 hover:bg-red-50 text-zinc-400 hover:text-red-500"
                           >
                              <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                     </div>
                     <h3 className="text-lg font-black tracking-tight text-zinc-900 mb-2">
                        {role.name} 
                        {role.slug === 'super-admin' && <span className="ml-2 text-[10px] py-0.5 px-2 bg-pink-100 text-pink-600 rounded-md tracking-widest font-bold">MUTLAQ HUQUQ</span>}
                     </h3>
                     <p className="text-zinc-500 text-xs font-medium mb-6 line-clamp-2 min-h-[32px]">
                        {role.description || "Ushbu lavozim uchun izoh kiritilmagan."}
                     </p>
                     <div className="mt-auto pt-4 border-t border-zinc-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <Users className="w-4 h-4 text-zinc-400" />
                           <span className="text-xs font-bold text-zinc-600">{role._count?.users || 0} xodim</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Shield className="w-4 h-4 text-pink-400" />
                           <span className="text-xs font-bold text-pink-600">{role.slug === 'super-admin' ? 'BARCHASI' : (role.permissions?.length || 0)} ruxsat</span>
                        </div>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>

      {/* 🔐 CENTERED 3-COLUMN PERMISSIONS MODAL */}
      {isPermissionsModalOpen && selectedRole && (
         <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-zinc-900/60 animate-in fade-in duration-300">
            <div className="bg-white rounded-[24px] sm:rounded-[32px] shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
               
               {/* Header */}
               <div className="p-6 sm:p-8 bg-zinc-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                  <div>
                     <h2 className="text-2xl font-black flex items-center gap-3">
                        <Lock className="w-6 h-6 text-pink-500" />
                        {selectedRole.name} Ruxsatnomalari
                     </h2>
                     <p className="text-zinc-400 text-sm mt-1 font-medium">Ushbu lavozim xodimlari faqat siz belgilagan amallarni bajara oladilar. Tizim xavfsizligi kafolatlanadi.</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                     <Button 
                        onClick={() => closePermissionsModal()}
                        className="h-12 w-12 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border-0 transition-all shrink-0"
                     >
                        <X className="w-5 h-5" />
                     </Button>
                     <Button 
                        onClick={savePermissions}
                        disabled={savingPermissions}
                        className="flex-1 sm:w-auto h-12 px-8 bg-pink-500 hover:bg-pink-600 text-white font-black rounded-xl border-0 shadow-lg shadow-pink-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                     >
                        {savingPermissions ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Saqlash
                     </Button>
                  </div>
               </div>

               {/* Toolbar */}
               <div className="p-4 sm:px-8 sm:py-6 bg-zinc-50 border-b border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                  <div className="relative w-full sm:w-96">
                     <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                     <input 
                        type="text" 
                        placeholder="Ruxsatnomalarni qidirish..."
                        value={permSearchTerm}
                        onChange={(e) => setPermSearchTerm(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 bg-white border border-zinc-200 rounded-xl text-sm font-bold focus:border-pink-400 focus:ring-4 focus:ring-pink-50 outline-none transition-all shadow-sm"
                     />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto bg-white p-1 rounded-xl shadow-sm border border-zinc-200">
                     <button onClick={() => toggleGlobalAll(true)} className="flex-1 sm:flex-none px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-600 text-xs font-black uppercase tracking-widest rounded-lg transition-colors">Barchasini Tanlash</button>
                     <button onClick={() => toggleGlobalAll(false)} className="flex-1 sm:flex-none px-4 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-500 text-xs font-black uppercase tracking-widest rounded-lg transition-colors">Tozalash</button>
                  </div>
               </div>

               {/* Grid Content */}
               <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-100/50 custom-scrollbar relative">
                     {Object.keys(categorizedPermissions).length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                           <ShieldCheck className="w-16 h-16 text-zinc-300 mb-4" strokeWidth={1.5} />
                           <p className="text-zinc-600 font-black text-xl">Topilmadi</p>
                           <p className="text-zinc-400 font-bold text-sm mt-1">Siz izlagan ruxsatnoma tizimda mavjud emas</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
                           {Object.entries(categorizedPermissions).map(([category, perms]) => {
                              const categoryPermsSlugs = perms.map(p => p.slug);
                              const allActive = categoryPermsSlugs.every(slug => draftPermissions.includes(slug));

                              return (
                                 <div key={category} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-full">
                                    <div className="p-4 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between gap-4">
                                       <h4 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest">{category}</h4>
                                       <button 
                                          onClick={() => toggleAllInCategory(category, !allActive)}
                                          className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors border-0 cursor-pointer shrink-0", 
                                             allActive ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-pink-100 text-pink-600 hover:bg-pink-200")}
                                       >
                                          {allActive ? "Olib tashlash" : "Tanlash"}
                                       </button>
                                    </div>
                                    <div className="p-2 space-y-1 bg-white">
                                       {perms.map((perm) => (
                                          <div 
                                             key={perm.slug} 
                                             className={cn(
                                                "flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer select-none",
                                                draftPermissions.includes(perm.slug) 
                                                   ? "bg-pink-50/50" 
                                                   : "hover:bg-zinc-50"
                                             )}
                                             onClick={() => togglePermission(perm.slug)}
                                          >
                                             <div className="flex-1 pr-4">
                                                <p className={cn("text-[13px] font-bold leading-snug", draftPermissions.includes(perm.slug) ? "text-pink-900" : "text-zinc-600")}>
                                                   {perm.name}
                                                </p>
                                             </div>
                                             {/* Custom IOS Switch */}
                                             <div className={cn("relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2", 
                                                draftPermissions.includes(perm.slug) ? 'bg-pink-500' : 'bg-zinc-200')}>
                                                <span className={cn("pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", 
                                                   draftPermissions.includes(perm.slug) ? 'translate-x-5' : 'translate-x-0')} />
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     )}
               </div>
            </div>
         </div>
      )}

      {/* 🛠 ADD/EDIT ROLE MODAL (GLASSMORPHISM) */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-zinc-900/60 animate-in fade-in duration-300">
           <div 
             className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300"
             onClick={(e) => e.stopPropagation()}
           >
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                 <div>
                    <h3 className="text-xl font-black text-zinc-900 tracking-tight">{isEditing ? "Lavozimni Tahrirlash" : "Yangi Lavozim"}</h3>
                    <p className="text-zinc-500 text-xs font-bold mt-1">Asosiy ma'lumotlarni kiriting</p>
                 </div>
                 <button 
                   onClick={() => setIsAddOpen(false)}
                   className="w-10 h-10 rounded-xl bg-white text-zinc-400 hover:text-pink-500 hover:bg-pink-50 flex items-center justify-center transition-all border border-zinc-200 shadow-sm"
                 >
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <form onSubmit={handleRoleAction} className="p-8 space-y-6">
                 <div className="space-y-5">
                    <div className="space-y-2">
                       <Label className="text-xs font-black text-zinc-600">LAVOZIM NOMI</Label>
                       <Input 
                         value={roleForm.name}
                         onChange={e => setRoleForm({...roleForm, name: e.target.value})}
                         required
                         placeholder="Masalan: Call Center, Menedjer"
                         className="h-12 rounded-xl border-zinc-200 bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 font-bold outline-none transition-all shadow-sm"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs font-black text-zinc-600">TAVSIFI (IXTIYORIY)</Label>
                       <textarea 
                         value={roleForm.description}
                         onChange={e => setRoleForm({...roleForm, description: e.target.value})}
                         placeholder="Ushbu lavozim vazifalari haqida qisqacha..."
                         className="w-full h-28 rounded-xl bg-white border border-zinc-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 text-zinc-900 font-bold p-4 text-sm outline-none resize-none transition-all shadow-sm"
                       />
                    </div>
                 </div>

                 <div className="flex gap-3 pt-6 border-t border-zinc-100">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddOpen(false)}
                      className="flex-1 h-12 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 font-bold text-sm transition-all shadow-sm"
                    >
                       Bekor Qilish
                    </Button>
                    <Button 
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-12 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-black text-sm shadow-xl shadow-pink-200 active:scale-95 transition-all outline-none border-0"
                    >
                       {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditing ? "Saqlash" : "Yaratish")}
                    </Button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
