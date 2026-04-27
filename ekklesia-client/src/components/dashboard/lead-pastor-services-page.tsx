import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, formatDistanceToNow } from 'date-fns'
import { es as esLocale, enUS as enLocale } from 'date-fns/locale'
import type { Locale as DateFnsLocale } from 'date-fns'
import { toast } from 'sonner'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/dashboard/confirm-modal'
import { UpcomingServicesList } from '@/components/dashboard/upcoming-services-list'
import { ScheduleServiceForm } from '@/components/dashboard/schedule-service-form'
import { useI18n } from '@/lib/i18n'
import { useAuthStore, ROLE_LABELS } from '@/lib/auth/store'
import {
  getServicesOverview,
  approveServiceRequest,
  rejectServiceRequest,
  type PendingRequest, type RecentResolved
} from '@/lib/api/services'
import { CheckCircle2, XCircle, Plus, Sparkles } from 'lucide-react'

type ConfirmAction = { kind: 'approve' | 'reject'; req: PendingRequest } | null

export function LeadPastorServicesPage() {
  const { t, locale } = useI18n()
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const dateLocale: DateFnsLocale = locale === 'en' ? enLocale : esLocale

  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)

  const overviewQ = useQuery({
    queryKey: ['services-overview'],
    queryFn:  getServicesOverview
  })

  const approveM = useMutation({
    mutationFn: approveServiceRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services-overview'] })
      toast.success(t('services.toastApproved'))
      setConfirmAction(null)
    },
    onError: () => toast.error(t('services.toastError'))
  })
  const rejectM = useMutation({
    mutationFn: rejectServiceRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services-overview'] })
      toast.success(t('services.toastRejected'))
      setConfirmAction(null)
    },
    onError: () => toast.error(t('services.toastError'))
  })

  const pending  = overviewQ.data?.pending_requests  ?? []
  const upcoming = overviewQ.data?.upcoming_services ?? []
  const resolved = overviewQ.data?.recent_resolved   ?? []

  const subtitle = t('services.subtitleLeadPastor')

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="lead_pastor" />
      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title={t('services.title')}
          userName={user?.full_name ?? ''}
          userRole={ROLE_LABELS[user?.role ?? ''] ?? ''}
        />
        <main className="p-6 bg-white space-y-8">
          <p className="text-sm text-slate-500 -mt-3">{subtitle}</p>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              {t('services.pendingRequestsHeader').replace('{{n}}', String(pending.length))}
            </h2>
            {pending.length === 0 ? (
              <p className="text-sm text-slate-500">{t('services.emptyPending')}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pending.map((r) => (
                  <PendingCard
                    key={r.id}
                    req={r}
                    onApprove={() => setConfirmAction({ kind: 'approve', req: r })}
                    onReject={() => setConfirmAction({ kind: 'reject', req: r })}
                    dateLocale={dateLocale}
                    t={t}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <Button onClick={() => setIsScheduleOpen(true)} variant="blue" className="gap-2">
              <Plus className="w-4 h-4" /> {t('services.scheduleServiceButton')}
            </Button>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              {t('services.upcomingServicesHeader')}
            </h2>
            <UpcomingServicesList services={upcoming} />
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              {t('services.recentResolvedHeader')}
            </h2>
            {resolved.length === 0 ? (
              <p className="text-sm text-slate-500">{t('services.emptyRecent')}</p>
            ) : (
              <ul className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                {resolved.map((r) => <ResolvedRow key={r.id} item={r} dateLocale={dateLocale} t={t} />)}
              </ul>
            )}
          </section>
        </main>
      </div>

      <ScheduleServiceForm isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />

      <ConfirmModal
        isOpen={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (!confirmAction) return
          if (confirmAction.kind === 'approve') approveM.mutate(confirmAction.req.id)
          else                                  rejectM.mutate(confirmAction.req.id)
        }}
        title={confirmAction?.kind === 'approve'
          ? t('services.approveConfirmTitle')
          : t('services.rejectConfirmTitle')}
        message={confirmAction?.kind === 'approve'
          ? t('services.approveConfirmBody').replace(
              '{{date}}',
              confirmAction.req.requested_for
                ? new Date(confirmAction.req.requested_for).toLocaleString()
                : '—'
            )
          : t('services.rejectConfirmBody')}
        confirmText={confirmAction?.kind === 'approve'
          ? t('services.approveButton')
          : t('services.rejectButton')}
        cancelText={t('common.cancel')}
        type={confirmAction?.kind === 'reject' ? 'danger' : 'info'}
      />
    </div>
  )
}

function PendingCard({
  req, onApprove, onReject, dateLocale, t
}: {
  req: PendingRequest
  onApprove: () => void
  onReject: () => void
  dateLocale: DateFnsLocale
  t: (k: string) => string
}) {
  const dateStr = req.requested_for
    ? format(new Date(req.requested_for), "EEEE d MMM, HH:mm", { locale: dateLocale })
    : '—'
  const relative = req.requested_for
    ? formatDistanceToNow(new Date(req.requested_for), { addSuffix: true, locale: dateLocale })
    : ''

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{req.service_type}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('services.requestedByLabel')
              .replace('{{name}}', req.requested_by_name ?? '—')
              .replace('{{church}}', req.church_name ?? '—')}
          </p>
          <p className="text-sm text-slate-700 mt-2">
            {t('services.requestedForLabel').replace('{{date}}', `${dateStr} (${relative})`)}
          </p>
          {req.notes && (
            <p className="text-xs text-slate-500 mt-2 italic">"{req.notes}"</p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
        <Button onClick={onReject} variant="blueOutline" className="gap-1">
          <XCircle className="w-4 h-4" /> {t('services.rejectButton')}
        </Button>
        <Button onClick={onApprove} variant="blue" className="gap-1">
          <CheckCircle2 className="w-4 h-4" /> {t('services.approveButton')}
        </Button>
      </div>
    </div>
  )
}

function ResolvedRow({
  item, dateLocale, t
}: {
  item: RecentResolved
  dateLocale: DateFnsLocale
  t: (k: string) => string
}) {
  const reviewedRelative = item.reviewed_at
    ? formatDistanceToNow(new Date(item.reviewed_at), { addSuffix: true, locale: dateLocale })
    : ''
  const Icon = item.status === 'approved' ? CheckCircle2 : XCircle
  const iconCls = item.status === 'approved' ? 'text-emerald-600' : 'text-red-500'
  const verb = item.status === 'approved'
    ? t('services.statusApprovedBy')
    : t('services.statusRejectedBy')
  const verbFilled = verb
    .replace('{{reviewer}}', item.reviewed_by_name ?? '—')
    .replace('{{relative}}', reviewedRelative)

  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconCls}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">{item.service_type}</p>
        <p className="text-xs text-slate-500">
          {t('services.requestedByLabel')
            .replace('{{name}}', item.requested_by_name ?? '—')
            .replace('{{church}}', item.church_name ?? '—')}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{verbFilled}</p>
      </div>
    </li>
  )
}
