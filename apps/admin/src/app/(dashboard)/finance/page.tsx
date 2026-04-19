"use client";

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet, TrendingUp, TrendingDown, CreditCard, ArrowUpRight, ArrowDownRight, DollarSign, Filter, Download, Plus, Search, Calendar, History, Building2 } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function FinancePage() {
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState('all');

  useEffect(() => {
    setBranchId(localStorage.getItem('branch_id') || 'all');
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, transRes] = await Promise.all([
        api.get(`/analytics/dashboard?branch_id=${branchId}`),
        api.get(`/finance/transactions?branch_id=${branchId}`)
      ]);
      setStats(statsRes.data?.data || statsRes.data);
      setTransactions(transRes.data?.data || transRes.data || []);
    } catch (err) {
      console.error('Finance Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [branchId]);

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500 pb-10 w-full max-w-[1500px] mx-auto p-0 pt-0">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-3xl shadow-sm border border-zinc-200">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center">
            Moliya va Kassa <Wallet className="w-6 h-6 ml-3 text-emerald-500" />
          </h1>
          <p className="text-zinc-500 text-sm mt-1 font-medium">Barcha tushumlar, chiqimlar va qarzdorliklar tarixi</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Link href="/finance/expenses" className="flex-1 sm:flex-none">
            <Button className="h-12 w-full bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20">
              <TrendingDown className="w-4 h-4 mr-2" /> Xarajat
            </Button>
          </Link>
          <Link href="/finance/payments" className="flex-1 sm:flex-none">
            <Button className="h-12 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20">
              <Plus className="w-4 h-4 mr-2" /> Tushum
            </Button>
          </Link>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Income Card */}
        <Card className="border-0 shadow-sm bg-emerald-600 text-white overflow-hidden relative group rounded-3xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-emerald-100 font-bold text-xs uppercase tracking-widest">Jami Tushum</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-3xl font-black tracking-tight">{formatCurrency(stats?.totalRevenue || 0)} <span className="text-xs font-bold text-emerald-200">UZS</span></p>
            <div className="mt-4 flex items-center text-[10px] uppercase font-black tracking-tight bg-white/10 px-3 py-1.5 rounded-full w-fit">
              <TrendingUp className="w-3 h-3 mr-1.5" /> Barcha davr
            </div>
          </CardContent>
        </Card>

        {/* Expense Card */}
        <Card className="border-0 shadow-sm bg-rose-500 text-white overflow-hidden relative group rounded-3xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
          <CardHeader className="pb-2 relative z-10">
             <CardTitle className="text-rose-100 font-bold text-xs uppercase tracking-widest">Jami Xarajat</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-3xl font-black tracking-tight">{formatCurrency(stats?.totalExpenses || 0)} <span className="text-xs font-bold text-rose-200">UZS</span></p>
            <div className="mt-4 flex items-center text-[10px] uppercase font-black tracking-tight bg-white/10 px-3 py-1.5 rounded-full w-fit">
              <TrendingDown className="w-3 h-3 mr-1.5" /> Barcha davr
            </div>
          </CardContent>
        </Card>

        {/* Debtors Card */}
        <Card className="border border-amber-200 shadow-sm bg-amber-50 text-amber-900 overflow-hidden relative group rounded-3xl">
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-amber-600 font-bold text-xs uppercase tracking-widest">Qarzdorlik (Aktiv)</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-3xl font-black tracking-tight">{stats?.debtors || 0} <span className="text-sm font-bold text-amber-400">NAFAR</span></p>
            <Link href="/finance/debtors" className="mt-4 flex items-center text-[10px] uppercase font-black tracking-tight bg-amber-900/10 px-3 py-1.5 rounded-full w-fit hover:bg-amber-900/20 transition-all">
              <Calendar className="w-3 h-3 mr-1.5" /> Talabalar ro'yxati
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Section */}
      <Card className="rounded-[2.5rem] shadow-sm border border-zinc-200 overflow-hidden bg-white">
        <CardHeader className="px-8 py-6 border-b border-zinc-100 flex flex-row items-center justify-between bg-zinc-50/50">
           <div>
             <CardTitle className="text-xl font-bold text-zinc-800">Oxirgi Amallar</CardTitle>
             <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1.5">Tushum va Xarajatlar Tarixi</p>
           </div>
           <div className="flex items-center gap-3">
             <div className="relative w-64 hidden sm:block">
               <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
               <input type="text" placeholder="Qidirish..." className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 transition-all font-medium" />
             </div>
             <Button variant="outline" className="h-10 rounded-xl border-zinc-200 text-zinc-400 font-bold">
               <Download className="w-4 h-4" />
             </Button>
           </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50/30 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] hover:bg-transparent">
                  <TableHead className="py-5 pl-8">Tranzaksiya / Sana</TableHead>
                  <TableHead>Mijoz (Talaba)</TableHead>
                  <TableHead>Filial / Kassa</TableHead>
                  <TableHead>Tur</TableHead>
                  <TableHead className="text-right pr-8">Summa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell colSpan={5} className="py-6"><div className="h-10 bg-zinc-50 rounded-xl w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : transactions.length > 0 ? (
                  transactions.map((trx) => (
                    <TableRow key={trx.id} className="hover:bg-zinc-50/50 transition-colors border-zinc-50">
                      <TableCell className="pl-8 py-5">
                        <p className="font-bold text-zinc-800 text-sm">#TX-{trx.id.substring(0, 8)}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight mt-1">{new Date(trx.created_at).toLocaleString('uz-UZ')}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-zinc-700 text-sm">{trx.student?.user?.first_name} {trx.student?.user?.last_name || '-'}</p>
                        <p className="text-[10px] text-zinc-400 font-bold">{trx.student?.user?.phone || 'Ma\'lumot yo\'q'}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <Building2 className="w-3.5 h-3.5 text-zinc-300" />
                           <p className="text-xs font-bold text-zinc-500">{trx.branch?.name || 'Tizim'}</p>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-bold ml-5">{trx.cashbox?.name || 'Asosiy kassa'}</p>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border
                          ${trx.type === 'CASH' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            trx.type === 'CARD' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                            'bg-violet-50 text-violet-600 border-violet-100'}
                        `}>
                          {trx.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <p className="font-black text-emerald-600 text-base">{formatCurrency(trx.amount)} <span className="text-[10px] text-zinc-400 ml-0.5">UZS</span></p>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                     <TableCell colSpan={5} className="py-20 text-center">
                        <History className="w-12 h-12 text-zinc-100 mx-auto mb-4" />
                        <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">Tranzaksiyalar maugjud emas</p>
                     </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Links Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
         {[
           { label: 'Kassalar', icon: Wallet, href: '/finance/cashbox', color: 'blue' },
           { label: 'Maoshlar', icon: DollarSign, href: '/finance/salaries', color: 'zinc' },
           { label: 'Tushumlar', icon: TrendingUp, href: '/finance/incomes', color: 'emerald' },
           { label: 'Qarzdorlar', icon: Calendar, href: '/finance/debtors', color: 'amber' },
         ].map((link, i) => (
           <Link key={i} href={link.href}>
             <Button variant="ghost" className="w-full h-16 rounded-2xl border border-zinc-100 bg-white hover:bg-zinc-50 hover:border-zinc-200 flex flex-col items-center justify-center gap-1 group">
                <link.icon className={`w-5 h-5 text-zinc-300 group-hover:text-${link.color}-500 transition-colors`} />
                <span className="text-[10px] font-black uppercase text-zinc-400 group-hover:text-zinc-800 transition-colors tracking-widest">{link.label}</span>
             </Button>
           </Link>
         ))}
      </div>
    </div>
  );
}
