import { create } from 'zustand'
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  type NotificationRow
} from '@/lib/api/notifications'

interface NotificationsStoreState {
  items: NotificationRow[]
  unreadCount: number
  isLoading: boolean
  fetchInitial: () => Promise<void>
  pushIncoming: (n: NotificationRow) => void
  markRead: (id: number) => Promise<void>
  markAllRead: () => Promise<void>
  remove: (id: number) => Promise<void>
  reset: () => void
}

const MAX_BELL_ITEMS = 30

export const useNotificationsStore = create<NotificationsStoreState>((set, get) => ({
  items: [],
  unreadCount: 0,
  isLoading: false,

  fetchInitial: async () => {
    set({ isLoading: true })
    try {
      const res = await listNotifications({ perPage: MAX_BELL_ITEMS })
      set({ items: res.notifications, unreadCount: res.unread_count, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  pushIncoming: (n) => {
    const items = get().items
    if (items.some((existing) => existing.id === n.id)) return // dedupe race with REST
    const next = [n, ...items].slice(0, MAX_BELL_ITEMS)
    set({
      items: next,
      unreadCount: get().unreadCount + (n.read_at ? 0 : 1)
    })
  },

  markRead: async (id) => {
    const items = get().items
    const target = items.find((i) => i.id === id)
    if (!target || target.read_at) return
    set({
      items: items.map((i) => (i.id === id ? { ...i, read_at: new Date().toISOString() } : i)),
      unreadCount: Math.max(0, get().unreadCount - 1)
    })
    try {
      await markNotificationRead(id)
    } catch {
      // optimistic; refetch on next mount will reconcile
    }
  },

  markAllRead: async () => {
    const now = new Date().toISOString()
    set({
      items: get().items.map((i) => (i.read_at ? i : { ...i, read_at: now })),
      unreadCount: 0
    })
    try {
      await markAllNotificationsRead()
    } catch {
      // optimistic
    }
  },

  remove: async (id) => {
    const items = get().items
    const target = items.find((i) => i.id === id)
    set({
      items: items.filter((i) => i.id !== id),
      unreadCount: target && !target.read_at ? Math.max(0, get().unreadCount - 1) : get().unreadCount
    })
    try {
      await deleteNotification(id)
    } catch {
      // optimistic
    }
  },

  reset: () => set({ items: [], unreadCount: 0, isLoading: false })
}))
