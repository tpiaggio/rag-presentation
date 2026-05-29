import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'

loadEnv({ path: resolve(__dirname, '..', '.env.local') })

async function main() {
  const { adminDb } = await import('../lib/firebase-admin')
  const snap = await adminDb.collection('presentation_songs').get()
  console.log(`total docs: ${snap.size}`)
  for (const d of snap.docs) {
    const raw = d.data() as Record<string, unknown>
    const emb = raw.embedding_mm as { toArray?: () => number[] } | number[] | undefined
    const dim = Array.isArray(emb) ? emb.length : emb?.toArray?.()?.length ?? '?'
    console.log(`  ${d.id.padEnd(45)} ${String(raw.title ?? '?').padEnd(25)} genre=${raw.genre} dim=${dim}`)
  }
}

main()
