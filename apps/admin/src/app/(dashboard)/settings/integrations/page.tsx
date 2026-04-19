"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Puzzle, Link as LinkIcon, MessageSquare, Smartphone, 
  Settings2, Globe, ShieldCheck, Loader2, Save, ExternalLink,
  Bot, LayoutGrid, Zap, Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const INTEGRATIONS = [
  {
    id: 'sms',
    name: "Eskiz UZ",
    desc: "O'zbekistondagi eng yirik SMS provayderi. Avtomatik sms-bildirishnomalar uchun ishlatiladi.",
    type: "SMS Gateway",
    color: "emerald",
    icon: Smartphone,
    fields: [
      { key: 'email', label: 'Eskiz Email', type: 'text', placeholder: 'admin@eskiz.uz' },
      { key: 'password', label: 'Eskiz Parol', type: 'password', placeholder: '••••••••' },
      { key: 'from', label: 'Sender ID (Mavjud bo\'lsa)', type: 'text', placeholder: '4546' },
    ]
  },
  {
    id: 'telegram',
    name: "Student App (Telegram)",
    desc: "Talabalar uchun Telegram Mini App va shaxsiy bot integratsiyasi. Darslar va balansni kuzatish uchun.",
    type: "Mini App / Bot",
    color: "blue",
    icon: Bot,
    fields: [
      { key: 'bot_token', label: 'Bot Token (HTTP API)', type: 'text', placeholder: '123456:ABC-DEF...' },
      { key: 'app_url', label: 'Mini App URL', type: 'text', placeholder: 'https://t.me/your_bot/app' },
    ]
  },
  {
    id: 'crm',
    name: "Tashqi CRM API",
    desc: "Tashqi web-saytlar va lendlardan leadlarni avtomatik qabul qilish uchun API interfeysi.",
    type: "Webhook API",
    color: "indigo",
    icon: Terminal,
    readOnly: true,
    fields: [
      { key: 'api_key', label: 'Sizning API Key', type: 'text', readOnly: true, placeholder: 'Avtomatik yaratiladi' },
      { key: 'endpoint', label: 'Lead POST Endpoint', type: 'text', readOnly: true, placeholder: 'https://api.yourdomain.com/leads' },
    ]
  }
];

export default function IntegrationsSettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings/global');
      setSettings(res.data || {});
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleEdit = (id: string) => {
    setEditingId(id);
    setFormData(settings[id] || {});
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSubmitting(true);
    try {
      const updatedSettings = {
        ...settings,
        [editingId]: formData
      };
      await api.post('/settings/global', updatedSettings);
      setSettings(updatedSettings);
      showToast("Sozlamalar saqlandi");
      setEditingId(null);
    } catch (err) {
      showToast("Xatolik yuz berdi", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
      </div>
    );
  }

  const isConfigured = (id: string) => {
    const config = settings[id];
    if (!config) return false;
    if (id === 'sms') return !!(config.email && config.password);
    if (id === 'telegram') return !!config.bot_token;
    return true;
  };

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 w-full px-6 pt-6">
      
      {/* 📊 Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 rounded-[12px] bg-white border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 transition-transform group-hover:scale-110">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Umumiy Modullar</p>
            <h3 className="text-2xl font-bold text-slate-900">{INTEGRATIONS.length} ta</h3>
          </div>
        </Card>

        <Card className="p-6 rounded-[12px] bg-white border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110">
            <LinkIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Faol ulanishlar</p>
            <h3 className="text-2xl font-bold text-slate-900">{INTEGRATIONS.filter(i => isConfigured(i.id)).length} ta</h3>
          </div>
        </Card>

        <Card className="p-6 rounded-[12px] bg-white border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Tizim holati</p>
            <h3 className="text-2xl font-bold text-slate-900">Xavfsiz</h3>
          </div>
        </Card>

        <Card className="p-6 rounded-[12px] bg-white border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 transition-transform group-hover:scale-110">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">API Uptime</p>
            <h3 className="text-2xl font-bold text-slate-900">99.9%</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
        {INTEGRATIONS.map((app) => {
           const Icon = app.icon;
           const active = isConfigured(app.id);
           
           return (
             <Card key={app.id} className={cn(
               "p-8 rounded-[12px] border transition-all duration-300 relative overflow-hidden group hover:border-slate-300",
               active ? "bg-white border-slate-200 shadow-sm" : "bg-slate-50/50 border-slate-100 opacity-80"
             )}>
                <div className="flex items-center justify-between mb-8 relative z-10">
                   <div className={cn(
                     "w-14 h-14 rounded-xl flex items-center justify-center border shadow-sm transition-all group-hover:bg-white",
                     active ? `bg-slate-50 border-slate-100 text-slate-700` : "bg-white border-slate-100 text-slate-300"
                   )}>
                      <Icon className="w-7 h-7" />
                   </div>
                   <Badge variant={active ? "success" : "secondary"} className={cn(
                     "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-none",
                     active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200"
                   )}>
                     {active ? "Ulangan" : "Ulanmagan"}
                   </Badge>
                </div>
                
                <div className="space-y-3 mb-8 relative z-10">
                   <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">{app.name}</h3>
                   <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">
                      {app.type} API
                   </span>
                   <p className="text-[13px] font-medium text-slate-500 leading-relaxed line-clamp-2">
                      {app.desc}
                   </p>
                </div>

                <div className="flex gap-3 relative z-10">
                   {app.readOnly ? (
                     <Button variant="outline" className="flex-1 h-10 rounded-lg border-slate-200 font-bold text-[13px] text-slate-600 hover:bg-slate-50">
                        <Save className="w-4 h-4 mr-2" /> API
                     </Button>
                   ) : (
                     <Button 
                       onClick={() => handleEdit(app.id)}
                       variant={active ? "outline" : "default"} 
                       className={cn(
                         "flex-1 h-10 rounded-lg font-bold text-[13px] shadow-sm",
                         active ? "border-slate-200 text-slate-700 hover:bg-slate-50" : "bg-slate-900 hover:bg-black text-white"
                       )}
                     >
                        {active ? <Settings2 className="w-4 h-4 mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                        {active ? "Sozlash" : "Ulash"}
                     </Button>
                   )}
                </div>
             </Card>
           );
        })}
      </div>

      {/* --- INTEGRATION CONFIG MODAL --- */}
      <Dialog open={!!editingId} onOpenChange={() => setEditingId(null)}>
         <DialogContent className="sm:max-w-md rounded-[40px] p-8 border-none shadow-2xl bg-white overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/5 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />
            
            <DialogHeader className="space-y-4 relative z-10 text-center">
               <div className={cn(
                 "w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto shadow-xl group-hover:rotate-12 transition-transform border border-white/50",
                 `bg-${INTEGRATIONS.find(i => i.id === editingId)?.color}-50 text-${INTEGRATIONS.find(i => i.id === editingId)?.color}-600`
               )}>
                  {editingId && (() => {
                    const Icon = INTEGRATIONS.find(i => i.id === editingId)?.icon || Puzzle;
                    return <Icon className="w-10 h-10" />
                  })()}
               </div>
               <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">
                  {INTEGRATIONS.find(i => i.id === editingId)?.name} Sozlamalari
               </DialogTitle>
               <DialogDescription className="font-bold text-slate-400 px-6">
                  {INTEGRATIONS.find(i => i.id === editingId)?.type} integratsiyasi uchun zaruriy API ma'lumotlarini kiriting.
               </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-8 relative z-10">
               {INTEGRATIONS.find(i => i.id === editingId)?.fields.map(field => (
                 <div key={field.key} className="space-y-2.5">
                    <Label className="text-[12px] font-black uppercase text-slate-400 tracking-[2px] ml-1">{field.label}</Label>
                    <Input 
                       type={field.type}
                       value={formData[field.key] || ''}
                       onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                       placeholder={field.placeholder}
                       className="h-14 rounded-2xl border-slate-100 font-bold bg-slate-50/50 focus:ring-2 focus:ring-pink-500/20 text-slate-700 placeholder:text-slate-300"
                    />
                 </div>
               ))}
            </div>

            <DialogFooter className="gap-3 sm:justify-center relative z-10">
               <Button onClick={() => setEditingId(null)} variant="outline" className="h-14 flex-1 rounded-2xl font-black border-slate-100 text-slate-500 hover:bg-slate-50">
                  Bekor qilish
               </Button>
               <Button onClick={handleSave} disabled={submitting} className="h-14 flex-1 rounded-2xl font-black bg-[#0F172A] hover:bg-black text-white shadow-xl shadow-slate-200">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                  Saqlash
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* --- TOAST NOTIFICATION --- */}
      {toast.show && (
         <div className="fixed top-6 right-6 z-[200] animate-in slide-in-from-right-8 duration-300">
            <div className={cn(
               "flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border min-w-[300px]",
               toast.type === 'success' ? "bg-white border-emerald-100 text-emerald-600" : "bg-white border-rose-100 text-rose-600"
            )}>
               {toast.type === 'success' ? <CheckCircle2 size={24} className="text-emerald-500" /> : <AlertCircle size={24} className="text-rose-500" />}
               <span className="font-bold text-[13px]">{toast.message}</span>
            </div>
         </div>
      )}
    </div>
  );
}
