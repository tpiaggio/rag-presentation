import { NextResponse } from 'next/server'
import { z } from 'zod'

const Body = z.object({ passcode: z.string().min(1).max(200) })

const DAY = 60 * 60 * 24

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  const expected = process.env.ACCESS_PASSCODE?.trim()
  if (!expected) {
    return NextResponse.json({ ok: true, ungated: true })
  }
  if (parsed.data.passcode.trim() !== expected) {
    return NextResponse.json({ error: 'invalid passcode' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set('access', expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: DAY,
  })
  return res
}
