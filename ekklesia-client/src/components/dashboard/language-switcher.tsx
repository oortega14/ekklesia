"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Globe, Check } from "lucide-react"
import { useState } from "react"
import { useI18n, Locale } from "@/lib/i18n"

const languages: { code: Locale; name: string; flag: string }[] = [
  { code: "es", name: "Espanol", flag: "ES" },
  { code: "en", name: "English", flag: "EN" },
]

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const { locale, setLocale } = useI18n()

  const currentLanguage = languages.find((l) => l.code === locale)

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">
          {currentLanguage?.flag}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-40 bg-[#0f2035] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
            >
              <div className="p-1">
                {languages.map((language) => (
                  <motion.button
                    key={language.code}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                    onClick={() => {
                      setLocale(language.code)
                      setIsOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors"
                  >
                    <span className="w-8 h-5 rounded bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center text-xs font-bold text-blue-300">
                      {language.flag}
                    </span>
                    <span
                      className={`text-sm flex-1 ${
                        locale === language.code
                          ? "text-white font-medium"
                          : "text-blue-200/70"
                      }`}
                    >
                      {language.name}
                    </span>
                    {locale === language.code && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-blue-400"
                      >
                        <Check className="w-4 h-4" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
