'use client'

import { useLanguage } from '@/lib/useLanguage'
import { LANGUAGES, type Language } from '@/lib/i18n'
import { useState } from 'react'

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage()
  const [open, setOpen] = useState(false)

  return (
    <div className="pointer-events-auto relative">
      <button
        onClick={() => setOpen(!open)}
        className="group flex h-6 w-6 items-center justify-center rounded text-xs font-semibold text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/10"
        aria-label={t('ui.language')}
        title={t('ui.language')}
      >
        {language.toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 top-8 mt-1 rounded bg-[var(--color-surface)] ring-1 ring-[var(--color-border)] shadow-lg z-50">
          {(Object.keys(LANGUAGES) as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang)
                setOpen(false)
              }}
              className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                language === lang
                  ? 'bg-[var(--color-accent)]/10 font-semibold text-[var(--color-accent)]'
                  : 'text-[var(--color-text)] hover:bg-[var(--color-accent)]/5'
              }`}
            >
              {LANGUAGES[lang].nativeName}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
