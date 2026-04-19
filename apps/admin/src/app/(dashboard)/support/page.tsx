"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, PhoneCall, Mail, MessageCircle, Send, CheckCircle2, ChevronDown, Rocket } from 'lucide-react';

const FAQS = [
  {
    q: "Yangi filial qo'shish qanday amalga oshiriladi?",
    a: "Bosh admin tizim sozlamalari orqali (Moliya bo'limi ostida) yangi filial kiritish imkoniyatiga ega. Filial qo'shgandan so'ng xodimlarni shu filialga biriktirish kerak."
  },
  {
    q: "O'quвчи to'lovini qanday qaytarish (otmen qilish) mumkin?",
    a: "Moliya > Kassa bo'limida amalga oshirilgan to'lovni topib, uning ustiga bosgan holda 'To'lovni bekor qilish' tugmasi orqali qaytarishingiz mumkin."
  },
  {
    q: "Xodim darsga kelmaganini tizimga qanday kiritaman?",
    a: "Xodimlar Davomati bo'limida Bugungi kun sanasini tanlab, kerakli xodimning ismi ro'parasiga 'Keldi/Kelmadi' statusini belgilaysiz."
  }
];

export default function SupportPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div className="max-w-[1500px] w-full mx-auto p-0 pt-0 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Area */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 sm:p-12 mb-8 text-white shadow-lg relative overflow-hidden">
        {/* Soft Decorative Elements */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/4 pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center mb-4">
            Texnik Yordam Markazi <Rocket className="w-8 h-8 ml-3 text-blue-200" />
          </h1>
          <p className="text-blue-100 font-medium text-lg leading-relaxed">
            Bizning murakkab bo'lmagan, lekin kuchli platformamizda savollaringiz bo'lsa yoki biron muammoga duch kelsangiz yordam berishdan doim xursandmiz.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Contact Cards & FAQs */}
        <div className="xl:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border border-indigo-100 shadow-sm bg-indigo-50/30 hover:shadow-md transition-all rounded-2xl group cursor-pointer">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 mb-1">Call Markaz</h3>
                  <p className="text-xs text-zinc-500 mb-2">Tezkor muammolar uchun qo'ng'iroq qiling.</p>
                  <a href="tel:+998712000000" className="text-indigo-600 font-bold hover:underline">+998 71 200 00 00</a>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-blue-100 shadow-sm bg-blue-50/30 hover:shadow-md transition-all rounded-2xl group cursor-pointer">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-blue-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 mb-1">Telegram IT Yordam</h3>
                  <p className="text-xs text-zinc-500 mb-2">Rasmli va matnli xatolar yuborish uchun.</p>
                  <a href="#" className="text-blue-600 font-bold hover:underline">@Edutizim_Support</a>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-zinc-200 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100/80 px-6 py-5">
              <CardTitle className="text-lg font-bold text-zinc-800 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2 text-zinc-400" /> Ko'p so'raladigan savollar (FAQ)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-100">
                {FAQS.map((faq, idx) => (
                  <div key={idx} className="p-6 transition-colors hover:bg-zinc-50/50 cursor-pointer" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                    <div className="flex justify-between items-center gap-4">
                      <h4 className={`text-sm font-bold ${openFaq === idx ? 'text-blue-600' : 'text-zinc-800'} transition-colors leading-tight`}>
                        {faq.q}
                      </h4>
                      <div className={`text-zinc-400 transition-transform ${openFaq === idx ? 'rotate-180 text-blue-500' : ''}`}>
                         <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                    {openFaq === idx && (
                      <p className="text-zinc-500 text-sm mt-3 leading-relaxed animate-in fade-in slide-in-from-top-2">
                        {faq.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Ticket Form */}
        <div className="xl:col-span-1">
          <Card className="border border-zinc-200 shadow-sm rounded-3xl sticky top-24">
            <CardHeader className="border-b border-zinc-100/80 px-6 py-5">
              <CardTitle className="text-lg font-bold text-zinc-800">Xabar yuborish</CardTitle>
              <CardDescription className="text-xs mt-1">
                Tizim yaratuvchilariga xato (bug) yoki yangi taklif yuboring.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              
              {success ? (
                <div className="flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-zinc-900 mb-2">So'rovingiz qabul qilindi!</h3>
                  <p className="text-xs text-zinc-500">Tez orada mutaxassislar muammoni hal etib siz bilan bog'lanishadi.</p>
                </div>
              ) : (
                <form onSubmit={handleSendTicket} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-700 tracking-wide uppercase">Mavzu türü</label>
                    <select className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-sm font-medium">
                      <option>Xatolik (Bug) haqida xabar berish</option>
                      <option>Tizimga yangi xususiyat taklif qilish</option>
                      <option>Moliyaviy muammo/tushunmovchilik</option>
                      <option>Boshqa...</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-700 tracking-wide uppercase">Xabar matni</label>
                    <textarea 
                      required
                      placeholder="Muammoni iloji boricha batafsil yozing..."
                      className="w-full min-h-[140px] p-4 rounded-xl border border-zinc-200 bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm resize-y"
                    ></textarea>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 rounded-xl shadow-sm transition-all flex items-center justify-center">
                    {loading ? "Yuborilmoqda..." : <><Send className="w-4 h-4 mr-2" /> Xabarni Yuborish</>}
                  </Button>
                </form>
              )}

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
