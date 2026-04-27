import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { es as esLocale, enUS as enLocale } from 'date-fns/locale'
import type { Locale as DateFnsLocale } from 'date-fns'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { UpcomingServicesList } from '@/components/dashboard/upcoming-services-list'
import { ServiceRequestForm } from '@/components/dashboard/service-request-form'
import { useI18n } from '@/lib/i18n'
import { useAuthStore, ROLE_LABELS } from '@/lib/auth/store'
import { getServicesOverview, type MyRequest } from '@/lib/api/services'
import { Plus, CheckCircle2, XCircle, Clock } from 'lucide-react'

export function PastorServicesPage() {
  const { t, locale } = useI18n()
  const user = useAuthStore((s) => s.user)
  const dateLocale: DateFnsLocale = locale === 'en' ? enLocale : esLocale

  const [isFormOpen, setIsFormOpen] = useState(false)

  const overviewQ = useQuery({
    queryKey: ['services-overview'],
    queryFn:  getServicesOverview
  })

  const myRequests       = overviewQ.data?.my_requests ?? []
  const upcomingServices = overviewQ.data?.upcoming_services ?? []

  const subtitle = t('services.subtitlePastor')

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="pastor" />
      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title={t('services.title')}
          userName={user?.full_name ?? ''}
          userRole={ROLE_LABELS[user?.role ?? ''] ?? ''}
        />
        <main className="p-6 bg-white space-y-8">
          <p className="text-sm text-slate-500 -mt-3">{subtitle}</p>

          <section>
            <Button onClick={() => setIsFormOpen(true)} variant="blue" className="gap-2">
              <Plus className="w-4 h-4" /> {t('services.newRequestButton')}
            </Button>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              {t('services.myRequestsHeader')}
            </h2>
            {myRequests.length === 0 ? (
              <p className="text-sm text-slate-500">{t('services.emptyMyRequests')}</p>
            ) : (
              <ul className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                {myRequests.map((r) => <MyRequestRow key={r.id} req={r} dateLocale={dateLocale} t={t} />)}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              {t('services.upcomingServicesHeader')}
            </h2>
            <UpcomingServicesList services={upcomingServices} />
          </section>
        </main>
      </div>

      <ServiceRequestForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  )
}

function MyRequestRow({
  req, dateLocale, t
}: {
  req: MyRequest
  dateLocale: DateFnsLocale
  t: (k: string) => string
}) {
  const reviewedRelative = req.reviewed_at
    ? formatDistanceToNow(new Date(req.reviewed_at), { addSuffix: true, locale: dateLocale })
    : ''
  const helper =
    req.status === 'pending'  ? t('services.statusPendingHelp')
    : req.status === 'approved'
      ? t('services.statusApprovedBy')
          .replace('{{reviewer}}', req.reviewed_by_name ?? '—')
          .replace('{{relative}}', reviewedRelative)
      : t('services.statusRejectedBy')
          .replace('{{reviewer}}', req.reviewed_by_name ?? '—')
          .replace('{{relative}}', reviewedRelative)

  const Icon = req.status === 'pending' ? Clock
             : req.status === 'approved' ? CheckCircle2
             : XCircle

  const iconCls = req.status === 'pending' ? 'text-amber-500'
                : req.status === 'approved' ? 'text-emerald-600'
                : 'text-red-500'

  return (
    <motion.li
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50"
    >
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconCls}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">{req.service_type}</p>
        <p className="text-xs text-slate-500">
          {t('services.requestedForLabel').replace('{{date}}',
            req.requested_for ? new Date(req.requested_for).toLocaleString() : '—'
          )}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{helper}</p>
      </div>
    </motion.li>
  )
}
