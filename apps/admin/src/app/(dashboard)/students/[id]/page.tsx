'use client'

import api from '@/lib/api'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import {
	AcademicPerformanceVIP,
	HomeworksVIP,
	GroupRankingVIP,
	TeacherFeedbacksVIP,
	StudentPaymentHistoryVIP,
	StudentDiscountsVIP,
	StudentPurchasesVIP,
	StudentMiniCalendarVIP,
	StudentProfileCardVIP,
} from './components/StudentDetailsVIP'

export default function StudentDetailPage() {
	const { id } = useParams()
	const searchParams = useSearchParams()
	const branchId = searchParams.get('branch_id') || 'all'

	const [student, setStudent] = useState<any>(null)
	const [loading, setLoading] = useState(true)

	const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
	const [newPassword, setNewPassword] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

	const showToast = (message: string, type: 'success' | 'error' = 'success') => {
		setToast({ show: true, message, type })
		setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000)
	}

	const fetchStudent = async () => {
		try {
			const res = await api.get(`/students/${id}?branch_id=${branchId}`)
			setStudent(res.data?.data || res.data)
		} catch (err) {
			console.error(err)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchStudent()
	}, [id, branchId])

	const handlePasswordUpdate = async (e?: React.FormEvent) => {
		e?.preventDefault()
		if (!newPassword) return
		setIsSubmitting(true)
		try {
			await api.put(`/students/${id}/password`, { password: newPassword })
			showToast("Parol muvaffaqiyatli yangilandi", "success")
			setIsPasswordModalOpen(false)
			setNewPassword('')
		} catch (err) {
			showToast("Xatolik yuz berdi", "error")
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleResetPasswordClick = () => {
		setIsPasswordModalOpen(true)
	}

	if (loading)
		return (
			<div className='flex items-center justify-center min-h-[60vh]'>
				<div className='w-16 h-16 border-4 border-cyan-100 border-t-pink-500 rounded-full animate-spin' />
			</div>
		)

	if (!student)
		return (
			<div className='p-20 text-center font-black uppercase text-zinc-400 tracking-widest'>
				O'quvchi topilmadi
			</div>
		)

	return (
		<div className='flex flex-col pb-10 w-full mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 relative'>
			{/* Custom Toast overlay */}
			{toast.show && (
				<div className={`fixed top-6 right-6 z-[200] max-w-sm flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl animate-in slide-in-from-right-8 duration-300 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
					{toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
					<p className="text-[14px] font-medium leading-tight">{toast.message}</p>
					<button onClick={() => setToast(prev => ({...prev, show: false}))} className="ml-auto hover:bg-white/20 p-1 rounded-full transition-colors"><X className="w-4 h-4" /></button>
				</div>
			)}

			{/* Password Reset Modal Overlay */}
			{isPasswordModalOpen && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsPasswordModalOpen(false)} />
					<div className="relative w-full max-w-md bg-white rounded-[16px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
						<div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 flex justify-between items-center text-white">
							<h3 className="font-bold text-[16px]">Parolni Yangilash</h3>
							<button onClick={() => setIsPasswordModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-xl font-bold">×</button>
						</div>
						<form onSubmit={handlePasswordUpdate} className="p-6 space-y-5">
							{/* Cyber Alert Box */}
							<div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
								<AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
								<div className="space-y-1">
									<h4 className="text-[13px] font-bold text-amber-800 tracking-tight">Kiberxavfsizlik Qoidalari</h4>
									<p className="text-[12px] font-medium text-amber-700 leading-snug">
										O'quvchining parolini hech kim ochiq ko'rishi mumkin emas (shifrlangan). Ammo siz uni pastdagi maydon orqali osongina yangisiga almashtirishingiz mumkin.
									</p>
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-[13px] font-semibold text-zinc-700">Yangi Parol:</label>
								<input 
									type="password" 
									required
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									className="w-full h-12 px-4 border border-zinc-300 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 font-mono text-[16px] tracking-widest transition-all"
									placeholder="123456"
								/>
							</div>
							
							<div className="pt-2">
								<button type="submit" disabled={isSubmitting} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-[0_8px_20px_rgba(79,70,229,0.25)] transition-all active:scale-[0.98] disabled:opacity-50">
									{isSubmitting ? 'Saqlanmoqda...' : 'Parolni Yangilash'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* 🏷️ PAGE HEADER & BREADCRUMB is handled by layout.tsx, skipping here */}

			<div className='grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pt-6'>
				{/* 💳 LEFT COLUMN 3/12 - Payments & Purchases */}
				<div className='lg:col-span-3 space-y-4 animate-in slide-in-from-left-10 duration-500'>
					<StudentProfileCardVIP student={student} onResetPassword={handleResetPasswordClick} />
					<StudentPaymentHistoryVIP student={student} />
					<StudentPurchasesVIP student={student} />
				</div>

				{/* 📅 MIDDLE COLUMN 4/12 - Attendance, Discounts, Feedbacks */}
				<div className='lg:col-span-4 space-y-4 animate-in slide-in-from-bottom-10 duration-500 delay-150'>
					<StudentMiniCalendarVIP student={student} />
					<StudentDiscountsVIP student={student} />
					<TeacherFeedbacksVIP student={student} />
				</div>

				{/* 📈 RIGHT COLUMN 5/12 - Analytics, Ranking, Homeworks */}
				<div className='lg:col-span-5 space-y-4 animate-in slide-in-from-right-10 duration-700'>
					<AcademicPerformanceVIP student={student} />
					<GroupRankingVIP student={student} />
					<HomeworksVIP student={student} />
				</div>
			</div>
		</div>
	)
}
