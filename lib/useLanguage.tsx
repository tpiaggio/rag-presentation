'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { type Language, LANGUAGES, setLanguageCookie, setLanguageInURL, getLanguageFromURL, getLanguageFromCookie, t } from './i18n'

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const urlLang = getLanguageFromURL()
    const cookieLang = getLanguageFromCookie()
    const detected = urlLang || cookieLang || 'es'

    setLanguageState(detected)
    setMounted(true)
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    setLanguageCookie(lang)
    setLanguageInURL(lang)
  }

  const translate = (key: string) => t(key, language)

  if (!mounted) return <>{children}</>

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translate }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    return {
      language: 'es' as Language,
      setLanguage: () => {},
      t: (key: string) => key,
    }
  }
  return context
}
