import { NextResponse } from 'next/server'
import { z } from 'zod'
import { embedMultimodal } from '@/lib/gemini'

const Part = z.union([
  z.object({ text: z.string() }),
  z.object({
    inlineData: z.object({ mimeType: z.string(), data: z.string() }),
  }),
])

const Body = z.object({
  value: z.string().default(''),
  content: z.array(Part).optional(),
})

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  const { value, content } = parsed.data
  const embedding = await embedMultimodal(value, content)
  return NextResponse.json({ embedding })
}
