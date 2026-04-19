"use client";

import React, { useState } from 'react';
import { X, Plus, Edit, Trash2, Archive, Key, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: React.ElementType;
  gradient?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, icon: Icon, gradient = "from-pink-500 to-pink-600", children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] overflow-hidden"
        >
          <div className={`px-6 py-4 bg-gradient-to-r ${gradient} flex justify-between items-center text-white`}>
            <div className="flex items-center gap-2.5">
              <Icon className="w-5 h-5" />
              <h3 className="font-bold text-[16px]">{title}</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export const StudentModals = ({
  isAddModalOpen, setIsAddModalOpen,
  isEditModalOpen, setIsEditModalOpen,
  isDeleteModalOpen, setIsDeleteModalOpen,
  isArchiveModalOpen, setIsArchiveModalOpen,
  isPasswordModalOpen, setIsPasswordModalOpen,
  newStudent, setNewStudent,
  editingStudent, setEditingStudent,
  deleteTarget,
  archiveTarget, selectedReason, setSelectedReason, archiveReasons,
  newPassword, setNewPassword,
  onSubmitAdd, onSubmitUpdate, onSubmitDelete, onSubmitArchive, onSubmitPassword,
  onAddArchiveReason,
  isSubmitting
}: any) => {

  const [isAddingNewReason, setIsAddingNewReason] = useState(false);
  const [newReasonName, setNewReasonName] = useState('');

  const handlePhoneInput = (val: string, setter: (v: string) => void) => {
    if (!val.startsWith('+998')) {
       setter('+998' + val.replace(/\D/g, '').slice(-9));
    } else {
       setter(val);
    }
  };

  return (
    <>
      {/* Add Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Yangi Talaba Qo'shish" 
        icon={Plus}
      >
        <form onSubmit={onSubmitAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-zinc-700">Ism <span className="text-red-500">*</span></label>
              <input required value={newStudent.firstName} onChange={e => setNewStudent({...newStudent, firstName: e.target.value})} className="w-full h-11 px-3 border border-zinc-200 rounded-lg outline-none focus:border-pink-400 text-[14px]" placeholder="Alisher" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-zinc-700">Familiya <span className="text-red-500">*</span></label>
              <input required value={newStudent.lastName} onChange={e => setNewStudent({...newStudent, lastName: e.target.value})} className="w-full h-11 px-3 border border-zinc-200 rounded-lg outline-none focus:border-pink-400 text-[14px]" placeholder="Vohidov" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-zinc-700">Telefon <span className="text-red-500">*</span></label>
              <input required value={newStudent.phone} onChange={e => handlePhoneInput(e.target.value, (v) => setNewStudent({...newStudent, phone: v}))} className="w-full h-11 px-3 border border-zinc-200 rounded-lg outline-none focus:border-pink-400 text-[14px]" placeholder="+998" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-zinc-700">Ota-ona telefon</label>
              <input value={newStudent.parentPhone} onChange={e => handlePhoneInput(e.target.value, (v) => setNewStudent({...newStudent, parentPhone: v}))} className="w-full h-11 px-3 border border-zinc-200 rounded-lg outline-none focus:border-pink-400 text-[14px]" placeholder="+998" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-zinc-700">Parrrol <span className="text-red-500">*</span></label>
              <input required type="password" value={newStudent.password} onChange={e => setNewStudent({...newStudent, password: e.target.value})} className="w-full h-11 px-3 border border-zinc-200 rounded-lg outline-none focus:border-pink-400 text-[14px]" placeholder="******" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-zinc-700">Tug'ilgan sana</label>
              <input type="date" value={newStudent.dateOfBirth} onChange={e => setNewStudent({...newStudent, dateOfBirth: e.target.value})} className="w-full h-11 px-3 border border-zinc-200 rounded-lg outline-none focus:border-pink-400 text-[14px]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-zinc-700">Jins <span className="text-red-500">*</span></label>
              <select required value={newStudent.gender} onChange={e => setNewStudent({...newStudent, gender: e.target.value})} className="w-full h-11 px-3 border border-zinc-200 rounded-lg outline-none focus:border-pink-400 text-[14px]">
                <option value="">Tanlang...</option>
                <option value="Erkak">Erkak</option>
                <option value="Ayol">Ayol</option>
              </select>
            </div>
          </div>
          <div className="pt-4">
            <Button disabled={isSubmitting} type="submit" className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-100">
              {isSubmitting ? 'Saqlanmoqda...' : "Talabani Yaratish"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Ma'lumotlarni Tahrirlash" 
        icon={Edit}
        gradient="from-blue-500 to-blue-600"
      >
        {editingStudent && (
          <form onSubmit={onSubmitUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-zinc-700">Ism</label>
                <input required value={editingStudent.user?.first_name} onChange={e => setEditingStudent({...editingStudent, user: {...editingStudent.user, first_name: e.target.value}})} className="w-full h-11 px-3 border border-zinc-200 rounded-lg outline-none focus:border-blue-400 text-[14px]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-zinc-700">Familiya</label>
                <input required value={editingStudent.user?.last_name} onChange={e => setEditingStudent({...editingStudent, user: {...editingStudent.user, last_name: e.target.value}})} className="w-full h-11 px-3 border border-zinc-200 rounded-lg outline-none focus:border-blue-400 text-[14px]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-zinc-700">Telefon</label>
                <input required value={editingStudent.user?.phone} onChange={e => handlePhoneInput(e.target.value, (v) => setEditingStudent({...editingStudent, user: {...editingStudent.user, phone: v}}))} className="w-full h-11 px-3 border border-zinc-200 rounded-lg outline-none focus:border-blue-400 text-[14px]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-zinc-700">Ota-ona telefon</label>
                <input value={editingStudent.parent_phone} onChange={e => handlePhoneInput(e.target.value, (v) => setEditingStudent({...editingStudent, parent_phone: v}))} className="w-full h-11 px-3 border border-zinc-200 rounded-lg outline-none focus:border-blue-400 text-[14px]" />
              </div>
            </div>
            <div className="grid grid-cols-1">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-zinc-700">Status</label>
                <select value={editingStudent.status} onChange={e => setEditingStudent({...editingStudent, status: e.target.value})} className="w-full h-11 px-3 border border-zinc-200 rounded-lg outline-none focus:border-blue-400 text-[14px]">
                  <option value="ACTIVE">Aktiv</option>
                  <option value="DEBTOR">Qarzdor</option>
                  <option value="FROZEN">Muzlatilgan</option>
                  <option value="LEFT">Chiqib ketgan</option>
                </select>
              </div>
            </div>
            <div className="pt-4">
              <Button disabled={isSubmitting} type="submit" className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100">
                {isSubmitting ? 'Saqlanmoqda...' : "O'zgarishlarni Saqlash"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Talabani O'chirish" 
        icon={Trash2}
        gradient="from-red-500 to-red-600"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-[14px] text-zinc-600">
            Haqiqatan ham ushbu talabani o'chirib tashlamoqchimisiz? <br/>
            Bu amalni ortga qaytarib bo'lmaydi.
          </p>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setIsDeleteModalOpen(false)}>Bekor qilish</Button>
            <Button disabled={isSubmitting} className="flex-1 h-12 bg-red-500 hover:bg-red-600 rounded-xl" onClick={onSubmitDelete}>
              {isSubmitting ? 'O\'chirilmoqda...' : "O'chirish"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Archive Modal */}
      <Modal 
        isOpen={isArchiveModalOpen} 
        onClose={() => { setIsArchiveModalOpen(false); setIsAddingNewReason(false); }} 
        title="Talabani Arxivlash" 
        icon={Archive}
        gradient="from-amber-500 to-amber-600"
      >
        <div className="space-y-4">
          {!isAddingNewReason ? (
            <>
              <p className="text-[14px] text-zinc-600 font-medium">Talaba nima uchun o'qishni to'xtatayotganini ko'rsating:</p>
              <select 
                className="w-full h-12 px-4 border border-zinc-200 rounded-xl outline-none focus:border-amber-400 text-[14px]"
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
              >
                <option value="">Sababni tanlang...</option>
                {archiveReasons.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <button 
                type="button"
                onClick={() => setIsAddingNewReason(true)}
                className="text-[12px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 mx-auto"
              >
                <Plus className="w-3 h-3" /> YANGI SABAB QO'SHISH
              </button>
            </>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-[14px] text-zinc-600 font-medium">Yangi sababni kiriting:</p>
              <input 
                autoFocus
                className="w-full h-12 px-4 border border-zinc-200 rounded-xl outline-none focus:border-amber-400 text-[14px]"
                placeholder="Masalan: Uzoqqa ko'chib ketdi"
                value={newReasonName}
                onChange={(e) => setNewReasonName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-10 text-[12px] rounded-lg" onClick={() => setIsAddingNewReason(false)}>Bekor qilish</Button>
                <Button 
                  className="flex-1 h-10 bg-amber-600 text-[12px] rounded-lg"
                  onClick={async () => {
                    if (!newReasonName) return;
                    await onAddArchiveReason(newReasonName);
                    setIsAddingNewReason(false);
                    setNewReasonName('');
                  }}
                >
                  Sababni Saqlash
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex gap-3 pt-4 border-t border-zinc-100">
            <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setIsArchiveModalOpen(false)}>Bekor qilish</Button>
            <Button 
              disabled={isSubmitting || (!selectedReason && !isAddingNewReason) || (isAddingNewReason && !newReasonName)} 
              className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 rounded-xl font-bold shadow-lg shadow-amber-100" 
              onClick={onSubmitArchive}
            >
              {isSubmitting ? 'Arxivlanmoqda...' : "Arxivlash"}
            </Button>
          </div>
        </div>
      </Modal>


      {/* Password Modal */}
      <Modal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        title="Parolni Yangilash" 
        icon={Key}
        gradient="from-indigo-500 to-indigo-600"
      >
        <div className="space-y-4">
          <p className="text-[13px] text-zinc-500 text-center font-medium">Tizimga kirish uchun yangi parolni kiriting:</p>
          <input 
            type="password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full h-12 px-4 border border-zinc-200 rounded-xl outline-none focus:border-indigo-400 text-center font-mono text-[16px] tracking-widest"
            placeholder="******"
          />
          <Button disabled={isSubmitting} className="w-full h-12 bg-indigo-500 hover:bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100" onClick={onSubmitPassword}>
             {isSubmitting ? 'Saqlanmoqda...' : "Parolni Yangilash"}
          </Button>
        </div>
      </Modal>
    </>
  );
};
