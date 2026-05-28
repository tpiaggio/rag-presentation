import { LoadingDot } from '@/components/LoadingDot'
import { SimilarityBar } from '@/components/SimilarityBar'
import { EmbeddingViz } from '@/components/EmbeddingViz'
import { CodePanel } from '@/components/CodePanel'

export default function Home() {
  const fakeEmbedding = Array.from({ length: 30 }, () => Math.random() * 2 - 1)
  return (
    <main className="mx-auto max-w-3xl space-y-8 p-12">
      <h1 className="text-3xl font-semibold tracking-tight">Visual primitives smoke test</h1>
      <div className="flex items-center gap-4">
        <LoadingDot />
        <SimilarityBar similarity={0.87} />
      </div>
      <EmbeddingViz values={fakeEmbedding} label="ceviche · 768 dim" />
      <CodePanel
        defaultOpen
        code={`const { embedding } = await embed({
  model: google.embedding('gemini-embedding-001'),
  value: 'ceviche',
})`}
      />
    </main>
  )
}
