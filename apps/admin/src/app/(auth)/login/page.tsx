'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
	const [phone, setPhone] = useState('+998')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const router = useRouter()

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		try {
			const res = await fetch('http://127.0.0.1:3001/api/v1/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ phone, password }),
			})

			const data = await res.json()

			if (!res.ok) {
				throw new Error(data?.message || "Login yoki parol noto'g'ri")
			}

			const token = data.data ? data.data.accessToken : data.accessToken
			if (token) {
				localStorage.setItem('accessToken', token)
				localStorage.setItem('token', token)
				localStorage.setItem('user', JSON.stringify(data.data?.user || {}))

				const expires = new Date()
				expires.setDate(expires.getDate() + 7)
				document.cookie = `token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`

				router.push('/dashboard')
			} else {
				throw new Error('Serverdan token olinmadi')
			}
		} catch (err: any) {
			setError(err.message || 'Xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='min-h-screen bg-slate-950 flex flex-col font-sans overflow-hidden selection:bg-blue-500/30'>
			{/* Navbar */}
			<nav className='h-20 px-6 md:px-12 border-b border-slate-900 flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-xl z-50'>
				<div className='flex items-center gap-4'>
					<img src='/Group 322.png' alt='ICE Logo' className='h-8 w-auto' />
				</div>

				<div className='flex items-center gap-4'>
					<div className='px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/10 text-[10px] font-black text-blue-400 uppercase tracking-widest'>
						v3.0 Stable
					</div>
					<div className='hidden sm:block w-[1px] h-4 bg-slate-800 mx-2' />
					<div className='hidden sm:flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]'>
						Protocol: <span className='text-emerald-500/80'>Secure SSL</span>
					</div>
				</div>
			</nav>

			{/* Main Content */}
			<main className='flex-1 flex flex-col md:flex-row relative'>
				{/* Left Section - Illustration */}
				<div className='hidden md:flex flex-1 items-center justify-center bg-slate-950 p-12 lg:p-24 relative overflow-hidden'>
					{/* Subtle background decoration */}
					<div className='absolute top-0 left-0 w-full h-full opacity-25 pointer-events-none'>
						<div className='absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[120px]' />
						<div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[100px]' />
					</div>

					<div className='max-w-xl w-full relative z-10 transition-transform duration-700'>
						<img
							src='/Frame 341.png'
							alt='Mountain Illustration'
							className='w-full h-auto drop-shadow-[0_20px_50px_rgba(37,99,235,0.15)] animate-float'
						/>
					</div>

					{/* Vertical Divider */}
					<div className='absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-[60%] bg-gradient-to-b from-transparent via-slate-800 to-transparent z-20' />
				</div>

				{/* Right Section - Form */}
				<div className='flex-1 flex flex-col items-center justify-center p-8 lg:p-24 bg-slate-950 relative'>
					<div className='w-full max-w-[420px]'>
						<div className='mb-12'>
							<div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6'>
								Xavfsiz Kirish
							</div>
							<h1 className='text-4xl font-black text-white tracking-tight mb-3'>
								Kirish
							</h1>
							<p className='text-slate-400 font-medium'>
								Boshqaruv paneliga xush kelibsiz
							</p>
						</div>

						<form onSubmit={handleLogin} className='space-y-6'>
							{error && (
								<div className='p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2'>
									<div className='w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse' />
									{error}
								</div>
							)}

							<div className='space-y-3'>
								<Label className='text-[11px] font-black text-slate-500 uppercase tracking-widest  ml-1'>
									TELEFON RAQAM
								</Label>
								<Input
									type='text'
									placeholder='+998 90 123 45 67'
									value={phone}
									onChange={e => {
										const val = e.target.value
										if (val.startsWith('+998')) {
											setPhone(val)
										}
									}}
									className='h-14 px-5 rounded-2xl border-slate-800 bg-slate-900 focus:bg-slate-900/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold placeholder:text-slate-600 shadow-sm'
								/>
							</div>

							<div className='space-y-3'>
								<Label className='text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1'>
									MAXFIY KALIT
								</Label>
								<Input
									type='password'
									placeholder='Parol'
									value={password}
									onChange={e => setPassword(e.target.value)}
									className='h-14 px-5 rounded-2xl border-slate-800 bg-slate-900 focus:bg-slate-900/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold placeholder:text-slate-600 shadow-sm'
								/>
							</div>

							<div className='flex items-center justify-between text-[13px] pt-2'>
								<div className='flex items-center gap-2 text-slate-500 font-medium group cursor-pointer'>
									<input
										type='checkbox'
										id='stay-signed-in'
										className='w-4 h-4 rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all'
									/>
									<label
										htmlFor='stay-signed-in'
										className='cursor-pointer select-none group-hover:text-slate-300 transition-colors'
									>
										Kirishni saqlash
									</label>
								</div>
								<Link
									href='/forgot-password'
									virtual-dom-link='forgot-password'
									className='text-blue-400 font-bold hover:text-blue-300 transition-all underline decoration-blue-500/20 underline-offset-4'
								>
									Parolni unutdingizmi?
								</Link>
							</div>

							<Button
								type='submit'
								disabled={loading}
								className='w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-900/20 group transition-all'
							>
								{loading ? (
									<Loader2 className='w-5 h-5 animate-spin' />
								) : (
									<span className='flex items-center gap-2'>
										Tizimga Kirish{' '}
										<ArrowRight className='h-5 w-5 group-hover:translate-x-1 transition-transform' />
									</span>
								)}
							</Button>
						</form>

						<div className='mt-16 pt-12 border-t border-slate-900 text-center text-[12px] text-slate-500 leading-relaxed font-medium'>
							Kirish orqali siz{' '}
							<span className='text-slate-300 cursor-pointer hover:underline'>
								Xizmat ko'rsatish shartlari
							</span>{' '}
							va{' '}
							<span className='text-slate-300 cursor-pointer hover:underline'>
								Maxfiylik siyosatiga
							</span>{' '}
							rozilik bildirasiz.
						</div>
					</div>
				</div>
			</main>

			<style jsx global>{`
				@keyframes float {
					0%,
					100% {
						transform: translateY(0px);
					}
					50% {
						transform: translateY(-15px);
					}
				}
				.animate-float {
					animation: float 5s ease-in-out infinite;
				}
			`}</style>
		</div>
	)
}
