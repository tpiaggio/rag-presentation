'use client'

import { EVENT_NAME } from '@/lib/event'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LanguageSelector } from '@/components/LanguageSelector'
import { useLanguage } from '@/lib/useLanguage'

type DriftNumber = { x: number; y: number; v: number; delay: number; duration: number; size: number }

export default function UnlockPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [numbers, setNumbers] = useState<DriftNumber[]>([])
  const [passcode, setPasscode] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>()

  useEffect(() => {
    const out: DriftNumber[] = []
    for (let i = 0; i < 80; i++) {
      out.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        v: Math.random() * 2 - 1,
        delay: Math.random() * 6,
        duration: 8 + Math.random() * 8,
        size: 9 + Math.random() * 3,
      })
    }
    setNumbers(out)
  }, [])

  async function submit() {
    if (!passcode.trim()) return
    setStatus('submitting')
    setErrorMessage(undefined)
    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ passcode }),
      })
      if (!res.ok) {
        setStatus('error')
        setErrorMessage(res.status === 401 ? t('unlock.error') : `Error ${res.status}`)
        return
      }
      router.replace('/')
    } catch (e) {
      setStatus('error')
      setErrorMessage(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg)]">
      <div className="pointer-events-auto fixed right-4 top-4 z-50">
        <LanguageSelector />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(50% 45% at 50% 45%, rgba(200, 85, 61, 0.10) 0%, rgba(232, 176, 74, 0.04) 50%, transparent 80%)',
        }}
      />

      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        {numbers.map((n, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.10, 0.04, 0], y: [-5, 5, -5] }}
            transition={{
              duration: n.duration,
              delay: n.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute font-mono tabular-nums text-[var(--color-fg)]"
            style={{ left: `${n.x}%`, top: `${n.y}%`, fontSize: `${n.size}px` }}
          >
            {n.v >= 0 ? ' ' : ''}
            {n.v.toFixed(3)}
          </motion.span>
        ))}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(250,250,247,0.7) 0%, transparent 20%, transparent 80%, rgba(250,250,247,0.7) 100%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-8 text-center"
      >
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-[var(--color-muted)]">
          <span className="size-1.5 rounded-full bg-[#4285F4]" />
          <span className="size-1.5 rounded-full bg-[#EA4335]" />
          <span className="size-1.5 rounded-full bg-[#FBBC04]" />
          <span className="size-1.5 rounded-full bg-[#34A853]" />
          <span className="ml-2">{EVENT_NAME}</span>
        </div>

        <h1 className="mt-10 text-4xl font-semibold tracking-tight">
          {t('unlock.title')}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {t('unlock.subtitle')}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
          className="mt-10 flex w-full flex-col gap-3"
        >
          <input
            type="password"
            autoFocus
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder={t('unlock.placeholder')}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-center text-base outline-none focus:border-[var(--color-accent)]"
            disabled={status === 'submitting'}
          />
          <button
            type="submit"
            disabled={!passcode.trim() || status === 'submitting'}
            className="rounded-md bg-[var(--color-fg)] px-5 py-3 text-sm font-medium text-white disabled:opacity-40"
          >
            {status === 'submitting' ? t('unlock.submitting') : t('unlock.button')}
          </button>
          {status === 'error' && errorMessage && (
            <div className="text-xs text-[var(--color-accent)]">{errorMessage}</div>
          )}
        </form>

        <div className="mt-16 max-w-sm text-xs leading-relaxed text-[var(--color-muted)]">
          {t('unlock.footer')}{' '}
          <a
            href="https://linkedin.com/in/tomas-piaggio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] hover:underline"
          >
            {t('unlock.footer-cta')}
          </a>{' '}
          {t('unlock.footer-end')}
        </div>
      </motion.div>
    </div>
  )
}
