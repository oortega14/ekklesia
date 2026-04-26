import { useEffect } from 'react'
import { useAuthStore } from '@/lib/auth/store'
import { useI18n, type Locale } from '@/lib/i18n'

const VALID: Locale[] = ['es', 'en']

export function LocaleSync() {
  const userLocale = useAuthStore((s) => s.user?.locale)
  const { locale, setLocale } = useI18n()

  useEffect(() => {
    if (!userLocale) return
    if (!VALID.includes(userLocale as Locale)) return
    if (userLocale === locale) return
    setLocale(userLocale as Locale)
  }, [userLocale, locale, setLocale])

  return null
}
