import { NextResponse } from 'next/server'
import { z } from 'zod'
import { embedText } from '@/lib/gemini'
import { findNearestDishes, keywordSearchDishes } from '@/lib/search'

const Body = z.object({
  query: z.string().min(1).max(500),
  mode: z.enum(['keyword', 'semantic']),
  k: z.number().int().min(1).max(20).optional(),
})

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  const { query, mode, k = 6 } = parsed.data

  if (mode === 'keyword') {
    const hits = await keywordSearchDishes(query, k)
    return NextResponse.json({ hits })
  }

  const vector = await embedText(query)
  const hits = await findNearestDishes(vector, 'embedding_text', k)
  return NextResponse.json({ hits, embedding_preview: vector.slice(0, 12) })
}
