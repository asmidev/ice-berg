'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Loader2, Info, ChevronLeft, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('+998');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:3001/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Xatolik yuz berdi');
      }
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:3001/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Kod noto\'g\'ri');
      }
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Parollar bir-biriga mos kelmadi');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:3001/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Xatolik yuz berdi');
      }
      setStep(4);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans overflow-hidden selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="h-20 px-6 md:px-12 border-b border-slate-900 flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <img 
            src="/Group 322.png" 
            alt="ICE Logo" 
            className="h-8 w-auto"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/10 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
            v3.0 Stable
          </div>
          <div className="hidden sm:block w-[1px] h-4 bg-slate-800 mx-2" />
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
             Protocol: <span className="text-blue-500/80">Encrypted</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row relative">
        {/* Left Section - Illustration */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-slate-950 p-12 lg:p-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-25 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[100px]" />
          </div>

          <div className="max-w-xl w-full relative z-10 transition-transform duration-700">
            <img 
              src="/Frame 341.png" 
              alt="Mountain Illustration" 
              className="w-full h-auto drop-shadow-[0_20px_50_rgba(37,99,235,0.15)] animate-float"
            />
          </div>

          {/* Vertical Divider */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-[60%] bg-gradient-to-b from-transparent via-slate-800 to-transparent z-20" />
        </div>

        {/* Right Section - Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-24 bg-slate-950 relative">
          <div className="w-full max-w-[420px]">
            <Link 
              href="/login" 
              className="mb-12 inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-400 transition-all group"
            >
              <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Ortga qaytish
            </Link>

            <div className="mb-10 text-center md:text-left">
              <img 
                src="/Group 322.png" 
                alt="ICE Logo" 
                className="h-8 w-auto mb-6"
              />
              <h1 className="text-4xl font-black text-white tracking-tight mb-3">
                {step === 1 && "Parolni tiklash"}
                {step === 2 && "Tasdiqlash"}
                {step === 3 && "Yangi parol"}
                {step === 4 && "Tayyor!"}
              </h1>
              <p className="text-slate-400 font-medium text-sm">
                {step === 1 && "Telefon raqamingizni kiriting."}
                {step === 2 && "Yuborilgan 6 xonali kodni kiriting."}
                {step === 3 && "Yangi xavfsiz parol o'rnating."}
                {step === 4 && "Parolingiz o'zgartirildi."}
              </p>
            </div>

            <div className="space-y-6">
              {step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2"><Info className="h-4 w-4 shrink-0" />{error}</div>}
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">TELEFON RAQAM</Label>
                    <Input 
                      placeholder="+998 90 123 45 67" 
                      value={phone} 
                      onChange={e => {
                        const val = e.target.value;
                        if (val.startsWith('+998')) {
                          setPhone(val);
                        }
                      }}
                      required
                      className="h-14 px-5 rounded-2xl border-slate-800 bg-slate-900 focus:bg-slate-900/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold !text-white placeholder:text-slate-600 shadow-sm" 
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-900/20 group transition-all">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 
                      <span className="flex items-center gap-2">Kodni yuborish <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></span>
                    }
                  </Button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2"><Info className="h-4 w-4 shrink-0" />{error}</div>}
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 text-center block">SMS Kod</Label>
                    <Input 
                      placeholder="000 000" 
                      value={otp} 
                      onChange={e => setOtp(e.target.value)}
                      maxLength={6}
                      required
                      className="h-24 text-center text-5xl tracking-[0.4em] font-black rounded-2xl border-slate-800 bg-slate-900 focus:bg-slate-900/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all !text-white placeholder:text-slate-950 shadow-sm"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-900/20 transition-all">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Tasdiqlash"}
                  </Button>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2"><Info className="h-4 w-4 shrink-0" />{error}</div>}
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">YANGI PAROL</Label>
                      <Input 
                        type="password"
                        placeholder="••••••••" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)}
                        required
                        className="h-14 px-5 rounded-2xl border-slate-800 bg-slate-900 focus:bg-slate-900/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold !text-white placeholder:text-slate-600 shadow-sm" 
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">TASDIQLASH</Label>
                      <Input 
                        type="password"
                        placeholder="••••••••" 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        className="h-14 px-5 rounded-2xl border-slate-800 bg-slate-900 focus:bg-slate-900/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-white placeholder:text-slate-600 shadow-sm" 
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-900/20 transition-all text-center">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Saqlash O'zgarishlarni"}
                  </Button>
                </form>
              )}

              {step === 4 && (
                <div className="text-center py-4 animate-in zoom-in duration-500">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_10px_30px_rgba(16,185,129,0.1)]">
                    <CheckCircle2 className="h-10 w-10" strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white">Muvaffaqiyatli!</h3>
                  <p className="text-xs font-medium text-slate-400 mb-8 leading-relaxed text-center">Parolingiz yangilandi. Endi tizimga kirishingiz mumkin.</p>
                  <Button onClick={() => router.push('/login')} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.2)] transition-all">
                    Login sahifasiga o'tish
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-16 pt-12 border-t border-slate-900 text-center text-[12px] text-slate-500 leading-relaxed font-bold uppercase tracking-widest italic opacity-50">
               Secure Access Protocol
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
