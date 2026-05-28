'use client'

import { useRef, useState } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  maxSeconds?: number
  onRecorded: (mimeType: string, base64: string) => void
  className?: string
}

export function AudioRecorder({ maxSeconds = 5, onRecorded, className }: Props) {
  const [state, setState] = useState<'idle' | 'recording' | 'processing'>('idle')
  const [seconds, setSeconds] = useState(0)
  const chunks = useRef<Blob[]>([])
  const recorder = useRef<MediaRecorder | null>(null)

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    chunks.current = []
    mr.ondataavailable = (e) => chunks.current.push(e.data)
    mr.onstop = async () => {
      setState('processing')
      stream.getTracks().forEach((t) => t.stop())
      const blob = new Blob(chunks.current, { type: 'audio/webm' })
      const buf = await blob.arrayBuffer()
      const b64 = btoa(
        Array.from(new Uint8Array(buf))
          .map((b) => String.fromCharCode(b))
          .join(''),
      )
      onRecorded('audio/webm', b64)
      setState('idle')
      setSeconds(0)
    }
    recorder.current = mr
    mr.start()
    setState('recording')
    setSeconds(0)

    const startedAt = Date.now()
    const tick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)
      setSeconds(elapsed)
      if (elapsed >= maxSeconds) {
        clearInterval(tick)
        mr.stop()
      }
    }, 100)
  }

  return (
    <button
      type="button"
      onClick={() => state === 'idle' && start()}
      className={cn(
        'flex items-center gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm',
        className,
      )}
      disabled={state !== 'idle'}
    >
      <span
        className={cn(
          'inline-block size-2.5 rounded-full',
          state === 'recording' ? 'animate-pulse bg-[var(--color-accent)]' : 'bg-[var(--color-muted)]',
        )}
      />
      {state === 'idle' && 'Grabar 5 segundos en vivo'}
      {state === 'recording' && `Grabando · ${seconds}s / ${maxSeconds}s`}
      {state === 'processing' && 'Procesando…'}
    </button>
  )
}
