import { useMemo, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { isAxiosError } from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format, formatDistanceToNow } from 'date-fns'
import type { Locale as DateFnsLocale } from 'date-fns'
import { es as esLocale, enUS as enLocale } from 'date-fns/locale'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { FormModal } from '@/components/dashboard/form-modal'
import { useI18n } from '@/lib/i18n'
import { useAuthStore, ROLE_LABELS, type AuthUser } from '@/lib/auth/store'
import {
  getAttendanceSubmission,
  submitAttendance,
  type PendingService,
  type RecentReport
} from '@/lib/api/attendance'
import {
  CalendarClock, Church as ChurchIcon, CheckCircle2, FileText,
  User as AdultIcon, Smile as YouthIcon, Baby as ChildIcon
} from 'lucide-react'

type Role = AuthUser['role']

export function AttendanceSubmitPage({ role }: { role: Role }) {
  const { t, locale } = useI18n()
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()

  const dateLocale = locale === 'en' ? enLocale : esLocale

  const submissionQ = useQuery({
    queryKey: ['attendance-submission'],
    queryFn:  getAttendanceSubmission
  })

  const [activeService, setActiveService] = useState<PendingService | null>(null)

  const handleClose = () => setActiveService(null)

  const handleSuccess = () => {
    qc.invalidateQueries({ queryKey: ['attendance-submission'] })
    qc.invalidateQueries({ queryKey: ['stats'] })
    qc.invalidateQueries({ queryKey: ['reports'] })
    toast.success(t('attendance.savedToast'))
    setActiveService(null)
  }

  const pending = submissionQ.data?.pending_services ?? []
  const recents = submissionQ.data?.recent_reports ?? []

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role={role} />
      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title={t('attendance.title')}
          userName={user?.full_name ?? ''}
          userRole={ROLE_LABELS[user?.role ?? ''] ?? ''}
        />
        <main className="p-6 bg-white">
          {submissionQ.isLoading && (
            <div className="p-6 text-slate-500">…</div>
          )}

          {!submissionQ.isLoading && pending.length === 0 && recents.length === 0 && (
            <EmptyState t={t} />
          )}

          {!submissionQ.isLoading && pending.length > 0 && (
            <PendingSection
              services={pending}
              onSelect={setActiveService}
              dateLocale={dateLocale}
              t={t}
            />
          )}

          {!submissionQ.isLoading && recents.length > 0 && (
            <RecentSection reports={recents} dateLocale={dateLocale} t={t} />
          )}
        </main>
      </div>

      {activeService && (
        <SubmitAttendanceModal
          service={activeService}
          isOpen
          onClose={handleClose}
          onSuccess={handleSuccess}
          dateLocale={dateLocale}
          t={t}
        />
      )}
    </div>
  )
}

// ── Pending section ────────────────────────────────────────────────────

function PendingSection({
  services, onSelect, dateLocale, t
}: {
  services: PendingService[]
  onSelect: (s: PendingService) => void
  dateLocale: DateFnsLocale
  t: (k: string) => string
}) {
  const countLabel = services.length === 1
    ? t('attendance.pendingCountSingular')
    : t('attendance.pendingCountPlural').replace('{{n}}', String(services.length))

  return (
    <section className="mb-10">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">{t('attendance.pendingHeader')}</h2>
        <p className="text-sm text-slate-500">{countLabel}</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((svc) => (
          <PendingCard
            key={svc.id}
            service={svc}
            onClick={() => onSelect(svc)}
            dateLocale={dateLocale}
            t={t}
          />
        ))}
      </div>
    </section>
  )
}

function PendingCard({
  service, onClick, dateLocale, t
}: {
  service: PendingService
  onClick: () => void
  dateLocale: DateFnsLocale
  t: (k: string) => string
}) {
  const dateStr = service.scheduled_at
    ? format(new Date(service.scheduled_at), "EEEE d 'de' MMMM, HH:mm", { locale: dateLocale })
    : '—'

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
    >
      <p className="text-base font-semibold text-slate-900 mb-1">{service.service_type}</p>
      <p className="text-sm text-slate-500 capitalize flex items-center gap-1.5 mb-1">
        <CalendarClock className="w-4 h-4 text-slate-400" /> {dateStr}
      </p>
      <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-4">
        <ChurchIcon className="w-4 h-4 text-slate-400" /> {service.church_name ?? '—'}
      </p>
      <span className="inline-flex items-center justify-center w-full px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium">
        {t('attendance.reportButton')} →
      </span>
    </motion.button>
  )
}

// ── Recent reports section ─────────────────────────────────────────────

function RecentSection({
  reports, dateLocale, t
}: {
  reports: RecentReport[]
  dateLocale: DateFnsLocale
  t: (k: string) => string
}) {
  return (
    <section>
      <header className="mb-3">
        <h2 className="text-lg font-semibold text-slate-900">{t('attendance.recentHeader')}</h2>
      </header>
      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
        {reports.map((r) => <RecentRow key={r.id} report={r} dateLocale={dateLocale} t={t} />)}
      </div>
      <p className="mt-3 text-xs text-slate-500">{t('attendance.correctionHint')}</p>
    </section>
  )
}

function RecentRow({
  report, dateLocale, t
}: {
  report: RecentReport
  dateLocale: DateFnsLocale
  t: (k: string) => string
}) {
  const dateStr = report.service_date
    ? formatDistanceToNow(new Date(report.service_date), { addSuffix: true, locale: dateLocale })
    : '—'

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-900">{report.service_type}</p>
          {report.notes && (
            <span title={report.notes} className="inline-flex">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {report.church_name ?? '—'} · {dateStr}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {t('attendance.adults')} {report.adults} · {t('attendance.youth')} {report.youth} · {t('attendance.children')} {report.children}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-2xl font-bold text-slate-900">{report.total}</p>
        <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t('attendance.total')}</p>
      </div>
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────

function EmptyState({ t }: { t: (k: string) => string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
        <CheckCircle2 className="w-9 h-9 text-emerald-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{t('attendance.emptyTitle')}</h3>
      <p className="text-sm text-slate-500">{t('attendance.emptyBody')}</p>
    </div>
  )
}

// ── Submit modal ───────────────────────────────────────────────────────

function SubmitAttendanceModal({
  service, isOpen, onClose, onSuccess, dateLocale, t
}: {
  service: PendingService
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  dateLocale: DateFnsLocale
  t: (k: string) => string
}) {
  const [adults, setAdults]     = useState<number | ''>('')
  const [youth, setYouth]       = useState<number | ''>('')
  const [children, setChildren] = useState<number | ''>('')
  const [notes, setNotes]       = useState('')

  const total = useMemo(() => {
    const a = typeof adults === 'number' ? adults : 0
    const y = typeof youth === 'number' ? youth : 0
    const c = typeof children === 'number' ? children : 0
    return a + y + c
  }, [adults, youth, children])

  const mutation = useMutation({
    mutationFn: () => submitAttendance({
      service_id: service.id,
      adults:     typeof adults === 'number' ? adults : 0,
      youth:      typeof youth  === 'number' ? youth  : 0,
      children:   typeof children === 'number' ? children : 0,
      notes:      notes.trim() || undefined
    }),
    onSuccess,
    onError: (err) => {
      if (isAxiosError(err) && err.response?.status === 422) {
        toast.error(t('attendance.saveFailedToast'))
      } else {
        toast.error(t('attendance.saveFailedToast'))
      }
    }
  })

  const dateStr = service.scheduled_at
    ? format(new Date(service.scheduled_at), "EEEE d 'de' MMMM, HH:mm", { locale: dateLocale })
    : '—'

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => mutation.mutate()}
      title={service.service_type}
      subtitle={`${dateStr} · ${service.church_name ?? '—'}`}
      icon={<CalendarClock className="w-6 h-6" />}
      submitText={mutation.isPending ? t('attendance.saving') : t('attendance.saveButton')}
      cancelText={t('attendance.cancelButton')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <NumberField
          icon={AdultIcon}
          label={t('attendance.adults')}
          value={adults}
          onChange={setAdults}
        />
        <NumberField
          icon={YouthIcon}
          label={t('attendance.youth')}
          value={youth}
          onChange={setYouth}
        />
        <NumberField
          icon={ChildIcon}
          label={t('attendance.children')}
          value={children}
          onChange={setChildren}
        />

        <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-slate-500">{t('attendance.total')}</span>
          <span className="text-3xl font-bold text-slate-900">{total}</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            {t('attendance.notesLabel')}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('attendance.notesPlaceholder')}
            maxLength={500}
            rows={3}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
      </form>
    </FormModal>
  )
}

function NumberField({
  icon: Icon, label, value, onChange
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | ''
  onChange: (v: number | '') => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          required
          value={value}
          onChange={(e) => {
            const raw = e.target.value
            if (raw === '') { onChange(''); return }
            const n = Number(raw)
            if (Number.isInteger(n) && n >= 0) onChange(n)
          }}
          className="w-full pl-10 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-base font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>
    </div>
  )
}
