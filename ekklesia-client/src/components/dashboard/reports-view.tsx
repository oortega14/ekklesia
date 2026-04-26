import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { useAuthStore, ROLE_LABELS, type AuthUser } from '@/lib/auth/store'
import {
  getAttendanceReport,
  getContributionsReport,
  downloadAttendanceCsv,
  downloadContributionsCsv,
  type ReportFilters,
  type ReportPeriod
} from '@/lib/api/reports'
import { listChurches } from '@/lib/api/churches'
import { Download, AlertCircle } from 'lucide-react'

type Tab = 'attendance' | 'contributions'

type Role = AuthUser['role']

interface ReportsViewProps {
  role: Role
}

const PERIOD_OPTIONS: ReadonlyArray<{ value: ReportPeriod; labelKey: string }> = [
  { value: 'this_month',   labelKey: 'reports.periodThisMonth' },
  { value: 'this_quarter', labelKey: 'reports.periodThisQuarter' },
  { value: 'this_year',    labelKey: 'reports.periodThisYear' }
]

const SERVICE_TYPES = ['Culto Dominical', 'Reunión Especial', 'Estudio Bíblico'] as const
const CONTRIBUTION_TYPES = ['Tithe', 'Offering', 'Donation', 'Firstfruit', 'Covenant'] as const

export function ReportsView({ role }: ReportsViewProps) {
  const { t } = useI18n()
  const { user } = useAuthStore()

  const [activeTab, setActiveTab]   = useState<Tab>('attendance')
  const [period, setPeriod]         = useState<ReportPeriod>('this_month')
  const [churchId, setChurchId]     = useState<number | ''>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)

  // Reset the type filter whenever the tab changes (service_type and
  // contribution_type don't share values).
  useEffect(() => {
    setTypeFilter('')
  }, [activeTab])

  const showChurchFilter = role === 'superadmin' || role === 'lead_pastor'

  const filters: ReportFilters = useMemo(() => ({
    period,
    church_id: churchId === '' ? undefined : churchId,
    type:      typeFilter || undefined
  }), [period, churchId, typeFilter])

  const attendanceQ = useQuery({
    queryKey: ['reports', 'attendance', filters],
    queryFn:  () => getAttendanceReport(filters),
    enabled:  activeTab === 'attendance'
  })
  const contributionsQ = useQuery({
    queryKey: ['reports', 'contributions', filters],
    queryFn:  () => getContributionsReport(filters),
    enabled:  activeTab === 'contributions'
  })
  const churchesQ = useQuery({
    queryKey: ['churches'],
    queryFn:  () => listChurches({ perPage: 100 }),
    enabled:  showChurchFilter
  })

  const handleExport = async () => {
    try {
      setIsExporting(true)
      if (activeTab === 'attendance') {
        await downloadAttendanceCsv(filters)
      } else {
        await downloadContributionsCsv(filters)
      }
    } finally {
      setIsExporting(false)
    }
  }

  const typeOptions = activeTab === 'attendance' ? SERVICE_TYPES : CONTRIBUTION_TYPES

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role={role} />

      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title={t('reports.title')}
          userName={user?.full_name ?? ''}
          userRole={ROLE_LABELS[user?.role ?? ''] ?? ''}
        />

        <main className="p-6 bg-white">
          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-slate-200">
            {(['attendance', 'contributions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab === 'attendance' ? t('reports.tabAttendance') : t('reports.tabContributions')}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-end gap-3 mb-6"
          >
            {/* Period */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">{t('reports.filterPeriod')}</label>
              <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-300">
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPeriod(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      period === opt.value ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t(opt.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Church */}
            {showChurchFilter && (
              <div className="flex flex-col gap-1 min-w-[200px]">
                <label className="text-xs font-medium text-slate-500">{t('reports.filterChurch')}</label>
                <select
                  value={churchId}
                  onChange={(e) => setChurchId(e.target.value ? Number(e.target.value) : '')}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <option value="">{t('reports.filterAllChurches')}</option>
                  {(churchesQ.data ?? []).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Type */}
            <div className="flex flex-col gap-1 min-w-[200px]">
              <label className="text-xs font-medium text-slate-500">
                {activeTab === 'attendance' ? t('reports.filterServiceType') : t('reports.filterContributionType')}
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="">{t('reports.filterAllTypes')}</option>
                {typeOptions.map((typeName) => (
                  <option key={typeName} value={typeName}>{typeName}</option>
                ))}
              </select>
            </div>

            <div className="flex-1" />

            <Button
              onClick={handleExport}
              variant="blue"
              className="gap-2"
              disabled={isExporting}
            >
              <Download className="w-4 h-4" />
              {isExporting ? t('reports.exporting') : t('reports.exportCsv')}
            </Button>
          </motion.div>

          {/* Body */}
          {activeTab === 'attendance'
            ? <AttendanceTab query={attendanceQ} t={t} />
            : <ContributionsTab query={contributionsQ} t={t} />}
        </main>
      </div>
    </div>
  )
}

// Attendance tab

type AttendanceQuery = ReturnType<typeof useQuery<Awaited<ReturnType<typeof getAttendanceReport>>, Error>>

function AttendanceTab({ query, t }: { query: AttendanceQuery; t: (k: string) => string }) {
  if (query.isLoading) return <div className="p-6 text-slate-500">{t('reports.loading')}</div>
  if (query.error)     return <div className="p-6 text-red-700">{t('reports.error')}</div>

  const data = query.data
  if (!data || data.rows.length === 0) {
    return <div className="p-6 text-slate-500">{t('reports.empty')}</div>
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard label={t('reports.summaryTotalRecords')}      value={data.summary.total_count.toLocaleString()} />
        <SummaryCard label={t('reports.summaryTotalAttendance')}   value={data.summary.total_attendance.toLocaleString()} />
        <SummaryCard label={t('reports.summaryAveragePerService')} value={data.summary.average_per_service.toLocaleString()} />
      </div>

      {data.truncated && (
        <div className="mb-4 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4" />
          {t('reports.truncated')}
        </div>
      )}

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
              <tr>
                <Th>{t('reports.colService')}</Th>
                <Th>{t('reports.colServiceType')}</Th>
                <Th>{t('reports.colChurch')}</Th>
                <Th>{t('reports.colDate')}</Th>
                <Th align="right">{t('reports.colAdults')}</Th>
                <Th align="right">{t('reports.colYouth')}</Th>
                <Th align="right">{t('reports.colChildren')}</Th>
                <Th align="right">{t('reports.colTotal')}</Th>
                <Th>{t('reports.colReportedBy')}</Th>
                <Th>{t('reports.colSubmittedAt')}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <Td>#{r.service_id}</Td>
                  <Td>{r.service_type}</Td>
                  <Td>{r.church_name ?? '—'}</Td>
                  <Td>{formatDate(r.scheduled_at)}</Td>
                  <Td align="right">{r.adults}</Td>
                  <Td align="right">{r.youth}</Td>
                  <Td align="right">{r.children}</Td>
                  <Td align="right" bold>{r.total}</Td>
                  <Td>{r.reported_by_name ?? '—'}</Td>
                  <Td>{formatDate(r.submitted_at)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// Contributions tab

type ContributionsQuery = ReturnType<typeof useQuery<Awaited<ReturnType<typeof getContributionsReport>>, Error>>

function ContributionsTab({ query, t }: { query: ContributionsQuery; t: (k: string) => string }) {
  if (query.isLoading) return <div className="p-6 text-slate-500">{t('reports.loading')}</div>
  if (query.error)     return <div className="p-6 text-red-700">{t('reports.error')}</div>

  const data = query.data
  if (!data || data.rows.length === 0) {
    return <div className="p-6 text-slate-500">{t('reports.empty')}</div>
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard label={t('reports.summaryTotalRecords')} value={data.summary.total_count.toLocaleString()} />
        <SummaryCard label={t('reports.summaryTotalAmount')}  value={`$${data.summary.total_amount.toLocaleString()}`} />
        <BreakdownCard label={t('reports.summaryBreakdownByType')} items={data.summary.breakdown_by_type} t={t} />
      </div>

      {data.truncated && (
        <div className="mb-4 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4" />
          {t('reports.truncated')}
        </div>
      )}

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
              <tr>
                <Th>{t('reports.colService')}</Th>
                <Th>{t('reports.colServiceType')}</Th>
                <Th>{t('reports.colChurch')}</Th>
                <Th>{t('reports.colDate')}</Th>
                <Th>{t('reports.colType')}</Th>
                <Th align="right">{t('reports.colAmount')}</Th>
                <Th>{t('reports.colReportedBy')}</Th>
                <Th>{t('reports.colSubmittedAt')}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <Td>#{r.service_id}</Td>
                  <Td>{r.service_type}</Td>
                  <Td>{r.church_name ?? '—'}</Td>
                  <Td>{formatDate(r.scheduled_at)}</Td>
                  <Td>{t(`contributionTypes.${r.type}`)}</Td>
                  <Td align="right" bold>${r.amount.toLocaleString()}</Td>
                  <Td>{r.reported_by_name ?? '—'}</Td>
                  <Td>{formatDate(r.submitted_at)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// Tiny helpers

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  )
}

function BreakdownCard({
  label,
  items,
  t
}: {
  label: string
  items: { type: string; amount: number }[]
  t: (k: string) => string
}) {
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
      <p className="text-sm text-slate-500 mb-2">{label}</p>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">—</p>
      ) : (
        <ul className="space-y-1">
          {items.map((it) => (
            <li key={it.type} className="flex justify-between text-sm">
              <span className="text-slate-600">{t(`contributionTypes.${it.type}`)}</span>
              <span className="font-medium text-slate-900">${it.amount.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Th({
  children,
  align = 'left'
}: {
  children: React.ReactNode
  align?: 'left' | 'right' | 'center'
}) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  return (
    <th className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${alignClass}`}>
      {children}
    </th>
  )
}

function Td({
  children,
  align = 'left',
  bold = false
}: {
  children: React.ReactNode
  align?: 'left' | 'right' | 'center'
  bold?: boolean
}) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  const weightClass = bold ? 'font-semibold text-slate-900' : 'text-slate-700'
  return <td className={`px-4 py-3 ${alignClass} ${weightClass}`}>{children}</td>
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}
