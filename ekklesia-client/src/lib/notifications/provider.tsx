import { ReactNode, useEffect } from 'react'
import { useAuthStore } from '@/lib/auth/store'
import { getConsumer } from '@/lib/realtime/cable'
import { useNotificationsStore } from '@/lib/notifications/store'
import type { NotificationRow } from '@/lib/api/notifications'

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const fetchInitial = useNotificationsStore((s) => s.fetchInitial)
  const pushIncoming = useNotificationsStore((s) => s.pushIncoming)
  const reset = useNotificationsStore((s) => s.reset)

  useEffect(() => {
    if (!accessToken) {
      reset()
      return
    }
    void fetchInitial()
    const consumer = getConsumer(accessToken)
    const sub = consumer?.subscriptions.create('NotificationsChannel', {
      received: (data: unknown) => pushIncoming(data as NotificationRow)
    })
    return () => { sub?.unsubscribe() }
  }, [accessToken, fetchInitial, pushIncoming, reset])

  return <>{children}</>
}
