import { CodePanel } from '@/components/CodePanel'

const STACK = [
  ['Stack', 'Next.js 16, React 19, TypeScript estricto, Tailwind v4, Framer Motion'],
  ['SDK de AI', 'Vercel AI SDK (@ai-sdk/google 3.0.x sobre ai 6.x), igual que Centinel'],
  ['Modelos', 'gemini-embedding-001 (texto, 768d) · gemini-embedding-2 (multimodal, 1536d)'],
  ['Vector DB', 'Firestore vectorField + findNearest, igual que Centinel'],
  ['Lo nuevo', 'Sólo el modelo nuevo y un providerOption nuevo. No hay SDK nuevo.'],
]

const COSTS = [
  ['gemini-embedding-001', '$0.00002 / 1k tokens'],
  ['gemini-embedding-2',   '$0.0001 / request (orden de magnitud)'],
  ['Firestore findNearest', 'Reads normales × k'],
  ['Total estimado por consulta', '~$0.0001 a $0.0002'],
]

const CODE = `const model = google.embedding('gemini-embedding-001')
// para multimodal:
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
  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-8 px-12 py-16">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
          Escena 08
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">Lo que pasa por debajo</h1>
      </header>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">El stack</div>
          {STACK.map(([k, v]) => (
            <div key={k}>
              <div className="font-semibold">{k}</div>
              <div className="text-sm text-[var(--color-muted)]">{v}</div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">Costos</div>
          {COSTS.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between font-mono text-sm">
              <span>{k}</span>
              <span className="text-[var(--color-muted)]">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <CodePanel
        title="El diff completo para que Centinel use multimodal"
        code={CODE}
        defaultOpen
      />

      <div className="mt-auto text-center text-[var(--color-muted)]">
        Gracias.
      </div>
    </div>
  )
}
