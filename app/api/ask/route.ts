import { NextResponse } from 'next/server'
import { z } from 'zod'
import { embedMultimodal } from '@/lib/gemini'
import { findNearestDishes } from '@/lib/search'

// Paso 1 del RAG: la pregunta se vuelve un vector multimodal y recuperamos
// los platos más cercanos. Devolvemos los hits para que la escena anime el
// contexto ANTES de pedir la respuesta generada (ver /api/ask/answer).
const Body = z.object({
  query: z.string().min(1).max(500),
  k: z.number().int().min(1).max(8).optional(),
})

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  const { query, k = 4 } = parsed.data

  const vector = await embedMultimodal(query)
  const hits = await findNearestDishes(vector, 'embedding_mm', k)

  return NextResponse.json({ hits, embedding_preview: vector.slice(0, 12) })
}
