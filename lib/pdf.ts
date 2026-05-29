import { extractText, getDocumentProxy, renderPageAsImage } from 'unpdf'

export type PdfExtract = {
  text: string
  pages: number
  chunks: string[]
}

export async function extractPdf(buf: ArrayBuffer): Promise<PdfExtract> {
  const pdf = await getDocumentProxy(new Uint8Array(buf))
  const { text, totalPages } = await extractText(pdf, { mergePages: true })
  const flat = Array.isArray(text) ? text.join('\n') : text
  const chunks: string[] = []
  for (let i = 0; i < flat.length; i += 400) chunks.push(flat.slice(i, i + 400))
  return { text: flat, pages: totalPages, chunks }
}

export async function renderFirstPagePng(buf: ArrayBuffer): Promise<Buffer> {
  const pngArrayBuffer = await renderPageAsImage(new Uint8Array(buf), 1, {
    canvasImport: () => import('@napi-rs/canvas'),
    scale: 1.6,
  })
  return Buffer.from(pngArrayBuffer)
}
