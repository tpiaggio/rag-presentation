'use client'

import { useState } from 'react'
import { AudioRecorder } from '@/components/AudioRecorder'
import { LoadingDot } from '@/components/LoadingDot'
import { SimilarityBar } from '@/components/SimilarityBar'
import { CodePanel } from '@/components/CodePanel'
import type { Song, SearchHit } from '@/lib/types'

const CODE = `const vector = await embedMultimodal('', [
  { inlineData: { mimeType: 'audio/webm', data: recordedBase64 } },
])
const hits = await findNearestSongs(vector, 6)`

const MOODS = [
  'triste pero esperanzador',
  'celebración del verano costeño',
  'andino festivo',
  'tarde nostálgica con guitarra criolla',
]

export default function Patron() {
  const [hits, setHits] = useState<SearchHit<Song>[]>([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'mood' | 'live'>('mood')

  async function searchByMood(mood: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/search-mm', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: mood, collection: 'songs', k: 6 }),
      })
      const { hits } = (await res.json()) as { hits: SearchHit<Song>[] }
      setHits(hits)
    } finally {
      setLoading(false)
    }
  }

  async function searchByAudio(mimeType: string, base64: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/search-mm', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          query: '',
          content: [{ inlineData: { mimeType, data: base64 } }],
          collection: 'songs',
          k: 6,
        }),
      })
      const { hits } = (await res.json()) as { hits: SearchHit<Song>[] }
      setHits(hits)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-6 px-12 py-16">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
          Escena 08
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">El mismo patrón, otro mundo</h1>
        <p className="text-[var(--color-muted)]">
          Música peruana. La misma forma de embebido aplica.
        </p>
      </header>

      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => setMode('mood')}
          className={
            'rounded-full border px-3 py-1 ' +
            (mode === 'mood'
              ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
              : 'border-[var(--color-border)] text-[var(--color-muted)]')
          }
        >
          Buscar por mood
        </button>
        <button
          type="button"
          onClick={() => setMode('live')}
          className={
            'rounded-full border px-3 py-1 ' +
            (mode === 'live'
              ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
              : 'border-[var(--color-border)] text-[var(--color-muted)]')
          }
        >
          Grabar en vivo (instrumento)
        </button>
      </div>

      {mode === 'mood' && (
        <div className="flex flex-wrap gap-2 text-xs">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => searchByMood(m)}
              className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[var(--color-muted)] hover:text-[var(--color-fg)]"
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {mode === 'live' && (
        <div className="flex items-center gap-3">
          <AudioRecorder onRecorded={searchByAudio} />
          {loading && <LoadingDot size={16} />}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 pt-4">
        {hits.map((h) => (
          <div
            key={h.doc.id}
            className="flex flex-col gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
          >
            <div>
              <div className="font-semibold tracking-tight">{h.doc.title}</div>
              <div className="text-xs text-[var(--color-muted)]">
                {h.doc.genre} · {h.doc.region}
              </div>
            </div>
            {h.doc.audio_clip_url && (
              <audio src={h.doc.audio_clip_url} controls preload="none" className="w-full" />
            )}
            <p className="text-xs text-[var(--color-muted)]">{h.doc.description}</p>
            <SimilarityBar similarity={h.similarity} />
          </div>
        ))}
      </div>

      <CodePanel code={CODE} />
    </div>
  )
}
