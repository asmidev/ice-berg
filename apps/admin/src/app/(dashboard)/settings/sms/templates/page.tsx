"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
  Plus, MessageSquare, Trash2, Edit3, Sparkles, LayoutGrid, Info, CheckCircle2, 
  Mail, Type, List, Save, X, Search, MoreHorizontal, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';
import { Input } from '@/components/ui/input';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function SmsTemplatesPage() {
  const confirm = useConfirm();
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch_id') || (typeof window !== 'undefined' ? localStorage.getItem('branch_id') : null) || 'all';

  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    text: '',
    is_active: true
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/sms/templates?branch_id=${branchId}`);
      setTemplates(res.data?.data || res.data || []);
    } catch (err) { 
      // Silently handle
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchData();
  }, [branchId]);

  const handleSubmit = async () => {
    if (!form.name || !form.text) {
      toast.error('Barcha maydonlarni toldiring');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form, branch_id: branchId };
      if (selectedTemplate) {
        await api.put(`/sms/templates/${selectedTemplate.id}`, payload);
      } else {
        await api.post('/sms/templates', payload);
      }
      setIsModalOpen(false);
      setForm({ name: '', text: '', is_active: true });
      fetchData();
    } catch (err) { 
      toast.error('Saqlashda xatolik yuz berdi');
    } finally { 
      setSubmitting(false); 
    }
  };

  const deleteTemplate = async (id: string) => {
    const isConfirmed = await confirm({
      title: 'Shablonni ochirish',
      message: "Ushbu shablonni ochirishni tasdiqlaysizmi?",
      type: 'danger'
    });
    
    if (!isConfirmed) return;

    try {
      await api.delete(`/sms/templates/${id}`);
      toast.success('Shablon muvaffaqiyatli ochirildi');
      fetchData();
    } catch (err) { 
      toast.error('Ochirishda xatolik yuz berdi');
    }
  };

  const variables = [
    { key: '(STUDENT)', label: 'O\'quvchi ismi' },
    { key: '(COURSE)', label: 'Kurs nomi' },
    { key: '(BALANCE)', label: 'Qarzdorlik summasi' },
    { key: '(GROUP)', label: 'Guruh nomi' },
    { key: '(TEACHER)', label: 'O\'qituvchi nomi' },
    { key: '(SUM)', label: 'To\'lov summasi' },
    { key: '(LC)', label: 'O\'quv markaz nomi' },
    { key: '(BRANCH)', label: 'Filial nomi' },
    { key: '(DATE)', label: 'Bugungi sana' },
  ];

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAF9] p-6 pt-1 w-full mx-auto space-y-8">
      
      {/* 🚀 Stats Section */}
      <div className="flex flex-col gap-6">

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-[12px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
              <List size={22} />
            </div>
            <div>
              <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">Jami shablonlar</p>
              <p className="text-[20px] font-bold text-gray-900">{templates.length} ta</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-[12px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">Aktiv shablonlar</p>
              <p className="text-[20px] font-bold text-gray-900">{templates.filter(t => t.is_active).length} ta</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-[12px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-navy-800/10 flex items-center justify-center text-navy-800">
              <Mail size={22} />
            </div>
            <div>
              <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">Tizim triggerlari</p>
              <p className="text-[20px] font-bold text-gray-900">3 xil</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 Search & Filter Bar */}
      <div className="flex items-center gap-4 bg-white p-2 rounded-[12px] border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Shablon nomi yoki matni bo'yicha qidirish..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-12 pr-4 bg-gray-50/50 border-none rounded-[8px] text-[14px] text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-pink-500/10 transition-all font-medium outline-none"
          />
        </div>
        <Button 
          onClick={() => { setSelectedTemplate(null); setForm({name:'', text:'', is_active:true}); setIsModalOpen(true); }} 
          className="h-11 px-6 rounded-[8px] bg-pink-500 hover:bg-pink-600 text-white font-semibold text-[14px] flex items-center gap-2 shadow-sm transition-all active:scale-95 border-none outline-none"
        >
          <Plus size={18} />
          Yangi shablon
        </Button>
      </div>

      {/* 📋 Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-64 bg-white rounded-[12px] border border-gray-100 animate-pulse" />)
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full py-20 border-2 border-dashed border-gray-100 rounded-[20px] flex flex-col items-center justify-center text-gray-300 gap-4">
            <LayoutGrid size={48} className="opacity-20" />
            <span className="text-[14px] font-medium text-gray-400 italic">Shablonlar topilmadi</span>
          </div>
        ) : filteredTemplates.map(t => (
          <div key={t.id} className="group bg-white rounded-[12px] border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[8px] bg-pink-50 flex items-center justify-center text-pink-500 shrink-0 group-hover:scale-110 transition-transform">
                  <Type size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-[15px] text-gray-800 leading-tight line-clamp-1">{t.name}</h3>
                  <p className="text-[11px] text-gray-400 font-medium">ID: {t.id.slice(0, 8)}</p>
                </div>
              </div>
              <Badge className={cn(
                "rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider",
                t.is_active ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"
              )}>
                {t.is_active ? 'Aktiv' : 'Nofaol'}
              </Badge>
            </div>
            
            <div className="p-5 flex-1 relative bg-gray-50/30">
              <div className="text-[14px] text-gray-600 leading-relaxed font-medium whitespace-pre-wrap italic opacity-80 group-hover:opacity-100 transition-opacity">
                "{t.text}"
              </div>
              <div className="absolute right-4 bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <MessageSquare size={48} />
              </div>
            </div>

            <div className="p-4 border-t border-gray-50 flex justify-between items-center bg-gray-50/10">
              <div className="text-[11px] font-medium text-gray-400">
                {new Date(t.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setSelectedTemplate(t); setForm({ name: t.name, text: t.text, is_active: t.is_active }); setIsModalOpen(true); }}
                  className="w-9 h-9 rounded-[8px] bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-pink-500 hover:border-pink-100 hover:bg-pink-50 shadow-sm transition-all active:scale-90"
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  onClick={() => deleteTemplate(t.id)}
                  className="w-9 h-9 rounded-[8px] bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 shadow-sm transition-all active:scale-90"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- CREATE/EDIT MODAL --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[16px] p-0 border-none shadow-2xl overflow-hidden selection:bg-pink-100">
          <div className="h-2 bg-pink-500 w-full" />
          
          <div className="p-8 space-y-8 text-left">
            <DialogHeader className="items-start space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pink-50 rounded-[12px] flex items-center justify-center text-pink-500">
                  <Sparkles size={24} />
                </div>
                <div>
                  <DialogTitle className="text-[18px] font-bold text-gray-900 leading-none">
                    {selectedTemplate ? 'Shablonni tahrirlash' : 'Yangi shablon yaratish'}
                  </DialogTitle>
                  <DialogDescription className="text-[13px] text-gray-500 font-medium">
                    Xabarlar uchun dinamik o'zgaruvchilarni qo'shing va saqlang
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-gray-700">Shablon nomi</Label>
                <div className="relative">
                  <Input 
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="h-11 rounded-[8px] bg-white border-gray-200 font-medium text-gray-900 px-4 focus-visible:ring-pink-500/20 shadow-none border"
                    placeholder="Masalan: To'lov tasdiqnomasi"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-[13px] font-semibold text-gray-700">Xabar matni</Label>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider transition-colors",
                    form.text.length > 160 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                    {form.text.length} belgi ({Math.ceil(form.text.length / 160)} qism)
                  </span>
                </div>
                <div className="relative group">
                  <textarea 
                    value={form.text}
                    onChange={e => setForm({...form, text: e.target.value})}
                    className="w-full h-40 rounded-[12px] bg-gray-50/50 border border-gray-200 p-5 text-[14px] font-medium text-gray-800 focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500/50 focus:bg-white transition-all placeholder:text-gray-300 resize-none outline-none shadow-inner"
                    placeholder="Assalomu alaykum (STUDENT)..."
                  />
                  <div className="absolute right-4 bottom-4 text-gray-200 hover:text-pink-500 transition-colors pointer-events-none opacity-20">
                    <MessageSquare size={32} />
                  </div>
                </div>
              </div>

              {/* 💡 Variable Hints */}
              <div className="space-y-4 p-5 bg-pink-50/40 rounded-[12px] border border-pink-100/50">
                <div className="flex items-center gap-2 mb-1">
                  <Info size={14} className="text-pink-500" />
                  <span className="text-[11px] font-bold text-pink-600 uppercase tracking-widest">Dinamik o'zgaruvchilar</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variables.map(v => (
                    <button 
                      key={v.key} 
                      type="button"
                      onClick={() => setForm({...form, text: form.text + v.key})}
                      className="px-3 py-1.5 bg-white border border-pink-100 rounded-[8px] text-[11px] font-bold text-pink-700 hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all shadow-sm active:scale-95"
                    >
                      {v.key}
                      <span className="ml-1.5 opacity-60 font-medium text-[10px]">({v.label})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-3 pt-4 border-t border-gray-100">
              <Button 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)} 
                className="h-11 px-8 rounded-[8px] font-bold text-[13px] uppercase tracking-wider text-gray-400 hover:bg-gray-100 flex-1 hover:text-gray-900"
              >
                Bekor qilish
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting} 
                className={cn(
                  "h-11 px-8 rounded-[8px] font-bold text-[13px] uppercase tracking-wider text-white flex-1 transition-all active:scale-95 shadow-lg shadow-pink-100 border-none flex items-center justify-center gap-2 outline-none",
                  selectedTemplate ? "bg-navy-800 hover:bg-navy-900 shadow-navy-100" : "bg-pink-500 hover:bg-pink-600"
                )}
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} /> 
                    {selectedTemplate ? 'Saqlash' : 'Yaratish'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
