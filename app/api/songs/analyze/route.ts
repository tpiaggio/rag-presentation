import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generateObject } from 'ai'
import { google } from '@/lib/gemini'

const GENRES = ['huayno', 'marinera', 'criolla', 'chicha', 'yaravi', 'festejo'] as const

const Body = z.object({
  filename: z.string().optional(),
  audioBase64: z.string().min(1),
  mimeType: z.string().min(1),
})

const schema = z.object({
  title: z.string().describe('Título de la canción. Si el nombre del archivo parece ser el título, usalo; si no, inventá uno basado en el clip.'),
  genre: z.enum(GENRES).describe('Uno de: huayno, marinera, criolla, chicha, yaravi, festejo.'),
  region: z.string().describe('Región peruana asociada al género o estilo del clip (Cuzco, Lima, Arequipa, etc.).'),
  description: z.string().describe('Descripción corta en español (2 frases) sobre instrumentos, ritmo y sentimiento.'),
  mood_tags: z.array(z.string()).min(3).max(6).describe('Mood tags en español, minúsculas, sin acentos opcionales.'),
})

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  const { filename, audioBase64, mimeType } = parsed.data

  const audioBytes = Buffer.from(audioBase64, 'base64')

  const { object } = await generateObject({
    model: google('gemini-2.5-flash'),
    schema,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analiza este clip de música peruana${
              filename ? ` (archivo original: ${filename})` : ''
            } y completá los metadatos en español. Si el nombre del archivo te da pistas sobre el título, respetalo.`,
          },
          { type: 'file', data: audioBytes, mediaType: mimeType },
        ],
      },
    ],
  })

  return NextResponse.json(object)
}
