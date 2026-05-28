'use client'

import { useState } from 'react'
import { WebcamCapture } from '@/components/WebcamCapture'
import { DishCard } from '@/components/DishCard'
import { LoadingDot } from '@/components/LoadingDot'
import { CodePanel } from '@/components/CodePanel'
import type { Dish, SearchHit } from '@/lib/types'

const CODE = `const vector = await embedMultimodal('', [
  { inlineData: { mimeType: 'image/jpeg', data: photoBase64 } },
])
const hits = await findNearestDishes(vector, 'embedding_mm', 6)`

export default function Reconoce() {
  const [photo, setPhoto] = useState<string>()
  const [hits, setHits] = useState<SearchHit<Dish>[]>([])
  const [loading, setLoading] = useState(false)

  async function search(dataUrl: string, mimeType: string) {
    const data = dataUrl.split(',')[1]
    setLoading(true)
    setPhoto(dataUrl)
    try {
      const res = await fetch('/api/search-mm', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          query: '',
          content: [{ inlineData: { mimeType, data } }],
          k: 6,
        }),
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
          Escena 06
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">Reconoce la comida que ves</h1>
      </header>

      <div className="grid grid-cols-2 gap-8">
        {!photo ? (
          <WebcamCapture onCapture={search} />
        ) : (
          <div className="flex flex-col gap-2">
            <img
              src={photo}
              alt="captura"
              className="aspect-video w-full rounded-md border border-[var(--color-border)] object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setPhoto(undefined)
                setHits([])
              }}
              className="self-start text-sm text-[var(--color-muted)] underline"
            >
              ↻ otra foto
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-sm uppercase tracking-widest text-[var(--color-muted)]">
            Resultados {loading && <LoadingDot size={16} />}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {hits.map((h) => (
              <DishCard key={h.doc.id} dish={h.doc} similarity={h.similarity} />
            ))}
          </div>
          {hits[0] && (
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm leading-relaxed">
              <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
                Receta · {hits[0].doc.name_es}
              </div>
              <p className="pt-1 whitespace-pre-line">{hits[0].doc.recipe}</p>
            </div>
          )}
        </div>
      </div>

      <CodePanel code={CODE} />
    </div>
  )
}
