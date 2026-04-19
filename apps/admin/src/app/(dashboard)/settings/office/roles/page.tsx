'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import api from '@/lib/api';
import { 
  UserCog, Plus, ShieldCheck, Trash2, 
  Settings, Loader2, CheckCircle2, AlertCircle, X, Search,
  ShieldAlert, Lock, ChevronRight, Hash, Users, Shield
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
  
  // Permissions State
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
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
    } catch (e) {
      showToast("Ma'lumotlarni yuklashda xatolik yuz berdi", "error");
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
        showToast("Lavozim yangilandi");
      } else {
        const slug = roleForm.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
        await api.post('/roles', { ...roleForm, slug, permissions: [] });
        showToast("Yangi lavozim yaratildi");
      }
      fetchInitialData();
      setIsAddOpen(false);
      setIsEditing(null);
      setRoleForm({ name: '', description: '' });
    } catch (e: any) {
      const errorData = e.response?.data?.message;
      const errorMessage = typeof errorData === 'object' ? errorData.message : errorData;
      showToast(errorMessage || "Amalni bajarishda xato", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Lavozimni o'chirish",
      message: "Ushbu lavozimni o'chirishga ishonchingiz komilmi?",
      type: "danger"
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/roles/${id}`);
      showToast("Lavozim muvaffaqiyatli o'chirildi");
      fetchInitialData();
      if (selectedRole?.id === id) setSelectedRole(null);
    } catch (e: any) {
      const errorData = e.response?.data?.message;
      const errorMessage = typeof errorData === 'object' ? errorData.message : errorData;
      showToast(errorMessage || "O'chirishda xato", "error");
    }
  };

  const togglePermission = async (permSlug: string) => {
    if (!selectedRole || savingPermissions) return;
    
    const currentPermissions = selectedRole.permissions || [];
    const newPermissions = currentPermissions.includes(permSlug)
      ? currentPermissions.filter((p: string) => p !== permSlug)
      : [...currentPermissions, permSlug];
    
    // Optimistic update
    const updatedSelectedRole = { ...selectedRole, permissions: newPermissions };
    setSelectedRole(updatedSelectedRole);
    setRoles(roles.map(r => r.id === selectedRole.id ? updatedSelectedRole : r));
    
    try {
      setSavingPermissions(true);
      await api.put(`/roles/${selectedRole.id}`, { permissions: newPermissions });
    } catch (e) {
      showToast("Saqlashda xato", "error");
      // Revert if error
      fetchInitialData();
    } finally {
      setSavingPermissions(false);
    }
  };

  const toggleAllInCategory = async (category: string, enable: boolean) => {
    if (!selectedRole || savingPermissions) return;
    
    const categoryPerms = availablePermissions.filter(p => p.category === category).map(p => p.slug);
    let newPermissions = [...(selectedRole.permissions || [])];
    
    if (enable) {
      newPermissions = Array.from(new Set([...newPermissions, ...categoryPerms]));
    } else {
      newPermissions = newPermissions.filter(p => !categoryPerms.includes(p));
    }

    // Update
    const updatedSelectedRole = { ...selectedRole, permissions: newPermissions };
    setSelectedRole(updatedSelectedRole);
    setRoles(roles.map(r => r.id === selectedRole.id ? updatedSelectedRole : r));

    try {
      setSavingPermissions(true);
      await api.put(`/roles/${selectedRole.id}`, { permissions: newPermissions });
    } catch (e) {
      showToast("Saqlashda xato", "error");
      fetchInitialData();
    } finally {
      setSavingPermissions(false);
    }
  };

  // Group permissions by category
  const categorizedPermissions = useMemo(() => {
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
  }, [availablePermissions, permSearchTerm]);

  const filteredRoles = roles.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const stats = [
    { label: 'Jami Lavozimlar', value: roles.length, icon: Shield, color: 'text-pink-500' },
    { label: 'Super Adminlar', value: roles.filter(r => r.slug === 'super-admin').reduce((acc, r) => acc + (r._count?.users || 0), 0), icon: Lock, color: 'text-amber-500' },
    { label: 'Faol Xodimlar', value: roles.reduce((acc, r) => acc + (r._count?.users || 0), 0), icon: Users, color: 'text-blue-500' },
    { label: 'Ruxsatnomalar', value: availablePermissions.length, icon: Hash, color: 'text-green-500' },
  ];

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 w-full mx-auto">
      
      {/* 🚀 Toast */}
      {toast.show && (
        <div className={`fixed bottom-8 right-8 z-[1000] p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 
            ${toast.type === 'error' ? 'bg-red-600 text-white shadow-red-500/20' : 'bg-pink-600 text-white shadow-pink-500/20'}`}>
           {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
           <span className="font-bold text-sm tracking-wide">{toast.message}</span>
        </div>
      )}
      
      {/* 📊 STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl bg-white overflow-hidden group hover:shadow-xl hover:shadow-zinc-200/50 transition-all">
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

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* 📋 ROLES SECTION */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border-none shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
             <div>
                <h2 className="text-xl font-black text-zinc-900 tracking-tight">Lavozimlar Bazasi</h2>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">Rollarni boshqarish va xodimlarni biriktirish</p>
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
               className="w-full h-12 pl-12 pr-4 bg-white border-zinc-100 border rounded-xl text-sm font-bold focus:border-pink-200 focus:ring-4 focus:ring-pink-50/50 outline-none shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all"
             />
          </div>

          <div className="grid grid-cols-1 gap-3">
             {loading && roles.length === 0 ? (
               <div className="py-20 flex flex-col items-center justify-center gap-4 bg-white rounded-2xl border border-zinc-100 border-dashed">
                  <Loader2 className="w-8 h-8 text-zinc-300 animate-spin" />
                  <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Yuklanmoqda...</p>
               </div>
             ) : (
               filteredRoles.map((role) => (
                 <div 
                   key={role.id}
                   onClick={() => setSelectedRole(role)}
                   className={cn(
                     "group p-5 rounded-xl border transition-all cursor-pointer flex items-center justify-between",
                     selectedRole?.id === role.id 
                       ? "bg-zinc-900 border-zinc-900 shadow-xl shadow-zinc-900/10 -translate-y-0.5" 
                       : "bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-md"
                   )}
                 >
                    <div className="flex items-center gap-4">
                       <div className={cn(
                         "w-12 h-12 rounded-xl flex items-center justify-center border transition-all",
                         selectedRole?.id === role.id ? "bg-white/10 border-white/20 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-400"
                       )}>
                          <ShieldCheck className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className={cn("text-base font-black tracking-tight", selectedRole?.id === role.id ? "text-white" : "text-zinc-900")}>
                            {role.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className={cn("text-[10px] font-bold uppercase tracking-widest", selectedRole?.id === role.id ? "text-zinc-400" : "text-zinc-400")}>
                               {role._count?.users || 0} xodim
                             </span>
                             <span className="w-1 h-1 rounded-full bg-zinc-300" />
                             <span className={cn("text-[10px] font-bold uppercase tracking-widest", selectedRole?.id === role.id ? "text-pink-400" : "text-pink-600")}>
                               {role.permissions?.length || 0} ruxsat
                             </span>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" size="icon" 
                          onClick={(e) => { e.stopPropagation(); setIsEditing(role); setRoleForm({ name: role.name, description: role.description || '' }); setIsAddOpen(true); }}
                          className={cn("h-9 w-9 rounded-lg border-0", selectedRole?.id === role.id ? "hover:bg-white/10 text-white" : "hover:bg-pink-50 text-zinc-400 hover:text-pink-500")}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" 
                          onClick={(e) => { e.stopPropagation(); handleDelete(role.id); }}
                          className={cn("h-9 w-9 rounded-lg border-0", selectedRole?.id === role.id ? "hover:bg-red-500/20 text-white" : "hover:bg-red-50 text-zinc-400 hover:text-red-500")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <ChevronRight className={cn("w-4 h-4 ml-1 transition-transform", selectedRole?.id === role.id ? "translate-x-1 text-white" : "text-zinc-300")} />
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>

        {/* 🛂 PERMISSIONS SECTION */}
        <div className="w-full lg:w-[450px]">
           <Card className="border-none shadow-[0_20px_60px_rgba(0,0,0,0.12)] rounded-3xl overflow-hidden sticky top-8 bg-white">
              <div className="p-6 bg-zinc-900 text-white border-0">
                 <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                       <ShieldAlert className="w-5 h-5 text-pink-500" />
                       <h3 className="font-black text-lg tracking-tight">Ruxsatnomalar</h3>
                    </div>
                    {savingPermissions && <Loader2 className="w-4 h-4 animate-spin text-pink-500" />}
                 </div>
                 <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mt-1.5">
                    {selectedRole ? `${selectedRole.name} huquqlarini boshqarish` : "Lavozimni tanlang"}
                 </p>
              </div>
              
              <div className="p-0 bg-white min-h-[500px] flex flex-col">
                 {!selectedRole ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
                       <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100">
                          <Lock className="w-8 h-8 text-zinc-300" strokeWidth={1.5} />
                       </div>
                       <div>
                          <p className="text-zinc-900 font-black text-base">Lavozim tanlanmagan</p>
                          <p className="text-zinc-400 font-bold text-[11px] uppercase tracking-widest mt-1">Huquqlarni ko'rish uchun chapdan tanlang</p>
                       </div>
                    </div>
                 ) : (
                    <div className="flex flex-col h-full max-h-[70vh]">
                       <div className="p-4 border-b border-zinc-100">
                          <div className="relative">
                             <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                             <input 
                               type="text" 
                               placeholder="Qidirish (masalan: o'chirish)..."
                               value={permSearchTerm}
                               onChange={(e) => setPermSearchTerm(e.target.value)}
                               className="w-full h-10 pl-9 pr-4 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-bold focus:bg-white focus:border-pink-500 outline-none transition-all shadow-sm"
                             />
                          </div>
                       </div>
                       
                       <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                          {Object.entries(categorizedPermissions).map(([category, perms]) => {
                             if (perms.length === 0) return null;
                             const categoryPermsSlugs = perms.map(p => p.slug);
                             const allActive = categoryPermsSlugs.every(slug => selectedRole.permissions?.includes(slug));

                             return (
                               <div key={category} className="space-y-3">
                                  <div className="flex items-center justify-between px-1">
                                     <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{category}</h4>
                                     <button 
                                       onClick={() => toggleAllInCategory(category, !allActive)}
                                       className="text-[9px] font-black text-pink-500 hover:text-pink-600 uppercase tracking-widest bg-pink-50 hover:bg-pink-100 px-2.5 py-1 rounded-lg transition-all border-0 cursor-pointer"
                                     >
                                        {allActive ? "Barchasini olib tashlash" : "Barchasini tanlash"}
                                     </button>
                                  </div>
                                  <div className="grid grid-cols-1 gap-1.5">
                                     {perms.map((perm) => (
                                       <div 
                                         key={perm.slug} 
                                         className={cn(
                                           "flex items-center justify-between p-3.5 rounded-xl border transition-all",
                                           selectedRole.permissions?.includes(perm.slug) 
                                             ? "bg-zinc-50 border-zinc-200 shadow-sm" 
                                             : "bg-white border-zinc-100 hover:border-zinc-200"
                                         )}
                                       >
                                          <div className="flex-1 mr-4">
                                             <p className={cn("text-xs font-bold", selectedRole.permissions?.includes(perm.slug) ? "text-zinc-900" : "text-zinc-500")}>
                                               {perm.name}
                                             </p>
                                          </div>
                                          <Switch 
                                            checked={selectedRole.permissions?.includes(perm.slug)} 
                                            onCheckedChange={() => togglePermission(perm.slug)}
                                            disabled={savingPermissions}
                                            className="data-[state=checked]:bg-pink-500 scale-90"
                                          />
                                       </div>
                                     ))}
                                  </div>
                               </div>
                             );
                          })}
                       </div>
                    </div>
                 )}
              </div>
           </Card>
        </div>
      </div>

      {/* 🛠 ADD/EDIT ROLE MODAL (GLASSMORPHISM) */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-zinc-900/40 animate-in fade-in duration-300">
           <div 
             className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300"
             onClick={(e) => e.stopPropagation()}
           >
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                 <div>
                    <h3 className="text-xl font-black text-zinc-900 tracking-tight">{isEditing ? "Lavozimni Tahrirlash" : "Yangi Lavozim"}</h3>
                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mt-1">Asosiy ma'lumotlar</p>
                 </div>
                 <button 
                   onClick={() => setIsAddOpen(false)}
                   className="w-10 h-10 rounded-xl bg-white text-zinc-400 hover:text-pink-500 hover:bg-pink-50 flex items-center justify-center transition-all border border-zinc-100 shadow-sm"
                 >
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <form onSubmit={handleRoleAction} className="p-8 space-y-6">
                 <div className="space-y-5">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Lavozim Nomi</Label>
                       <Input 
                         value={roleForm.name}
                         onChange={e => setRoleForm({...roleForm, name: e.target.value})}
                         required
                         placeholder="Masalan: Call Center"
                         className="h-12 rounded-xl border-zinc-100 bg-zinc-50/30 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 font-bold outline-none transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Tavsif (Ixtiyoriy)</Label>
                       <textarea 
                         value={roleForm.description}
                         onChange={e => setRoleForm({...roleForm, description: e.target.value})}
                         placeholder="Ushbu lavozim vazifasi haqida..."
                         className="w-full h-28 rounded-xl bg-zinc-50/30 border-zinc-100 border focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 text-zinc-900 font-bold p-4 text-sm outline-none resize-none transition-all"
                       />
                    </div>
                 </div>

                 <div className="flex gap-3 pt-6 border-t border-zinc-50">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddOpen(false)}
                      className="flex-1 h-12 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-500 font-bold text-sm transition-all"
                    >
                       Bekor Qilish
                    </Button>
                    <Button 
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-12 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-black text-sm shadow-xl shadow-pink-200 active:scale-95 transition-all outline-none border-0"
                    >
                       {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditing ? "Yangilash" : "Yaratish")}
                    </Button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
