"use client";

import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoneyInput } from '@/components/ui/money-input';
import { X, Camera, Plus, ShieldAlert } from 'lucide-react';

interface TeacherModalsProps {
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  isEditMode: boolean;
  formData: any;
  setFormData: (v: any) => void;
  isSubmitting: boolean;
  onSave: (e: React.FormEvent) => void;
  branches: any[];
  
  // Archive Modal
  isArchiveModalOpen: boolean;
  setIsArchiveModalOpen: (v: boolean) => void;
  archiveReasons: any[];
  selectedReason: string;
  setSelectedReason: (v: string) => void;
  customReason: string;
  setCustomReason: (v: string) => void;
  isArchiving: boolean;
  onArchive: () => void;
  onAddArchiveReason: () => void;
  
  // Specialization
  specializations: any[];
  onAddSpecialization: (name: string) => void;
}

const compressImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; // Profil rasm uchun mos o'lcham
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/webp', 0.8);
        resolve(dataUrl);
      };
      img.onerror = error => reject(error);
    };
    reader.onerror = error => reject(error);
  });
};

export const TeacherModals = ({
  isModalOpen, setIsModalOpen, isEditMode, formData, setFormData, isSubmitting, onSave, branches,
  isArchiveModalOpen, setIsArchiveModalOpen, archiveReasons, selectedReason, setSelectedReason, customReason, setCustomReason, isArchiving, onArchive, onAddArchiveReason,
  specializations, onAddSpecialization
}: TeacherModalsProps) => {
  const [newSpec, setNewSpec] = React.useState('');
  const [showAddSpec, setShowAddSpec] = React.useState(false);
  
  const handlePhoneInput = (val: string) => {
    if (!val.startsWith('+998')) {
      setFormData({...formData, phone: '+998' + val.replace(/\D/g, '').slice(-9)});
    } else {
      setFormData({...formData, phone: val});
    }
  };

  return (
    <>
      {/* 🔮 Add/Edit Teacher Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[1050px] rounded-md p-0 overflow-hidden border-none shadow-2xl bg-white outline-none">
          <div className="px-8 py-6 flex justify-between items-center bg-zinc-50/50 border-b border-zinc-100">
             <DialogTitle className="text-xl font-black text-zinc-900 tracking-tight">
               {isEditMode ? "Tahrirlash: " + formData.firstName : "Yangi o'qituvchi qo'shish"}
             </DialogTitle>
             <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-200 transition-colors">
               <X className="w-4 h-4 text-zinc-500" />
             </button>
          </div>
          
          <form onSubmit={onSave} className="p-8 space-y-8 max-h-[85vh] overflow-y-auto bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              
              {/* 👤 1-ustun: Shaxsiy & Foto */}
              <div className="space-y-6">
                 <div className="relative group w-32 h-32 mx-auto mb-8">
                    <div className="w-full h-full rounded-2xl bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 overflow-hidden relative group-hover:border-cyan-200 transition-colors">
                       {formData.photoUrl ? (
                         <img src={formData.photoUrl} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <>
                            <Camera className="w-8 h-8 mb-1 opacity-50 group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-black uppercase text-center px-2">Rasm yuklash</span>
                         </>
                       )}
                       <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={async (e) => {
                         const f = e.target.files?.[0];
                         if (f) {
                           try {
                             const base64 = await compressImageToBase64(f);
                             setFormData({...formData, photoUrl: base64});
                           } catch (err) {
                             console.error("Failed to compress image:", err);
                           }
                         }
                       }} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-lg shadow-lg border border-zinc-100 flex items-center justify-center text-cyan-600 z-20">
                       <Plus className="w-4 h-4" />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1 text-cyan-600/70">F.I.SH <span className="text-rose-500">*</span></Label>
                      <Input 
                        required 
                        value={formData.firstName + (formData.lastName ? ' ' + formData.lastName : '')} 
                        onChange={e => {
                           const parts = e.target.value.split(' ');
                           setFormData({...formData, firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || ''});
                        }} 
                        placeholder="Ism Familiya" 
                        className="h-11 bg-white border-zinc-200 rounded-md font-bold focus:ring-4 focus:ring-cyan-500/10 transition-shadow" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Tug'ilgan sana</Label>
                      <Input type="date" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className="h-11 rounded-md font-bold text-xs uppercase" />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Jinsi</Label>
                      <div className="flex gap-6 p-1 bg-zinc-50/50 rounded-lg border border-zinc-100/50 px-3 h-11 items-center">
                         {['Erkak', 'Ayol'].map(g => (
                           <label key={g} className="flex items-center gap-2 cursor-pointer group">
                              <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-4 h-4 accent-cyan-600" />
                              <span className="text-sm font-bold text-zinc-600 group-hover:text-cyan-600 transition-colors">{g}</span>
                           </label>
                         ))}
                      </div>
                    </div>
                 </div>
              </div>

              {/* 📞 2-ustun: Bog'lanish & Kasbiy */}
              <div className="space-y-6">
                 <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Telefon <span className="text-rose-500">*</span></Label>
                      <Input 
                        required 
                        value={formData.phone} 
                        onChange={e => handlePhoneInput(e.target.value)} 
                        placeholder="+998" 
                        className="h-11 bg-white border-zinc-200 rounded-md font-bold tracking-tight" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Email</Label>
                      <Input 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        placeholder="example@mail.com" 
                        className="h-11 bg-white border-zinc-200 rounded-md font-bold" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Filial <span className="text-rose-500">*</span></Label>
                      <Select value={formData.branchId} onValueChange={val => setFormData({...formData, branchId: val})}>
                        <SelectTrigger className="h-11 rounded-md font-bold text-zinc-700 bg-white shadow-sm"><SelectValue placeholder="Filialni tanlang" /></SelectTrigger>
                        <SelectContent className="rounded-xl border-zinc-100 shadow-2xl">
                          {branches.map(b => <SelectItem key={b.id} value={b.id} className="font-bold">{b.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Mutaxassislik</Label>
                      <div className="space-y-2">
                        <Select 
                          value={formData.specialization} 
                          onValueChange={val => {
                            if (val === 'add_new') setShowAddSpec(true);
                            else { setFormData({...formData, specialization: val}); setShowAddSpec(false); }
                          }}
                        >
                           <SelectTrigger className="h-11 rounded-md font-bold border-cyan-100 bg-cyan-50/10 text-cyan-800"><SelectValue placeholder="Tanlang" /></SelectTrigger>
                           <SelectContent className="rounded-xl shadow-2xl">
                             {specializations.map(s => <SelectItem key={s.id} value={s.name} className="font-bold">{s.name}</SelectItem>)}
                             <SelectItem value="add_new" className="text-cyan-600 font-bold border-t border-zinc-100 mt-1">
                                <span className="flex items-center gap-2"><Plus className="w-3.5 h-3.5" /> Yangi qo'shish</span>
                             </SelectItem>
                           </SelectContent>
                        </Select>
                        {showAddSpec && (
                          <div className="flex gap-2 animate-in slide-in-from-top-2 duration-300">
                             <Input value={newSpec} onChange={e => setNewSpec(e.target.value)} placeholder="Yangi yo'nalish..." className="h-10 rounded-md text-xs font-bold border-cyan-200" />
                             <Button type="button" onClick={() => { if (!newSpec) return; onAddSpecialization(newSpec); setFormData({...formData, specialization: newSpec}); setNewSpec(''); setShowAddSpec(false); }} className="h-10 px-4 bg-cyan-600 text-white font-bold rounded-md">Ok</Button>
                          </div>
                        )}
                      </div>
                    </div>
                 </div>
              </div>

              {/* 💰 3-ustun: Moliya & Tizim */}
              <div className="space-y-6">
                 <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Ustoz Turi</Label>
                          <Select value={formData.type || 'MAIN'} onValueChange={val => setFormData({...formData, type: val})}>
                            <SelectTrigger className="h-11 rounded-md font-bold bg-amber-50/30 border-amber-100 text-amber-700"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl shadow-2xl">
                              <SelectItem value="MAIN" className="font-bold">Asosiy</SelectItem>
                              <SelectItem value="SUPPORT" className="font-bold">Yordamchi</SelectItem>
                              <SelectItem value="INTERN" className="font-bold">Amaliyotchi</SelectItem>
                            </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Maosh Turi</Label>
                          <Select value={formData.salaryType} onValueChange={val => setFormData({...formData, salaryType: val})}>
                            <SelectTrigger className="h-11 rounded-md font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl shadow-2xl">
                              <SelectItem value="FIXED" className="font-bold">Fix</SelectItem>
                              <SelectItem value="PERCENTAGE" className="font-bold">Foiz (%)</SelectItem>
                              <SelectItem value="HOURLY" className="font-bold">Soatlik</SelectItem>
                            </SelectContent>
                          </Select>
                       </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                        {formData.salaryType === 'PERCENTAGE' ? 'Foiz miqdori (%)' : 'Ish haqi miqdori'}
                      </Label>
                      {formData.salaryType === 'PERCENTAGE' ? (
                        <Input 
                           type="number" min="0" max="100" 
                           value={formData.salaryAmount} 
                           onChange={e => setFormData({...formData, salaryAmount: e.target.value})} 
                           placeholder="Masalan: 50"
                           className="h-11 bg-white border-zinc-200 rounded-md font-bold text-zinc-800" 
                        />
                      ) : (
                        <MoneyInput value={formData.salaryAmount} onChange={val => setFormData({...formData, salaryAmount: val})} />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Tizim Paroli {!isEditMode ? <span className="text-rose-500">*</span> : <span className="text-[9px] text-zinc-400 tracking-normal capitalize font-medium">(O'zgartirish uchun yozing)</span>}</Label>
                      <Input 
                        required={!isEditMode}
                        type="password"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        placeholder="********"
                        className="h-11 bg-white border-zinc-200 rounded-md font-mono"
                      />
                    </div>

                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100/50">
                       <ul className="text-[10px] space-y-2 text-zinc-400 font-medium">
                         <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-cyan-500" /> Barcha maydonlar to'g'riligini tekshiring</li>
                         <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-cyan-500" /> Parol kamida 6 belgidan iborat bo'lsin</li>
                       </ul>
                    </div>
                 </div>
              </div>
            </div>

            {/* 📝 Full Width Bottom Row: Izoh */}
            <div className="space-y-2 pt-4 border-t border-zinc-100">
               <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Qo'shimcha izoh yoki ma'lumotlar</Label>
               <textarea 
                 value={formData.description}
                 onChange={e => setFormData({...formData, description: e.target.value})}
                 placeholder="O'qituvchi haqida qo'shimcha ma'lumotlar..."
                 className="w-full h-24 p-4 bg-zinc-50/30 border border-zinc-200 rounded-xl outline-none focus:ring-4 focus:ring-cyan-500/10 font-medium text-sm resize-none transition-all placeholder:text-zinc-300"
               />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
               <Button type="button" onClick={() => setIsModalOpen(false)} variant="ghost" className="h-12 px-6 font-bold text-zinc-400 transition-colors hover:text-zinc-600">Yopish</Button>
               <Button disabled={isSubmitting} type="submit" className="h-12 px-10 bg-[#06B6D4] hover:bg-[#0891B2] text-white font-black rounded-xl shadow-lg shadow-cyan-600/20 active:scale-95 transition-all text-xs uppercase tracking-widest">
                 {isSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}
               </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 📂 Archive Modal */}
      <Dialog open={isArchiveModalOpen} onOpenChange={setIsArchiveModalOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-md p-0 overflow-hidden border-none shadow-2xl bg-white outline-none">
          <div className="p-8 space-y-6 text-center">
             <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-2">
               <ShieldAlert className="w-8 h-8 text-amber-500" />
             </div>
             <div className="space-y-1">
                <DialogTitle className="text-xl font-black text-zinc-900 tracking-tight">Arxivlash</DialogTitle>
                <p className="text-[13px] font-medium text-zinc-400 px-4">O'qituvchini arxivlash sababini tanlang. U faol ro'yxatdan chiqariladi.</p>
             </div>

             <div className="space-y-4 text-left">
                <Select value={selectedReason} onValueChange={setSelectedReason}>
                   <SelectTrigger className="h-12 border-zinc-200 rounded-md font-bold"><SelectValue placeholder="Sababini tanlang" /></SelectTrigger>
                   <SelectContent>
                      {archiveReasons.map((r: any) => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
                      <SelectItem value="other">Boshqa sabab...</SelectItem>
                   </SelectContent>
                </Select>

                {selectedReason === 'other' && (
                   <div className="flex gap-2 animate-in fade-in duration-300">
                     <Input value={customReason} onChange={e => setCustomReason(e.target.value)} placeholder="Sababni yozing..." className="h-12 rounded-md border-zinc-200" />
                     <Button onClick={onAddArchiveReason} variant="outline" className="h-12 w-12 rounded-md"><Plus className="w-4 h-4" /></Button>
                   </div>
                )}
             </div>

             <div className="flex gap-2 pt-2">
                <Button onClick={() => setIsArchiveModalOpen(false)} variant="ghost" className="flex-1 h-12 font-bold text-zinc-400 rounded-md">Bekor qilish</Button>
                <Button disabled={isArchiving || (!selectedReason && !customReason)} onClick={onArchive} className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-md shadow-lg active:scale-95 transition-all">
                   {isArchiving ? 'Arxivlanmoqda...' : 'Tasdiqlash'}
                </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
