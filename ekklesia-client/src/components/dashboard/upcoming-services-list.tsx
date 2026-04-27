import { useMemo } from 'react'
import { format } from 'date-fns'
import { es as esLocale, enUS as enLocale } from 'date-fns/locale'
import type { Locale as DateFnsLocale } from 'date-fns'
import { CalendarClock, CheckCircle2, AlertCircle } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { UpcomingService } from '@/lib/api/services'

export function UpcomingServicesList({ services }: { services: UpcomingService[] }) {
  const { t, locale } = useI18n()
  const dateLocale: DateFnsLocale = locale === 'en' ? enLocale : esLocale

  const grouped = useMemo(() => {
    const map = new Map<string, UpcomingService[]>()
    for (const svc of services) {
      const key = svc.church_name ?? '—'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(svc)
    }
    return Array.from(map.entries())
  }, [services])

  if (services.length === 0) {
    return <p className="text-sm text-slate-500 py-4">{t('services.emptyUpcoming')}</p>
  }

  return (
    <div className="space-y-4">
      {grouped.map(([churchName, list]) => (
        <div key={churchName}>
          {grouped.length > 1 && (
            <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">{churchName}</h4>
          )}
          <ul className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
            {list.map((svc) => (
              <li key={svc.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <CalendarClock className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{svc.service_type}</p>
                    <p className="text-xs text-slate-500">
                      {svc.scheduled_at
                        ? format(new Date(svc.scheduled_at), "EEE d MMM, HH:mm", { locale: dateLocale })
                        : '—'}
                    </p>
                  </div>
                </div>
                {svc.has_attendance_report
                  ? <Badge color="emerald" icon={CheckCircle2} text={t('services.reportedBadge')} />
                  : <Badge color="amber"   icon={AlertCircle}  text={t('services.notReportedBadge')} />}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function Badge({
  color, icon: Icon, text
}: {
  color: 'emerald' | 'amber'
  icon: React.ComponentType<{ className?: string }>
  text: string
}) {
  const cls = color === 'emerald'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-amber-100 text-amber-700'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls} shrink-0`}>
      <Icon className="w-3 h-3" />
      {text}
    </span>
  )
}
