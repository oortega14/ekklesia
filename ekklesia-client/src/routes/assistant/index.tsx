import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { es as esLocale, enUS as enLocale } from "date-fns/locale"
import type { Locale as DateFnsLocale } from "date-fns"
import { ClipboardList, FileText, CalendarClock, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ErrorCard } from "@/components/dashboard/error-card"
import { useI18n } from "@/lib/i18n"
import { useAuthStore, ROLE_LABELS } from "@/lib/auth/store"
import { getAssistantStats } from "@/lib/api/stats"
import { getAttendanceSubmission, type PendingService } from "@/lib/api/attendance"
import { getServicesOverview, type MyRequest } from "@/lib/api/services"

function AssistantDashboard() {
  const { t, locale } = useI18n()
  const user = useAuthStore((s) => s.user)
  const dateLocale: DateFnsLocale = locale === "en" ? enLocale : esLocale

  const statsQ      = useQuery({ queryKey: ["stats", "assistant"],         queryFn: getAssistantStats })
  const submissionQ = useQuery({ queryKey: ["attendance-submission"],      queryFn: getAttendanceSubmission })
  const overviewQ   = useQuery({ queryKey: ["services-overview"],          queryFn: getServicesOverview })

  const fmt = (n: number | undefined) => (n ?? 0).toLocaleString()

  const pendingServices = submissionQ.data?.pending_services ?? []
  const myRequests = (overviewQ.data?.my_requests ?? []).slice(0, 5)

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="assistant" />

      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title={t("dashboards.assistant.title")}
          userName={user?.full_name ?? ""}
          userRole={ROLE_LABELS[user?.role ?? ""] ?? ""}
        />

        <main className="p-6 bg-white space-y-8">
          <p className="text-sm text-slate-500 -mt-3">
            {t("dashboards.assistant.subtitle")}
          </p>

          {/* Stats: 2 cards centered */}
          {statsQ.isError ? (
            <ErrorCard onRetry={() => statsQ.refetch()} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
              <StatsCard
                title={t("dashboards.assistant.pendingRequests")}
                value={statsQ.isLoading ? "…" : fmt(statsQ.data?.pending_service_requests)}
                icon={ClipboardList}
                delay={0}
              />
              <Link to="/assistant/attendance">
                <StatsCard
                  title={t("dashboards.assistant.submittedReports")}
                  value={statsQ.isLoading ? "…" : fmt(statsQ.data?.submitted_reports_count)}
                  icon={FileText}
                  delay={0.1}
                />
              </Link>
            </div>
          )}

          {/* Pending services list */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              {t("dashboards.assistant.pendingServicesHeader")}
            </h2>
            {submissionQ.isError ? (
              <ErrorCard onRetry={() => submissionQ.refetch()} />
            ) : submissionQ.isLoading ? (
              <p className="text-sm text-slate-500">{t("common.loading")}</p>
            ) : pendingServices.length === 0 ? (
              <p className="text-sm text-slate-500">
                {t("dashboards.assistant.emptyPendingServices")}
              </p>
            ) : (
              <ul className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                {pendingServices.map((svc) => (
                  <PendingServiceRow key={svc.id} svc={svc} dateLocale={dateLocale} />
                ))}
              </ul>
            )}
          </section>

          {/* My requests list */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              {t("dashboards.assistant.myRequestsHeader")}
            </h2>
            {overviewQ.isError ? (
              <ErrorCard onRetry={() => overviewQ.refetch()} />
            ) : overviewQ.isLoading ? (
              <p className="text-sm text-slate-500">{t("common.loading")}</p>
            ) : myRequests.length === 0 ? (
              <p className="text-sm text-slate-500">
                {t("dashboards.assistant.emptyMyRequests")}
              </p>
            ) : (
              <ul className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                {myRequests.map((r) => (
                  <MyRequestRow key={r.id} req={r} />
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

function PendingServiceRow({
  svc, dateLocale
}: {
  svc: PendingService
  dateLocale: DateFnsLocale
}) {
  return (
    <motion.li
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 px-4 py-3 text-sm"
    >
      <Link
        to="/assistant/attendance"
        className="flex flex-1 items-center gap-3 min-w-0 hover:bg-slate-50 -mx-4 -my-3 px-4 py-3 transition-colors"
      >
        <CalendarClock className="w-4 h-4 text-slate-400 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-900 truncate">{svc.service_type}</p>
          <p className="text-xs text-slate-500">
            {svc.scheduled_at
              ? format(new Date(svc.scheduled_at), "EEE d MMM, HH:mm", { locale: dateLocale })
              : "—"}
          </p>
        </div>
        {svc.church_name && (
          <span className="text-xs text-slate-400 shrink-0">{svc.church_name}</span>
        )}
      </Link>
    </motion.li>
  )
}

function MyRequestRow({ req }: { req: MyRequest }) {
  const Icon = req.status === "pending" ? Clock
             : req.status === "approved" ? CheckCircle2
             : XCircle
  const iconCls = req.status === "pending" ? "text-amber-500"
                : req.status === "approved" ? "text-emerald-600"
                : "text-red-500"
  return (
    <motion.li
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-start gap-3 px-4 py-3 text-sm"
    >
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconCls}`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900">{req.service_type}</p>
        <p className="text-xs text-slate-500">
          {req.requested_for ? new Date(req.requested_for).toLocaleString() : "—"}
        </p>
      </div>
    </motion.li>
  )
}

export const Route = createFileRoute("/assistant/")({
  component: AssistantDashboard
})
