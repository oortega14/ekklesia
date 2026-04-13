"use client"

import { motion } from "framer-motion"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  delay?: number
  className?: string
}

export function StatsCard({ title, value, icon: Icon, trend, delay = 0, className }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-6 group",
        className
      )}
    >
      {/* Background glow effect */}
      <motion.div
        className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <motion.p 
            className="text-3xl font-bold text-[#0a1628]"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.2, duration: 0.3, type: "spring" }}
          >
            {value}
          </motion.p>
          {trend && (
            <motion.div 
              className={cn(
                "flex items-center gap-1 text-sm font-medium",
                trend.isPositive ? "text-emerald-400" : "text-red-400"
              )}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3 }}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-slate-400">vs mes anterior</span>
            </motion.div>
          )}
        </div>
        
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20"
        >
          <Icon className="w-6 h-6 text-blue-400" />
        </motion.div>
      </div>
    </motion.div>
  )
}
