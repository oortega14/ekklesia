import { createFileRoute } from '@tanstack/react-router'
import { motion } from "framer-motion"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { DataTable } from "@/components/dashboard/data-table"
import { ChartCard } from "@/components/dashboard/chart-card"
import {
  Church,
  Users,
  Calendar,
  Wallet,
  Filter,
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { useAuthStore, ROLE_LABELS } from "@/lib/auth/store"

const churchesData = [
  { id: 1, nombre: "Iglesia Central", pastor: "Carlos Mendez", miembros: 320, ciudad: "Ciudad de México", estado: "active" },
  { id: 2, nombre: "Iglesia del Norte", pastor: "María García", miembros: 185, ciudad: "Monterrey", estado: "active" },
  { id: 3, nombre: "Iglesia del Sur", pastor: "Juan López", miembros: 210, ciudad: "Guadalajara", estado: "active" },
  { id: 4, nombre: "Iglesia Esperanza", pastor: "Ana Rodríguez", miembros: 145, ciudad: "Puebla", estado: "active" },
  { id: 5, nombre: "Iglesia Nueva Vida", pastor: "Pedro Sánchez", miembros: 95, ciudad: "Querétaro", estado: "pending" },
]

const incomeData = [
  { name: "Diezmos", value: 45000 },
  { name: "Ofrendas", value: 32000 },
  { name: "Donaciones", value: 18000 },
  { name: "Eventos", value: 12000 },
]

function SuperAdminDashboard() {
  const { t } = useI18n()
  const { user } = useAuthStore()

  const statsData = [
    { title: t('superadminDashboard.totalChurches'), value: 24, icon: Church, trend: { value: 12, isPositive: true } },
    { title: t('superadminDashboard.activePastors'), value: 48, icon: Users, trend: { value: 8, isPositive: true } },
    { title: t('superadminDashboard.servicesThisMonth'), value: 156, icon: Calendar, trend: { value: 5, isPositive: true } },
    { title: t('superadminDashboard.totalIncome'), value: '$125,420', icon: Wallet, trend: { value: 15, isPositive: true } },
  ]

  const attendanceData = [
    { name: t('superadminDashboard.monthJan'), asistencia: 2400 },
    { name: t('superadminDashboard.monthFeb'), asistencia: 2210 },
    { name: t('superadminDashboard.monthMar'), asistencia: 2290 },
    { name: t('superadminDashboard.monthApr'), asistencia: 2000 },
    { name: t('superadminDashboard.monthMay'), asistencia: 2181 },
    { name: t('superadminDashboard.monthJun'), asistencia: 2500 },
    { name: t('superadminDashboard.monthJul'), asistencia: 2100 },
  ]

  const columns = [
    { key: 'nombre', label: t('superadminDashboard.colName') },
    { key: 'pastor', label: t('superadminDashboard.colLeadPastor') },
    {
      key: 'miembros',
      label: t('superadminDashboard.colMembers'),
      render: (value: unknown) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
          {String(value)}
        </span>
      )
    },
    { key: 'ciudad', label: t('superadminDashboard.colCity') },
    {
      key: 'estado',
      label: t('superadminDashboard.colStatus'),
      render: (value: unknown) => (
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
          value === 'active'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-amber-100 text-amber-700'
        }`}>
          {value === 'active' ? t('superadminDashboard.statusActive') : t('superadminDashboard.statusPending')}
        </span>
      )
    },
  ]

  const activityItems = [
    {
      action: t('superadminDashboard.activity1Action'),
      details: t('superadminDashboard.activity1Details'),
      time: t('superadminDashboard.activity1Time'),
    },
    {
      action: t('superadminDashboard.activity2Action'),
      details: t('superadminDashboard.activity2Details'),
      time: t('superadminDashboard.activity2Time'),
    },
    {
      action: t('superadminDashboard.activity3Action'),
      details: t('superadminDashboard.activity3Details'),
      time: t('superadminDashboard.activity3Time'),
    },
    {
      action: t('superadminDashboard.activity4Action'),
      details: t('superadminDashboard.activity4Details'),
      time: t('superadminDashboard.activity4Time'),
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="superadmin" />

      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title={t('superadminDashboard.title')}
          userName={user?.full_name ?? ''}
          userRole={ROLE_LABELS[user?.role ?? ''] ?? ''}
        />

        <main className="p-6 bg-white">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <StatsCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
                delay={index * 0.1}
              />
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard
              title={t('superadminDashboard.generalAttendance')}
              subtitle={t('superadminDashboard.generalAttendanceSubtitle')}
              type="area"
              data={attendanceData}
              dataKey="asistencia"
              delay={0.4}
            />
            <ChartCard
              title={t('superadminDashboard.incomeDistribution')}
              subtitle={t('superadminDashboard.incomeDistributionSubtitle')}
              type="pie"
              data={incomeData}
              dataKey="value"
              delay={0.5}
            />
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-3 mb-6"
          >
            <Button variant="blueOutline" className="gap-2">
              <Filter className="w-4 h-4" />
              {t('superadminDashboard.filter')}
            </Button>
            <Button variant="blueOutline" className="gap-2">
              <Download className="w-4 h-4" />
              {t('superadminDashboard.export')}
            </Button>
          </motion.div>

          {/* Churches Table */}
          <DataTable
            title={t('superadminDashboard.registeredChurches')}
            columns={columns}
            data={churchesData}
            onView={(row) => console.log("View", row)}
            onEdit={(row) => console.log("Edit", row)}
            onDelete={(row) => console.log("Delete", row)}
          />

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 bg-white border border-slate-200 shadow-sm rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-[#0a1628] mb-4">{t('superadminDashboard.recentActivity')}</h3>
            <div className="space-y-4">
              {activityItems.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                      <p className="text-xs text-slate-500">{activity.details}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/superadmin/')({
  component: SuperAdminDashboard
})
