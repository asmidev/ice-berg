import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, User, Building, Lock, Bell, Settings as SettingsIcon, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950 p-6 rounded-2xl shadow-sm border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-200 tracking-tight">Tizim Sozlamalari</h1>
          <p className="text-zinc-400 text-sm mt-1">Xavfsizlik va xabarnomalar sozlamalari</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button className="h-10 bg-blue-600/90 hover:bg-blue-600 hover:bg-blue-600 shadow-sm shadow-blue-500/20 text-slate-100 font-medium">
            <Save className="w-4 h-4 mr-2" /> O'zgarishlarni Saqlash
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Settings Navigation Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-1 bg-slate-950 p-4 rounded-xl shadow-sm border border-slate-800 h-fit sticky top-24">

          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:bg-zinc-900 rounded-lg text-sm font-medium transition-all group">
            <User className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400" /> Shaxsiy Akkaunt
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:bg-zinc-900 rounded-lg text-sm font-medium transition-all group">
            <Lock className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400" /> Xavfsizlik & Parol
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:bg-zinc-900 rounded-lg text-sm font-medium transition-all group">
            <Bell className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400" /> Bildirishnomalar
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:bg-zinc-900 rounded-lg text-sm font-medium transition-all group">
            <Shield className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400" /> Rollar va Huquqlar
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:bg-zinc-900 rounded-lg text-sm font-medium transition-all group">
            <Palette className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400" /> Tizim Vizuali
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 space-y-6">
          


          <Card className="border-0 shadow-sm bg-slate-950 overflow-hidden">
            <CardHeader className="border-b border-slate-800 pb-4 bg-zinc-900/50">
              <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-blue-400" /> Region va Til
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">Interfeys Tili</label>
                  <select className="w-full h-11 px-4 text-sm bg-zinc-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-slate-950 outline-none transition-all font-semibold text-slate-200 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20stroke%3D%22%231e293b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_16px_center] bg-no-repeat">
                    <option>O'zbek tili (Lotin)</option>
                    <option>Ўзбек тили (Кирилл)</option>
                    <option>Русский язык</option>
                    <option>English</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">Asosiy Valyuta</label>
                  <select className="w-full h-11 px-4 text-sm bg-zinc-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-slate-950 outline-none transition-all font-semibold text-slate-200 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20stroke%3D%22%231e293b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_16px_center] bg-no-repeat">
                    <option>UZS - O'zbek so'mi</option>
                    <option>USD - AQSh dollari</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
