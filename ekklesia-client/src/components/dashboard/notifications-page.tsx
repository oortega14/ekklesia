import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { useAuthStore, ROLE_LABELS, type AuthUser } from '@/lib/auth/store'
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  type NotificationKind,
  type NotificationRow
} from '@/lib/api/notifications'
import { useNotificationsStore } from '@/lib/notifications/store'
import { useInterpolate } from '@/lib/notifications/use-interpolate'
import { Check, Trash2, ExternalLink } from 'lucide-react'

type Tab = 'unread' | 'all'
type Role = AuthUser['role']

const KINDS: NotificationKind[] = [
  'ministry_created',
  'service_request_created',
  'service_request_approved',
  'service_request_rejected',
  'attendance_report_submitted',
  'contribution_recorded',
  'user_created',
  'church_created'
]

export function NotificationsPage({ role }: { role: Role }) {
  const { t } = useI18n()
  const router = useRouter()
  const interpolate = useInterpolate()
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()

  const storeMarkRead = useNotificationsStore((s) => s.markRead)
  const storeMarkAllRead = useNotificationsStore((s) => s.markAllRead)
  const storeRemove = useNotificationsStore((s) => s.remove)

  const [tab, setTab] = useState<Tab>('all')
  const [kind, setKind] = useState<NotificationKind | ''>('')
  const [page, setPage] = useState(1)

  const filters = { unread: tab === 'unread', kind: kind || undefined, page, perPage: 50 }

  const query = useQuery({
    queryKey: ['notifications-page', filters],
    queryFn: () => listNotifications(filters)
  })

  const readMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications-page'] })
  })
  const readAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications-page'] })
  })
  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications-page'] })
  })

  const handleClick = (n: NotificationRow) => {
    void storeMarkRead(n.id)
    readMutation.mutate(n.id)
    const url = (n.payload?.target_url as string | undefined) ?? '/'
    router.navigate({ to: url })
  }

  const handleMarkRead = (id: number) => {
    void storeMarkRead(id)
    readMutation.mutate(id)
  }
  const handleDelete = (id: number) => {
    void storeRemove(id)
    deleteMutation.mutate(id)
  }
  const handleMarkAll = () => {
    void storeMarkAllRead()
    readAllMutation.mutate()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role={role} />
      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title={t('notifications.title')}
          userName={user?.full_name ?? ''}
          userRole={ROLE_LABELS[user?.role ?? ''] ?? ''}
        />
        <main className="p-6 bg-white">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end gap-3 mb-6">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">{t('notifications.title')}</label>
              <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-300">
                {(['unread', 'all'] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => { setTab(value); setPage(1) }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      tab === value ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {value === 'unread' ? t('notifications.tabUnread') : t('notifications.tabAll')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1 min-w-[220px]">
              <label className="text-xs font-medium text-slate-500">Kind</label>
              <select
                value={kind}
                onChange={(e) => { setKind(e.target.value as NotificationKind | ''); setPage(1) }}
                className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm"
              >
                <option value="">{t('notifications.filterAllKinds')}</option>
                {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            <div className="flex-1" />

            <Button onClick={handleMarkAll} variant="blueOutline" className="gap-2">
              <Check className="w-4 h-4" /> {t('notifications.markAllRead')}
            </Button>
          </motion.div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            {query.isLoading && <div className="p-6 text-slate-500">…</div>}
            {query.error && <div className="p-6 text-red-700">Error</div>}
            {!query.isLoading && !query.error && (query.data?.notifications.length ?? 0) === 0 && (
              <div className="p-12 text-center text-slate-500">{t('notifications.empty')}</div>
            )}
            {!query.isLoading && !query.error && (query.data?.notifications.length ?? 0) > 0 && (
              <ul className="divide-y divide-slate-100">
                {query.data!.notifications.map((n) => {
                  const title = interpolate(`notifications.kinds.${n.kind}.title`, n.payload as Record<string, unknown>) || t('notifications.genericFallback')
                  const body  = interpolate(`notifications.kinds.${n.kind}.body`,  n.payload as Record<string, unknown>)
                  return (
                    <li key={n.id} className={`flex items-start gap-3 p-4 hover:bg-slate-50 ${n.read_at ? '' : 'bg-blue-50/40'}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm ${n.read_at ? 'text-slate-700' : 'font-semibold text-slate-900'}`}>{title}</p>
                          {!n.read_at && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                        </div>
                        {body && <p className="text-xs text-slate-500 mt-0.5">{body}</p>}
                        <p className="text-[11px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => handleClick(n)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-700" title={t('notifications.viewAll')}>
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        {!n.read_at && (
                          <button onClick={() => handleMarkRead(n.id)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-700" title={t('notifications.markRead')}>
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(n.id)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-red-600" title={t('notifications.delete')}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {query.data?.meta && query.data.meta.total_pages > 1 && (
            <div className="flex justify-center gap-2 mt-4 text-sm">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40"
              >‹</button>
              <span className="px-3 py-1.5 text-slate-600">{page} / {query.data.meta.total_pages}</span>
              <button
                disabled={page >= query.data.meta.total_pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40"
              >›</button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
