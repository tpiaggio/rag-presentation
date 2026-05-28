import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { FieldValue } from 'firebase-admin/firestore'

loadEnv({ path: resolve(__dirname, '..', '.env.local') })

import type { Dish, DishCategory } from '../lib/types'
import type { MultimodalPart } from '../lib/gemini'
import type { Storage } from 'firebase-admin/storage'

type SeedEntry = { slug: string; category: DishCategory }

function sleep(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms))
}

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 15000,
): Promise<T> {
  let lastError: unknown
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (e) {
      lastError = e
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('429') || msg.includes('quota') || msg.includes('rate') || msg.includes('Too Many')) {
        process.stdout.write(`    [retry ${i + 1}/${retries} in ${delayMs / 1000}s]\n`)
        await sleep(delayMs)
      } else {
        throw e
      }
    }
  }
  throw lastError
}

async function uploadImage(
  storage: Storage,
  slug: string,
  buf: Buffer,
  mimeType: string,
  fallbackUrl: string,
): Promise<string> {
  const ext = mimeType.includes('png') ? 'png' : 'jpg'
  const file = storage.bucket().file(`dishes/${slug}.${ext}`)
  try {
    await file.save(buf, { contentType: mimeType, public: true, resumable: false })
    await file.makePublic()
    return file.publicUrl()
  } catch {
    return fallbackUrl
  }
}

async function main() {
  const adminMod = await import('../lib/firebase-admin')
  const { adminDb, adminStorage } = (adminMod as any).default ?? adminMod
  const geminiMod = await import('../lib/gemini')
  const { embedText, embedMultimodal } = (geminiMod as any).default ?? geminiMod
  const wikiMod = await import('./lib/wikipedia')
  const { fetchWikipediaSummary, fetchImageBytes } = (wikiMod as any).default ?? wikiMod
  const augMod = await import('./lib/augment')
  const { augmentDish } = (augMod as any).default ?? augMod

  const entries = JSON.parse(
    readFileSync(resolve(process.cwd(), 'data/dishes.json'), 'utf-8'),
  ) as SeedEntry[]

  const existingSnap = await adminDb.collection('presentation_dishes').get()
  const existingIds = new Set(existingSnap.docs.map((d: { id: string }) => d.id))
  process.stdout.write(`Skipping ${existingIds.size} already-ingested docs.\n\n`)

  const errors: { slug: string; error: string }[] = []

  for (const entry of entries) {
    if (existingIds.has(entry.slug)) {
      process.stdout.write(`  SKIP ${entry.slug}\n`)
      continue
    }

    await sleep(500)
    try {
      const summary = await withRetry(() => fetchWikipediaSummary(entry.slug), 3, 5000)
      if (!summary.image_url) throw new Error('no image')

      const { data, mimeType } = await withRetry(() => fetchImageBytes(summary.image_url!), 3, 10000)
      const image_url = await uploadImage(adminStorage, entry.slug, data, mimeType, summary.image_url)

      const aug = await withRetry(() => augmentDish({
        name_es: summary.title,
        wikipedia_extract: summary.extract,
      }), 3, 15000)

      const textForEmbedding = [
        summary.title,
        aug.description,
        aug.ingredients.join(', '),
        aug.tags.join(', '),
      ].join('\n')

      const multimodalContent: MultimodalPart[] = [
        { text: textForEmbedding },
        { inlineData: { mimeType, data: data.toString('base64') } },
      ]

      const [embedding_text, embedding_mm] = await Promise.all([
        withRetry(() => embedText(textForEmbedding), 3, 15000),
        withRetry(() => embedMultimodal(textForEmbedding, multimodalContent), 3, 15000),
      ])

      const doc: Dish = {
        id: entry.slug,
        name_es: summary.title,
        name_en: aug.name_en,
        category: entry.category,
        description: aug.description,
        recipe: aug.recipe,
        ingredients: aug.ingredients,
        tags: aug.tags,
        image_url,
        source_url: summary.source_url,
        embedding_text,
        embedding_mm,
      }

      const ref = adminDb.collection('presentation_dishes').doc(entry.slug)
      await ref.set({
        ...doc,
        embedding_text: FieldValue.vector(embedding_text),
        embedding_mm: FieldValue.vector(embedding_mm),
      })

      process.stdout.write(`  OK  ${entry.slug}\n`)
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e)
      errors.push({ slug: entry.slug, error })
      process.stdout.write(`  FAIL ${entry.slug} :: ${error}\n`)
    }
  }

  const succeeded = entries.length - errors.length
  process.stdout.write(`\nDone. ${succeeded}/${entries.length} succeeded (${existingIds.size} pre-existing).\n`)
  if (errors.length) {
    process.stdout.write('\nErrors:\n')
    for (const e of errors) process.stdout.write(`  ${e.slug}: ${e.error}\n`)
  }
}

main()
