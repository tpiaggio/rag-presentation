export default function Apertura() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
      <div className="mx-auto max-w-3xl px-12 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
          Centinel · Lima · 2026
        </div>
        <h1 className="mt-6 text-6xl font-semibold tracking-tight">
          RAG · Embeddings · Multimodal
        </h1>
        <p className="mt-4 text-xl text-[var(--color-muted)]">
          Una exploración con comida peruana
        </p>
        <div className="mt-12 space-y-2 text-base leading-relaxed">
          <p className="font-semibold">Tomás Piaggio</p>
          <p className="text-[var(--color-muted)]">
            Soy parte del equipo de Centinel. Trabajo en pre-contabilidad automatizada y vector search.
            Hoy: cómo las máquinas entienden el significado, usando algo que todos conocemos.
          </p>
        </div>
      </div>
    </div>
  )
}
