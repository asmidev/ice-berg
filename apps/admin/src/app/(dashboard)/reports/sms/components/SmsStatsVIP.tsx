import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, CheckCircle2, AlertCircle, Wallet } from 'lucide-react';

interface SmsStatsProps {
  stats: {
    total: number;
    sent: number;
    failed: number;
    balance: number | string;
  };
  loading: boolean;
}

export const SmsStatsVIP = ({ stats, loading }: SmsStatsProps) => {
  const items = [
    {
      title: 'Jami SMSlar',
      value: (stats?.total ?? 0).toLocaleString(),
      icon: MessageSquare,
      gradient: 'from-pink-500 to-pink-600',
      subtitle: 'Oxirgi oyda'
    },
    {
      title: 'Yetkazildi',
      value: (stats?.sent ?? 0).toLocaleString(),
      icon: CheckCircle2,
      gradient: 'from-cyan-500 to-cyan-600',
      subtitle: 'Muvaffaqiyatli'
    },
    {
      title: 'Xatoliklar',
      value: (stats?.failed ?? 0).toLocaleString(),
      icon: AlertCircle,
      gradient: 'from-slate-700 to-slate-900',
      subtitle: 'Xato raqamlar'
    },
    {
      title: 'SMS Balans',
      value: typeof stats?.balance === 'number' ? stats.balance.toLocaleString() : (stats?.balance ?? '0'),
      icon: Wallet,
      gradient: 'from-violet-500 to-violet-600',
      subtitle: 'Eskiz.uz balansi'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item, i) => (
        <Card key={i} className={`border-none shadow-xl shadow-zinc-200/50 bg-gradient-to-br ${item.gradient} rounded-xl overflow-hidden relative group`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{item.subtitle}</span>
            </div>
            <h3 className="text-white/80 font-bold text-xs uppercase tracking-widest mb-1">{item.title}</h3>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-black text-white tracking-tight">
                {loading ? '...' : item.value}
              </h2>
              {item.title === 'SMS Balans' && <span className="text-white/60 font-bold text-sm">UZS</span>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
