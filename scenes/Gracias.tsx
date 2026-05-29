'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useMemo } from 'react'
import { MorphingText } from '@/components/MorphingText'

function useDrift() {
  return useMemo(() => {
    const out: { x: number; y: number; v: number; delay: number; duration: number; size: number }[] = []
    for (let i = 0; i < 120; i++) {
      out.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        v: Math.random() * 2 - 1,
        delay: Math.random() * 8,
        duration: 9 + Math.random() * 10,
        size: 9 + Math.random() * 3,
      })
    }
    return out
  }, [])
}

export default function Gracias() {
  const numbers = useDrift()

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg)]">
      <motion.div
        aria-hidden
        animate={{
          background: [
            'radial-gradient(60% 55% at 50% 45%, rgba(200, 85, 61, 0.16) 0%, rgba(232, 176, 74, 0.06) 45%, transparent 80%)',
            'radial-gradient(70% 60% at 50% 50%, rgba(232, 176, 74, 0.14) 0%, rgba(122, 143, 58, 0.06) 50%, transparent 80%)',
            'radial-gradient(60% 55% at 50% 45%, rgba(200, 85, 61, 0.16) 0%, rgba(232, 176, 74, 0.06) 45%, transparent 80%)',
          ],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-0"
      />

      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        {numbers.map((n, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.12, 0.05, 0], y: [-6, 6, -6] }}
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
            'linear-gradient(to bottom, rgba(250,250,247,0.7) 0%, transparent 18%, transparent 82%, rgba(250,250,247,0.7) 100%)',
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[88rem] flex-col items-center px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-[var(--color-muted)]"
        >
          <span className="size-1.5 rounded-full bg-[#4285F4]" />
          <span className="size-1.5 rounded-full bg-[#EA4335]" />
          <span className="size-1.5 rounded-full bg-[#FBBC04]" />
          <span className="size-1.5 rounded-full bg-[#34A853]" />
          <span className="ml-2">Build with AI · OPEN 2026 · Lima</span>
        </motion.div>

        <h1 className="mt-10 whitespace-nowrap text-[clamp(4rem,11vw,11rem)] font-semibold leading-[0.95] tracking-tight">
          <MorphingText
            text="Gracias."
            cyclesPerChar={18}
            intervalMs={40}
            staggerMs={70}
            startDelayMs={500}
          />
        </h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 2.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="mt-10 h-px w-32 origin-center bg-[var(--color-accent)]"
        />

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.5 }}
          className="mt-8 max-w-3xl text-2xl leading-snug text-[var(--color-fg)]"
        >
          El embedding ya aprendió el sabor del ceviche.
          <br />
          <span className="text-[var(--color-muted)]">Lo que viene a continuación lo construyen ustedes.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.85 }}
          className="mt-16 flex items-center gap-5"
        >
          <div className="relative size-20 overflow-hidden rounded-full ring-2 ring-[var(--color-accent)] ring-offset-4 ring-offset-[var(--color-bg)]">
            <Image src="/tomas.jpg" alt="Tomás Piaggio" fill sizes="80px" className="object-cover" />
          </div>
          <div className="text-left">
            <div className="text-xl font-semibold tracking-tight">Tomás Piaggio</div>
            <div className="text-sm text-[var(--color-muted)]">
              Google Developer Expert · Firebase
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <a
                href="https://github.com/tpiaggio/rag-presentation"
                className="text-[var(--color-accent)] hover:underline"
              >
                github.com/tpiaggio/rag-presentation
              </a>
              <span className="text-[var(--color-muted)]">·</span>
              <a
                href="https://www.linkedin.com/in/tpiaggio/"
                className="text-[var(--color-accent)] hover:underline"
              >
                in/tpiaggio
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 3.4 }}
          className="mt-12 text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]"
        >
          Construyan algo · Pregúntenme · Hablemos
        </motion.div>
      </div>
    </div>
  )
}
