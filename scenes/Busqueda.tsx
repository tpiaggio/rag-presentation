'use client'

import { useState } from 'react'
import { DishCard } from '@/components/DishCard'
import { LoadingDot } from '@/components/LoadingDot'
import { CodePanel } from '@/components/CodePanel'
import type { Dish, SearchHit } from '@/lib/types'
import { useLanguage } from '@/lib/useLanguage'

type Mode = 'keyword' | 'semantic'

async function runSearch(query: string, mode: Mode): Promise<SearchHit<Dish>[]> {
  const res = await fetch('/api/search', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, mode, k: 6 }),
  })
  const json = (await res.json()) as { hits: SearchHit<Dish>[] }
  return json.hits
}

const CODE = `const vector = await embedText(query)
const snap = await adminDb
  .collection('presentation_dishes')
  .findNearest({
    vectorField: 'embedding_text',
    queryVector: FieldValue.vector(vector),
    limit: 6,
    distanceMeasure: 'COSINE',
  })
  .get()`

const SUGERIDAS = [
  'ceviche',
  'comida reconfortante en día lluvioso',
  'algo dulce y cremoso',
  'plato típico de la sierra',
]

export default function Busqueda() {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [keywordHits, setKeywordHits] = useState<SearchHit<Dish>[]>([])
  const [semanticHits, setSemanticHits] = useState<SearchHit<Dish>[]>([])
  const [loading, setLoading] = useState(false)

  async function go(q: string) {
    setQuery(q)
    setLoading(true)
    const [kw, sem] = await Promise.all([
      runSearch(q, 'keyword'),
      runSearch(q, 'semantic'),
    ])
    setKeywordHits(kw)
    setSemanticHits(sem)
    setLoading(false)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-6 px-12 py-16">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
          {t('busqueda.sceneLabel')}
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">
          {t('scene.busqueda')}
        </h1>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (query.trim()) go(query.trim())
        }}
        className="flex gap-2"
      >
        <input
          className="flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-lg outline-none focus:border-[var(--color-accent)]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('busqueda.placeholder')}
        />
        <button
          type="submit"
          className="rounded-md bg-[var(--color-fg)] px-5 text-sm text-white"
        >
          {t('busqueda.button')}
        </button>
      </form>

      <div className="flex gap-2 text-xs">
        {['busqueda.sugerencia1', 'busqueda.sugerencia2', 'busqueda.sugerencia3', 'busqueda.sugerencia4'].map((key) => {
          const s = t(key)
          return (
            <button
              key={key}
              type="button"
              onClick={() => go(s)}
              className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[var(--color-muted)] hover:text-[var(--color-fg)]"
            >
              {s}
            </button>
          )
        })}
      </div>

      <div className="grid flex-1 grid-cols-2 gap-8 pt-4">
        <Column title={t('busqueda.keyword')} hits={keywordHits} loading={loading} />
        <Column title={t('busqueda.semantic')} hits={semanticHits} loading={loading} highlight />
      </div>

      <CodePanel code={CODE} />
    </div>
  )
}

function Column({
  title,
  hits,
  loading,
  highlight,
}: {
  title: string
  hits: SearchHit<Dish>[]
  loading: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2
          className={
            'text-sm uppercase tracking-widest ' +
            (highlight ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]')
          }
        >
          {title}
        </h2>
        {loading && <LoadingDot size={16} />}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {hits.length === 0 && !loading && (
          <div className="col-span-3 rounded-md border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-muted)]">
            sin resultados
          </div>
        )}
        {hits.map((h) => (
          <DishCard key={h.doc.id} dish={h.doc} similarity={h.similarity} />
        ))}
      </div>
    </div>
  )
}
