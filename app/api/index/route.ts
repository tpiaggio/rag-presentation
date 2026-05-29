import { NextResponse } from 'next/server'
import { z } from 'zod'
import { adminDb, adminStorage } from '@/lib/firebase-admin'
import { embedMultimodal, embedText } from '@/lib/gemini'
import { extractPdf, renderFirstPagePng } from '@/lib/pdf'
import { FieldValue } from 'firebase-admin/firestore'

const Body = z.object({
  filename: z.string(),
  pdfBase64: z.string(),
})

async function renderAndUploadPng(arrBuf: ArrayBuffer, id: string): Promise<string> {
  const png = await renderFirstPagePng(arrBuf)
  const file = adminStorage.bucket().file(`live/${id}.png`)
  await file.save(png, { contentType: 'image/png', resumable: false })
  await file.makePublic()
  return file.publicUrl()
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  const { filename, pdfBase64 } = parsed.data
  const bytes = Buffer.from(pdfBase64, 'base64')
  const sliceFreshBuffer = (): ArrayBuffer =>
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer

  const extract = await extractPdf(sliceFreshBuffer())

  const id = `live_${Date.now()}`
  const textForEmbedding = extract.text.slice(0, 8000)

  const [embedding_text, embedding_mm, image_url] = await Promise.all([
    embedText(textForEmbedding),
    embedMultimodal(textForEmbedding, [
      { text: textForEmbedding },
      { inlineData: { mimeType: 'application/pdf', data: pdfBase64 } },
    ]),
    renderAndUploadPng(sliceFreshBuffer(), id).catch((err) => {
      console.error('[index] page render failed, falling back to empty image_url:', err)
      return ''
    }),
  ])

  await adminDb.collection('presentation_dishes').doc(id).set({
    id,
    name_es: filename.replace(/\.pdf$/i, ''),
    name_en: filename.replace(/\.pdf$/i, ''),
    category: 'criollo',
    description: extract.text.slice(0, 240),
    recipe: extract.text,
    ingredients: [],
    tags: ['live', 'indexed_on_stage'],
    image_url,
    source_url: '',
    embedding_text: FieldValue.vector(embedding_text),
    embedding_mm: FieldValue.vector(embedding_mm),
  })

  return NextResponse.json({
    id,
    pages: extract.pages,
    chunks: extract.chunks.length,
    embedding_preview: embedding_mm.slice(0, 16),
  })
}
