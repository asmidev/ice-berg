'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { 
  Calendar as CalendarIcon, Loader2, CheckCircle2, 
  XCircle, AlertCircle, Clock, ChevronDown 
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AttendanceMarkingModalProps {
	isOpen: boolean
	onClose: () => void
	group: any
	onSuccess: () => void
}

const STATUSES = [
  { value: 'PRESENT', label: 'Keldi', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { value: 'ABSENT', label: 'Kelmadi', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  { value: 'LATE', label: 'Kechikdi', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
];

const UZ_MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
const UZ_DAYS = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

function formatUzLongDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayName = UZ_DAYS[date.getDay()];
  const monthName = UZ_MONTHS[date.getMonth()];
  return `${d}-${monthName}, ${dayName}`;
}

function formatDateUz(date: Date) {
	const y = date.getFullYear()
	const m = String(date.getMonth() + 1).padStart(2, '0')
	const d = String(date.getDate()).padStart(2, '0')
	return `${y}-${m}-${d}`
}

export function AttendanceMarkingModal({
	isOpen,
	onClose,
	group,
	onSuccess,
}: AttendanceMarkingModalProps) {
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [date, setDate] = useState(formatDateUz(new Date()))
	const [students, setStudents] = useState<any[]>([])
	const [gradingSystem, setGradingSystem] = useState<any>(null)

	const lessonDays = useMemo(() => {
		if (!group?.start_date || !group?.schedules) return []
		const days: string[] = []
		const start = new Date(group.start_date)
		const end = group.end_date ? new Date(group.end_date) : new Date(new Date().setMonth(new Date().getMonth() + 6))
		
		const scheduledDayIndexes = group.schedules.map((s: any) => s.day_of_week)

		let curr = new Date(start)
		while (curr <= end) {
			if (scheduledDayIndexes.includes(curr.getDay())) {
				days.push(formatDateUz(curr))
			}
			curr.setDate(curr.getDate() + 1)
		}
		return days
	}, [group])

	// Agar dars kuni bo'lsa bugunni, bo'lmasa eng so'nggi dars kunini tanlash
	useEffect(() => {
		if (isOpen && lessonDays.length > 0 && !lessonDays.includes(date)) {
			const today = formatDateUz(new Date())
			if (lessonDays.includes(today)) {
				setDate(today)
			} else {
				// Eng yaqin o'tgan dars kunini topish
				const pastDays = lessonDays.filter(d => d <= today)
				if (pastDays.length > 0) {
					setDate(pastDays[pastDays.length - 1])
				} else {
					setDate(lessonDays[0])
				}
			}
		}
	}, [isOpen, lessonDays])

	useEffect(() => {
		if (isOpen && group?.branch_id) {
			fetchGradingSettings()
		}
	}, [isOpen, group])

	useEffect(() => {
		if (isOpen && group) {
			fetchAttendanceDetails()
		}
	}, [isOpen, group, date])

	const fetchGradingSettings = async () => {
		try {
			const res = await api.get(
				`/lms/grading-settings?branch_id=${group.branch_id}`,
			)
			setGradingSystem(res.data.data?.settings || { method: '10-ball' })
		} catch (e) {
			console.error('Grading settings fetch error:', e)
		}
	}

	const fetchAttendanceDetails = async () => {
		setLoading(true)
		try {
			const res = await api.get(`/attendance/group-details`, {
				params: { groupId: group.id, date },
			})
			// Har bir studentga mavjud bo'lsa bahosini qo'shish
			setStudents(
				res.data.data?.students?.map((s: any) => ({
					...s,
					score: s.score || null,
				})) || [],
			)
		} catch (e) {
			console.error(e)
		} finally {
			setLoading(false)
		}
	}

	const handleStatusChange = (enrollmentId: string, status: string) => {
		setStudents(prev =>
			prev.map(s => (s.enrollmentId === enrollmentId ? { ...s, status } : s)),
		)
	}

	const handleScoreChange = (enrollmentId: string, score: number) => {
		setStudents(prev =>
			prev.map(s => (s.enrollmentId === enrollmentId ? { ...s, score } : s)),
		)
	}

	const handleMarkAll = (status: string) => {
		setStudents(prev => prev.map(s => ({ ...s, status })))
	}

	const handleSave = async () => {
		// Dars jadvalini tekshirish
		// Use a date object that correctly represents the local day
		const [y, m, d] = date.split('-').map(Number)
		const selectedDay = new Date(y, m - 1, d).getDay()
		const scheduledDays = group.schedules?.map((s: any) => s.day_of_week) || []
		if (scheduledDays.length > 0 && !scheduledDays.includes(selectedDay)) {
			toast.error('Ushbu kunda guruhning darsi mavjud emas!')
			return
		}

		// Hammani baholanganini tekshirish
		const unrated = students.filter(
			s => s.status !== 'ABSENT' && s.score === null,
		)
		if (unrated.length > 0) {
			toast.error(
				`Iltimos, barcha o'quvchilarga baxo qo'ying (${unrated.length} ta o'quvchi baholanmagan)`,
			)
			return
		}

		setSubmitting(true)
		try {
			const records = students.map(s => ({
				enrollmentId: s.enrollmentId,
				status: s.status === 'NOT_MARKED' ? 'PRESENT' : s.status, // Agar belgilanmagan bo'lsa ham keldi deb hisoblanadi (bahosi borligi uchun)
				score: s.score ? parseInt(s.score.toString()) : null,
			}))

			await api.post('/attendance/mark', {
				groupId: group.id,
				date,
				records,
			})
			onSuccess()
			onClose()
		} catch (e: any) {
			toast.error(e.response?.data?.message || 'Davomatni saqlashda xatolik')
		} finally {
			setSubmitting(false)
		}
	}

	const getScoreRange = () => {
		if (gradingSystem?.method === '5-ball') return [2, 3, 4, 5]
		if (gradingSystem?.method === '10-ball')
			return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
		return Array.from({ length: 20 }, (_, i) => (i + 1) * 5) // 100-ballik uchun 5 lik qadam bilan 20 ta
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-6xl p-0 overflow-hidden rounded-[40px] border-none shadow-2xl flex flex-col h-[85vh]'>
				<DialogHeader className='p-10 bg-zinc-900 text-white relative overflow-hidden shrink-0'>
					<div className='absolute right-0 top-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
					<DialogTitle className='text-2xl font-black tracking-tight flex items-center gap-3'>
						<CalendarIcon className='w-6 h-6 text-emerald-400' />
						Baholar va Davomat
					</DialogTitle>
					<p className='text-zinc-400 text-sm mt-2 font-medium'>
						{group?.name} • {formatUzLongDate(date)}
					</p>
				</DialogHeader>

				<div className='p-10 space-y-8 flex-1 overflow-y-auto custom-scrollbar bg-white'>
					<div className='flex items-center justify-between gap-6 bg-zinc-50 p-6 rounded-[24px] border border-zinc-100 mb-2'>
						<div className='flex-1 space-y-2'>
							<Label className='text-[11px] font-black uppercase text-zinc-400 tracking-wider pl-1'>
								Dars Sanasini Tanlang
							</Label>
							<Select value={date} onValueChange={setDate}>
								<SelectTrigger className="w-full h-14 rounded-2xl border-zinc-200 bg-white font-bold text-zinc-900 shadow-sm hover:border-emerald-200 transition-all">
									<SelectValue>{formatUzLongDate(date)}</SelectValue>
								</SelectTrigger>
								<SelectContent className="rounded-2xl border-zinc-100 shadow-xl max-h-[300px]">
									{lessonDays.map((d: string) => (
										<SelectItem 
											key={d} 
											value={d}
											className="rounded-xl my-1 font-medium focus:bg-emerald-50 focus:text-emerald-700"
										>
											{formatUzLongDate(d)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className='flex gap-2'>
							<Button
								variant='outline'
								size='sm'
								onClick={() => handleMarkAll('PRESENT')}
								className='rounded-xl border-zinc-200 text-[11px] font-bold text-emerald-600 hover:bg-emerald-50'
							>
								Hammani Keldi qilish
							</Button>
						</div>
					</div>

					{loading ? (
						<div className='flex flex-col items-center justify-center py-20 gap-4'>
							<Loader2 className='w-8 h-8 animate-spin text-emerald-500' />
							<p className='text-zinc-400 font-bold text-sm tracking-widest uppercase'>
								Yuklanmoqda...
							</p>
						</div>
					) : (
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4'>
							{students.map(student => (
								<div
									key={student.enrollmentId}
									className='flex flex-col p-6 rounded-3xl border border-zinc-100 hover:border-emerald-100 hover:bg-emerald-50/10 transition-all group gap-5'
								>
									<div className='flex items-center justify-between'>
										<div className='flex items-center gap-6'>
											<div className='w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-600 font-black text-xl group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm'>
												{student.name.charAt(0)}
											</div>
											<div className='flex flex-col'>
												<span className='font-black text-zinc-900 uppercase tracking-tight text-base'>
													{student.name}
												</span>
												<span className='text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5'>
													O'quvchi
												</span>
											</div>
										</div>

										<div className='flex items-center gap-1.5 bg-zinc-50 p-1 rounded-2xl border border-zinc-100 shadow-inner'>
											{STATUSES.map(status => (
												<button
													key={status.value}
													onClick={() =>
														handleStatusChange(
															student.enrollmentId,
															status.value,
														)
													}
													title={status.label}
													className={cn(
														'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
														student.status === status.value
															? `${status.bg} ${status.color} shadow-sm border ${status.border}`
															: 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600',
													)}
												>
													<status.icon className='w-5 h-5' />
												</button>
											))}
										</div>
									</div>

									<div className='space-y-3'>
										<div className='flex items-center justify-between px-1'>
											<Label className='text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2'>
												Darsdagi Faollik Bahosi
												{student.score && (
													<Badge className='bg-emerald-500 text-white border-0 text-[9px] font-black px-1.5 h-4 ml-1'>
														BELGILANDI
													</Badge>
												)}
											</Label>
											<span className='text-[10px] font-black text-zinc-900'>
												{student.score || 0} ball
											</span>
										</div>

										<div className='flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide py-1'>
											{getScoreRange().map(scoreValue => (
												<button
													key={scoreValue}
													onClick={() =>
														handleScoreChange(student.enrollmentId, scoreValue)
													}
													className={cn(
														'min-w-[42px] h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all border shrink-0',
														student.score === scoreValue
															? 'bg-zinc-900 text-white border-zinc-900 shadow-lg shadow-zinc-200 scale-110 z-10'
															: 'bg-white text-zinc-500 border-zinc-100 hover:border-zinc-300 hover:text-zinc-900',
													)}
												>
													{scoreValue}
												</button>
											))}
										</div>
									</div>
								</div>
							))}
							{students.length === 0 && (
								<div className='text-center py-10 text-zinc-400 font-medium bg-zinc-50 rounded-2xl border border-dashed border-zinc-200'>
									Ushbu guruhda faol o'quvchilar yo'q.
								</div>
							)}
						</div>
					)}
				</div>

				<DialogFooter className='p-8 bg-zinc-50 border-t border-zinc-100'>
					<Button
						variant='ghost'
						onClick={onClose}
						disabled={submitting}
						className='rounded-2xl font-bold text-zinc-500'
					>
						Bekor qilish
					</Button>
					<Button
						onClick={handleSave}
						disabled={submitting || loading || students.length === 0}
						className='rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black px-10 shadow-xl shadow-zinc-200'
					>
						{submitting && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
						Saqlash
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
