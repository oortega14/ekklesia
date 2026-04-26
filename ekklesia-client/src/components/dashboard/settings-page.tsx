import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { isAxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { useI18n, type Locale } from '@/lib/i18n'
import { useAuthStore, ROLE_LABELS, type AuthUser } from '@/lib/auth/store'
import { changePassword } from '@/lib/api/auth'
import { updateProfile } from '@/lib/api/users'
import { User as UserIcon, Mail, Phone, Lock, Languages } from 'lucide-react'

type Role = AuthUser['role']

export function SettingsPage({ role }: { role: Role }) {
  const { t, setLocale } = useI18n()
  const user = useAuthStore((s) => s.user)
  const applyTokens = useAuthStore((s) => s.applyTokensFromPasswordChange)
  const updateUserLocally = useAuthStore((s) => s.updateUserLocally)

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role={role} />
      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title={t('settings.title')}
          userName={user.full_name}
          userRole={ROLE_LABELS[user.role] ?? ''}
        />
        <main className="p-6 bg-white">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <ProfileCard
              user={user}
              onSaved={(updated) => updateUserLocally(updated)}
              t={t}
            />
            <SecurityCard
              onSaved={(tokens) => applyTokens(tokens.access_token, tokens.refresh_token)}
              t={t}
            />
            <PreferencesCard
              user={user}
              onSaved={(locale) => {
                setLocale(locale)
                updateUserLocally({ locale })
              }}
              t={t}
            />
          </motion.div>
        </main>
      </div>
    </div>
  )
}

// ── Profile card ───────────────────────────────────────────────────────

function ProfileCard({
  user,
  onSaved,
  t
}: {
  user: AuthUser
  onSaved: (patch: Partial<AuthUser>) => void
  t: (k: string) => string
}) {
  const [firstName, setFirstName] = useState(user.first_name)
  const [lastName, setLastName]   = useState(user.last_name)
  const [phone, setPhone]         = useState(user.phone ?? '')

  const mutation = useMutation({
    mutationFn: () => updateProfile(user.id, {
      first_name: firstName,
      last_name:  lastName,
      phone:      phone || undefined
    }),
    onSuccess: (updated) => {
      onSaved({
        first_name: updated.first_name,
        last_name:  updated.last_name,
        full_name:  updated.full_name,
        phone:      phone || null
      })
      toast.success(t('settings.profileSaved'))
    },
    onError: () => {
      toast.error(t('settings.saveFailed'))
    }
  })

  return (
    <Card title={t('settings.profileTitle')} subtitle={t('settings.profileSubtitle')}>
      <form
        onSubmit={(e: FormEvent) => { e.preventDefault(); mutation.mutate() }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field icon={UserIcon} label={t('settings.firstName')}>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </Field>
          <Field icon={UserIcon} label={t('settings.lastName')}>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field icon={Phone} label={t('settings.phone')}>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </Field>
          <Field icon={Mail} label={t('settings.email')}>
            <input
              value={user.email}
              disabled
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500"
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="blue" disabled={mutation.isPending}>
            {t('settings.saveProfile')}
          </Button>
        </div>
      </form>
    </Card>
  )
}

// ── Security card ─────────────────────────────────────────────────────

function SecurityCard({
  onSaved,
  t
}: {
  onSaved: (tokens: { access_token: string; refresh_token: string }) => void
  t: (k: string) => string
}) {
  const [current, setCurrent] = useState('')
  const [next, setNext]       = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError]     = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => changePassword({ current_password: current, new_password: next }),
    onSuccess: (data) => {
      onSaved(data)
      setCurrent(''); setNext(''); setConfirm(''); setError(null)
      toast.success(t('settings.passwordSaved'))
    },
    onError: (err) => {
      if (isAxiosError(err) && err.response?.status === 401) {
        setError(t('settings.currentPasswordWrong'))
      } else {
        toast.error(t('settings.saveFailed'))
      }
    }
  })

  function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (next.length < 8) {
      setError(t('settings.passwordTooShort'))
      return
    }
    if (next !== confirm) {
      setError(t('settings.passwordsDoNotMatch'))
      return
    }
    mutation.mutate()
  }

  return (
    <Card title={t('settings.securityTitle')} subtitle={t('settings.securitySubtitle')}>
      <form onSubmit={submit} className="space-y-4">
        <Field icon={Lock} label={t('settings.currentPassword')}>
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field icon={Lock} label={t('settings.newPassword')}>
            <input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
              minLength={8}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </Field>
          <Field icon={Lock} label={t('settings.confirmNewPassword')}>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </Field>
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <div className="flex justify-end">
          <Button type="submit" variant="blue" disabled={mutation.isPending}>
            {t('settings.changePasswordBtn')}
          </Button>
        </div>
      </form>
    </Card>
  )
}

// ── Preferences card ──────────────────────────────────────────────────

function PreferencesCard({
  user,
  onSaved,
  t
}: {
  user: AuthUser
  onSaved: (locale: Locale) => void
  t: (k: string) => string
}) {
  const [locale, setLocaleState] = useState<Locale>(user.locale)

  const mutation = useMutation({
    mutationFn: () => updateProfile(user.id, { locale }),
    onSuccess: (updated) => {
      onSaved(updated.locale)
      toast.success(t('settings.preferencesSaved'))
    },
    onError: () => {
      toast.error(t('settings.saveFailed'))
    }
  })

  return (
    <Card title={t('settings.preferencesTitle')} subtitle={t('settings.preferencesSubtitle')}>
      <form
        onSubmit={(e: FormEvent) => { e.preventDefault(); mutation.mutate() }}
        className="space-y-4"
      >
        <Field icon={Languages} label={t('settings.language')}>
          <select
            value={locale}
            onChange={(e) => setLocaleState(e.target.value as Locale)}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </Field>
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="blue"
            disabled={mutation.isPending || locale === user.locale}
          >
            {t('settings.savePreferences')}
          </Button>
        </div>
      </form>
    </Card>
  )
}

// ── Tiny helpers ──────────────────────────────────────────────────────

function Card({
  title,
  subtitle,
  children
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </header>
      {children}
    </section>
  )
}

function Field({
  icon: Icon,
  label,
  children
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        {children}
      </div>
    </div>
  )
}
