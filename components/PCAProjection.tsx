'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { pca2 } from '@/lib/pca'
import type { Dish, DishCategory } from '@/lib/types'

const CATEGORY_COLOR: Record<DishCategory, string> = {
  marino: '#1d4ed8',
  criollo: '#c8553d',
  sopa: '#7a8f3a',
  postre: '#e8b04a',
  bebida: '#9333ea',
  andino: '#0a0a0a',
}

export function PCAProjection({ dishes }: { dishes: Dish[] }) {
  const [hover, setHover] = useState<Dish | null>(null)
  const [filter, setFilter] = useState<DishCategory | null>(null)

  const points = useMemo(() => {
    if (dishes.length === 0) return []
    const matrix = dishes.map((d) => d.embedding_text)
    const projected = pca2(matrix)
    const xs = projected.map((p) => p.x)
    const ys = projected.map((p) => p.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const spanX = maxX - minX || 1
    const spanY = maxY - minY || 1
    const padPct = 0.06
    const nx = (v: number) => padPct + ((v - minX) / spanX) * (1 - 2 * padPct)
    const ny = (v: number) => padPct + ((v - minY) / spanY) * (1 - 2 * padPct)
    return projected.map((p, i) => ({
      dish: dishes[i],
      x: nx(p.x) * 100,
      y: ny(p.y) * 100,
    }))
  }, [dishes])

  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-md"
      style={{
        backgroundColor: 'var(--color-bg)',
        backgroundImage:
          'radial-gradient(circle at center, rgba(10,10,10,0.10) 1px, transparent 1.5px)',
        backgroundSize: '20px 20px',
      }}
    >
      {points.map(({ dish, x, y }, i) => {
        const dim = filter && dish.category !== filter
        const isHover = hover?.id === dish.id
        const dimByHover = hover && !isHover
        return (
          <motion.button
            key={dish.id}
            type="button"
            onMouseEnter={() => setHover(dish)}
            onMouseLeave={() => setHover(null)}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: dim ? 0.12 : dimByHover ? 0.35 : 1,
              scale: isHover ? 1.6 : 1,
            }}
            transition={{
              opacity: { duration: 0.25, delay: isHover ? 0 : i * 0.015 },
              scale: { type: 'spring', stiffness: 280, damping: 22 },
            }}
            className="absolute size-10 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full focus:outline-none"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              boxShadow: `0 0 0 2px ${CATEGORY_COLOR[dish.category]}, 0 4px 12px rgba(0,0,0,${isHover ? 0.18 : 0.04})`,
              zIndex: isHover ? 30 : 1,
            }}
            aria-label={dish.name_es}
          >
            {dish.image_url ? (
              <Image
                src={dish.image_url}
                alt={dish.name_es}
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div
                className="size-full"
                style={{ background: CATEGORY_COLOR[dish.category] }}
              />
            )}
          </motion.button>
        )
      })}

      {hover && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-40 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs shadow-lg">
          <div className="text-sm font-semibold">{hover.name_es}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[var(--color-muted)]">
            <span className="size-1.5 rounded-full" style={{ background: CATEGORY_COLOR[hover.category] }} />
            {hover.category}
          </div>
        </div>
      )}

      <div className="absolute right-3 top-3 z-40 flex flex-col gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-2 text-xs backdrop-blur-sm">
        {(Object.keys(CATEGORY_COLOR) as DishCategory[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter((cur) => (cur === c ? null : c))}
            className={
              'flex items-center gap-2 rounded px-1.5 py-0.5 text-left transition-colors ' +
              (filter === c
                ? 'bg-[var(--color-fg)] text-white'
                : 'text-[var(--color-fg)] hover:bg-[var(--color-border)]/40')
            }
          >
            <span className="size-2 rounded-full" style={{ background: CATEGORY_COLOR[c] }} />
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}
