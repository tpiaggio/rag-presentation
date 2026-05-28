'use client'

import { motion } from 'framer-motion'

export function LoadingDot({ size = 24 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="relative inline-block"
      aria-label="cargando"
    >
      <div
        className="absolute inset-0 rounded-full border border-[var(--color-border)]"
      />
      <motion.div
        className="absolute size-1.5 rounded-full bg-[var(--color-accent)]"
        style={{ top: 0, left: '50%', marginLeft: -3 }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
      />
    </div>
  )
}
