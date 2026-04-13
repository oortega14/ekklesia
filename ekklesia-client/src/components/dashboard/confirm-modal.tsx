"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: "danger" | "warning" | "info"
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = "danger"
}: ConfirmModalProps) {
  const { t } = useI18n()
  
  const typeStyles = {
    danger: {
      icon: "bg-red-500/20 text-red-400"
    },
    warning: {
      icon: "bg-amber-500/20 text-amber-400"
    },
    info: {
      icon: "bg-blue-500/20 text-blue-400"
    }
  }

  const styles = typeStyles[type]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
            className="relative w-full max-w-md bg-gradient-to-br from-[#0f2035] to-[#0a1628] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-blue-300/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className={`w-16 h-16 rounded-full ${styles.icon} flex items-center justify-center mx-auto mb-4`}
              >
                <AlertTriangle className="w-8 h-8" />
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-center mb-6"
              >
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-blue-300/70 text-sm">{message}</p>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-3"
              >
                <Button
                  onClick={onClose}
                  variant="blueOutline"
                  className="flex-1"
                >
                  {cancelText || t("common.cancel")}
                </Button>
                <Button
                  onClick={() => { onConfirm(); onClose(); }}
                  variant="blue"
                  className="flex-1"
                >
                  {confirmText || t("common.confirm")}
                </Button>
              </motion.div>
            </div>

            {/* Warning stripes decoration */}
            {type === "danger" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500" />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
