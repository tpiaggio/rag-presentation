'use client'

import { motion } from 'framer-motion'

export default function QuienSoy() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg)]">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
        }}
        className="mx-auto flex max-w-4xl flex-col gap-12 px-12 md:flex-row md:items-center"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, scale: 0.94 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } },
          }}
          className="flex size-44 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-6xl font-semibold tracking-tight text-white"
        >
          TP
        </motion.div>

        <div className="space-y-6">
          <motion.div
            variants={{
              hidden: { opacity: 0, x: -12 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
            }}
            className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]"
          >
            Quién soy
          </motion.div>

          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            className="text-5xl font-semibold tracking-tight"
          >
            Tomás Piaggio
          </motion.h1>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            className="space-y-2 text-base leading-relaxed text-[var(--color-muted)]"
          >
            <div className="flex items-center gap-2 text-[var(--color-fg)]">
              <span className="inline-flex size-5 items-center justify-center rounded-md bg-[#F57C00] text-[10px] font-bold text-white">

              </span>
              <span className="font-semibold">Google Developer Expert</span>
              <span className="text-[var(--color-muted)]">· Firebase</span>
            </div>
            <p className="max-w-xl pt-3">
              Trabajo con vector search y modelos de IA todos los días. Hoy les muestro
              lo que aprendí, usando algo que todos conocemos.
            </p>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            className="flex flex-wrap gap-2 pt-2 text-xs"
          >
            {['embeddings', 'rag', 'multimodal', 'firestore', 'gemini'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 font-mono text-[var(--color-muted)]"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
