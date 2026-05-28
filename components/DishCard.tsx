import Image from 'next/image'
import { cn } from '@/lib/cn'
import { SimilarityBar } from './SimilarityBar'
import type { Dish } from '@/lib/types'

type Props = {
  dish: Dish
  similarity?: number
  className?: string
  onSelect?: (dish: Dish) => void
}

export function DishCard({ dish, similarity, className, onSelect }: Props) {
  const hasImage = typeof dish.image_url === 'string' && dish.image_url.length > 0

  return (
    <button
      type="button"
      onClick={onSelect ? () => onSelect(dish) : undefined}
      className={cn(
        'group flex flex-col rounded-md border border-[var(--color-border)]',
        'bg-[var(--color-surface)] overflow-hidden text-left',
        'transition-transform duration-150 hover:-translate-y-1 hover:shadow-md',
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-border)]">
        {hasImage ? (
          <Image
            src={dish.image_url}
            alt={dish.name_es}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-[var(--color-code-bg)] text-3xl text-[var(--color-muted)]">
            📄
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-3">
        <div>
          <div className="font-semibold tracking-tight">{dish.name_es}</div>
          <div className="text-xs text-[var(--color-muted)]">{dish.name_en}</div>
        </div>
        {typeof similarity === 'number' && <SimilarityBar similarity={similarity} />}
      </div>
    </button>
  )
}
