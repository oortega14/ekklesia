"use client"

import { motion } from "framer-motion"
import { Menu, User, ChevronDown } from "lucide-react"
import { useState } from "react"
import { LanguageSwitcher } from "./language-switcher"
import { NotificationsBell } from "@/components/dashboard/notifications-bell"
import { useI18n } from "@/lib/i18n"
import { useAuth } from '@/lib/auth/context'

interface HeaderProps {
  title: string
  userName?: string
  userRole?: string
  onMenuClick?: () => void
}

export function Header({ title, userName: userNameProp, userRole: userRoleProp, onMenuClick }: HeaderProps) {
  const [showProfile, setShowProfile] = useState(false)
  const { user, logout } = useAuth()
  const { t } = useI18n()

  const ROLE_LABELS: Record<string, string> = {
    superadmin:  'Super Admin',
    lead_pastor: 'Pastor Principal',
    pastor:      'Pastor',
    assistant:   'Asistente',
  }

  const userName = userNameProp ?? user?.full_name ?? ''
  const userRole = userRoleProp ?? (user ? (ROLE_LABELS[user.role] ?? user.role) : '')

  const handleLogout = async () => {
    await logout()
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40"
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <motion.h1 
          className="text-lg font-semibold text-[#0a1628]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h1>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Notifications */}
        <NotificationsBell />

        {/* Profile */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-[#0a1628]">{userName}</p>
              <p className="text-xs text-slate-500">{userRole}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </motion.button>

          {/* Profile dropdown */}
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-48 bg-[#0f2035] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-2">
                <button className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/5 rounded-lg transition-colors">
                  {t("profile.myProfile")}
                </button>
                <button className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/5 rounded-lg transition-colors">
                  {t("header.settings")}
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  {t("auth.logout")}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  )
}
