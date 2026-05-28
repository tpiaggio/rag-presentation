'use client'

import { useEffect, useState } from 'react'
import { PCAProjection } from '@/components/PCAProjection'
import { LoadingDot } from '@/components/LoadingDot'
import type { Dish } from '@/lib/types'

const USES = [
  { who: 'Spotify', what: 'recomendaciones de canciones por gusto' },
  { who: 'Google', what: 'búsqueda semántica' },
  { who: 'ChatGPT', what: 'memoria de conversaciones largas' },
  { who: 'Centinel', what: 'reconocimiento de proveedores en facturas' },
]

export default function Como() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dishes')
      .then((r) => r.json())
      .then((j: { dishes: Dish[] }) => setDishes(j.dishes))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-6 px-12 py-16">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
          Escena 03
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">
          ¿Cómo funcionan y para qué sirven?
        </h1>
        <p className="text-[var(--color-muted)]">
          Cada plato es un punto. Los parecidos se agrupan.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          {loading ? (
            <div className="flex aspect-[4/3] items-center justify-center rounded-md border border-[var(--color-border)]">
              <LoadingDot />
            </div>
          ) : (
            <PCAProjection dishes={dishes} />
          )}
        </div>
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
            Donde ya las usás
          </div>
          {USES.map((u) => (
            <div key={u.who} className="space-y-1">
              <div className="font-semibold">{u.who}</div>
              <div className="text-sm text-[var(--color-muted)]">{u.what}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
