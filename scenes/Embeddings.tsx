'use client'

import { useState } from 'react'
import { EmbeddingViz } from '@/components/EmbeddingViz'
import { LoadingDot } from '@/components/LoadingDot'
import { CodePanel } from '@/components/CodePanel'

const CODE = `import { google } from '@/lib/gemini'
import { embed } from 'ai'

const { embedding } = await embed({
  model: google.embedding('gemini-embedding-001'),
  value: 'ceviche',
})

// embedding.length === 768`

export default function Embeddings() {
  const [value, setValue] = useState('ceviche')
  const [embedding, setEmbedding] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  async function go() {
    setLoading(true)
    try {
      const res = await fetch('/api/embed/text', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ value }),
      })
      const { embedding } = (await res.json()) as { embedding: number[] }
      setEmbedding(embedding)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-10 px-12">
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
          Escena 01
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">¿Qué son los embeddings?</h1>
        <p className="text-[var(--color-muted)]">
          ¿Cómo le explico el sabor del ceviche a una máquina? Con números.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') go()
          }}
          className="flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-lg"
        />
        <button
          type="button"
          onClick={go}
          className="rounded-md bg-[var(--color-fg)] px-5 py-3 text-sm text-white"
        >
          Embebir
        </button>
        {loading && <LoadingDot size={20} />}
      </div>

      <EmbeddingViz
        values={embedding}
        max={48}
        label={`${value} · ${embedding.length || 0} dim`}
      />

      <CodePanel code={CODE} defaultOpen />
    </div>
  )
}
