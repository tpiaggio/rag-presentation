'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  onRecorded: (mimeType: string, base64: string) => void
  className?: string
}

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AudioRecorder({ onRecorded, className }: Props) {
  const [state, setState] = useState<'idle' | 'recording' | 'processing'>('idle')
  const [elapsedMs, setElapsedMs] = useState(0)
  const chunks = useRef<Blob[]>([])
  const recorder = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const startedAt = useRef<number>(0)

  useEffect(() => {
    if (state !== 'recording') return
    const tick = setInterval(() => {
      setElapsedMs(Date.now() - startedAt.current)
    }, 100)
    return () => clearInterval(tick)
  }, [state])

  async function start() {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.current = s
    const mr = new MediaRecorder(s, { mimeType: 'audio/webm' })
    chunks.current = []
    mr.ondataavailable = (e) => chunks.current.push(e.data)
    mr.onstop = async () => {
      setState('processing')
      stream.current?.getTracks().forEach((t) => t.stop())
      stream.current = null
      const blob = new Blob(chunks.current, { type: 'audio/webm' })
      const buf = await blob.arrayBuffer()
      let binary = ''
      const bytes = new Uint8Array(buf)
      const chunk = 0x8000
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
      }
      const b64 = btoa(binary)
      onRecorded('audio/webm', b64)
      setState('idle')
      setElapsedMs(0)
    }
    recorder.current = mr
    startedAt.current = Date.now()
    mr.start()
    setState('recording')
    setElapsedMs(0)
  }

  function stop() {
    recorder.current?.stop()
  }

  return (
    <button
      type="button"
      onClick={state === 'idle' ? start : state === 'recording' ? stop : undefined}
      className={cn(
        'flex items-center gap-3 rounded-md border px-4 py-3 text-sm transition-colors',
        state === 'recording'
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface)]',
        className,
      )}
      disabled={state === 'processing'}
    >
      <span
        className={cn(
          'inline-block size-2.5 rounded-full',
          state === 'recording'
            ? 'animate-pulse bg-[var(--color-accent)]'
            : 'bg-[var(--color-muted)]',
        )}
      />
      {state === 'idle' && 'Grabar en vivo'}
      {state === 'recording' && (
        <span className="flex items-center gap-3">
          <span className="font-mono tabular-nums">{formatElapsed(elapsedMs)}</span>
          <span className="text-[var(--color-muted)]">·</span>
          <span>Click para detener</span>
        </span>
      )}
      {state === 'processing' && 'Procesando…'}
    </button>
  )
}
