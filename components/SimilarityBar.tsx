import { cn } from '@/lib/cn'

export function SimilarityBar({
  similarity,
  className,
}: {
  similarity: number
  className?: string
}) {
  const pct = Math.max(0, Math.min(1, similarity)) * 100
  return (
    <div className={cn('flex items-center gap-2 font-mono text-xs', className)}>
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          className="h-full bg-[var(--color-accent-3)]"
          style={{ width: `${pct.toFixed(1)}%` }}
        />
      </div>
      <span className="tabular-nums text-[var(--color-muted)]">
        {similarity.toFixed(2)}
      </span>
    </div>
  )
}
