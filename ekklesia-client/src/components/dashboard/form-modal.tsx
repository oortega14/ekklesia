"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReactNode } from "react"

interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  title: string
  subtitle?: string
  children: ReactNode
  submitText?: string
  cancelText?: string
  icon?: ReactNode
  size?: "sm" | "md" | "lg" | "xl"
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  children,
  submitText = "Guardar",
  cancelText = "Cancelar",
  icon,
  size = "md"
}: FormModalProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl"
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative w-full ${sizeClasses[size]} bg-gradient-to-br from-[#0f2035] to-[#0a1628] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8`}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {icon && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400"
                  >
                    {icon}
                  </motion.div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                  {subtitle && (
                    <p className="text-sm text-blue-300/60 mt-0.5">{subtitle}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-blue-300/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-6 max-h-[60vh] overflow-y-auto"
            >
              {children}
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="px-6 py-4 border-t border-white/10 flex gap-3 justify-end bg-white/[0.02]"
            >
              <Button
                onClick={onClose}
                variant="blueOutline"
              >
                {cancelText}
              </Button>
              <Button
                onClick={onSubmit}
                variant="blue"
              >
                {submitText}
              </Button>
            </motion.div>

            {/* Accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
