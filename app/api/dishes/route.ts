import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import type { Dish } from '@/lib/types'

export async function GET() {
  const snap = await adminDb.collection('presentation_dishes').get()
  const dishes = snap.docs
    .map((d) => {
      const raw = d.data() as Record<string, unknown>
      const embedding_text = (raw.embedding_text as { toArray?: () => number[] })?.toArray?.()
        ?? raw.embedding_text
        ?? []
      const embedding_mm = (raw.embedding_mm as { toArray?: () => number[] })?.toArray?.()
        ?? raw.embedding_mm
        ?? []
      return { ...raw, embedding_text, embedding_mm } as Dish
    })
    .filter((d) => !d.id.startsWith('live_'))
  return NextResponse.json({ dishes })
}
