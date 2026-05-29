'use client'

import { useEffect, useState } from 'react'
import { AudioRecorder } from '@/components/AudioRecorder'
import { LoadingDot } from '@/components/LoadingDot'
import { SimilarityBar } from '@/components/SimilarityBar'
import { CodePanel } from '@/components/CodePanel'
import { cn } from '@/lib/cn'
import type { Song, SongGenre, SearchHit } from '@/lib/types'

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

const GENRES: SongGenre[] = ['huayno', 'marinera', 'criolla', 'chicha', 'yaravi', 'festejo']

type Mode = 'mood' | 'live' | 'upload'

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  let binary = ''
  const bytes = new Uint8Array(buf)
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

export default function Patron() {
  const [hits, setHits] = useState<SearchHit<Song>[]>([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<Mode>('mood')

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
          k: 1,
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

      <div className="flex flex-wrap gap-2 text-xs">
        {(
          [
            ['mood', 'Buscar por mood'],
            ['live', 'Grabar en vivo (instrumento)'],
            ['upload', 'Subir canción'],
          ] as [Mode, string][]
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              'rounded-full border px-3 py-1',
              mode === m
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-fg)]',
            )}
          >
            {label}
          </button>
        ))}
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

      {mode === 'upload' && <UploadForm />}

      <div className="grid grid-cols-3 gap-3 pt-4">
        {hits.map((h) => (
          <div
            key={h.doc.id}
            className="flex flex-col gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
          >
            <div>
              <div className="font-semibold tracking-tight">{h.doc.title}</div>
              <div className="text-xs text-[var(--color-muted)]">
                {h.doc.genre}
                {h.doc.region ? ` · ${h.doc.region}` : ''}
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

type UploadStatus = 'idle' | 'analyzing' | 'analyzed' | 'uploading' | 'done' | 'error'

function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState<SongGenre>('huayno')
  const [region, setRegion] = useState('')
  const [description, setDescription] = useState('')
  const [moodInput, setMoodInput] = useState('')
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string>()
  const [audioCache, setAudioCache] = useState<{ base64: string; mimeType: string } | null>(null)

  async function onFile(picked: File) {
    setFile(picked)
    setStatus('analyzing')
    setErrorMessage(undefined)
    try {
      const audioBase64 = await fileToBase64(picked)
      const mimeType = picked.type || 'audio/mpeg'
      setAudioCache({ base64: audioBase64, mimeType })
      const res = await fetch('/api/songs/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ filename: picked.name, audioBase64, mimeType }),
      })
      if (!res.ok) throw new Error(`Analyze ${res.status}`)
      const meta = (await res.json()) as {
        title: string
        genre: SongGenre
        region: string
        description: string
        mood_tags: string[]
      }
      setTitle(meta.title)
      setGenre(meta.genre)
      setRegion(meta.region)
      setDescription(meta.description)
      setMoodInput(meta.mood_tags.join(', '))
      setStatus('analyzed')
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e))
      setStatus('error')
    }
  }

  async function submit() {
    if (!file || !title.trim() || !audioCache) return
    setStatus('uploading')
    setErrorMessage(undefined)
    try {
      const mood_tags = moodInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const res = await fetch('/api/songs/upload', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          genre,
          region: region.trim() || undefined,
          description: description.trim() || undefined,
          mood_tags: mood_tags.length ? mood_tags : undefined,
          audioBase64: audioCache.base64,
          mimeType: audioCache.mimeType,
        }),
      })
      if (!res.ok) throw new Error(`Upload ${res.status}`)
      setStatus('done')
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e))
      setStatus('error')
    }
  }

  const audioObjectUrl = useAudioObjectUrl(file)

  return (
    <div className="grid grid-cols-2 items-stretch gap-6">
      <DropZone
        file={file}
        status={status}
        audioObjectUrl={audioObjectUrl}
        onFile={onFile}
      />

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título *"
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
          />
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value as SongGenre)}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="Región (opcional) — Cuzco, Lima, Arequipa…"
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción corta (opcional) — instrumentos, sentimiento, contexto"
          rows={3}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm leading-relaxed"
        />
        <input
          value={moodInput}
          onChange={(e) => setMoodInput(e.target.value)}
          placeholder="Mood tags separados por coma (opcional) — triste, festivo, andino"
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
        />

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={submit}
            disabled={
              !file ||
              !title.trim() ||
              status === 'uploading' ||
              status === 'analyzing'
            }
            className="rounded-md bg-[var(--color-fg)] px-5 py-2 text-sm text-white disabled:opacity-40"
          >
            {status === 'uploading'
              ? 'Subiendo…'
              : status === 'done'
                ? '¡Listo!'
                : status === 'analyzing'
                  ? 'Esperando análisis…'
                  : 'Subir y embeber'}
          </button>
          {(status === 'uploading' || status === 'analyzing') && <LoadingDot size={16} />}
          {status === 'done' && (
            <span className="text-xs text-[var(--color-accent-3)]">
              ¡Embebida y guardada! Probá &quot;Buscar por mood&quot; cuando quieras.
            </span>
          )}
          {status === 'error' && (
            <span className="text-xs text-[var(--color-accent)]">{errorMessage}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function useAudioObjectUrl(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!file) {
      setUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])
  return url
}

function DropZone({
  file,
  status,
  audioObjectUrl,
  onFile,
}: {
  file: File | null
  status: UploadStatus
  audioObjectUrl: string | null
  onFile: (f: File) => void
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-stretch justify-center gap-3 rounded-md border-2 border-dashed p-6 text-center transition-colors',
        file
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
          : 'border-[var(--color-border)] bg-[var(--color-surface)]',
      )}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const f = e.dataTransfer.files[0]
        if (f) onFile(f)
      }}
    >
      {!file ? (
        <label className="flex cursor-pointer flex-col items-center gap-2">
          <span className="text-4xl">🎵</span>
          <span className="font-semibold">Arrastrá un mp3 acá</span>
          <span className="text-xs text-[var(--color-muted)]">o hacé click</span>
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onFile(f)
            }}
          />
        </label>
      ) : (
        <>
          <div className="flex items-center justify-center gap-2 text-2xl">🎵</div>
          <div className="font-semibold">{file.name}</div>
          {audioObjectUrl && (
            <audio
              src={audioObjectUrl}
              controls
              preload="metadata"
              className="w-full"
            />
          )}
          <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-muted)]">
            {status === 'analyzing' && <LoadingDot size={14} />}
            <span>
              {status === 'analyzing'
                ? 'Gemini está analizando el clip…'
                : status === 'analyzed'
                  ? 'Metadatos sugeridos por Gemini, editá si querés'
                  : status === 'uploading'
                    ? 'Subiendo a Firebase Storage…'
                    : status === 'done'
                      ? '¡Listo!'
                      : 'Listo para subir'}
            </span>
          </div>
          <label className="cursor-pointer text-xs text-[var(--color-muted)] underline">
            Cambiar archivo
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) onFile(f)
              }}
            />
          </label>
        </>
      )}
    </div>
  )
}
