import { NextResponse } from 'next/server'
import { z } from 'zod'
import { embedMultimodal } from '@/lib/gemini'
import { findNearestDishes } from '@/lib/search'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import type { Song, SearchHit } from '@/lib/types'

const Part = z.union([
  z.object({ text: z.string() }),
  z.object({ inlineData: z.object({ mimeType: z.string(), data: z.string() }) }),
])

const Body = z.object({
  query: z.string().default(''),
  content: z.array(Part).optional(),
  k: z.number().int().min(1).max(20).optional(),
  collection: z.enum(['dishes', 'songs']).default('dishes'),
})

async function findNearestSongs(vector: number[], k: number): Promise<SearchHit<Song>[]> {
  const snap = await adminDb
    .collection('presentation_songs')
    .findNearest({
      vectorField: 'embedding_mm',
      queryVector: FieldValue.vector(vector),
      limit: k,
      distanceMeasure: 'COSINE',
      distanceResultField: '_distance',
    })
    .get()
  return snap.docs.map((d) => {
    const raw = d.data() as Song & { _distance: number }
    return { doc: raw, distance: raw._distance, similarity: 1 - raw._distance }
  })
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  const { query, content, k = 6, collection } = parsed.data
  const vector = await embedMultimodal(query, content)
  const hits =
    collection === 'songs'
      ? await findNearestSongs(vector, k)
      : await findNearestDishes(vector, 'embedding_mm', k)
  return NextResponse.json({ hits, embedding_preview: vector.slice(0, 16) })
}
