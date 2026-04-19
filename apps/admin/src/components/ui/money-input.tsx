"use client"

import * as React from "react"
import { Input } from "./input"
import { cn } from "@/lib/utils"

export interface MoneyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string | number
  onChange: (value: string) => void
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    
    // Format helper: 300000 -> 300,000
    const formatValue = (val: string | number) => {
      if (!val && val !== 0) return ""
      const number = val.toString().replace(/\D/g, "")
      return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    const [displayValue, setDisplayValue] = React.useState(formatValue(value))

    // Sync display value when external value changes
    React.useEffect(() => {
      setDisplayValue(formatValue(value))
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, "")
      setDisplayValue(formatValue(rawValue))
      onChange(rawValue)
    }

    return (
      <Input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        className={cn("font-bold", className)}
      />
    )
  }
)
MoneyInput.displayName = "MoneyInput"

export { MoneyInput }
