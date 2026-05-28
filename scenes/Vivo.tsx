'use client'

import { useState } from 'react'
import { IndexingAnimation } from '@/components/IndexingAnimation'
import { DishCard } from '@/components/DishCard'
import { CodePanel } from '@/components/CodePanel'
import type { Dish, SearchHit } from '@/lib/types'

type Stage = 'idle' | 'reading' | 'chunking' | 'embedding' | 'storing' | 'done' | 'error'

async function readAsBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  let binary = ''
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

const CODE = `const extract = await extractPdf(pdfBytes)
const embedding = await embedMultimodal(extract.text.slice(0, 8000), [
  { text: extract.text.slice(0, 8000) },
  { inlineData: { mimeType: 'application/pdf', data: pdfBase64 } },
])
await adminDb.collection('presentation_dishes').doc(id).set({
  ...,
  embedding_mm: FieldValue.vector(embedding),
})`

export default function Vivo() {
  const [stage, setStage] = useState<Stage>('idle')
  const [preview, setPreview] = useState<number[]>()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [hits, setHits] = useState<SearchHit<Dish>[]>([])
  const [query, setQuery] = useState('')

  async function onFile(file: File) {
    try {
      setStage('reading')
      const pdfBase64 = await readAsBase64(file)
      setStage('chunking')
      await new Promise((r) => setTimeout(r, 250))
      setStage('embedding')

      const res = await fetch('/api/index', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ filename: file.name, pdfBase64 }),
      })
      if (!res.ok) throw new Error(`Index ${res.status}`)
      const { embedding_preview } = (await res.json()) as { embedding_preview: number[] }

      setStage('storing')
      await new Promise((r) => setTimeout(r, 250))
      setPreview(embedding_preview)
      setStage('done')
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e))
      setStage('error')
    }
  }

  async function querySemantic(q: string) {
    const res = await fetch('/api/search-mm', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: q, k: 6 }),
    })
    const { hits } = (await res.json()) as { hits: SearchHit<Dish>[] }
    setHits(hits)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-6 px-12 py-16">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
          Escena 05
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">Embedding en vivo</h1>
        <p className="text-[var(--color-muted)]">
          Arrastrá un PDF de receta sobre el panel. Lo dividimos, lo embebemos y lo guardamos en Firestore acá mismo.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-8 pt-2">
        <DropZone onFile={onFile} stage={stage} />
        <div className="flex flex-col gap-4">
          <IndexingAnimation
            stage={stage}
            embeddingPreview={preview}
            errorMessage={errorMessage}
          />
          {stage === 'done' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (query.trim()) querySemantic(query.trim())
              }}
              className="flex gap-2 pt-2"
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="probá una búsqueda nueva…"
                className="flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2"
              />
              <button
                type="submit"
                className="rounded-md bg-[var(--color-fg)] px-4 text-sm text-white"
              >
                Buscar
              </button>
            </form>
          )}
        </div>
      </div>

      {hits.length > 0 && (
        <div className="grid grid-cols-6 gap-3 pt-4">
          {hits.map((h) => (
            <DishCard key={h.doc.id} dish={h.doc} similarity={h.similarity} />
          ))}
        </div>
      )}

      <CodePanel code={CODE} />
    </div>
  )
}

function DropZone({
  onFile,
  stage,
}: {
  onFile: (file: File) => void
  stage: Stage
}) {
  return (
    <label
      className="flex aspect-square min-h-[280px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface)] text-center"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const f = e.dataTransfer.files[0]
        if (f) onFile(f)
      }}
    >
      <span className="text-3xl">📄</span>
      <span className="font-semibold">
        {stage === 'idle' ? 'Arrastrá un PDF acá' : 'Procesando…'}
      </span>
      <span className="text-xs text-[var(--color-muted)]">o hacé click</span>
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
        }}
      />
    </label>
  )
}
