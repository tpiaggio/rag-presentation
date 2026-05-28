import { NextResponse } from 'next/server'
import { z } from 'zod'
import { embedMultimodal } from '@/lib/gemini'
import { findNearestDishes } from '@/lib/search'

const Part = z.union([
  z.object({ text: z.string() }),
  z.object({ inlineData: z.object({ mimeType: z.string(), data: z.string() }) }),
])

const Body = z.object({
  query: z.string().default(''),
  content: z.array(Part).optional(),
  k: z.number().int().min(1).max(20).optional(),
})

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  const { query, content, k = 6 } = parsed.data
  const vector = await embedMultimodal(query, content)
  const hits = await findNearestDishes(vector, 'embedding_mm', k)
  return NextResponse.json({ hits, embedding_preview: vector.slice(0, 16) })
}
