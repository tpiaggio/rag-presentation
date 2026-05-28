'use client'

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
    const nx = (v: number) => (v - minX) / (maxX - minX || 1)
    const ny = (v: number) => (v - minY) / (maxY - minY || 1)
    return projected.map((p, i) => ({
      dish: dishes[i],
      x: nx(p.x) * 100,
      y: ny(p.y) * 100,
    }))
  }, [dishes])

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        {points.map(({ dish, x, y }) => (
          <circle
            key={dish.id}
            cx={x}
            cy={y}
            r={1.2}
            fill={CATEGORY_COLOR[dish.category]}
            opacity={hover && hover.id !== dish.id ? 0.3 : 0.9}
            onMouseEnter={() => setHover(dish)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </svg>
      {hover && (
        <div className="absolute bottom-3 left-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs">
          <div className="font-semibold">{hover.name_es}</div>
          <div className="text-[var(--color-muted)]">{hover.category}</div>
        </div>
      )}
      <div className="absolute right-3 top-3 flex flex-col gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-xs">
        {(Object.keys(CATEGORY_COLOR) as DishCategory[]).map((c) => (
          <div key={c} className="flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ background: CATEGORY_COLOR[c] }} />
            {c}
          </div>
        ))}
      </div>
    </div>
  )
}
