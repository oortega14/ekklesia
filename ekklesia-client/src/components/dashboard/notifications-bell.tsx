import { useMemo, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Bell, Check, Trash2 } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import { useI18n } from '@/lib/i18n'
import { useAuthStore } from '@/lib/auth/store'
import { useNotificationsStore } from '@/lib/notifications/store'
import { useInterpolate } from '@/lib/notifications/use-interpolate'
import type { NotificationRow } from '@/lib/api/notifications'

export function NotificationsBell() {
  const { t } = useI18n()
  const router = useRouter()
  const interpolate = useInterpolate()
  const user = useAuthStore((s) => s.user)
  const items = useNotificationsStore((s) => s.items)
  const unreadCount = useNotificationsStore((s) => s.unreadCount)
  const markRead = useNotificationsStore((s) => s.markRead)
  const markAllRead = useNotificationsStore((s) => s.markAllRead)
  const remove = useNotificationsStore((s) => s.remove)

  const [tab, setTab] = useState<'unread' | 'all'>('unread')
  const [open, setOpen] = useState(false)

  const visibleItems = useMemo(() => {
    return tab === 'unread' ? items.filter((i) => !i.read_at) : items
  }, [items, tab])

  const handleClick = (n: NotificationRow) => {
    void markRead(n.id)
    const url = (n.payload?.target_url as string | undefined) ?? '/'
    setOpen(false)
    router.navigate({ to: url })
  }

  const seeAllUrl = user ? `/${rolePath(user.role)}/notifications` : '/'

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="w-96 max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-50"
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">{t('notifications.title')}</h3>
            <div className="flex items-center bg-slate-100 rounded-lg p-1 text-xs">
              {(['unread', 'all'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setTab(value)}
                  className={`px-2 py-1 rounded-md font-medium transition-colors ${
                    tab === value ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {value === 'unread' ? t('notifications.tabUnread') : t('notifications.tabAll')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {visibleItems.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">{t('notifications.empty')}</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {visibleItems.map((n) => {
                  const titleKey = `notifications.kinds.${n.kind}.title`
                  const bodyKey  = `notifications.kinds.${n.kind}.body`
                  const title = interpolate(titleKey, n.payload as Record<string, unknown>) || t('notifications.genericFallback')
                  const body  = interpolate(bodyKey,  n.payload as Record<string, unknown>)
                  return (
                    <li key={n.id} className="group hover:bg-slate-50 transition-colors">
                      <button
                        onClick={() => handleClick(n)}
                        className="w-full text-left px-4 py-3 flex flex-col gap-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${n.read_at ? 'text-slate-700' : 'font-semibold text-slate-900'}`}>
                            {title}
                          </p>
                          {!n.read_at && <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                        </div>
                        {body && <p className="text-xs text-slate-500">{body}</p>}
                        <p className="text-[11px] text-slate-400">{relativeTime(n.created_at, t)}</p>
                      </button>
                      <div className="flex items-center justify-end gap-1 px-4 pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.read_at && (
                          <button
                            onClick={(e) => { e.stopPropagation(); void markRead(n.id) }}
                            className="text-xs text-slate-500 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> {t('notifications.markRead')}
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); void remove(n.id) }}
                          className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> {t('notifications.delete')}
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between p-3 border-t border-slate-200 bg-slate-50">
            <button
              onClick={() => void markAllRead()}
              disabled={unreadCount === 0}
              className="text-xs text-slate-600 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('notifications.markAllRead')}
            </button>
            <button
              onClick={() => { setOpen(false); router.navigate({ to: seeAllUrl }) }}
              className="text-xs font-medium text-blue-700 hover:underline"
            >
              {t('notifications.viewAll')}
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function rolePath(role: string): string {
  const map: Record<string, string> = {
    superadmin: 'superadmin',
    lead_pastor: 'lead-pastor',
    pastor: 'pastor',
    assistant: 'assistant'
  }
  return map[role] ?? role
}

function relativeTime(iso: string, t: (k: string) => string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(ms / 60_000)
  const hours = Math.floor(ms / 3_600_000)
  const days = Math.floor(ms / 86_400_000)
  if (minutes < 1) return t('notifications.relativeJustNow')
  if (minutes < 60) return t('notifications.relativeMinutes').replace('{{n}}', String(minutes))
  if (hours < 24) return t('notifications.relativeHours').replace('{{n}}', String(hours))
  return t('notifications.relativeDays').replace('{{n}}', String(days))
}
