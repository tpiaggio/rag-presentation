'use client'

import { useEffect, useState } from 'react'

type Props = {
  index: number
  total: number
  title: string
  onOpenNotes: () => void
}

export function SceneChrome({ index, total, title, onOpenNotes }: Props) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const show = () => {
      setVisible(true)
      clearTimeout(t)
      t = setTimeout(() => setVisible(false), 3000)
    }
    show()
    window.addEventListener('mousemove', show)
    window.addEventListener('keydown', show)
    return () => {
      window.removeEventListener('mousemove', show)
      window.removeEventListener('keydown', show)
      clearTimeout(t)
    }
  }, [])
  return (
    <div
      style={{ opacity: visible ? 1 : 0.3 }}
      className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
    >
      <button
        type="button"
        onClick={onOpenNotes}
        className="pointer-events-auto absolute left-4 top-4 size-2.5 rounded-full bg-[var(--color-accent)]"
        aria-label="Abrir notas del presentador"
      />
      <div className="absolute right-4 top-4 font-mono text-xs text-[var(--color-muted)]">
        {String(index).padStart(2, '0')} / {String(total - 1).padStart(2, '0')} · {title}
      </div>
      <div className="absolute bottom-4 right-4 font-mono text-xs text-[var(--color-muted)]">
        ← →
      </div>
    </div>
  )
}
