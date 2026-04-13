"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

interface FormInputProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  icon?: LucideIcon
  required?: boolean
  error?: string
}

interface FormSelectProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  icon?: LucideIcon
  required?: boolean
  placeholder?: string
}

interface FormTextareaProps {
  label: string
  name: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  rows?: number
  required?: boolean
}

export function FormInput({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  required = false,
  error
}: FormInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <label htmlFor={name} className="block text-sm font-medium text-blue-200/80">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/40" />
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full px-4 py-2.5 rounded-xl
            bg-white/5 border border-white/10
            text-white placeholder-blue-300/30
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
            transition-all duration-200
            ${Icon ? "pl-10" : ""}
            ${error ? "border-red-500/50 focus:ring-red-500/50" : ""}
          `}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </motion.div>
  )
}

export function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  icon: Icon,
  required = false,
  placeholder = "Seleccionar..."
}: FormSelectProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <label htmlFor={name} className="block text-sm font-medium text-blue-200/80">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/40 pointer-events-none z-10" />
        )}
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full px-4 py-2.5 rounded-xl appearance-none
            bg-white/5 border border-white/10
            text-white
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
            transition-all duration-200 cursor-pointer
            ${Icon ? "pl-10" : ""}
          `}
        >
          <option value="" className="bg-[#0f2035]">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0f2035]">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-blue-300/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </motion.div>
  )
}

export function FormTextarea({
  label,
  name,
  placeholder,
  value,
  onChange,
  rows = 3,
  required = false
}: FormTextareaProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <label htmlFor={name} className="block text-sm font-medium text-blue-200/80">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="
          w-full px-4 py-2.5 rounded-xl
          bg-white/5 border border-white/10
          text-white placeholder-blue-300/30
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
          transition-all duration-200 resize-none
        "
      />
    </motion.div>
  )
}

interface FormFieldGroupProps {
  children: ReactNode
  columns?: 1 | 2 | 3
}

export function FormFieldGroup({ children, columns = 2 }: FormFieldGroupProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {children}
    </div>
  )
}
