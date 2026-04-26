import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useRouterState } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Church,
  Users,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCog,
  Wallet,
  ClipboardList,
  Bell,
  HelpCircle,
  TrendingUp,
  Building2,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth/context"

interface SidebarProps {
  role: "superadmin" | "lead_pastor" | "pastor" | "assistant"
}

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  labelKey: string
  href: string
  badge?: number
}

const roleNavItems: Record<string, NavItem[]> = {
  superadmin: [
    { icon: LayoutDashboard, labelKey: "nav.dashboard", href: "/superadmin" },
    { icon: Building2, labelKey: "nav.ministries", href: "/superadmin/ministries" },
    { icon: Church, labelKey: "nav.churches", href: "/superadmin/churches" },
    { icon: Users, labelKey: "nav.users", href: "/superadmin/users" },
    { icon: Shield, labelKey: "nav.roles", href: "/superadmin/roles" },
    { icon: BarChart3, labelKey: "nav.reports", href: "/superadmin/reports" },
    { icon: TrendingUp, labelKey: "nav.statistics", href: "/superadmin/statistics" },
    { icon: Bell, labelKey: "nav.notifications", href: "/superadmin/notifications" },
    { icon: Settings, labelKey: "nav.settings", href: "/superadmin/settings" },
  ],
  lead_pastor: [
    { icon: LayoutDashboard, labelKey: "nav.dashboard", href: "/lead-pastor" },
    { icon: Church, labelKey: "nav.myChurches", href: "/lead-pastor/churches" },
    { icon: UserCog, labelKey: "nav.pastors", href: "/lead-pastor/pastors" },
    { icon: Calendar, labelKey: "nav.services", href: "/lead-pastor/services" },
    { icon: TrendingUp, labelKey: "nav.statistics", href: "/lead-pastor/statistics" },
    { icon: Wallet, labelKey: "nav.finances", href: "/lead-pastor/finances" },
    { icon: Settings, labelKey: "nav.settings", href: "/lead-pastor/settings" },
  ],
  pastor: [
    { icon: LayoutDashboard, labelKey: "nav.dashboard", href: "/pastor" },
    { icon: ClipboardList, labelKey: "nav.reports", href: "/pastor/reports" },
    { icon: Users, labelKey: "nav.assistants", href: "/pastor/assistants" },
    { icon: TrendingUp, labelKey: "nav.statistics", href: "/pastor/statistics" },
    { icon: Calendar, labelKey: "nav.services", href: "/pastor/services" },
  ],
  assistant: [
    { icon: LayoutDashboard, labelKey: "nav.dashboard", href: "/assistant" },
    { icon: ClipboardList, labelKey: "nav.reports", href: "/assistant/reports" },
    { icon: HelpCircle, labelKey: "nav.help", href: "/assistant/help" },
  ],
}

export function Sidebar({ role }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const router = useRouter()
  const { t } = useI18n()
  const { logout } = useAuth()

  // Expose collapse state to siblings (page content) via a CSS variable so
  // the existing `lg:ml-64` wrappers can shrink to ml-20 without each page
  // having to know about the sidebar's local state.
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', isCollapsed ? '5rem' : '16rem')
    return () => { document.documentElement.style.removeProperty('--sidebar-w') }
  }, [isCollapsed])

  const items = roleNavItems[role] || []
  const sidebarThemeClass =
    role === "superadmin"
      ? "bg-gradient-to-b from-[#020817] via-[#06122b] to-[#020617] border-r border-blue-950/70"
      : "bg-gradient-to-b from-[#040b1f] via-[#07132e] to-[#030917] border-r border-blue-950/70"

  const getRoleTitle = () => {
    switch (role) {
      case "superadmin": return t("roles.superadmin")
      case "lead_pastor": return t("roles.leadPastor")
      case "pastor": return t("roles.pastor")
      case "assistant": return t("roles.assistant")
      default: return ""
    }
  }

  const getRoleSubtitle = () => {
    switch (role) {
      case "superadmin": return t("roles.superadminSubtitle")
      case "lead_pastor": return t("roles.leadPastorSubtitle")
      case "pastor": return t("roles.pastorSubtitle")
      case "assistant": return t("roles.assistantSubtitle")
      default: return ""
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <motion.aside
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col z-50 transition-all duration-300",
        sidebarThemeClass,
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <motion.div 
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/40 flex items-center justify-center border border-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg viewBox="0 0 100 100" className="w-6 h-6 text-white">
                    <path
                      d="M50 20 C30 25, 15 40, 20 55 C25 70, 40 75, 50 70 C60 75, 75 70, 80 55 C85 40, 70 25, 50 20 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M20 55 C10 50, 5 45, 8 40 C12 35, 18 38, 20 45 M80 55 C90 50, 95 45, 92 40 C88 35, 82 38, 80 45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </motion.div>
                <div>
                  <h2 className="text-sm font-bold text-white">{getRoleTitle()}</h2>
                  <p className="text-xs text-blue-300/60">{getRoleSubtitle()}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "p-2 rounded-lg bg-white/5 hover:bg-white/10 text-blue-300/70 hover:text-white transition-colors",
              isCollapsed && "mx-auto"
            )}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <motion.button
              key={item.href}
              onClick={() => router.navigate({ to: item.href })}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-blue-500/20 text-white" 
                  : "text-blue-200/60 hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-blue-400")} />
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {t(item.labelKey)}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && !isCollapsed && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto px-2 py-0.5 text-xs font-semibold bg-blue-500/30 text-blue-300 rounded-full"
                >
                  {item.badge}
                </motion.span>
              )}
              {item.badge && isCollapsed && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[10px] font-bold bg-blue-500 text-white rounded-full"
                >
                  {item.badge}
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Logout button */}
      <div className="p-3 border-t border-white/10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5" />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                {t("auth.logout")}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  )
}
