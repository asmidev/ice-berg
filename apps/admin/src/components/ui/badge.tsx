import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "bg-pink-100 text-pink-500",
        secondary: "bg-gray-100 text-gray-500",
        success: "bg-emerald-50 text-emerald-600 border border-emerald-100",
        warning: "bg-amber-50 text-amber-600 border border-amber-100",
        danger: "bg-red-50 text-red-600 border border-red-100",
        navy: "bg-navy-800 text-white", // On Leave style from rules
        outline: "border border-gray-200 text-gray-600",
        info: "bg-blue-50 text-blue-600 border border-blue-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

