import { NextResponse } from 'next/server'
import { z } from 'zod'
import { adminDb } from '@/lib/firebase-admin'
import { embedMultimodal } from '@/lib/gemini'
import { extractPdf } from '@/lib/pdf'
import { FieldValue } from 'firebase-admin/firestore'

const Body = z.object({
  filename: z.string(),
  pdfBase64: z.string(),
})

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  const { filename, pdfBase64 } = parsed.data
  const bytes = Buffer.from(pdfBase64, 'base64')
  const arrBuf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  const extract = await extractPdf(arrBuf)

  const embedding = await embedMultimodal(extract.text.slice(0, 8000), [
    { text: extract.text.slice(0, 8000) },
    { inlineData: { mimeType: 'application/pdf', data: pdfBase64 } },
  ])

  const id = `live_${Date.now()}`
  await adminDb.collection('presentation_dishes').doc(id).set({
    id,
    name_es: filename.replace(/\.pdf$/i, ''),
    name_en: filename.replace(/\.pdf$/i, ''),
    category: 'criollo',
    description: extract.text.slice(0, 240),
    recipe: extract.text,
    ingredients: [],
    tags: ['live', 'indexed_on_stage'],
    image_url: '',
    source_url: '',
    embedding_text: FieldValue.vector(new Array(768).fill(0)),
    embedding_mm: FieldValue.vector(embedding),
  })

  return NextResponse.json({
    id,
    pages: extract.pages,
    chunks: extract.chunks.length,
    embedding_preview: embedding.slice(0, 16),
  })
}
