import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Church, UserCog, Calendar, Users, Wallet } from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { DataTable } from "@/components/dashboard/data-table"
import { ErrorCard } from "@/components/dashboard/error-card"
import { useI18n } from "@/lib/i18n"
import { useAuthStore, ROLE_LABELS } from "@/lib/auth/store"
import {
  getLeadPastorStats,
  getAttendanceTimeline,
  getContributionsBreakdown
} from "@/lib/api/stats"
import { listChurches, type ChurchRow } from "@/lib/api/churches"

function LeadPastorDashboard() {
  const { t }     = useI18n()
  const user      = useAuthStore((s) => s.user)
  const navigate  = useNavigate()

  const statsQ     = useQuery({ queryKey: ["stats", "lead-pastor"], queryFn: getLeadPastorStats })
  const timelineQ  = useQuery({ queryKey: ["stats", "attendance_timeline"], queryFn: getAttendanceTimeline })
  const breakdownQ = useQuery({ queryKey: ["stats", "contributions_breakdown"], queryFn: getContributionsBreakdown })
  const churchesQ  = useQuery({ queryKey: ["churches"], queryFn: () => listChurches({ perPage: 100 }) })

  const fmt = (n: number | undefined) => (n ?? 0).toLocaleString()
  const money = (n: number | undefined) => `$${(n ?? 0).toLocaleString()}`

  const attendanceData = (timelineQ.data ?? []).map((p) => ({ name: p.label, asistencia: p.total }))
  const incomeData = (breakdownQ.data ?? []).map((b) => ({
    name: t(`contributionTypes.${b.type}`),
    value: b.amount
  }))

  const churchesRows = (churchesQ.data ?? []).map((c: ChurchRow) => ({
    id:                c.id,
    [t("dashboards.leadPastor.colChurchName")]:  c.name,
    [t("dashboards.leadPastor.colPastor")]:      c.lead_pastor_name ?? "—",
    [t("dashboards.leadPastor.colMembers")]:     c.users_count
  }))

  const churchesColumns = [
    { key: t("dashboards.leadPastor.colChurchName"), label: t("dashboards.leadPastor.colChurchName") },
    { key: t("dashboards.leadPastor.colPastor"),     label: t("dashboards.leadPastor.colPastor") },
    { key: t("dashboards.leadPastor.colMembers"),    label: t("dashboards.leadPastor.colMembers") }
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="lead_pastor" />

      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title={t("dashboards.leadPastor.title")}
          userName={user?.full_name ?? ""}
          userRole={ROLE_LABELS[user?.role ?? ""] ?? ""}
        />

        <main className="p-6 bg-white space-y-8">
          <p className="text-sm text-slate-500 -mt-3">
            {t("dashboards.leadPastor.subtitle")}
          </p>

          {/* Stats grid */}
          {statsQ.isError ? (
            <ErrorCard onRetry={() => statsQ.refetch()} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
              <Link to="/lead-pastor/churches">
                <StatsCard
                  title={t("dashboards.leadPastor.churches")}
                  value={statsQ.isLoading ? "…" : fmt(statsQ.data?.churches_count)}
                  icon={Church}
                  delay={0}
                />
              </Link>
              <Link to="/lead-pastor/pastors">
                <StatsCard
                  title={t("dashboards.leadPastor.pastors")}
                  value={statsQ.isLoading ? "…" : fmt(statsQ.data?.pastors_count)}
                  icon={UserCog}
                  delay={0.1}
                />
              </Link>
              <StatsCard
                title={t("dashboards.leadPastor.servicesThisMonth")}
                value={statsQ.isLoading ? "…" : fmt(statsQ.data?.services_this_month)}
                icon={Calendar}
                delay={0.2}
              />
              <StatsCard
                title={t("dashboards.leadPastor.totalAttendance")}
                value={statsQ.isLoading ? "…" : fmt(statsQ.data?.total_attendance)}
                icon={Users}
                delay={0.3}
              />
              <StatsCard
                title={t("dashboards.leadPastor.totalContributions")}
                value={statsQ.isLoading ? "…" : money(statsQ.data?.total_contributions)}
                icon={Wallet}
                delay={0.4}
              />
            </div>
          )}

          {/* Charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {timelineQ.isError ? (
              <ErrorCard onRetry={() => timelineQ.refetch()} />
            ) : (
              <ChartCard
                title={t("dashboards.leadPastor.attendanceTitle")}
                subtitle={t("dashboards.leadPastor.attendanceSubtitle")}
                type="area"
                data={attendanceData}
                dataKey="asistencia"
                delay={0.4}
              />
            )}
            {breakdownQ.isError ? (
              <ErrorCard onRetry={() => breakdownQ.refetch()} />
            ) : (
              <ChartCard
                title={t("dashboards.leadPastor.contributionsTitle")}
                subtitle={t("dashboards.leadPastor.contributionsSubtitle")}
                type="pie"
                data={incomeData}
                dataKey="value"
                delay={0.5}
              />
            )}
          </div>

          {/* Churches table */}
          {churchesQ.isError ? (
            <ErrorCard onRetry={() => churchesQ.refetch()} />
          ) : churchesRows.length === 0 && !churchesQ.isLoading ? (
            <p className="text-sm text-slate-500">
              {t("dashboards.leadPastor.emptyChurches")}
            </p>
          ) : (
            <DataTable
              title={t("dashboards.leadPastor.churchesTableTitle")}
              columns={churchesColumns}
              data={churchesRows}
              onView={() => navigate({ to: "/lead-pastor/churches" })}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/lead-pastor/")({
  component: LeadPastorDashboard
})
