"use client"

import { motion } from "framer-motion"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface ErrorCardProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorCard({ title, message, onRetry, className }: ErrorCardProps) {
  const { t } = useI18n()
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={
        "rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 " +
        (className ?? "")
      }
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">
            {title ?? t("common.error")}
          </p>
          <p className="text-xs text-red-600 mt-1">
            {message ?? t("common.errorRetry")}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-red-700 hover:text-red-900 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t("common.retry")}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
