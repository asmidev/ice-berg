'use client'

import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'
import { useConfirm } from '@/hooks/use-confirm'
import {
	AlertCircle,
	Camera,
	CheckCircle2,
	ChevronRight,
	Loader2,
	Lock,
	Mail,
	Phone,
	Plus,
	Save,
	Shield,
	ShieldCheck,
	Settings,
	Store,
	Trash2,
	UserCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState('personal'); 
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Admin',
  });

  const [passData, setPassData] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  const [branches, setBranches] = useState<any[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [tenantSettings, setTenantSettings] = useState({
    attendance_penalty_amount: 0,
    attendance_penalty_wait_hours: 4,
  });
  const [loadingSettings, setLoadingSettings] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const r = (user.role?.slug || user.role || '').toLowerCase();
        const superAdmin = r === 'super-admin' || r === 'super_admin' || r === 'bosh_admin' || r === 'bosh-admin' || r === 'super admin' || r === 'bosh admin';
        setIsSuperAdmin(superAdmin);

        setFormData({
          firstName: user.first_name || user.firstName || '',
          lastName: user.last_name || user.lastName || '',
          phone: user.phone || '',
          email: user.email || (user.phone ? `${user.phone.replace('+', '')}@edutizim.uz` : ''),
          role: superAdmin ? 'Super Admin' : user.role || 'Admin',
        });
        
        if (superAdmin) {
          fetchSettings();
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      const res = await api.get('/branches');
      const data = res.data?.data || res.data || [];
      setBranches(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBranches(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoadingSettings(true);
      const res = await api.get('/tenant/settings');
      const data = res.data?.data || res.data || {};
      setTenantSettings({
        attendance_penalty_amount: data.attendance_penalty_amount || 0,
        attendance_penalty_wait_hours: data.attendance_penalty_wait_hours || 4,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await api.put('/tenant/settings', tenantSettings);
      setSuccessMsg("Tizim sozlamalari saqlandi!");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      const errorData = err.response?.data?.message || "Xatolik yuz berdi";
      const errorMessage = typeof errorData === 'object' ? (Array.isArray(errorData) ? errorData.join(', ') : (errorData.message || JSON.stringify(errorData))) : String(errorData);
      setErrorMsg(errorMessage);
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await api.put('/auth/profile', formData);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.first_name = formData.firstName;
        user.last_name = formData.lastName;
        user.phone = formData.phone;
        user.email = formData.email;
        localStorage.setItem('user', JSON.stringify(user));
      }
      setSuccessMsg("Profil ma'lumotlari saqlandi!");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      const errorData = err.response?.data?.message || "Xatolik yuz berdi";
      const errorMessage = typeof errorData === 'object' ? (Array.isArray(errorData) ? errorData.join(', ') : (errorData.message || JSON.stringify(errorData))) : String(errorData);
      setErrorMsg(errorMessage);
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.newPass !== passData.confirm) {
      setErrorMsg("Parollar mos kelmadi");
      return;
    }
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await api.put('/auth/password', {
        oldPassword: passData.current,
        newPassword: passData.newPass
      });
      setPassData({ current: '', newPass: '', confirm: '' });
      setSuccessMsg("Parol muvaffaqiyatli yangilandi!");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      const errorData = err.response?.data?.message || "Xatolik yuz berdi";
      const errorMessage = typeof errorData === 'object' ? (Array.isArray(errorData) ? errorData.join(', ') : (errorData.message || JSON.stringify(errorData))) : String(errorData);
      setErrorMsg(errorMessage);
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    setIsAddingBranch(true);
    try {
      await api.post('/branches', { name: newBranchName });
      setNewBranchName('');
      setSuccessMsg("Filial qo'shildi!");
      fetchBranches();
      setTimeout(() => window.location.reload(), 800);
    } catch (e) {
      setErrorMsg("Xatolik");
    } finally {
      setIsAddingBranch(false);
    }
  };

  const handleDeleteBranch = async (id: string, name: string) => {
    const isConfirmed = await confirm({
      title: "Filialni o'chirish",
      message: `${name} filialini o'chirishga ishonchingiz komilmi?`,
      type: "danger"
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/branches/${id}`);
      setSuccessMsg("Filial o'chirildi");
      fetchBranches();
      setTimeout(() => window.location.reload(), 800);
    } catch (e) {
      setErrorMsg("Xatolik");
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
      
      {/* 👑 PREMIUM HEADER */}
      <div className="relative mb-12 bg-white rounded-[2.5rem] p-10 shadow-xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            
            <div className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative w-32 h-32 rounded-full border-4 border-white bg-blue-50 flex items-center justify-center overflow-hidden shadow-2xl">
                    <UserCircle className="w-20 h-20 text-blue-200" strokeWidth={1} />
                    <button className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                       <Camera className="w-8 h-8 text-white" />
                    </button>
                </div>
            </div>

            <div className="flex-1 text-center md:text-left">
               <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                  <h1 className="text-4xl font-black text-zinc-900 tracking-tight">{formData.firstName} {formData.lastName}</h1>
                  <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[11px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                    {formData.role}
                  </span>
               </div>
               <p className="text-zinc-400 font-bold text-sm max-w-lg">Profil ma'lumotlarini boshqarish va xavfsizlik sozlamalarini tahrirlash.</p>
            </div>
         </div>
      </div>

      {/* 🔔 FEEDBACK ALERTS */}
      {(successMsg || errorMsg) && (
        <div className={`mb-8 p-5 rounded-3xl border flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 ${successMsg ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
           <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${successMsg ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {successMsg ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
           </div>
           <span className="font-black text-[14px]">{successMsg || errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
         
         {/* 📑 TABS NAVIGATION */}
         <div className="lg:col-span-1 space-y-2">
            <button 
              onClick={() => setActiveTab('personal')}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all ${activeTab === 'personal' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 font-bold border-0' : 'text-zinc-500 hover:bg-white hover:text-zinc-900 bg-transparent border-0'}`}
            >
              <UserCircle className="w-5 h-5" />
              <span className="text-[14px] font-bold">Profil</span>
              {activeTab === 'personal' && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 font-bold border-0' : 'text-zinc-500 hover:bg-white hover:text-zinc-900 bg-transparent border-0'}`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[14px] font-bold">Xavfsizlik</span>
              {activeTab === 'security' && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
            {isSuperAdmin && (
              <button 
                onClick={() => setActiveTab('branches')}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all ${activeTab === 'branches' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 font-bold border-0' : 'text-zinc-500 hover:bg-white hover:text-zinc-900 bg-transparent border-0'}`}
              >
                <Store className="w-5 h-5" />
                <span className="text-[14px] font-bold">Filiallar</span>
                {activeTab === 'branches' && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            )}
            {isSuperAdmin && (
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 font-bold border-0' : 'text-zinc-500 hover:bg-white hover:text-zinc-900 bg-transparent border-0'}`}
              >
                <Settings className="w-5 h-5" />
                <span className="text-[14px] font-bold">Tizim sozlamalari</span>
                {activeTab === 'settings' && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            )}
         </div>

         {/* 📄 ACTIVE CONTENT */}
         <div className="lg:col-span-3">
            
            {activeTab === 'personal' && (
               <Card className="border-0 shadow-2xl shadow-zinc-200/40 rounded-[2.5rem] overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                  <CardHeader className="p-8 border-b border-zinc-100 bg-zinc-50/30">
                     <CardTitle className="text-xl font-black text-zinc-900 leading-none">Shaxsiy ma'lumotlar</CardTitle>
                     <CardDescription className="text-zinc-400 font-bold text-xs mt-2 uppercase tracking-wide">Tizimda ko'rinadigan identifikatsiya ma'lumotlaringiz</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10">
                     <form onSubmit={handleSaveProfile} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-2">
                              <Label className="text-[11px] font-black text-zinc-400 uppercase ml-1">Ism</Label>
                              <Input 
                                value={formData.firstName} 
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, firstName: e.target.value})}
                                required
                                className="h-14 rounded-2xl bg-zinc-50/50 border-zinc-200 focus:bg-white focus:ring-4 focus:ring-blue-100 text-zinc-900 font-bold border outline-none"
                              />
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[11px] font-black text-zinc-400 uppercase ml-1">Familiya</Label>
                              <Input 
                                value={formData.lastName} 
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, lastName: e.target.value})}
                                required
                                className="h-14 rounded-2xl bg-zinc-50/50 border-zinc-200 focus:bg-white focus:ring-4 focus:ring-blue-100 text-zinc-900 font-bold border outline-none"
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-2">
                              <Label className="text-[11px] font-black text-zinc-400 uppercase ml-1">Email</Label>
                              <div className="relative">
                                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                 <Input 
                                   type="email"
                                   value={formData.email} 
                                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
                                   required
                                   className="h-14 pl-12 rounded-2xl bg-zinc-50/50 border-zinc-200 focus:bg-white focus:ring-4 focus:ring-blue-100 text-zinc-900 font-bold border outline-none"
                                 />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[11px] font-black text-zinc-400 uppercase ml-1">Telefon</Label>
                              <div className="relative">
                                 <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                 <Input 
                                   value={formData.phone} 
                                   readOnly
                                   className="h-14 pl-12 rounded-2xl bg-zinc-200/50 border-zinc-200 text-zinc-500 font-bold cursor-not-allowed border outline-none font-bold"
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="flex justify-end pt-4">
                           <Button disabled={loading} className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-600/20 transition-all border-0">
                              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ma'lumotlarni saqlash"}
                           </Button>
                        </div>
                     </form>
                  </CardContent>
               </Card>
            )}

            {activeTab === 'security' && (
               <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                  <Card className="border-0 shadow-2xl shadow-zinc-200/40 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 border-b border-zinc-100 bg-zinc-50/30">
                       <CardTitle className="text-xl font-black text-zinc-900 leading-none">Parolni yangilash</CardTitle>
                    </CardHeader>
                    <CardContent className="p-10">
                       <form onSubmit={handleUpdatePassword} className="space-y-8">
                          <div className="space-y-2 max-w-md">
                             <Label className="text-[11px] font-black text-zinc-400 uppercase ml-1">Hozirgi parol</Label>
                             <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <Input 
                                  type="password"
                                  value={passData.current}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassData({...passData, current: e.target.value})}
                                  required
                                  placeholder="Eski parolingiz"
                                  className="h-14 pl-12 rounded-2xl bg-zinc-50/50 border-zinc-200 text-zinc-900 font-bold border outline-none"
                                />
                             </div>
                          </div>
                          
                          <div className="h-px bg-zinc-100" />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-2">
                                <Label className="text-[11px] font-black text-zinc-400 uppercase ml-1">Yangi parol</Label>
                                <Input 
                                  type="password"
                                  value={passData.newPass}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassData({...passData, newPass: e.target.value})}
                                  required
                                  placeholder="Kamida 8 belgi"
                                  className="h-14 rounded-2xl bg-zinc-50/50 border-zinc-200 text-zinc-900 font-bold border outline-none"
                                />
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[11px] font-black text-zinc-400 uppercase ml-1">Tasdiqlash</Label>
                                <Input 
                                  type="password"
                                  value={passData.confirm}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassData({...passData, confirm: e.target.value})}
                                  required
                                  placeholder="Yangi parolni takrorlang"
                                  className="h-14 rounded-2xl bg-zinc-50/50 border-zinc-200 text-zinc-900 font-bold border outline-none"
                                />
                             </div>
                          </div>
                          
                          <div className="flex justify-end pt-4">
                             <Button disabled={loading} className="h-14 px-10 rounded-2xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-black transition-all bg-white">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Parolni almashtirish"}
                             </Button>
                          </div>
                       </form>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl shadow-zinc-200/40 rounded-[2.5rem] p-10 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white overflow-hidden relative">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                     <div className="relative z-10 flex items-start gap-8">
                        <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                           <ShieldCheck className="w-8 h-8 text-blue-400" strokeWidth={1.5} />
                        </div>
                        <div>
                           <h3 className="text-2xl font-black mb-2 tracking-tight">Akkaunt xavfsizligi</h3>
                           <p className="text-zinc-400 font-bold text-[14px] leading-relaxed max-w-xl">
                              Sizning hisobingiz <span className="text-emerald-400">FAOL</span> holatda. <br />
                              Oxirgi tizim faolligi: 2026-yil 7-aprel, Toshkent.
                           </p>
                        </div>
                     </div>
                  </Card>
               </div>
            )}

            {activeTab === 'branches' && isSuperAdmin && (
               <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                  <Card className="border-0 shadow-2xl shadow-zinc-200/40 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 border-b border-zinc-100 bg-zinc-50/30">
                       <CardTitle className="text-xl font-black text-zinc-900 leading-none">Filiallar boshqaruvi</CardTitle>
                    </CardHeader>
                    <CardContent className="p-10">
                       <form onSubmit={handleAddBranch} className="flex gap-4 p-4 bg-zinc-50 rounded-3xl border border-zinc-200 mb-10">
                          <Input 
                            value={newBranchName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBranchName(e.target.value)}
                            placeholder="Yangi filial nomini kiriting..."
                            className="h-14 rounded-2xl bg-white border-zinc-200 text-zinc-900 font-bold text-base px-6 flex-1 shadow-sm border outline-none"
                          />
                          <Button disabled={isAddingBranch} className="h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-600/20 border-0">
                             {isAddingBranch ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 mr-2" /> Qo'shish</>}
                          </Button>
                       </form>

                       <div className="space-y-4">
                          <Label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Mavjud filiallar</Label>
                          {loadingBranches ? (
                             <div className="py-12 flex items-center justify-center text-zinc-400 font-bold">
                                <Loader2 className="w-8 h-8 animate-spin" />
                             </div>
                          ) : (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {branches.map(branch => (
                                   <div key={branch.id} className="flex items-center justify-between p-6 bg-white border border-zinc-200 rounded-[2rem] hover:border-blue-500 transition-all group shadow-sm">
                                      <div className="flex items-center gap-5">
                                         <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                                            <Store className="w-6 h-6" strokeWidth={1.5} />
                                         </div>
                                         <div className="min-w-0">
                                            <h4 className="text-[16px] font-black text-zinc-900 leading-none mb-1 truncate">{branch.name}</h4>
                                            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight">{branch.id.slice(0,8)} • Aktiv</p>
                                         </div>
                                      </div>
                                      <Button 
                                        variant="ghost" 
                                        onClick={() => handleDeleteBranch(branch.id, branch.name)}
                                        className="w-10 h-10 p-0 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all bg-transparent border-0"
                                      >
                                         <Trash2 className="w-5 h-5" />
                                      </Button>
                                   </div>
                                ))}
                             </div>
                          )}
                          {!loadingBranches && branches.length === 0 && (
                             <div className="py-20 text-center border-2 border-dashed border-zinc-100 rounded-[2.5rem]">
                                <Store className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                                <p className="text-zinc-400 font-bold">Hozircha filiallar mavjud emas</p>
                             </div>
                          )}
                       </div>
                    </CardContent>
                  </Card>
               </div>
            )}

            {activeTab === 'settings' && isSuperAdmin && (
               <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                  <Card className="border-0 shadow-2xl shadow-zinc-200/40 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 border-b border-zinc-100 bg-zinc-50/30">
                       <CardTitle className="text-xl font-black text-zinc-900 leading-none">Tizim sozlamalari</CardTitle>
                       <CardDescription className="text-zinc-400 font-bold text-xs mt-2 uppercase tracking-wide">Davomat va jarimalar qoidalarini boshqarish</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10">
                       <form onSubmit={handleSaveSettings} className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-2">
                                <Label className="text-[11px] font-black text-zinc-400 uppercase ml-1">Davomat jarimasi (so'mda)</Label>
                                <Input 
                                  type="text"
                                  value={tenantSettings.attendance_penalty_amount === 0 ? '' : tenantSettings.attendance_penalty_amount.toLocaleString('en-US')} 
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                      const rawValue = e.target.value.replace(/,/g, '');
                                      if (!isNaN(Number(rawValue))) {
                                          setTenantSettings({...tenantSettings, attendance_penalty_amount: Number(rawValue)});
                                      }
                                  }}
                                  required
                                  className="h-14 rounded-2xl bg-zinc-50/50 border-zinc-200 focus:bg-white focus:ring-4 focus:ring-blue-100 text-zinc-900 font-bold border outline-none"
                                />
                                <p className="text-[10px] text-zinc-400 font-bold ml-1">O'qituvchi o'z vaqtida davomat qilmasa qo'llaniladigan jarima miqdori.</p>
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[11px] font-black text-zinc-400 uppercase ml-1">Kutish vaqti (soatlarda)</Label>
                                <Input 
                                  type="number"
                                  value={tenantSettings.attendance_penalty_wait_hours} 
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTenantSettings({...tenantSettings, attendance_penalty_wait_hours: Number(e.target.value)})}
                                  required
                                  className="h-14 rounded-2xl bg-zinc-50/50 border-zinc-200 focus:bg-white focus:ring-4 focus:ring-blue-100 text-zinc-900 font-bold border outline-none"
                                />
                                <p className="text-[10px] text-zinc-400 font-bold ml-1">Dars tugaganidan keyin necha soat ichida davomat qilinishi shart.</p>
                             </div>
                          </div>

                          <div className="flex justify-end pt-4">
                             <Button disabled={loading} className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-600/20 transition-all border-0">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sozlamalarni saqlash"}
                             </Button>
                          </div>
                       </form>
                    </CardContent>
                  </Card>
               </div>
            )}

         </div>
      </div>
   </div>
  );
}
