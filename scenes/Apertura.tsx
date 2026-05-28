'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

const TITLE_WORDS = ['RAG', '·', 'Embeddings', '·', 'Multimodal']

function useBackgroundNumbers() {
  return useMemo(() => {
    const out: { x: number; y: number; v: number; delay: number; duration: number }[] = []
    for (let i = 0; i < 80; i++) {
      out.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        v: Math.random() * 2 - 1,
        delay: Math.random() * 6,
        duration: 8 + Math.random() * 8,
      })
    }
    return out
  }, [])
}

export default function Apertura() {
  const numbers = useBackgroundNumbers()

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 40%, rgba(232, 176, 74, 0.10) 0%, rgba(200, 85, 61, 0.04) 40%, transparent 80%)',
        }}
      />

      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        {numbers.map((n, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 0.08, 0.04, 0], y: [-4, 4, -4] }}
            transition={{
              duration: n.duration,
              delay: n.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute font-mono text-[10px] tabular-nums text-[var(--color-fg)]"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            {n.v >= 0 ? ' ' : ''}
            {n.v.toFixed(3)}
          </motion.span>
        ))}
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
        }}
        className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-12 text-center"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: -8 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
          }}
          className="text-xs uppercase tracking-[0.35em] text-[var(--color-muted)]"
        >
          Centinel · Lima · 2026
        </motion.div>

        <h1 className="mt-10 flex flex-wrap items-baseline justify-center gap-x-5 gap-y-1 text-7xl font-semibold leading-[0.95] tracking-tight">
          {TITLE_WORDS.map((w, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } },
              }}
              className={w === '·' ? 'text-[var(--color-accent)]' : ''}
            >
              {w}
            </motion.span>
          ))}
        </h1>

        <motion.p
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
          }}
          className="mt-8 text-xl text-[var(--color-muted)]"
        >
          Una exploración con comida peruana
        </motion.p>

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.5, delay: 0.3 } },
          }}
          className="mt-24 flex items-center gap-3 font-mono text-xs text-[var(--color-muted)]"
        >
          <span>presioná</span>
          <motion.kbd
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1"
          >
            →
          </motion.kbd>
          <span>para empezar</span>
        </motion.div>
      </motion.div>
    </div>
  )
}
