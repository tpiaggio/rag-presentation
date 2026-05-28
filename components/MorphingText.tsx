'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789·áéíóúñ'

function pick() {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)]
}

export function MorphingText({
  text,
  cyclesPerChar = 14,
  intervalMs = 45,
  staggerMs = 70,
  startDelayMs = 0,
  className,
}: {
  text: string
  cyclesPerChar?: number
  intervalMs?: number
  staggerMs?: number
  startDelayMs?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const chars = useMemo(() => Array.from(text), [text])
  const [display, setDisplay] = useState<string[]>(() =>
    chars.map((c) => (c === ' ' ? ' ' : c)),
  )

  useEffect(() => {
    if (reduce) {
      setDisplay(chars)
      return
    }
    setDisplay(chars.map((c) => (c === ' ' ? ' ' : pick())))
    const totalEnd = startDelayMs + chars.length * staggerMs + cyclesPerChar * intervalMs
    let raf = 0
    const startedAt = performance.now()
    const tick = () => {
      const now = performance.now() - startedAt
      setDisplay((prev) =>
        chars.map((c, i) => {
          if (c === ' ') return ' '
          const charStart = startDelayMs + i * staggerMs
          const charEnd = charStart + cyclesPerChar * intervalMs
          if (now >= charEnd) return c
          if (now < charStart) return prev[i]
          return pick()
        }),
      )
      if (now < totalEnd) raf = requestAnimationFrame(tick)
      else setDisplay(chars)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [chars, cyclesPerChar, intervalMs, staggerMs, startDelayMs, reduce])

  const words: { chars: string[]; offsets: number[] }[] = []
  let cursor = 0
  while (cursor < chars.length) {
    if (chars[cursor] === ' ') {
      words.push({ chars: [' '], offsets: [cursor] })
      cursor += 1
      continue
    }
    const start = cursor
    while (cursor < chars.length && chars[cursor] !== ' ') cursor += 1
    const slice = chars.slice(start, cursor)
    words.push({ chars: slice, offsets: slice.map((_, k) => start + k) })
  }

  return (
    <span className={className}>
      {words.map((word, wi) =>
        word.chars[0] === ' ' ? (
          <span key={`s-${wi}`}> </span>
        ) : (
          <span key={`w-${wi}`} className="inline-block whitespace-nowrap">
            {word.chars.map((_, ci) => {
              const i = word.offsets[ci]
              return (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: (startDelayMs + i * staggerMs) / 1000, duration: 0.15 }}
                >
                  {display[i]}
                </motion.span>
              )
            })}
          </span>
        ),
      )}
    </span>
  )
}
