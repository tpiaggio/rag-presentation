'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/cn'

type Stage = 'idle' | 'reading' | 'chunking' | 'embedding' | 'storing' | 'done' | 'error'

export function IndexingAnimation({
  stage,
  embeddingPreview,
  errorMessage,
  className,
}: {
  stage: Stage
  embeddingPreview?: number[]
  errorMessage?: string
  className?: string
}) {
  const steps: { id: Stage; label: string }[] = [
    { id: 'reading', label: 'Leyendo el PDF' },
    { id: 'chunking', label: 'Dividiendo en fragmentos' },
    { id: 'embedding', label: 'Generando el embedding' },
    { id: 'storing', label: 'Escribiendo en Firestore' },
  ]
  const order: Stage[] = ['idle', 'reading', 'chunking', 'embedding', 'storing', 'done', 'error']
  const reached = (s: Stage) => order.indexOf(stage) >= order.indexOf(s)

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {steps.map((step) => (
        <div key={step.id} className="flex items-center gap-3">
          <div
            className={cn(
              'size-2 rounded-full transition-colors duration-200',
              reached(step.id) ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]',
            )}
          />
          <span
            className={cn(
              'text-sm transition-colors duration-200',
              reached(step.id) ? 'text-[var(--color-fg)]' : 'text-[var(--color-muted)]',
            )}
          >
            {step.label}
          </span>
        </div>
      ))}

      <AnimatePresence>
        {stage === 'embedding' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="font-mono text-xs text-[var(--color-muted)]"
          >
            calculando 1536 números…
          </motion.div>
        )}
        {stage === 'done' && embeddingPreview && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-xs"
          >
            {embeddingPreview.map((v, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="mr-2 tabular-nums"
              >
                {v.toFixed(3)}
              </motion.span>
            ))}
            …
          </motion.div>
        )}
        {stage === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-[var(--color-accent)]"
          >
            Error: {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
