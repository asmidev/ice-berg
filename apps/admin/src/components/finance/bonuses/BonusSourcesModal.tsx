import { Plus, Trash2, Settings2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BonusSource } from '@/types/finance';
import { useState } from 'react';

interface BonusSourcesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sources: BonusSource[];
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
  submitting: boolean;
}

export function BonusSourcesModal({ 
  isOpen, onOpenChange, sources, onCreate, onDelete, submitting 
}: BonusSourcesModalProps) {
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (!newName) return;
    onCreate(newName);
    setNewName('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-md rounded-[16px] p-8 border-none shadow-2xl bg-white focus:outline-none">
          <DialogHeader className="items-center text-center space-y-3 mb-4">
             <div className="w-16 h-16 bg-[#1E3A5F]/10 rounded-full flex items-center justify-center text-[#1E3A5F] mb-2 shadow-inner"><Settings2 size={32} /></div>
             <DialogTitle className="text-[24px] font-black text-[#1E3A5F] tracking-tight">Manbalar sozlamalari</DialogTitle>
             <DialogDescription className="text-[12px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Dinamik bonus manbalarini boshqaring</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
             {/* Add New Source */}
             <div className="flex gap-2">
                <Input 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                  placeholder="Yangi manba nomi..." 
                  className="h-11 rounded-[8px] bg-gray-50 border-gray-100 font-bold text-[12px] focus:ring-1 focus:ring-pink-100 shadow-sm"
                />
                <Button 
                  onClick={handleCreate} 
                  disabled={submitting} 
                  className="h-11 px-4 bg-[#EC4899] hover:bg-pink-600 rounded-[8px] text-white border-none shadow-sm transition-all active:scale-95"
                >
                   <Plus size={18} strokeWidth={3} />
                </Button>
             </div>

             {/* Current Sources List */}
             <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 flex flex-col custom-scrollbar">
                {sources.length === 0 ? (
                  <p className="text-center py-10 text-gray-300 font-bold uppercase tracking-widest text-[10px]">Manbalar mavjud emas</p>
                ) : sources.map(s => (
                  <div key={s.id} className="flex justify-between items-center p-4 rounded-[12px] border border-gray-100 bg-gray-50/30 group hover:border-[#EC4899]/30 hover:bg-white transition-all">
                     <span className="text-[11px] font-black text-gray-600 uppercase tracking-tight">{s.name}</span>
                     <Button 
                       onClick={() => onDelete(s.id)} 
                       variant="ghost" 
                       className="h-8 w-8 p-0 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                     >
                        <Trash2 size={14} strokeWidth={2.5} />
                     </Button>
                  </div>
                ))}
             </div>
          </div>

          <DialogFooter className="mt-4 text-center">
              <p className="w-full text-[10px] text-gray-300 font-black uppercase tracking-widest">Dinamik o'zgarishlar darhol saqlanadi</p>
          </DialogFooter>
       </DialogContent>
    </Dialog>
  );
}
