import { NextResponse } from 'next/server'
import { z } from 'zod'
import { adminDb, adminStorage } from '@/lib/firebase-admin'
import { embedMultimodal } from '@/lib/gemini'
import { FieldValue } from 'firebase-admin/firestore'
import type { Song, SongGenre } from '@/lib/types'

const GENRES: readonly SongGenre[] = ['huayno', 'marinera', 'criolla', 'chicha', 'yaravi', 'festejo']

const Body = z.object({
  title: z.string().min(1).max(120),
  genre: z.enum(GENRES as unknown as [SongGenre, ...SongGenre[]]),
  region: z.string().max(120).optional(),
  description: z.string().max(500).optional(),
  mood_tags: z.array(z.string().max(40)).max(8).optional(),
  audioBase64: z.string().min(1),
  mimeType: z.string().min(1),
})

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

async function uploadAudio(id: string, mimeType: string, bytes: Buffer): Promise<string> {
  const ext = mimeType.includes('mp3') || mimeType.includes('mpeg') ? 'mp3' : mimeType.split('/')[1] ?? 'audio'
  const file = adminStorage.bucket().file(`songs/${id}.${ext}`)
  await file.save(bytes, { contentType: mimeType, resumable: false })
  await file.makePublic()
  return file.publicUrl()
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body', details: parsed.error.format() }, { status: 400 })
  }
  const { title, genre, region, description, mood_tags, audioBase64, mimeType } = parsed.data

  const audioBytes = Buffer.from(audioBase64, 'base64')
  const id = `${slugify(title)}-${Date.now().toString(36)}`

  const text = [title, genre, region ?? '', description ?? '', (mood_tags ?? []).join(', ')]
    .filter(Boolean)
    .join('\n')

  const [embedding_mm, audio_clip_url] = await Promise.all([
    embedMultimodal(text, [
      { text },
      { inlineData: { mimeType, data: audioBase64 } },
    ]),
    uploadAudio(id, mimeType, audioBytes),
  ])

  const doc: Song = {
    id,
    title,
    genre,
    region: region ?? '',
    description: description ?? '',
    mood_tags: mood_tags ?? [],
    audio_clip_url,
    embedding_mm,
  }

  await adminDb.collection('presentation_songs').doc(id).set({
    ...doc,
    embedding_mm: FieldValue.vector(embedding_mm),
  })

  return NextResponse.json({
    id,
    title,
    genre,
    audio_clip_url,
    embedding_preview: embedding_mm.slice(0, 16),
  })
}
