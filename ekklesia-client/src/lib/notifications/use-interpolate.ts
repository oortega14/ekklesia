import { useI18n } from '@/lib/i18n'

export function useInterpolate(): (key: string, vars: Record<string, unknown>) => string {
  const { t } = useI18n()
  return (key, vars) => {
    const template = t(key)
    if (template === key) return ''
    return template.replace(/\{\{(\w+)\}\}/g, (_, name) => String(vars[name] ?? ''))
  }
}
