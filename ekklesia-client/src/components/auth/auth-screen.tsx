import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { isAxiosError } from 'axios'
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useI18n, Locale } from "@/lib/i18n"
import { useAuth } from "@/lib/auth/context"
import { useNavigate } from '@tanstack/react-router'

function AnimatedDove({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <motion.path
        d="M50 20 C30 25, 15 40, 20 55 C25 70, 40 75, 50 70 C60 75, 75 70, 80 55 C85 40, 70 25, 50 20 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      <motion.path
        d="M50 70 C50 75, 48 85, 45 90 M50 70 C50 75, 52 85, 55 90"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 1.5, ease: "easeInOut" }}
      />
      <motion.path
        d="M20 55 C10 50, 5 45, 8 40 C12 35, 18 38, 20 45"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.8, ease: "easeInOut" }}
      />
      <motion.path
        d="M80 55 C90 50, 95 45, 92 40 C88 35, 82 38, 80 45"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.8, ease: "easeInOut" }}
      />
      <motion.circle
        cx="42"
        cy="38"
        r="2"
        fill="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 2 }}
      />
    </motion.svg>
  )
}

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          }}
          animate={{
            y: [null, -20, 20, -10, 10, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: Math.random() * 2,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  )
}

function LoginLanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const { locale, setLocale, t } = useI18n()

  const languages: { code: Locale; name: string; flag: string }[] = [
    { code: "es", name: t('auth.languageSpanish'), flag: "ES" },
    { code: "en", name: t('auth.languageEnglish'), flag: "EN" },
  ]

  return (
    <div className="absolute top-4 right-4 z-20">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white transition-colors backdrop-blur-sm border border-white/10"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{locale.toUpperCase()}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-10"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-36 bg-[#0f2035]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20"
            >
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => {
                    setLocale(language.code)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    locale === language.code
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-xs font-bold">{language.flag}</span>
                  <span className="text-sm">{language.name}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export function AuthScreen() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const { t } = useI18n()
  const { login, user, isLoading: isAuthLoading } = useAuth()

  useEffect(() => {
    if (isAuthLoading || !user) return
    const roleToPath: Record<string, string> = {
      superadmin: '/superadmin',
      lead_pastor: '/lead-pastor',
      pastor: '/pastor',
      assistant: '/assistant',
    }
    navigate({ to: roleToPath[user.role] ?? '/', replace: true })
  }, [user, isAuthLoading, navigate])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setIsLoading(true)

    try {
      await login(email, password)
    } catch (err) {
      if (isAxiosError(err)) {
        const payload = err.response?.data as { error?: string; errors?: string[] } | undefined
        const apiMessage = payload?.error || payload?.errors?.[0]
        setAuthError(apiMessage || t('auth.invalidCredentials'))
      } else {
        const message = err instanceof Error ? err.message : null
        if (message === 'AUTH_TOKEN_MISSING') {
          setAuthError(t('auth.sessionStartFailed'))
        } else {
          setAuthError(message || t('auth.invalidCredentials'))
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#020817] via-[#06122b] to-[#020617]">
      <LoginLanguageSwitcher />
      <FloatingParticles />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.06)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(255,255,255,0.04)_0%,_transparent_50%)]" />

      <motion.div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
        animate={{ backgroundPosition: ['0px 0px', '50px 50px'] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="backdrop-blur-xl bg-white/[0.08] rounded-3xl border border-white/10 shadow-2xl shadow-black/20 p-8 md:p-10">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex justify-center mb-4">
              <motion.div
                className="relative"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255, 255, 255, 0.12)',
                    '0 0 36px rgba(255, 255, 255, 0.2)',
                    '0 0 20px rgba(255, 255, 255, 0.12)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 flex items-center justify-center border border-white/20">
                  <AnimatedDove className="w-12 h-12 text-white/90" />
                </div>
              </motion.div>
            </div>

            <motion.h1
              className="text-2xl font-bold text-white mb-2 tracking-tight"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {t("auth.loginTitle")}
            </motion.h1>
            <motion.p
              className="text-white/75 text-sm"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {t("auth.loginSubtitle")}
            </motion.p>
          </motion.div>

          <form onSubmit={handleAuth} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <label className="block text-sm font-medium text-white/80 mb-2">
                {t("auth.email")}
              </label>
              <div className="relative group">
                <AnimatePresence>
                  {focusedField === 'email' && (
                    <motion.div
                      className="absolute -inset-0.5 bg-white/25 rounded-xl blur opacity-75"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.75 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/55 transition-colors group-focus-within:text-white" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder={t('auth.emailPlaceholder')}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border-white/15 rounded-xl text-white placeholder:text-white/40 focus:border-white/60 focus:bg-white/10 transition-all duration-300"
                    required
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label className="block text-sm font-medium text-white/80 mb-2">
                {t("auth.password")}
              </label>
              <div className="relative group">
                <AnimatePresence>
                  {focusedField === 'password' && (
                    <motion.div
                      className="absolute -inset-0.5 bg-white/25 rounded-xl blur opacity-75"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.75 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/55 transition-colors group-focus-within:text-white" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="w-full pl-12 pr-12 py-3 bg-white/5 border-white/15 rounded-xl text-white placeholder:text-white/40 focus:border-white/60 focus:bg-white/10 transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/55 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center justify-between text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-4 h-4 border border-white/30 rounded bg-white/5 peer-checked:bg-white peer-checked:border-white transition-all" />
                  <motion.div className="absolute inset-0 flex items-center justify-center text-[#0a1628] opacity-0 peer-checked:opacity-100" initial={false}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                </div>
                <span className="text-white/65 group-hover:text-white/85 transition-colors">{t("auth.rememberMe")}</span>
              </label>
              <button type="button" className="text-white/75 hover:text-white transition-colors">
                {t("auth.forgotPassword")}
              </button>
            </motion.div>

            {authError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm text-center"
              >
                {authError}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-white hover:bg-white/90 text-[#0a1628] font-semibold rounded-xl shadow-lg shadow-black/25 transition-all duration-300 hover:shadow-black/35 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <motion.div
                        className="w-5 h-5 border-2 border-[#0a1628]/30 border-t-[#0a1628] rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>{t("common.loading")}</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>{t('auth.signIn')}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </form>
        </div>

        <motion.p
          className="text-center text-white/50 text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          &copy; {new Date().getFullYear()} {t("auth.loginTitle")}
        </motion.p>
      </motion.div>
    </div>
  )
}
