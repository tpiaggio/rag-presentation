'use client'

import { useState } from 'react'
import ingredients from '@/data/ingredients.json'
import { DishCard } from '@/components/DishCard'
import { LoadingDot } from '@/components/LoadingDot'
import { CodePanel } from '@/components/CodePanel'
import { cn } from '@/lib/cn'
import type { Dish, SearchHit } from '@/lib/types'

const CODE = `const query = \`Quiero cocinar algo con \${selected.join(', ')}.\`
const vector = await embedMultimodal(query)
const hits = await findNearestDishes(vector, 'embedding_mm', 6)`

export default function Cocinar() {
  const [selected, setSelected] = useState<string[]>([])
  const [hits, setHits] = useState<SearchHit<Dish>[]>([])
  const [loading, setLoading] = useState(false)

  function toggle(name: string) {
    setSelected((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]))
  }

  async function search() {
    if (selected.length === 0) return
    setLoading(true)
    try {
      const query = `Quiero cocinar algo con: ${selected.join(', ')}. ¿Qué platos peruanos puedo hacer?`
      const res = await fetch('/api/search-mm', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query, k: 6 }),
      })
      const { hits } = (await res.json()) as { hits: SearchHit<Dish>[] }
      setHits(hits)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-6 px-12 py-16">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
          Escena 07
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">¿Qué puedo cocinar?</h1>
        <p className="text-[var(--color-muted)]">
          Elegí ingredientes (la audiencia también puede sumar pidiendo en voz alta).
        </p>
      </header>

      <div className="grid grid-cols-8 gap-2">
        {ingredients.map((ing) => (
          <button
            key={ing.name}
            type="button"
            onClick={() => toggle(ing.name)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-md border p-3 text-xs transition-colors',
              selected.includes(ing.name)
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                : 'border-[var(--color-border)] bg-[var(--color-surface)]',
            )}
          >
            <span className="text-2xl">{ing.emoji}</span>
            <span>{ing.name}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={search}
          disabled={selected.length === 0 || loading}
          className="rounded-md bg-[var(--color-fg)] px-5 py-2 text-sm text-white disabled:opacity-40"
        >
          Buscar platos ({selected.length})
        </button>
        {loading && <LoadingDot size={16} />}
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => setSelected([])}
            className="text-xs text-[var(--color-muted)] underline"
          >
            limpiar
          </button>
        )}
      </div>

      <div className="grid grid-cols-6 gap-3 pt-2">
        {hits.map((h) => (
          <DishCard key={h.doc.id} dish={h.doc} similarity={h.similarity} />
        ))}
      </div>

      <CodePanel code={CODE} />
    </div>
  )
}
