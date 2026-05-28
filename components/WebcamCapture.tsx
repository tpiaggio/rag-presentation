'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  onCapture: (dataUrl: string, mimeType: string) => void
  className?: string
}

export function WebcamCapture({ onCapture, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    let stream: MediaStream | undefined
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
      .then((s) => {
        stream = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
          videoRef.current.play()
        }
        setReady(true)
      })
      .catch((e) => setError(e.message))
    return () => stream?.getTracks().forEach((t) => t.stop())
  }, [])

  function capture() {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(videoRef.current, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    onCapture(dataUrl, 'image/jpeg')
  }

  if (error) {
    return <div className="text-sm text-[var(--color-accent)]">Cámara: {error}</div>
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <video
        ref={videoRef}
        playsInline
        muted
        className="aspect-video w-full rounded-md border border-[var(--color-border)] bg-black object-cover"
      />
      <button
        type="button"
        onClick={capture}
        disabled={!ready}
        className="self-start rounded-md bg-[var(--color-fg)] px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        Capturar
      </button>
    </div>
  )
}
