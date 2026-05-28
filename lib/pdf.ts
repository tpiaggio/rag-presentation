import { extractText, getDocumentProxy } from 'unpdf'

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
