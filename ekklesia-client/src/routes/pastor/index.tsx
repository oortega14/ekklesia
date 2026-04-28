import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Calendar, ClipboardList, Wallet, Users } from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { ErrorCard } from "@/components/dashboard/error-card"
import { UpcomingServicesList } from "@/components/dashboard/upcoming-services-list"
import { useI18n } from "@/lib/i18n"
import { useAuthStore, ROLE_LABELS } from "@/lib/auth/store"
import {
  getPastorStats,
  getAttendanceTimeline,
  getContributionsBreakdown
} from "@/lib/api/stats"
import { getServicesOverview } from "@/lib/api/services"

function PastorDashboard() {
  const { t } = useI18n()
  const user  = useAuthStore((s) => s.user)

  const statsQ     = useQuery({ queryKey: ["stats", "pastor"], queryFn: getPastorStats })
  const timelineQ  = useQuery({ queryKey: ["stats", "attendance_timeline"], queryFn: getAttendanceTimeline })
  const breakdownQ = useQuery({ queryKey: ["stats", "contributions_breakdown"], queryFn: getContributionsBreakdown })
  const overviewQ  = useQuery({ queryKey: ["services-overview"], queryFn: getServicesOverview })

  const fmt = (n: number | undefined) => (n ?? 0).toLocaleString()

  const attendanceData = (timelineQ.data ?? []).map((p) => ({ name: p.label, asistencia: p.total }))
  const incomeData = (breakdownQ.data ?? []).map((b) => ({
    name: t(`contributionTypes.${b.type}`),
    value: b.amount
  }))

  const upcoming = (overviewQ.data?.upcoming_services ?? []).slice(0, 5)

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="pastor" />

      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title={t("dashboards.pastor.title")}
          userName={user?.full_name ?? ""}
          userRole={ROLE_LABELS[user?.role ?? ""] ?? ""}
        />

        <main className="p-6 bg-white space-y-8">
          <p className="text-sm text-slate-500 -mt-3">
            {t("dashboards.pastor.subtitle")}
          </p>

          {/* Stats grid */}
          {statsQ.isError ? (
            <ErrorCard onRetry={() => statsQ.refetch()} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <Link to="/pastor/services">
                <StatsCard
                  title={t("dashboards.pastor.services")}
                  value={statsQ.isLoading ? "…" : fmt(statsQ.data?.services_count)}
                  icon={Calendar}
                  delay={0}
                />
              </Link>
              <Link to="/pastor/attendance">
                <StatsCard
                  title={t("dashboards.pastor.pendingAttendance")}
                  value={statsQ.isLoading ? "…" : fmt(statsQ.data?.pending_attendance_reports)}
                  icon={ClipboardList}
                  delay={0.1}
                />
              </Link>
              <Link to="/pastor/reports">
                <StatsCard
                  title={t("dashboards.pastor.pendingContributions")}
                  value={statsQ.isLoading ? "…" : fmt(statsQ.data?.pending_contributions)}
                  icon={Wallet}
                  delay={0.2}
                />
              </Link>
              <Link to="/pastor/assistants">
                <StatsCard
                  title={t("dashboards.pastor.assistants")}
                  value={statsQ.isLoading ? "…" : fmt(statsQ.data?.assistants_count)}
                  icon={Users}
                  delay={0.3}
                />
              </Link>
            </div>
          )}

          {/* Charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {timelineQ.isError ? (
              <ErrorCard onRetry={() => timelineQ.refetch()} />
            ) : (
              <ChartCard
                title={t("dashboards.pastor.attendanceTitle")}
                subtitle={t("dashboards.pastor.attendanceSubtitle")}
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
                title={t("dashboards.pastor.contributionsTitle")}
                subtitle={t("dashboards.pastor.contributionsSubtitle")}
                type="pie"
                data={incomeData}
                dataKey="value"
                delay={0.5}
              />
            )}
          </div>

          {/* Upcoming services */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              {t("dashboards.pastor.upcomingHeader")}
            </h2>
            {overviewQ.isError ? (
              <ErrorCard onRetry={() => overviewQ.refetch()} />
            ) : overviewQ.isLoading ? (
              <p className="text-sm text-slate-500">{t("common.loading")}</p>
            ) : upcoming.length === 0 ? (
              <p className="text-sm text-slate-500">
                {t("dashboards.pastor.emptyUpcoming")}
              </p>
            ) : (
              <UpcomingServicesList services={upcoming} />
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/pastor/")({
  component: PastorDashboard
})
