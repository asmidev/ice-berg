"use client";

import { useEffect, useState } from 'react';
import { 
  Users, UserCheck, UserCog, AlertCircle, Briefcase, Users2
} from 'lucide-react';
import api from '@/lib/api';
import { useSearchParams } from 'next/navigation';

// Custom Components
import { StatCardMini } from '@/components/dashboard/StatCardMini';
import { EarningsChart } from '@/components/dashboard/EarningsChart';
import { GenderChart } from '@/components/dashboard/GenderChart';
import { DebtorsStats } from '@/components/dashboard/DebtorsStats';
import { AbsentStudentsToday } from '@/components/dashboard/AbsentStudentsToday';
import { RecentPaymentsTable } from '@/components/dashboard/RecentPaymentsTable';
import { RecentActivitiesTable } from '@/components/dashboard/RecentActivitiesTable';

// New Strategical Components
import { LeadFunnelChart } from '@/components/dashboard/LeadFunnelChart';
import { CoursePerformanceChart } from '@/components/dashboard/CoursePerformanceChart';
import { GroupCapacityChart } from '@/components/dashboard/GroupCapacityChart';
import { PaymentMethodsChart } from '@/components/dashboard/PaymentMethodsChart';
import { InventorySalesChart } from '@/components/dashboard/InventorySalesChart';
import { StudentRetentionChart } from '@/components/dashboard/StudentRetentionChart';
import { PenalizedTeachersToday } from '@/components/dashboard/PenalizedTeachersToday';
import { TopPenalizedTeachers } from '@/components/dashboard/TopPenalizedTeachers';

export default function DashboardHome() {
  const searchParams = useSearchParams();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const branchId = searchParams.get('branch_id') || (typeof window !== 'undefined' ? localStorage.getItem('branch_id') : null) || 'all';

  useEffect(() => {
    setLoading(true);
    
    // Default fetch with 7d for initial load
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    api.get(`/analytics/dashboard?branch_id=${branchId}&startDate=${startStr}&endDate=${endStr}`)
    .then(res => {
      setData(res.data?.data || res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error('Failed to load dashboard stats', err);
      setLoading(false);
    });
  }, [branchId]);

  if (loading || !data) {
    return (
      <div className="flex animate-pulse space-y-8 flex-col w-full h-full pt-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {[...Array(4)].map((_, i) => <div key={i} className="h-[400px] bg-gray-100 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8 w-full mx-auto py-2 animate-in fade-in duration-700">
      
      {/* 📊 Top Mini Stats - Unified 6 Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCardMini 
          title="Barcha o'quvchilar" 
          value={data.stats?.students?.total || 0} 
          icon={UserCheck} 
          iconBg="bg-blue-50" 
          iconColor="text-blue-600" 
        />
        <StatCardMini 
          title="Asosiy Ustozlar" 
          value={data.stats?.teachers?.main || 0} 
          icon={Users} 
          iconBg="bg-pink-50" 
          iconColor="text-pink-500" 
        />
        <StatCardMini 
          title="Yordamchi ustozlar" 
          value={data.stats?.teachers?.support || 0} 
          icon={Users2} 
          iconBg="bg-cyan-50" 
          iconColor="text-cyan-600" 
        />
        <StatCardMini 
          title="Xodimlar" 
          value={data.stats?.staff?.total || 0} 
          icon={Briefcase} 
          iconBg="bg-navy-50" 
          iconColor="text-navy-800" 
        />
        <StatCardMini 
          title="Lidlar" 
          value={data.stats?.leads?.total || 0} 
          icon={UserCog} 
          iconBg="bg-purple-50" 
          iconColor="text-purple-600" 
        />
        <StatCardMini 
          title="Umumiy qarz" 
          value={`${(data.stats?.debtors?.amount / 1000000).toFixed(1)}M`} 
          icon={AlertCircle} 
          iconBg="bg-red-50" 
          iconColor="text-red-600" 
        />
      </div>

      {/* 🏔️ MAIN STRATEGICAL DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <LeadFunnelChart initialData={data.funnelData} initialConversionRate={data.stats?.leads?.conversionRate} />
          <StudentRetentionChart initialData={data.stats?.students} />
          <PaymentMethodsChart initialData={data.paymentMethodData} />
          
          <CoursePerformanceChart initialData={data.coursePerformance} />
          <GroupCapacityChart initialData={data.capacityData} />
          <InventorySalesChart initialRevenue={data.inventoryRevenue} />
      </div>

      {/* 📉 TRENDS & PERFORMANCE */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <EarningsChart initialData={data.chartData} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GenderChart initialData={data.stats?.gender} />
            <DebtorsStats 
              initialTotalAmount={data.stats?.debtors?.amount || 0} 
              initialCount={data.stats?.debtors?.total || 0} 
              initialDebtors={data.topDebtors || []}
            />
          </div>
      </div>

      {/* 📢 Bottom Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PenalizedTeachersToday penalties={data.penalizedTeachersToday || []} />
        <TopPenalizedTeachers teachers={data.topPenalizedTeachers || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <AbsentStudentsToday students={data.absentStudentsToday || []} />
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <RecentPaymentsTable payments={data.latestPayments || []} />
          <RecentActivitiesTable activities={data.recentActivities || []} />
        </div>
      </div>

    </div>
  );
}
