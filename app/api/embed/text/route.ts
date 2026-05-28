import { NextResponse } from 'next/server'
import { z } from 'zod'
import { embedText } from '@/lib/gemini'

const Body = z.object({ value: z.string().min(1).max(2000) })

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  const embedding = await embedText(parsed.data.value)
  return NextResponse.json({ embedding })
}
