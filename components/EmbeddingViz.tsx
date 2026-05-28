'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

type Props = {
  values: number[]
  max?: number
  staggerMs?: number
  className?: string
  label?: string
}

export function EmbeddingViz({
  values,
  max = 24,
  staggerMs = 60,
  className,
  label,
}: Props) {
  const visible = values.slice(0, max)
  return (
    <div className={cn('font-mono text-xs leading-relaxed', className)}>
      {label && (
        <div className="text-[var(--color-muted)] mb-1 tracking-wider uppercase text-[10px]">
          {label}
        </div>
      )}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {visible.map((v, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i * staggerMs) / 1000, duration: 0.2 }}
            className="tabular-nums"
          >
            {v >= 0 ? ' ' : ''}
            {v.toFixed(3)}
          </motion.span>
        ))}
        {values.length > max && (
          <span className="text-[var(--color-muted)]">
            … +{values.length - max} más
          </span>
        )}
      </div>
    </div>
  )
}
