'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { 
  BarChart4, Settings2, ShieldCheck, CheckSquare, Plus, Edit3, 
  LayoutGrid, Building2, Info, CheckCircle2, AlertCircle, TrendingUp, Trophy, Target, Award
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Threshold {
  label: string
  range: string
  type: 'success' | 'primary' | 'warning' | 'danger'
  coin_reward?: number
}

interface GradingSettings {
  method: '5-ball' | '10-ball' | '100-ball'
  thresholds: Threshold[]
}

const DEFAULT_THRESHOLDS: Record<string, Threshold[]> = {
  '5-ball': [
    { label: "A'lo", range: '4-5', type: 'success' },
    { label: 'Yaxshi', range: '3-4', type: 'primary' },
    { label: 'Qoniqarli', range: '2-3', type: 'warning' },
    { label: 'Qoniqarsiz', range: '0-2', type: 'danger' }
  ],
  '10-ball': [
    { label: "A'lo", range: '9-10', type: 'success' },
    { label: 'Yaxshi', range: '7-8', type: 'primary' },
    { label: 'Qoniqarli', range: '5-6', type: 'warning' },
    { label: 'Qoniqarsiz', range: '0-4', type: 'danger' }
  ],
  '100-ball': [
    { label: "A'lo", range: '86-100', type: 'success' },
    { label: 'Yaxshi', range: '71-85', type: 'primary' },
    { label: 'Qoniqarli', range: '56-70', type: 'warning' },
    { label: 'Qoniqarsiz', range: '0-55', type: 'danger' }
  ]
}

const DEFAULT_SETTINGS: GradingSettings = {
  method: '10-ball',
  thresholds: DEFAULT_THRESHOLDS['10-ball']
}

const METHODS = [
  { id: '5-ball', name: '5 Ballik Sistem', desc: 'Sobiq maktab standarti (2, 3, 4, 5)', color: 'blue' },
  { id: '10-ball', name: '10 Ballik Sistem', desc: 'IELTS / Xalqaro standart', color: 'emerald' },
  { id: '100-ball', name: '100 Ballik Sistem', desc: 'Siklli imtihonlar (DTM/Pro) uchun', color: 'amber' },
]

export default function AcademicScoresSettingsPage() {
  const searchParams = useSearchParams()
  const [branchId, setBranchId] = useState('all')
  const [settings, setSettings] = useState<GradingSettings>(DEFAULT_SETTINGS)

  const changeMethod = (methodId: string) => {
    setSettings({
      method: methodId as any,
      thresholds: DEFAULT_THRESHOLDS[methodId]
    })
  }
  const [stats, setStats] = useState({ totalExams: 0, averageScore: 0 })
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [branch, setBranch] = useState<any>(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' })

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  // --- BRANCH SYNC ---
  useEffect(() => {
    const handleSyncBranch = () => {
      const bId = searchParams?.get('branch_id') || localStorage.getItem('branch_id') || 'all'
      if (bId !== branchId) setBranchId(bId)
    }
    handleSyncBranch()
    window.addEventListener('storage', handleSyncBranch)
    const interval = setInterval(handleSyncBranch, 1000)
    return () => {
      window.removeEventListener('storage', handleSyncBranch)
      clearInterval(interval)
    }
  }, [searchParams, branchId])

  const fetchData = async () => {
    if (branchId === 'all') {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [branchRes, res] = await Promise.all([
        api.get(`/branches/${branchId}`),
        api.get(`/lms/grading-settings?branch_id=${branchId}`)
      ])
      const data = res.data?.data || res.data;
      setBranch(branchRes.data?.data || branchRes.data)
      setSettings(data.settings || DEFAULT_SETTINGS)
      setStats(data.stats || { totalExams: 0, averageScore: 0 })
    } catch (err) {
      console.error(err)
      showToast('Ma\'lumotlarni yuklashda xatolik', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [branchId])

  const handleSave = async () => {
    if (branchId === 'all') return
    setIsSaving(true)
    try {
      await api.post(`/lms/grading-settings?branch_id=${branchId}`, settings)
      showToast('Sozlamalar muvaffaqiyatli saqlandi!')
      // Refresh stats after save if needed, though they shouldn't change from settings save
    } catch (err) {
      showToast('Saqlashda xatolik yuz berdi', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const updateThreshold = (index: number, field: keyof Threshold, value: any) => {
    const newThresholds = [...settings.thresholds]
    newThresholds[index] = { ...newThresholds[index], [field]: value }
    setSettings({ ...settings, thresholds: newThresholds })
  }

  if (branchId === 'all') {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] space-y-6 bg-white rounded-xl border border-dashed border-gray-200 animate-in fade-in duration-500'>
        <div className='w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300'>
          <LayoutGrid size={32} />
        </div>
        <div className='text-center space-y-1'>
          <h3 className='text-lg font-black text-navy-800'>Filial Tanlanmagan</h3>
          <p className='text-gray-500 text-[13px] max-w-[280px] font-medium leading-relaxed'>
            Baholash tizimi sozlamalarini boshqarish uchun yuqoridagi menyudan filialni tanlang.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-20'>
      {/* --- TOAST --- */}
      {toast.show && (
        <div className='fixed top-6 right-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300'>
          <div className={cn(
            'flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border min-w-[300px]',
            toast.type === 'success' ? 'bg-white border-emerald-100 text-emerald-600' : 'bg-white border-rose-100 text-rose-600'
          )}>
            {toast.type === 'success' ? <CheckCircle2 size={24} className='text-emerald-500' /> : <AlertCircle size={24} className='text-rose-500' />}
            <span className='font-bold text-[13px]'>{toast.message}</span>
          </div>
        </div>
      )}

      {/* 🧭 Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
         <div className='bg-white p-6 rounded-[12px] shadow-sm border border-gray-100 flex items-center gap-5 group transition-all hover:bg-navy-50/30'>
            <div className='w-12 h-12 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center group-hover:bg-navy-800 group-hover:text-white transition-all shadow-sm'>
              <Trophy size={24} />
            </div>
            <div>
              <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1'>Jami Imtihonlar</p>
              <h2 className='text-xl font-black text-navy-800 leading-none'>{stats.totalExams} ta</h2>
            </div>
         </div>

         <div className='bg-white p-6 rounded-[12px] shadow-sm border border-gray-100 flex items-center gap-5 group transition-all hover:bg-emerald-50/30'>
            <div className='w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm shadow-emerald-100'>
              <Award size={24} />
            </div>
            <div>
              <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1'>O'rtacha Ball</p>
              <h2 className='text-xl font-black text-navy-800 leading-none'>{stats.averageScore} / 10</h2>
            </div>
         </div>

         <div className='bg-white p-6 rounded-[12px] shadow-sm border border-gray-100 flex items-center gap-5 group transition-all hover:bg-pink-50/30'>
            <div className='w-12 h-12 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-all shadow-sm shadow-pink-100'>
              <Target size={24} />
            </div>
            <div>
              <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1'>Aktiv Sistema</p>
              <h2 className='text-xl font-black text-navy-800 leading-none'>{METHODS.find(m => m.id === settings.method)?.name || 'Noma\'lum'}</h2>
            </div>
         </div>
      </div>

      {/* 🚀 Logic Selection Grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {METHODS.map((method, i) => (
           <Card 
            key={i} 
            onClick={() => changeMethod(method.id)}
            className={cn(
              'border shadow-sm hover:shadow-md transition-all duration-300 rounded-[12px] relative overflow-hidden group cursor-pointer h-full',
              settings.method === method.id ? 'border-pink-200 bg-pink-50/10' : 'bg-white border-gray-100'
            )}
           >
             <CardContent className='p-6 relative z-10'>
                <div className='flex items-start justify-between mb-5'>
                   <div className={cn(
                     'w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm transition-all',
                     settings.method === method.id ? 'bg-pink-500 border-pink-400 text-white' : 'bg-gray-50 border-gray-100 text-gray-400 group-hover:bg-gray-100'
                   )}>
                      {settings.method === method.id ? <ShieldCheck size={24} /> : <CheckSquare size={24} />}
                   </div>
                   {settings.method === method.id && (
                      <span className='text-[9px] uppercase font-black px-3 py-1.5 rounded-full border shadow-sm bg-white text-pink-500 border-pink-100 tracking-widest animate-in zoom-in-50 duration-300'>
                        TANLANDI
                      </span>
                   )}
                </div>
                <h3 className='text-[15px] font-black text-navy-800 leading-tight group-hover:text-pink-600 transition-colors uppercase'>{method.name}</h3>
                <p className='text-[12px] font-bold text-gray-400 mt-2 italic leading-relaxed'>{method.desc}</p>
             </CardContent>
           </Card>
        ))}
      </div>

      {/* 🚀 Configuration Section */}
      <Card className='border border-gray-100 shadow-sm bg-white rounded-[12px] overflow-hidden mt-2 relative'>
         <div className='absolute top-0 right-0 p-10 opacity-[0.03] text-navy-800'><Settings2 size={120} /></div>
         
         <div className='border-b border-gray-50 px-8 py-5 bg-gray-50/20 flex items-center gap-4'>
            <div className='w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-navy-800 shadow-sm'>
              <Edit3 size={16} />
            </div>
            <h3 className='text-[15px] font-black text-navy-800 uppercase tracking-tight'>
              {METHODS.find(m => m.id === settings.method)?.name} Konfiguratsiyasi
            </h3>
         </div>
         
         <CardContent className='p-8 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10'>
            {settings.thresholds.map((t, idx) => (
              <div key={idx} className='space-y-4 group'>
                <div className='flex justify-between items-center px-1'>
                   <label className='text-[11px] font-black uppercase tracking-widest text-gray-400 group-focus-within:text-pink-500 transition-colors'>
                    {t.label} 
                    <span className={cn(
                      'ml-2 px-1.5 py-0.5 rounded-md text-[8px]',
                      t.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                      t.type === 'primary' ? 'bg-blue-50 text-blue-600' :
                      t.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                      'bg-rose-50 text-rose-600'
                    )}>
                      {t.type.toUpperCase()}
                    </span>
                   </label>
                </div>
                <div className='relative'>
                  <Input 
                    value={t.range} 
                    onChange={(e) => updateThreshold(idx, 'range', e.target.value)}
                    className={cn(
                      'h-12 font-black border-gray-200 rounded-lg bg-gray-50/30 pl-12 focus:bg-white transition-all',
                      t.type === 'success' ? 'text-emerald-600 border-emerald-100 focus:border-emerald-500' :
                      t.type === 'primary' ? 'text-blue-600 border-blue-100 focus:border-blue-500' :
                      t.type === 'warning' ? 'text-amber-600 border-amber-100 focus:border-amber-500' :
                      'text-rose-600 border-rose-100 focus:border-rose-500'
                    )} 
                  />
                  <div className='absolute left-4 top-1/2 -translate-y-1/2 opacity-30'>
                    <Target size={18} />
                  </div>
                </div>
              </div>
            ))}

            <div className='sm:col-span-2 flex flex-col md:flex-row items-center justify-between gap-6 bg-amber-50/50 p-6 rounded-xl border border-amber-100/50 mt-2'>
               <div className='flex gap-4'>
                  <Info className='text-amber-500 shrink-0 mt-0.5' size={18} />
                  <div className='space-y-1'>
                     <p className='text-[11px] font-black text-amber-800 uppercase tracking-tight'>Eslatma</p>
                     <p className='text-[11px] font-bold text-amber-700 leading-relaxed opacity-80'>
                        Baholash chegaralari (thresholds) faqat vizual ko'rsatkichlar va akademik gradatsiya uchun ishlatiladi. 
                        Mavjud baholarni qayta hisoblamaydi.
                     </p>
                  </div>
               </div>
               <Button 
                onClick={handleSave}
                disabled={isSaving || loading}
                className='h-14 px-10 bg-pink-500 hover:bg-pink-600 text-white font-black rounded-xl shadow-lg shadow-pink-100 flex items-center gap-3 uppercase text-[12px] tracking-widest transition-all active:scale-95 min-w-[240px]'
              >
                {isSaving ? <TrendingUp className='animate-pulse' size={20} /> : <Settings2 size={20} />}
                {isSaving ? 'Saqlanmoqda...' : 'O\'zgarishlarni Saqlash'}
              </Button>
            </div>
         </CardContent>
      </Card>
    </div>
  )
}
