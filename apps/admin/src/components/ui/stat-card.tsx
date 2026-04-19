import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: string
    direction: "up" | "down"
  }
  subtitle?: string
  className?: string
}

const StatCardPlain = ({ title, value, icon: Icon, trend, subtitle, className }: StatCardProps) => {
  return (
    <div className={cn("p-6 bg-white border border-gray-100 rounded-lg shadow-card hover:shadow-card-hover transition-all", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-semibold text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn("text-xs font-bold", trend.direction === 'up' ? 'text-emerald-500' : 'text-red-500')}>
                {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
              </span>
              {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-pink-500" />
        </div>
      </div>
    </div>
  )
}

interface StatCardGradientProps extends StatCardProps {
  variant?: 1 | 2 | 3 | 4
}

const StatCardGradient = ({ title, value, icon: Icon, variant = 1, trend, subtitle, className }: StatCardGradientProps) => {
  const gradients = {
    1: "bg-gradient-to-br from-pink-500 to-pink-700", // Pink - Students
    2: "bg-gradient-to-br from-cyan-500 to-cyan-700", // Cyan - Teachers
    3: "bg-gradient-to-br from-navy-800 to-[#0f172a]", // Navy - Finance
    4: "bg-gradient-to-br from-purple-500 to-purple-700", // Purple - Awards
  }

  return (
    <div className={cn("p-5 rounded-md text-white shadow-lg shadow-black/5 relative overflow-hidden", gradients[variant], className)}>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[13px] font-medium text-white/70 mb-1">{title}</p>
          <h3 className="text-28px font-bold">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs font-bold bg-white/20 px-1.5 py-0.5 rounded">
                {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
              </span>
              {subtitle && <span className="text-xs text-white/60">{subtitle}</span>}
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
    </div>
  )
}

export { StatCardPlain, StatCardGradient }
