"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { 
  MessageSquare, Settings, Share2, Filter, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";

// Components
import { SmsStatsVIP } from './components/SmsStatsVIP';
import { SmsTrafficChartVIP } from './components/SmsTrafficChartVIP';
import { SmsLogTableVIP } from './components/SmsLogTableVIP';

export default function SmsReportPage() {
  const searchParams = useSearchParams();
  
  // Data States
  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0, balance: 0 });
  const [logs, setLogs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState('all');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 🔄 Init
  useEffect(() => {
    const bId = searchParams.get('branch_id') || localStorage.getItem('branch_id') || 'all';
    setBranchId(bId);
    
    // Fetch branches
    api.get('/branches').then(res => setBranches(res.data?.data || res.data || []));
  }, [searchParams]);

  // 🛰️ Data Fetching
  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get(`/sms/report/stats?branch_id=${branchId}`);
      setStats(statsRes.data);

      const chartRes = await api.get(`/sms/report/chart?branch_id=${branchId}`);
      setChartData(chartRes.data);

      const logsRes = await api.get(`/sms/report/logs?branch_id=${branchId}&status=${status}&page=${page}`);
      setLogs(logsRes.data.logs || []);
      setTotalPages(logsRes.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('SMS Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [branchId, status, page]);

  return (
    <div className="flex flex-col space-y-6 pb-12 w-full mx-auto animate-in fade-in duration-700 h-full overflow-y-auto custom-scrollbar px-1">
      
      {/* 📊 High-Density Stats */}
      <SmsStatsVIP stats={stats} loading={loading} />

      {/* 🧭 Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <SmsTrafficChartVIP data={chartData} loading={loading} />
        </div>
        
        {/* 🛠 Filters Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200/80 space-y-6">
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
               <Filter className="w-4 h-4 text-pink-500" /> Filtrlash
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Filial</label>
                <Select value={branchId} onValueChange={setBranchId}>
                  <SelectTrigger className="h-10 rounded-lg border-zinc-200 bg-white font-bold text-gray-700">
                    <SelectValue placeholder="Filialni tanlang" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-zinc-200 shadow-xl">
                    <SelectItem value="all" className="font-bold py-2">Barcha filiallar</SelectItem>
                    {branches.map(b => (
                      <SelectItem key={b.id} value={b.id} className="font-bold py-2">{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Holati bo'yicha</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ALL', label: 'Hammasi' },
                    { id: 'SENT', label: 'Yetkazildi' },
                    { id: 'FAILED', label: 'Xatolik' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStatus(s.id)}
                      className={`h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                        ${status === s.id 
                          ? 'bg-pink-500 text-white shadow-md shadow-pink-100' 
                          : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100 border border-zinc-100'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                variant="ghost" 
                onClick={() => { setBranchId('all'); setStatus('ALL'); setPage(1); }}
                className="w-full h-10 rounded-lg font-bold text-zinc-400 hover:text-pink-500 hover:bg-pink-50 gap-2 mt-2"
              >
                <RotateCcw className="w-4 h-4" /> Tozalash
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 📋 Logs Table Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Oxirgi loglar</h2>
          <div className="flex items-center gap-2">
             <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Sahifa: {page}/{totalPages}</span>
             <div className="flex items-center gap-1">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-zinc-100 disabled:opacity-50"
                >
                  &lt;
                </button>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-zinc-100 disabled:opacity-50"
                >
                  &gt;
                </button>
             </div>
          </div>
        </div>
        <SmsLogTableVIP logs={logs} loading={loading} />
      </div>

    </div>
  );
}

