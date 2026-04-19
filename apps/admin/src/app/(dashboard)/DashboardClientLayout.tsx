'use client'

import api from '@/lib/api'
import { BranchProvider, useBranch } from '@/providers/BranchProvider'
import {
	Archive,
	BarChart2,
	Bell,
	BookOpen,
	Briefcase,
	Calendar as CalendarIcon,
	ChevronDown,
	ChevronRight,
	CreditCard,
	GraduationCap,
	LayoutDashboard,
	Loader2,
	LogOut,
	Search,
	Settings,
	PhoneCall,
	Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'

// MENUS DATA
const MENU_ITEMS = [
	{ name: 'Bosh sahifa', path: '/dashboard', icon: LayoutDashboard },
	{ name: 'CRM (Lidlar)', path: '/crm', icon: Briefcase },
	{ name: "O'quvchilar", path: '/students', icon: GraduationCap },
	{ name: 'LMS (Guruhlar)', path: '/lms', icon: BookOpen },
	{ name: 'Ustozlar', path: '/teachers', icon: Users },
	{ name: 'Call Center', path: '/call-center', icon: PhoneCall },
	{
		name: 'Moliya',
		icon: CreditCard,
		children: [
			{ name: "To'lovlar", path: '/finance/payments' },
			{ name: "Qo'shimcha daromadlar", path: '/finance/incomes' },
			{ name: 'Ish haqi', path: '/finance/salaries' },
			{ name: 'Bonuslar', path: '/finance/bonuses' },
			{ name: 'Xarajatlar', path: '/finance/expenses' },
			{ name: 'Qarzdorlar', path: '/finance/debtors' },
			{ name: 'Kassa', path: '/finance/cashbox' },
		],
	},
	{
		name: 'Sozlamalar',
		icon: Settings,
		children: [
			{
				name: 'Ofis',
				children: [
					{ name: 'Lavozimlar', path: '/settings/office/roles' },
					{ name: 'Xodimlar', path: '/settings/office/staff' },
					{ name: 'Xonalar', path: '/settings/office/rooms' },
					{ name: 'Chek sozlama', path: '/settings/office/receipts' },
				],
			},
			{
				name: "O'quv bo'limi",
				children: [
					{ name: "Yo'nalishlar", path: '/settings/academic/courses' },
					{ name: 'Ballar', path: '/settings/academic/scores' },
				],
			},
			{
				name: 'SMS',
				children: [
					{ name: 'Auto sms', path: '/settings/sms/auto' },
					{ name: 'Shablonlar', path: '/settings/sms/templates' },
				],
			},
			{ name: "To'lov turlari", path: '/settings/payment-types' },
			{ name: 'Integratsiyalar', path: '/settings/integrations' },
		],
	},
	{
		name: 'Hisobotlar',
		icon: BarChart2,
		children: [
			{
				name: 'Moliya Hisobotlari',
				children: [
					{ name: 'Ish haqi (Salary)', path: '/reports/financial/salary' },
				],
			},
			{
				name: "CRM va O'quvchilar",
				children: [
					{ name: 'Lid hisobotlari', path: '/reports/crm/leads' },
					{ name: 'Davomat hisoboti', path: '/reports/students/attendance' },
					{ name: 'Ballar hisoboti', path: '/reports/students/scores' },
				],
			},
			{ name: 'Chegirmalar', path: '/reports/discounts' },
			{ name: 'Yuborilgan SMSlar', path: '/reports/sms' },
		],
	},
	{ name: 'Xodimlar davomati', path: '/attendance/staff', icon: CalendarIcon },
	{ name: 'Arxiv', path: '/archive', icon: Archive },
]

// 🍞 BREADCRUMB COMPONENT
function Breadcrumbs() {
	const pathname = usePathname()
	const { branchId, isReady } = useBranch()

	if (!isReady) return null

	if (pathname === '/dashboard') {
		return (
			<nav className='flex items-center gap-1.5 text-[11px] font-medium text-gray-400'>
				<span className='text-gray-500'>Dashboard</span>
			</nav>
		)
	}

	const pathParts = pathname.split('/').filter(p => p && p !== 'dashboard')

	return (
		<nav className='flex items-center gap-1.5 text-[11px] font-medium text-gray-400'>
			<Link
				href={`/dashboard?branch_id=${branchId}`}
				className='hover:text-pink-500 hover:underline transition-all'
			>
				Dashboard
			</Link>
			{pathParts.length > 0 && (
				<>
					{pathParts.map((part, index) => {
						const isLast = index === pathParts.length - 1
						const fullPath = `/${pathParts.slice(0, index + 1).join('/')}`
						const label = part.charAt(0).toUpperCase() + part.slice(1)

						return (
							<div key={part} className='flex items-center gap-1.5'>
								<ChevronRight className='w-3 h-3 text-gray-300' />
								{isLast ? (
									<span className='text-gray-500'>{label}</span>
								) : (
									<Link
										href={`${fullPath}?branch_id=${branchId}`}
										className='hover:text-pink-500 hover:underline transition-all'
									>
										{label}
									</Link>
								)}
							</div>
						)
					})}
				</>
			)}
		</nav>
	)
}

// 📋 RECURSIVE SIDEBAR COMPONENT
function SidebarItem({ item, level = 0 }: { item: any; level?: number }) {
	const [isOpen, setIsOpen] = useState(false)
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const hasChildren = item.children && item.children.length > 0
	const isActiveExact = pathname === item.path
	const isActiveParent =
		hasChildren &&
		item.children.some((child: any) => pathname.startsWith(child.path))

	const paddingLeft =
		level === 0 ? 'px-3' : level === 1 ? 'pl-10 pr-3' : 'pl-14 pr-3'

	if (hasChildren) {
		return (
			<div className='flex flex-col'>
				<button
					onClick={() => setIsOpen(!isOpen)}
					className={`flex items-center justify-between w-full py-2.5 ${paddingLeft} rounded-xl transition-all cursor-pointer group mb-1
            ${isOpen || isActiveParent ? 'text-pink-500 bg-pink-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
          `}
				>
					<div className='flex items-center gap-3'>
						{item.icon && (
							<item.icon
								className={`w-5 h-5 ${isOpen || isActiveParent ? 'text-pink-500' : 'text-gray-400 group-hover:text-gray-600'}`}
							/>
						)}
						<span className={`text-[13px] font-medium`}>{item.name}</span>
					</div>
					<ChevronRight
						className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''} text-gray-400`}
					/>
				</button>

				{isOpen && (
					<div className='flex flex-col mt-0.5 mb-1'>
						{item.children.map((child: any, idx: number) => (
							<SidebarItem
								key={child.name + idx}
								item={child}
								level={level + 1}
							/>
						))}
					</div>
				)}
			</div>
		)
	}

	const { branchId: activeBranchId, isReady } = useBranch()

	if (!isReady) return null

	// Do not include branch_id for profile page
	const isProfile = item.path === '/profile'
	const finalHref = item.path
		? isProfile
			? item.path
			: `${item.path}?branch_id=${activeBranchId}`
		: '#'

	return (
		<Link
			href={finalHref}
			className={`flex items-center gap-3 w-full py-2.5 ${paddingLeft} rounded-xl transition-all group mb-1 relative
        ${isActiveExact ? 'bg-pink-500 text-white font-semibold shadow-sm shadow-pink-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'}
      `}
		>
			{item.icon && (
				<item.icon
					className={`w-5 h-5 ${isActiveExact ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`}
				/>
			)}
			<span className='text-[13px]'>{item.name}</span>
		</Link>
	)
}

// 🌐 BRANCH SWITCHER COMPONENT
function BranchSwitcher({
	branches,
	activeId,
	onSelect,
}: {
	branches: any[]
	activeId: string
	onSelect: (id: string) => void
}) {
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const activeBranch = branches.find(b => b.id === activeId)

	useEffect(() => {
		const clickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			)
				setIsOpen(false)
		}
		document.addEventListener('mousedown', clickOutside)
		return () => document.removeEventListener('mousedown', clickOutside)
	}, [])

	return (
		<div className='relative' ref={dropdownRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={`h-10 px-4 flex items-center gap-2.5 rounded-xl transition-all text-sm font-semibold border
          ${isOpen ? 'bg-white border-pink-200 text-pink-500 shadow-sm' : 'bg-gray-50 border-transparent text-gray-600 hover:bg-white hover:border-gray-200'}
        `}
			>
				<div className='w-5 h-5 flex items-center justify-center bg-white rounded-md border border-gray-100 shadow-sm'>
					<Briefcase className='w-3 h-3 text-gray-400' />
				</div>
				<span className='max-w-[120px] truncate'>
					{activeId === 'all' ? 'Barcha Filiallar' : activeBranch?.name}
				</span>
				<ChevronDown
					className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-pink-500' : ''}`}
				/>
			</button>

			{isOpen && (
				<div className='absolute right-0 top-[calc(100%+12px)] w-[260px] bg-white border border-gray-100 rounded-2xl shadow-dropdown z-[60] overflow-hidden animate-in fade-in slide-in-from-top-1'>
					<div className='p-3 border-b border-gray-50 bg-gray-50/50'>
						<p className='px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400'>
							Filialni tanlang
						</p>
					</div>
					<div className='max-h-[300px] overflow-y-auto p-1.5 custom-scrollbar'>
						<button
							onClick={() => {
								onSelect('all')
								setIsOpen(false)
							}}
							className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all mb-1 ${activeId === 'all' ? 'bg-pink-50 text-pink-500 font-bold' : 'hover:bg-gray-50 text-gray-600 font-medium'}`}
						>
							<div
								className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeId === 'all' ? 'bg-white shadow-sm' : 'bg-gray-100'}`}
							>
								🏢
							</div>
							<span>Barcha Filiallar</span>
						</button>
						{branches.map(b => (
							<button
								key={b.id}
								onClick={() => {
									onSelect(b.id)
									setIsOpen(false)
								}}
								className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all mb-1 ${activeId === b.id ? 'bg-pink-50 text-pink-500 font-bold' : 'hover:bg-gray-50 text-gray-600 font-medium'}`}
							>
								<div
									className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeId === b.id ? 'bg-white shadow-sm' : 'bg-gray-100'}`}
								>
									📍
								</div>
								<span className='truncate'>{b.name}</span>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

export default function DashboardClientLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<Suspense
			fallback={
				<div className='flex-1 flex items-center justify-center min-h-screen bg-gray-50'>
					<Loader2 className='w-8 h-8 animate-spin text-zinc-300' />
				</div>
			}
		>
			<BranchProvider>
				<DashboardContent>{children}</DashboardContent>
			</BranchProvider>
		</Suspense>
	)
}

function DashboardContent({ children }: { children: React.ReactNode }) {
	const [mounted, setMounted] = useState(false)
	const router = useRouter()
	const [isNotifOpen, setIsNotifOpen] = useState(false)
	const [notifications, setNotifications] = useState<any[]>([])
	const notifRef = useRef<HTMLDivElement>(null)
	const pathname = usePathname()
	const searchParams = useSearchParams()

	useEffect(() => {
		setMounted(true)
	}, [])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (notifRef.current && !notifRef.current.contains(event.target as Node))
				setIsNotifOpen(false)
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	useEffect(() => {
		if (isNotifOpen) {
			api
				.get('/analytics/notifications')
				.then(res => setNotifications(res.data))
				.catch(err => console.error(err))
		}
	}, [isNotifOpen])

	const { branchId, setBranchId: updateBranchContext } = useBranch()
	const [branches, setBranches] = useState<any[]>([])
	const [user, setUser] = useState<{
		firstName?: string
		lastName?: string
		role?: string
		branches?: any[]
	}>({})

	useEffect(() => {
		const savedUser = localStorage.getItem('user')
		if (savedUser) {
			try {
				const parsed = JSON.parse(savedUser)
				setUser({
					firstName: parsed.first_name || parsed.firstName,
					lastName: parsed.last_name || parsed.lastName,
					role: parsed.role,
					branches: parsed.branches || [],
				})
			} catch (e) {
				console.error(e)
			}
		}

		const tkn =
			localStorage.getItem('token') || localStorage.getItem('accessToken')
		if (!tkn) {
			window.location.href = '/login'
		} else {
			updateBranchContext(localStorage.getItem('branch_id') || 'all')
			api
				.get('/branches')
				.then(res => {
					const data = res.data?.data || res.data || []
					setBranches(Array.isArray(data) ? data : [])
				})
				.catch(err => console.error(err))
		}
	}, [])

	const handleBranchSelect = (id: string) => {
		updateBranchContext(id)
	}

	const handleLogout = () => {
		localStorage.clear()
		document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
		window.location.href = '/login'
	}

	// Get Page Title from Menu
	const getPageInfo = () => {
		let title = 'Bosh sahifa'
		let breadcrumb = 'Bosh sahifa'

		const findItem = (items: any[]): any => {
			for (const item of items) {
				if (item.path === pathname) return item
				if (item.children) {
					const found = findItem(item.children)
					if (found) return found
				}
			}
		}

		const activeItem = findItem(MENU_ITEMS)
		if (activeItem) {
			title = activeItem.name
			// Simple breadcrumb logic
			const pathParts = pathname.split('/').filter(p => p)
			breadcrumb = pathParts
				.map(p => p.charAt(0).toUpperCase() + p.slice(1))
				.join(' › ')
		}

		return { title, breadcrumb }
	}

	const { title, breadcrumb } = getPageInfo()

	if (!mounted) {
		return (
			<div className='flex h-screen items-center justify-center bg-gray-50'>
				<Loader2 className='w-8 h-8 animate-spin text-pink-500' />
			</div>
		)
	}

	return (
		<div className='flex h-screen bg-gray-50 custom-scrollbar'>
			{/* 🚀 SIDEBAR */}
			<aside className='w-[220px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col z-20'>
				{/* Brand/Logo */}
				<div className='h-24 border-b border-gray-100 flex-shrink-0'>
					<Link href='/' className='w-full h-full group block'>
						<div className='w-full h-full flex items-center justify-center bg-slate-900 transition-all hover:bg-slate-800 overflow-hidden'>
							<img
								src='/Frame 344.png'
								alt='logo'
								className='w-full h-auto max-h-16 px-6 object-contain'
							/>
						</div>
					</Link>
				</div>

				{/* Navigation */}
				<nav className='flex-1 overflow-y-auto px-3 py-4 custom-scrollbar'>
					{MENU_ITEMS.map((item, idx) => (
						<SidebarItem key={item.name + idx} item={item} />
					))}
				</nav>

				{/* User Account / Footer */}
				<div className='p-4 border-t border-gray-100'>
					<div className='flex items-center gap-3'>
						<div className='w-9 h-9 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center font-bold text-xs shrink-0'>
							{user.firstName?.charAt(0)}
							{user.lastName?.charAt(0) || 'A'}
						</div>
						<div className='flex-1 min-w-0'>
							<p className='text-xs font-semibold text-gray-900 truncate'>
								{user.firstName} {user.lastName}
							</p>
							<p className='text-[10px] text-gray-500 capitalize'>
								{user.role || 'Admin'}
							</p>
						</div>
						<button
							onClick={handleLogout}
							className='text-gray-400 hover:text-red-500 transition-colors'
							title='Logout'
						>
							<LogOut className='w-4 h-4' />
						</button>
					</div>
				</div>
			</aside>

			{/* 💻 MAIN CONTENT AREA */}
			<main className='flex-1 min-w-0 flex flex-col h-screen overflow-hidden'>
				{/* HEADER */}
				<header className='h-24 bg-transparent shadow-sm flex items-center justify-between px-5 sticky top-0 z-40'>
					<div className='flex flex-col gap-0.5'>
						<h1 className='text-xl font-bold text-gray-900 tracking-tight'>
							{title}
						</h1>
						<Breadcrumbs />
					</div>

					<div className='flex items-center gap-6'>
						{/* 🔍 Global Search */}
						<div className='hidden lg:flex relative group'>
							<div className='absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2'>
								<Search className='w-4 h-4 text-gray-400 group-focus-within:text-pink-500 transition-colors' />
							</div>
							<input
								type='text'
								placeholder='Qidiruv...'
								className='w-[280px] h-11 bg-gray-50 border border-transparent rounded-2xl pl-10 pr-10 text-[13px] focus:bg-white focus:border-pink-100 focus:ring-4 focus:ring-pink-50/50 transition-all outline-none text-gray-700 font-medium'
							/>
							<div className='absolute right-3 top-1/2 -translate-y-1/2'>
								<button
									title='Filter'
									className='p-1 hover:bg-gray-200 rounded-md transition-colors group/filter'
								>
									<svg
										width='14'
										height='14'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2.5'
										strokeLinecap='round'
										strokeLinejoin='round'
										className='text-gray-400 group-hover/filter:text-pink-500 transition-colors'
									>
										<line x1='4' y1='21' x2='4' y2='14' />
										<line x1='4' y1='10' x2='4' y2='3' />
										<line x1='12' y1='21' x2='12' y2='12' />
										<line x1='12' y1='8' x2='12' y2='3' />
										<line x1='20' y1='21' x2='20' y2='16' />
										<line x1='20' y1='12' x2='20' y2='3' />
										<line x1='1' y1='14' x2='7' y2='14' />
										<line x1='9' y1='8' x2='15' y2='8' />
										<line x1='17' y1='16' x2='23' y2='16' />
									</svg>
								</button>
							</div>
						</div>

						<div className='h-8 w-px bg-gray-100 hidden sm:block mx-1'></div>

						<div className='flex items-center gap-3'>
							<BranchSwitcher
								branches={
									user.role === 'super-admin'
										? branches
										: branches.filter(b =>
												user.branches?.some(ub => ub.id === b.id),
											)
								}
								activeId={branchId}
								onSelect={handleBranchSelect}
							/>

							<div className='flex items-center gap-2'>
								<div className='relative' ref={notifRef}>
									<button
										onClick={() => setIsNotifOpen(!isNotifOpen)}
										className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border relative
                       ${isNotifOpen ? 'bg-pink-50 border-pink-200 text-pink-500 shadow-sm' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100 hover:border-gray-200'}
                     `}
									>
										<Bell className='w-4.5 h-4.5' />
										<span className='absolute top-2.5 right-2.5 w-2 h-2 bg-pink-500 rounded-full border-2 border-white shadow-sm animate-pulse'></span>
									</button>

									{isNotifOpen && (
										<div className='absolute right-0 top-[calc(100%+12px)] w-[360px] bg-white rounded-2xl shadow-dropdown border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1'>
											<div className='px-5 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between'>
												<h3 className='font-bold text-sm text-gray-900'>
													Notifications
												</h3>
												<span className='px-2 py-0.5 bg-pink-100 text-[10px] text-pink-600 font-bold rounded-full uppercase tracking-wider'>
													{notifications.length} New
												</span>
											</div>
											<div className='max-h-[360px] overflow-y-auto custom-scrollbar'>
												{notifications.length === 0 ? (
													<div className='p-10 text-center text-sm text-gray-400 flex flex-col items-center gap-2 opacity-60'>
														<Bell className='w-8 h-8 opacity-20' />
														No new notifications
													</div>
												) : (
													notifications.map((n, i) => (
														<div
															key={i}
															className='p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer'
														>
															<p className='text-xs font-semibold text-gray-800 mb-0.5'>
																{n.title}
															</p>
															<p className='text-[10px] text-gray-400 font-medium'>
																{n.time}
															</p>
														</div>
													))
												)}
											</div>
										</div>
									)}
								</div>
							</div>

							<div className='h-8 w-px bg-gray-100 mx-1'></div>

							{/* 👤 User Profile Section */}
							<Link
								href='/profile'
								className='flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group'
							>
								<div className='relative'>
									<div className='w-10 h-10 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center font-bold text-sm border-2 border-white ring-1 ring-pink-100'>
										{user.firstName?.charAt(0)}
										{user.lastName?.charAt(0) || 'A'}
									</div>
									<div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm'></div>
								</div>
								<div className='flex flex-col text-left hidden sm:flex'>
									<span className='text-sm font-bold text-gray-900 leading-tight group-hover:text-pink-500 transition-colors'>
										{user.firstName} {user.lastName}
									</span>
									<span className='text-[11px] font-medium text-gray-400 capitalize'>
										{user.role || 'Admin'}
									</span>
								</div>
								<ChevronDown className='w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors ml-1 hidden lg:block' />
							</Link>
						</div>
					</div>
				</header>

				{/* PAGE CONTENT */}
				<div
					key={branchId}
					className='flex-1 overflow-x-hidden overflow-y-auto px-5 pt-[5px] pb-10 bg-gray-50 custom-scrollbar'
				>
					<div className='w-full max-w-full mx-auto'>{children}</div>
				</div>
			</main>
		</div>
	)
}
