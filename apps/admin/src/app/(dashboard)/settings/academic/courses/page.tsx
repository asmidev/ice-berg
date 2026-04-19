'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, Plus, Search, Trash2, AlertCircle, CheckCircle2, TrendingUp, Users, LayoutGrid, 
  MoreHorizontal, Filter, Layers, Building2, Info
} from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useConfirm } from '@/hooks/use-confirm'
import { toast as toastSonner } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts'

const COLORS = ['#1E3A5F', '#EC4899', '#10b981', '#f43f5e', '#8b5cf6', '#f59e0b', '#06b6d4']

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-white/80 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-2xl flex flex-col gap-2 min-w-[150px]'>
        <p className='text-[10px] font-black text-gray-400 border-b border-gray-100 pb-2 uppercase tracking-widest'>{payload[0].name}</p>
        <div className='flex justify-between items-center gap-4'>
           <div className='flex items-center gap-2'>
              <div className='w-2 h-2 rounded-full' style={{ backgroundColor: payload[0].fill }} />
              <span className='text-[11px] font-bold text-gray-500'>AKTIV GURUXLAR:</span>
           </div>
           <span className='text-[13px] font-black text-navy-800'>{payload[0].value} ta</span>
        </div>
      </div>
    )
  }
  return null
}

export default function AcademicCoursesSettingsPage() {
	const confirm = useConfirm()
	const searchParams = useSearchParams()
	const [branchId, setBranchId] = useState('all')
	const [courses, setCourses] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState('')
	const [branch, setBranch] = useState<any>(null)

	// Toast & Modal State
	const [activeModal, setActiveModal] = useState<'CREATE' | 'EDIT' | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [formData, setFormData] = useState({ name: '', description: '' })
	const [toast, setToast] = useState({
		show: false,
		message: '',
		type: 'success' as 'success' | 'error',
	})

	const showToast = (
		message: string,
		type: 'success' | 'error' = 'success',
	) => {
		setToast({ show: true, message, type })
		setTimeout(
			() => setToast({ show: false, message: '', type: 'success' }),
			3000,
		)
	}

	// --- BRANCH SYNC ---
	useEffect(() => {
		const handleSyncBranch = () => {
			const bId =
				searchParams?.get('branch_id') ||
				localStorage.getItem('branch_id') ||
				'all'
			if (bId !== branchId) {
				setBranchId(bId)
			}
		}

		handleSyncBranch()
		window.addEventListener('storage', handleSyncBranch)
		const interval = setInterval(handleSyncBranch, 1000)

		return () => {
			window.removeEventListener('storage', handleSyncBranch)
			clearInterval(interval)
		}
	}, [searchParams, branchId])

	const fetchBranch = async () => {
		if (branchId === 'all') return
		try {
			const res = await api.get(`/branches/${branchId}`)
			setBranch(res.data?.data || res.data)
		} catch (err) {
			console.error(err)
		}
	}

	const fetchCourses = async () => {
		if (branchId === 'all') {
			setCourses([])
			setLoading(false)
			return
		}
		setLoading(true)
		try {
			const res = await api.get(`/lms/courses?branch_id=${branchId}`)
			const data = res.data?.data || res.data || []
			setCourses(Array.isArray(data) ? data : [])
		} catch (err) {
			showToast("Yo'nalishlarni yuklashda xatolik", 'error')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchBranch()
		fetchCourses()
	}, [branchId])

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault()
		if (branchId === 'all')
			return showToast('Iltimos, filialni tanlang', 'error')
		setIsSubmitting(true)
		try {
			await api.post('/lms/courses', {
				...formData,
				branch_id: branchId,
			})
			showToast("Yo'nalish muvaffaqiyatli qo'shildi!")
			setActiveModal(null)
			setFormData({ name: '', description: '' })
			fetchCourses()
		} catch (err: any) {
			showToast(err.response?.data?.message || 'Xatolik yuz berdi', 'error')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleDelete = async (id: string) => {
		const isConfirmed = await confirm({
			title: "Yo'nalishni o'chirish",
			message: "Ushbu yo'nalishni o'chirmoqchimisiz?",
			type: "danger"
		})
		if (!isConfirmed) return
		try {
			await api.delete(`/lms/courses/${id}`)
			showToast("Yo'nalish o'chirildi")
			fetchCourses()
		} catch (err) {
			showToast('Xatolik yuz berdi', 'error')
		}
	}

	const filteredCourses = useMemo(() => {
		return courses.filter(c =>
			c.name.toLowerCase().includes(search.toLowerCase()),
		)
	}, [courses, search])

	const stats = useMemo(() => {
		const totalCourses = courses.length
		const totalGroups = courses.reduce(
			(acc, c) => acc + (c._count?.groups || 0),
			0,
		)
    const totalStudents = courses.reduce(
      (acc, c) => acc + (c.groups?.reduce((sum: number, g: any) => sum + (g._count?.enrollments || 0), 0) || 0),
      0
    )
    const chartData = courses
      .map(c => ({
        name: c.name,
        value: c._count?.groups || 0
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 7)

		return { totalCourses, totalGroups, totalStudents, chartData }
	}, [courses])

	if (branchId === 'all') {
		return (
			<div className='flex flex-col items-center justify-center min-h-[400px] space-y-6 bg-white rounded-xl border border-dashed border-gray-200 animate-in fade-in duration-500'>
				<div className='w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300'>
					<LayoutGrid size={32} />
				</div>
				<div className='text-center space-y-1'>
					<h3 className='text-lg font-black text-navy-800'>
						Filial Tanlanmagan
					</h3>
					<p className='text-gray-500 text-[13px] max-w-[280px] font-medium leading-relaxed'>
						O'quv yo'nalishlarini boshqarish uchun yuqoridagi menyudan filialni
						tanlang.
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
					<div
						className={cn(
							'flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border min-w-[300px]',
							toast.type === 'success'
								? 'bg-white border-emerald-100 text-emerald-600'
								: 'bg-white border-rose-100 text-rose-600',
						)}
					>
						{toast.type === 'success' ? (
							<CheckCircle2 size={24} className='text-emerald-500' />
						) : (
							<AlertCircle size={24} className='text-rose-500' />
						)}
						<span className='font-bold text-[13px]'>{toast.message}</span>
					</div>
				</div>
			)}

			{/* 🚀 Top Summary Cards & 3D Chart Row */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Statistics Column */}
        <div className='flex flex-col gap-6'>
          <div className='bg-white p-6 rounded-[12px] shadow-sm border border-gray-100 flex items-center gap-5 group transition-all hover:bg-navy-50/30 flex-1 min-h-[120px]'>
            <div className='w-12 h-12 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center group-hover:bg-navy-800 group-hover:text-white transition-all shadow-sm'>
              <Layers size={24} />
            </div>
            <div>
              <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1'>
                Jami Yo'nalishlar
              </p>
              <h2 className='text-2xl font-black text-navy-800 leading-none'>
                {stats.totalCourses} ta
              </h2>
            </div>
          </div>

          <div className='bg-white p-6 rounded-[12px] shadow-sm border border-gray-100 flex items-center gap-5 group transition-all hover:bg-pink-50/30 flex-1 min-h-[120px]'>
            <div className='w-12 h-12 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-all shadow-sm shadow-pink-100'>
              <Users size={24} />
            </div>
            <div>
              <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1'>
                Aktiv Guruhlar
              </p>
              <h2 className='text-2xl font-black text-navy-800 leading-none'>
                {stats.totalGroups} ta
              </h2>
            </div>
          </div>
        </div>

        {/* 3D Circle Chart Card */}
				<div className='lg:col-span-2 bg-white p-6 rounded-[12px] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden h-full min-h-[280px]'>
					<div className='absolute top-6 left-8 z-10'>
						<p className='text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1'>Yo'nalishlar Taqsimoti</p>
						<h4 className='text-[14px] font-black text-navy-800 uppercase tracking-tight'>Aktiv guruhlar nisbati</h4>
					</div>

          <div className='w-full md:w-[240px] h-[210px] mt-6 relative shrink-0'>
             <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <defs>
                     {COLORS.map((color, i) => (
                        <linearGradient key={`grad-${i}`} id={`grad-${i}`} x1='0%' y1='0%' x2='0%' y2='100%'>
                           <stop offset='0%' stopColor={color} stopOpacity={1} />
                           <stop offset='100%' stopColor={color} stopOpacity={0.7} />
                        </linearGradient>
                     ))}
                     <filter id='shadow' x='-20%' y='-20%' width='140%' height='140%'>
                        <feGaussianBlur in='SourceAlpha' stdDeviation='3' />
                        <feOffset dx='4' dy='6' result='offsetblur' />
                        <feComponentTransfer><feFuncA type='linear' slope='0.3' /></feComponentTransfer>
                        <feMerge><feMergeNode /><feMergeNode in='SourceGraphic' /></feMerge>
                     </filter>
                  </defs>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={stats.chartData}
                    cx='50%'
                    cy='50%'
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={6}
                    dataKey='value'
                    animationDuration={1500}
                    stroke='none'
                    filter='url(#shadow)'
                  >
                    {stats.chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#grad-${index % COLORS.length})`} />
                    ))}
                  </Pie>
                </PieChart>
             </ResponsiveContainer>
             <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2'>
                <div className='bg-navy-50/50 p-2 rounded-full mb-1'>
                   <TrendingUp size={18} className='text-navy-800 opacity-60' />
                </div>
                <h3 className='text-3xl font-black text-navy-800 leading-none'>{stats.totalGroups}</h3>
                <p className='text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1'>Guruhlar</p>
             </div>
          </div>

          <div className='flex-1 flex flex-col gap-4 w-full pr-4'>
             {stats.chartData.map((item, i) => {
               const percentage = stats.totalGroups > 0 ? Math.round((item.value / stats.totalGroups) * 100) : 0
               return (
                  <div key={i} className='group cursor-default'>
                     <div className='flex justify-between items-end mb-1.5'>
                        <div className='flex items-center gap-2.5'>
                           <div className='w-2 h-2 rounded-full ring-4 ring-gray-50' style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                           <span className='text-[11px] font-black text-navy-800/70 uppercase tracking-tight group-hover:text-navy-800 transition-colors'>{item.name}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                           <span className='text-[10px] font-black text-gray-300'>{percentage}%</span>
                           <span className='text-[12px] font-black text-navy-800'>{item.value} <span className='text-[10px] text-gray-400'>gr</span></span>
                        </div>
                     </div>
                     <div className='w-full h-1.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100/50'>
                        <div 
                           className='h-full rounded-full transition-all duration-1000 ease-out' 
                           style={{ 
                              width: `${percentage}%`,
                              backgroundColor: COLORS[i % COLORS.length],
                              opacity: 0.8
                           }} 
                        />
                     </div>
                  </div>
               )
             })}
             {stats.chartData.length === 0 && (
               <div className='flex flex-col items-center justify-center h-full opacity-20 gap-3'>
                  <Layers size={40} className='text-gray-300' />
                  <span className='text-[10px] font-black uppercase tracking-widest'>Ma'lumotlar mavjud emas</span>
               </div>
             )}
          </div>
				</div>
			</div>

			{/* 🧭 Table & Actions Section */}
			<div className='bg-white rounded-[12px] shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]'>
				{/* Toolbar */}
				<div className='p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-center gap-6'>
					<div className='flex items-center gap-4 w-full sm:w-auto'>
						<div className='bg-navy-800 p-2.5 rounded-xl text-white shadow-lg shadow-navy-100'>
							<Building2 size={20} />
						</div>
						<div>
							<h2 className='text-lg font-black text-navy-800'>
								{branch?.name || "Yo'nalishlar"}
							</h2>
							<p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
								Akademik o'quv yo'nalishlari
							</p>
						</div>
					</div>

					<div className='flex items-center gap-3 w-full sm:w-auto'>
						<div className='relative group flex-1 sm:w-64'>
							<Search
								className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors'
								size={16}
							/>
							<input
								type='text'
								value={search}
								onChange={e => setSearch(e.target.value)}
								placeholder='Qidiruv...'
								className='w-full h-10 bg-white border border-gray-200 rounded-lg pl-10 pr-4 text-sm font-bold focus:border-pink-200 focus:ring-4 focus:ring-pink-50 transition-all outline-none'
							/>
						</div>
						<Button
							onClick={() => setActiveModal('CREATE')}
							className='h-10 px-6 bg-pink-500 hover:bg-pink-600 text-white font-black rounded-lg shadow-lg shadow-pink-100 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap text-[11px] uppercase tracking-widest'
						>
							<Plus size={18} />
							Yo'nalish
						</Button>
					</div>
				</div>

				{/* Table Area */}
				<div className='overflow-x-auto w-full'>
					<Table className='w-full'>
						<TableHeader>
							<TableRow className='hover:bg-transparent border-b border-gray-50'>
								<TableHead className='py-6 pl-10 text-[11px] font-black text-gray-400 uppercase tracking-widest'>
									Yo'nalish Nomi
								</TableHead>
								<TableHead className='py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center'>
									Tavsif
								</TableHead>
								<TableHead className='py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center'>
									Guruhlar / O'quvchilar
								</TableHead>
								<TableHead className='py-6 pr-10 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest'>
									Amallar
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								[1, 2, 3, 4, 5].map(i => (
									<TableRow key={i}>
										<TableCell colSpan={4} className='p-8'>
											<div className='h-14 bg-gray-50 animate-pulse rounded-lg w-full' />
										</TableCell>
									</TableRow>
								))
							) : filteredCourses.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} className='p-20'>
										<div className='flex flex-col items-center justify-center gap-4 text-center opacity-40'>
											<BookOpen size={64} className='text-gray-300' />
											<p className='font-black text-gray-400 uppercase tracking-widest text-sm italic'>
												Hozircha yo'nalishlar mavjud emas
											</p>
										</div>
									</TableCell>
								</TableRow>
							) : (
								filteredCourses.map(course => {
                  const studentCount = course.groups?.reduce((sum: number, g: any) => sum + (g._count?.enrollments || 0), 0) || 0
                  return (
									<TableRow
										key={course.id}
										className='group hover:bg-navy-50/20 transition-all border-b border-gray-50/50 last:border-0 relative'
									>
										<TableCell className='pl-10 py-6'>
											<div className='flex items-center gap-4'>
												<div className='w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform'>
													<BookOpen size={20} className='text-navy-800' />
												</div>
												<div>
													<h4 className='font-black text-navy-800 text-[15px]'>
														{course.name}
													</h4>
													<div className='flex items-center gap-2 mt-0.5'>
														<Badge
															variant='outline'
															className='text-[9px] font-black border-navy-100 text-navy-500 bg-navy-50/30'
														>
															ID: {course.id.split('-')[0]}
														</Badge>
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell className='text-center py-6'>
											<p className='text-sm font-semibold text-gray-500 max-w-[200px] truncate mx-auto italic'>
												{course.description || "Tavsif yo'q"}
											</p>
										</TableCell>
										<TableCell className='text-center py-6'>
											<div className='flex items-center justify-center gap-3'>
                        <div
                          className={cn(
                            'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-[11px] transition-all',
                            (course._count?.groups || 0) > 0
                              ? 'bg-navy-50 text-navy-800 border border-navy-100'
                              : 'bg-gray-50 text-gray-400 border border-gray-100',
                          )}
                        >
                          <Users size={12} />
                          {course._count?.groups || 0} gr
                        </div>
                        <div
                          className={cn(
                            'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-[11px] transition-all',
                            studentCount > 0
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-gray-50 text-gray-400 border border-gray-100',
                          )}
                        >
                          <TrendingUp size={12} />
                          {studentCount} st
                        </div>
                      </div>
										</TableCell>
										<TableCell className='text-right pr-10 py-6'>
											<div className='flex justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300'>
												<Button
													variant='ghost'
													className='h-10 w-10 p-0 text-gray-400 hover:text-navy-800 hover:bg-navy-100/50 rounded-lg'
												>
													<Filter size={18} />
												</Button>
												<Button
													variant='ghost'
													onClick={() => handleDelete(course.id)}
													className='h-10 w-10 p-0 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg'
												>
													<Trash2 size={18} />
												</Button>
												<Button
													variant='ghost'
													className='h-10 w-10 p-0 text-gray-400 hover:text-navy-800 rounded-lg'
												>
													<MoreHorizontal size={18} />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								)})
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			<Dialog
				open={activeModal === 'CREATE'}
				onOpenChange={o => !o && setActiveModal(null)}
			>
				<DialogContent className='sm:max-w-[480px] p-0 border-none rounded-2xl shadow-2xl bg-white overflow-hidden'>
					<form onSubmit={handleCreate}>
						<div className='p-10 space-y-8'>
							<div className='flex items-center gap-4 border-b border-gray-50 pb-6'>
								<div className='w-12 h-12 rounded-xl bg-navy-800 text-white flex items-center justify-center shadow-lg shadow-navy-200'>
									<Plus size={24} />
								</div>
								<div>
									<h3 className='text-xl font-black text-navy-800'>
										Yangi Yo'nalish
									</h3>
									<p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
										Akademik o'quv yo'nalishi
									</p>
								</div>
							</div>

							<div className='space-y-6'>
								<div className='space-y-2'>
									<Label className='text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1'>
										Yo'nalish Nomi *
									</Label>
									<Input
										required
										value={formData.name}
										onChange={e =>
											setFormData({ ...formData, name: e.target.value })
										}
										placeholder='Masalan: General English'
										className='h-11 bg-gray-50 border-gray-100 font-bold text-sm focus:ring-1 focus:ring-navy-50 rounded-lg'
									/>
								</div>

								<div className='space-y-2'>
									<Label className='text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1'>
										Qisqacha Tavsif
									</Label>
									<Input
										value={formData.description}
										onChange={e =>
											setFormData({ ...formData, description: e.target.value })
										}
										placeholder="Yo'nalish haqida ma'lumot..."
										className='h-11 bg-gray-50 border-gray-100 font-semibold text-sm focus:ring-1 focus:ring-navy-50 rounded-lg'
									/>
								</div>
							</div>

							<div className='pt-4 flex gap-3'>
								<Button
									type='button'
									variant='ghost'
									onClick={() => setActiveModal(null)}
									className='flex-1 h-11 rounded-lg font-bold text-gray-500 hover:bg-gray-100 text-[11px] uppercase tracking-widest'
								>
									Bekor Qilish
								</Button>
								<Button
									disabled={isSubmitting}
									type='submit'
									className='flex-[2] h-11 rounded-lg bg-navy-800 hover:bg-navy-900 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-navy-100 transition-all active:scale-95'
								>
									{isSubmitting ? 'Saqlanmoqda...' : 'Yaratish'}
								</Button>
							</div>
						</div>
					</form>
					<div className='bg-amber-50 p-6 flex gap-4'>
						<Info size={18} className='text-amber-500 shrink-0' />
						<p className='text-[10px] font-bold text-amber-700 leading-relaxed'>
							Ushbu yo'nalish faqat <b>{branch?.name}</b> filiali uchun
							yaratiladi.
						</p>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
