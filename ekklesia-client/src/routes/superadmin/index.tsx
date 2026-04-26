import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { DataTable } from '@/components/dashboard/data-table'
import { ChartCard } from '@/components/dashboard/chart-card'
import { Church, Users, Calendar, Wallet } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useAuthStore, ROLE_LABELS } from '@/lib/auth/store'
import { getStats, getAttendanceTimeline, getContributionsBreakdown } from '@/lib/api/stats'
import { listChurches } from '@/lib/api/churches'

function SuperAdminDashboard() {
  const { t } = useI18n()
  const { user } = useAuthStore()

  const statsQ      = useQuery({ queryKey: ['stats'], queryFn: getStats })
  const timelineQ   = useQuery({ queryKey: ['stats', 'attendance_timeline'], queryFn: getAttendanceTimeline })
  const breakdownQ  = useQuery({ queryKey: ['stats', 'contributions_breakdown'], queryFn: getContributionsBreakdown })
  const churchesQ   = useQuery({ queryKey: ['churches'], queryFn: () => listChurches({ perPage: 100 }) })

  const isLoading = statsQ.isLoading || timelineQ.isLoading || breakdownQ.isLoading || churchesQ.isLoading
  const hasError  = statsQ.error || timelineQ.error || breakdownQ.error || churchesQ.error

  const statsCards = [
    { title: t('superadminDashboard.totalChurches'),       value: statsQ.data?.total_churches ?? 0,                      icon: Church },
    { title: t('superadminDashboard.activePastors'),       value: statsQ.data?.total_users ?? 0,                         icon: Users },
    { title: t('superadminDashboard.servicesThisMonth'),   value: statsQ.data?.services_this_month ?? 0,                 icon: Calendar },
    { title: t('superadminDashboard.totalIncome'),         value: `$${(statsQ.data?.total_contributions_amount ?? 0).toLocaleString()}`, icon: Wallet }
  ]

  const attendanceData = (timelineQ.data ?? []).map((p) => ({ name: p.label, asistencia: p.total }))

  const incomeData = (breakdownQ.data ?? []).map((b) => ({
    name: t(`contributionTypes.${b.type}`),
    value: b.amount
  }))

  const churchesRows = (churchesQ.data ?? []).map((c) => ({
    id: c.id,
    nombre: c.name,
    pastor: c.lead_pastor_name ?? '—',
    miembros: c.users_count,
    ciudad: c.city ?? '—',
    estado: c.status
  }))

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
            : value === 'pending'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-slate-100 text-slate-600'
        }`}>
          {value === 'active'
            ? t('superadminDashboard.statusActive')
            : value === 'pending'
              ? t('superadminDashboard.statusPending')
              : String(value)}
        </span>
      )
    }
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
          {hasError && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              {t('common.errorRetry')}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <StatsCard
                key={stat.title}
                title={stat.title}
                value={isLoading ? '…' : stat.value}
                icon={stat.icon}
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

          {/* Churches Table */}
          <DataTable
            title={t('superadminDashboard.registeredChurches')}
            columns={columns}
            data={churchesRows}
            onView={(row) => console.log('View', row)}
          />
        </main>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/superadmin/')({
  component: SuperAdminDashboard
})
