'use client'

import { AnimatePresence, motion } from 'framer-motion'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  notes: string
}

export function PresenterNotes({ open, onClose, title, notes }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/40"
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-12 bottom-12 max-h-[40vh] overflow-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
          >
            <div className="mb-2 text-xs uppercase tracking-wider text-[var(--color-muted)]">
              Notas · {title}
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed">{notes}</p>
            <div className="mt-4 text-xs text-[var(--color-muted)]">
              Cmd+. para cerrar
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
