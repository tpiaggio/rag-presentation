'use client'

import { CodePanel } from '@/components/CodePanel'
import { useLanguage } from '@/lib/useLanguage'

const STACK = ['stack', 'sdk', 'models', 'vectorDb', 'new'] as const

const COSTS = [
  ['gemini-embedding-001', '$0.00002 / 1k tokens'],
  ['gemini-embedding-2', 'debajo.cost.mm'],
  ['Firestore findNearest', 'debajo.cost.firestore'],
  ['debajo.cost.totalLabel', 'debajo.cost.total'],
]

const code = (t: (key: string) => string) => `const model = google.embedding('gemini-embedding-001')
// ${t('debajo.codeComment')}
const model = google.embedding('gemini-embedding-2')

await embed({
  model,
  value: '',
  providerOptions: {
    google: {
      outputDimensionality: 1536,
      content: [[{ inlineData: { mimeType, data } }]],
    },
  },
})`

export default function Debajo() {
  const { t } = useLanguage()
  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-8 px-12 py-16">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
          {t("debajo.sceneLabel")}
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">{t('scene.debajo')}</h1>
      </header>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">{t('debajo.stack')}</div>
          {STACK.map((k) => (
            <div key={k}>
              <div className="font-semibold">{t(`debajo.stack.${k}.label`)}</div>
              <div className="text-sm text-[var(--color-muted)]">{t(`debajo.stack.${k}.value`)}</div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">{t('debajo.costs')}</div>
          {COSTS.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between font-mono text-sm">
              <span>{t(k)}</span>
              <span className="text-[var(--color-muted)]">{t(v)}</span>
            </div>
          ))}
        </div>
      </div>

      <CodePanel
        title={t('debajo.codeTitle')}
        code={code(t)}
        defaultOpen
      />
    </div>
  )
}
