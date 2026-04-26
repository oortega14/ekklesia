import { createConsumer, type Consumer } from '@rails/actioncable'

let consumer: Consumer | null = null
let currentToken: string | null = null

function cableUrl(token: string): string {
  const base = (import.meta.env.VITE_CABLE_URL as string | undefined) ?? '/cable'
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}token=${encodeURIComponent(token)}`
}

export function getConsumer(token: string | null): Consumer | null {
  if (!token) {
    consumer?.disconnect()
    consumer = null
    currentToken = null
    return null
  }

  if (token !== currentToken) {
    consumer?.disconnect()
    consumer = createConsumer(cableUrl(token))
    currentToken = token
  }

  return consumer
}
