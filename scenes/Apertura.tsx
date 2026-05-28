'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import { MorphingText } from '@/components/MorphingText'

function useBackgroundNumbers() {
  return useMemo(() => {
    const out: { x: number; y: number; v: number; delay: number; duration: number; size: number }[] = []
    for (let i = 0; i < 140; i++) {
      out.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        v: Math.random() * 2 - 1,
        delay: Math.random() * 8,
        duration: 9 + Math.random() * 10,
        size: 9 + Math.random() * 4,
      })
    }
    return out
  }, [])
}

export default function Apertura() {
  const numbers = useBackgroundNumbers()

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      mouseX.set((e.clientX - cx) / cx)
      mouseY.set((e.clientY - cy) / cy)
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [mouseX, mouseY])

  const parallaxX = useTransform(springX, [-1, 1], [12, -12])
  const parallaxY = useTransform(springY, [-1, 1], [12, -12])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg)]">
      <motion.div
        aria-hidden
        animate={{
          background: [
            'radial-gradient(60% 55% at 50% 40%, rgba(232, 176, 74, 0.16) 0%, rgba(200, 85, 61, 0.06) 45%, transparent 80%)',
            'radial-gradient(70% 60% at 55% 45%, rgba(200, 85, 61, 0.14) 0%, rgba(122, 143, 58, 0.06) 50%, transparent 80%)',
            'radial-gradient(60% 55% at 45% 38%, rgba(232, 176, 74, 0.16) 0%, rgba(200, 85, 61, 0.06) 45%, transparent 80%)',
          ],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-0"
      />

      <motion.div
        aria-hidden
        style={{ x: parallaxX, y: parallaxY }}
        className="pointer-events-none absolute inset-0 select-none"
      >
        {numbers.map((n, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.14, 0.06, 0], y: [-6, 6, -6] }}
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
      </motion.div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(250,250,247,0.7) 0%, transparent 20%, transparent 80%, rgba(250,250,247,0.7) 100%)',
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-12 text-center">
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

        <h1 className="mt-12 text-[clamp(3rem,9vw,8.5rem)] font-semibold leading-[0.95] tracking-tight">
          <MorphingText
            text="Más allá del texto"
            cyclesPerChar={16}
            intervalMs={40}
            staggerMs={60}
            startDelayMs={600}
          />
        </h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 2.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="mt-10 h-px w-32 origin-center bg-[var(--color-accent)]"
        />

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.6 }}
          className="mt-8 text-2xl text-[var(--color-fg)]"
        >
          RAG Multimodal con{' '}
          <span className="font-semibold text-[#EA4335]">Gemini</span>
          {' '}y{' '}
          <span className="font-semibold text-[#F57C00]">Firestore</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.85 }}
          className="mt-4 max-w-2xl text-base text-[var(--color-muted)]"
        >
          Una exploración con comida peruana
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 3.4 }}
          className="mt-20 flex items-center gap-3 font-mono text-xs text-[var(--color-muted)]"
        >
          <span>presioná</span>
          <motion.kbd
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1"
          >
            →
          </motion.kbd>
          <span>para empezar</span>
        </motion.div>
      </div>
    </div>
  )
}
