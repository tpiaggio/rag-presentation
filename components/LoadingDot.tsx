'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/useLanguage'

export function LoadingDot({ size = 24 }: { size?: number }) {
  const { t } = useLanguage()
  return (
    <div
      style={{ width: size, height: size }}
      className="relative inline-block"
      aria-label={t('ui.loading')}
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
