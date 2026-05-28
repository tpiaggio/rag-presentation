'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  title?: string
  code: string
  language?: string
  className?: string
  defaultOpen?: boolean
}

export function CodePanel({
  title = 'El código que está corriendo',
  code,
  language = 'ts',
  className,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div
      className={cn(
        'rounded-md border border-[var(--color-border)] bg-[var(--color-code-bg)]',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2 text-xs uppercase tracking-wider text-[var(--color-muted)]"
      >
        <span>{title}</span>
        <span className="font-mono">{open ? '–' : '+'}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.pre
            key="code"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-x-auto px-4 pb-4 text-xs leading-relaxed text-[var(--color-code-fg)]"
            data-language={language}
          >
            <code>{code}</code>
          </motion.pre>
        )}
      </AnimatePresence>
    </div>
  )
}
