'use client'

import { Fragment, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DishCard } from '@/components/DishCard'
import { LoadingDot } from '@/components/LoadingDot'
import { CodePanel } from '@/components/CodePanel'
import { cn } from '@/lib/cn'
import type { Dish, SearchHit } from '@/lib/types'
import { useLanguage } from '@/lib/useLanguage'

const SCENE_NUMBER = '08'

const code = (t: (key: string) => string) => `// 1) ${t('pregunta.codeRetrieve')}
const vector = await embedMultimodal(question)
const context = await findNearestDishes(vector, 'embedding_mm', 4)

// 2) ${t('pregunta.codeGenerate')}
const result = streamText({
  model: google('gemini-3.8-flash'),
  system: '${t('pregunta.codeSystem')}',
  prompt: \`CONTEXT:\\n\${context}\\n\\nQUESTION:\\n\${question}\`,
})
return result.toTextStreamResponse()`

// idle → retrieving → retrieved → answering → done
type Phase = 'idle' | 'retrieving' | 'retrieved' | 'answering' | 'done'

const PROGRESS: Record<Phase, number> = {
  idle: 0,
  retrieving: 1,
  retrieved: 2,
  answering: 3,
  done: 4,
}

export default function Pregunta() {
  const { t, language } = useLanguage()
  const [query, setQuery] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [hits, setHits] = useState<SearchHit<Dish>[]>([])
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState<string>()

  const busy = phase === 'retrieving' || phase === 'answering'

  async function ask(q: string) {
    const question = q.trim()
    if (!question || busy) return

    setQuery(question)
    setPhase('retrieving')
    setHits([])
    setAnswer('')
    setError(undefined)

    try {
      // Paso 1 — recuperación
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: question, k: 4 }),
      })
      if (!res.ok) throw new Error(`retrieval ${res.status}`)
      const { hits } = (await res.json()) as { hits: SearchHit<Dish>[] }
      if (hits.length === 0) {
        setError(t('pregunta.error'))
        setPhase('idle')
        return
      }
      setHits(hits)
      setPhase('retrieved')

      // Paso 2 — generación fundamentada (stream)
      setPhase('answering')
      const stream = await fetch('/api/ask/answer', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          query: question,
          lang: language,
          dishes: hits.map((h) => ({
            name_es: h.doc.name_es,
            name_en: h.doc.name_en,
            description: h.doc.description,
            ingredients: h.doc.ingredients,
            recipe: h.doc.recipe,
          })),
        }),
      })
      if (!stream.ok || !stream.body) throw new Error(`answer ${stream.status}`)

      const reader = stream.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setAnswer(acc)
      }
      setPhase('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setPhase((p) => (p === 'answering' ? 'done' : 'idle'))
    }
  }

  function reset() {
    setQuery('')
    setPhase('idle')
    setHits([])
    setAnswer('')
    setError(undefined)
  }

  const names = hits.map((h) => h.doc.name_es)

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-6 px-12 py-14">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
          {t('pregunta.sceneLabel')}
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">{t('scene.pregunta')}</h1>
        <p className="text-[var(--color-muted)]">
          {t('pregunta.retrieval')} <span className="text-[var(--color-fg)]">+</span> {t('pregunta.generation')} ={' '}
          <span className="font-semibold text-[var(--color-accent)]">RAG</span>. {t('pregunta.answerSource')}
        </p>
      </header>

      {/* Buscador */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          ask(query)
        }}
        className="flex gap-2"
      >
        <input
          className="flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-lg outline-none focus:border-[var(--color-accent)]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('pregunta.placeholder')}
        />
        <button
          type="submit"
          disabled={busy || query.trim().length === 0}
          className="rounded-md bg-[var(--color-fg)] px-6 text-sm text-white disabled:opacity-40"
        >
          {t('pregunta.button')}
        </button>
        {phase !== 'idle' && !busy && (
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-[var(--color-border)] px-4 text-sm text-[var(--color-muted)]"
          >
            {t('pregunta.clear')}
          </button>
        )}
      </form>

      <div className="flex flex-wrap gap-2 text-xs">
        {['pregunta.sugerencia1', 'pregunta.sugerencia2', 'pregunta.sugerencia3', 'pregunta.sugerencia4'].map((key) => {
          const s = t(key)
          return (
            <button
              key={key}
              type="button"
              onClick={() => ask(s)}
              disabled={busy}
              className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[var(--color-muted)] hover:text-[var(--color-fg)] disabled:opacity-40"
            >
              {s}
            </button>
          )
        })}
      </div>

      {/* Pipeline RAG */}
      <Pipeline progress={PROGRESS[phase]} t={t} />

      {error && <div className="text-sm text-[var(--color-accent)]">{error}</div>}

      {/* Contexto + Respuesta */}
      <div className="grid flex-1 grid-cols-5 gap-8 pt-2">
        {/* Contexto recuperado */}
        <div className="col-span-2 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm uppercase tracking-widest text-[var(--color-muted)]">
            {t('pregunta.contextTitle')}
            {phase === 'retrieving' && <LoadingDot size={14} />}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {hits.map((h, i) => (
                <motion.div
                  key={h.doc.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <DishCard dish={h.doc} similarity={h.similarity} />
                </motion.div>
              ))}
            </AnimatePresence>
            {hits.length === 0 && phase !== 'retrieving' && (
              <div className="col-span-2 rounded-md border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-muted)]">
                {t('pregunta.emptyContext')}
              </div>
            )}
          </div>
        </div>

        {/* Respuesta generada */}
        <div className="col-span-3 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm uppercase tracking-widest text-[var(--color-accent)]">
            {t('pregunta.answerTitle')}
            {phase === 'answering' && <LoadingDot size={14} />}
          </div>
          <div
            className={cn(
              'min-h-[220px] flex-1 rounded-lg border bg-[var(--color-surface)] p-6 text-lg leading-relaxed',
              answer || busy
                ? 'border-[var(--color-accent)]/40 shadow-sm'
                : 'border-dashed border-[var(--color-border)]',
            )}
          >
            {answer ? (
              <p className="whitespace-pre-line">
                {highlight(answer, names)}
                {phase === 'answering' && <Cursor />}
              </p>
            ) : (
              <span className="text-[var(--color-muted)]">
                {phase === 'retrieving'
                  ? t('pregunta.retrieving')
                  : phase === 'answering'
                    ? t('pregunta.thinking')
                    : t('pregunta.answerPlaceholder')}
              </span>
            )}
          </div>
          {phase === 'done' && hits.length > 0 && (
            <div className="text-xs text-[var(--color-muted)]">
              {t('pregunta.groundedIn').replace('{count}', String(hits.length))}{' '}
              <span className="font-mono">gemini-3.8-flash</span>
            </div>
          )}
        </div>
      </div>

      <CodePanel code={code(t)} />
    </div>
  )
}

function Cursor() {
  return (
    <motion.span
      aria-hidden
      animate={{ opacity: [1, 0.15, 1] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
      className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[2px] bg-[var(--color-accent)]"
    />
  )
}

function Pipeline({ progress, t }: { progress: number; t: (key: string) => string }) {
  const STEPS = [
    { label: t('pregunta.step1'), at: 1 },
    { label: t('pregunta.step2'), at: 1 },
    { label: t('pregunta.step3'), at: 2 },
    { label: t('pregunta.step4'), at: 3 },
    { label: t('pregunta.step5'), at: 3 },
  ]
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-code-bg)] px-4 py-3">
      {STEPS.map((step, i) => {
        const state = progress > step.at ? 'done' : progress >= step.at ? 'active' : 'pending'
        return (
          <Fragment key={step.label}>
            {i > 0 && (
              <div
                className={cn(
                  'h-px flex-1 transition-colors duration-500',
                  progress >= step.at ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]',
                )}
              />
            )}
            <div className="flex items-center gap-2">
              <motion.span
                animate={
                  state === 'active'
                    ? { scale: [1, 1.25, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 1, repeat: state === 'active' ? Infinity : 0 }}
                className={cn(
                  'size-2.5 rounded-full transition-colors duration-300',
                  state === 'done'
                    ? 'bg-[var(--color-accent-3)]'
                    : state === 'active'
                      ? 'bg-[var(--color-accent)]'
                      : 'bg-[var(--color-border)]',
                )}
              />
              <span
                className={cn(
                  'whitespace-nowrap text-xs transition-colors duration-300',
                  state === 'pending' ? 'text-[var(--color-muted)]' : 'text-[var(--color-fg)]',
                  state === 'active' && 'font-semibold',
                )}
              >
                {step.label}
              </span>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}

// Resalta los nombres de los platos recuperados dentro de la respuesta.
function highlight(text: string, names: string[]): React.ReactNode {
  const valid = names.filter((n) => n && n.trim().length > 1)
  if (valid.length === 0) return text
  const escaped = valid
    .sort((a, b) => b.length - a.length)
    .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const re = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = text.split(re)
  return parts.map((part, i) =>
    valid.some((n) => n.toLowerCase() === part.toLowerCase()) ? (
      <span
        key={i}
        className="rounded bg-[var(--color-accent)]/12 px-1 font-semibold text-[var(--color-accent)]"
      >
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}
