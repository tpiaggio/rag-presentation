import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'

loadEnv({ path: resolve(__dirname, '..', '.env.local') })

async function main() {
  const { adminDb, adminStorage } = await import('../lib/firebase-admin')
  const docs = await adminDb.collection('presentation_songs').get()
  const knownIds = new Set(docs.docs.map((d) => d.id))

  const [files] = await adminStorage.bucket().getFiles({ prefix: 'songs/' })
  console.log(`docs in Firestore: ${[...knownIds].join(', ')}`)
  console.log(`audio files in Storage:`)
  let removed = 0
  for (const f of files) {
    const base = f.name.replace(/^songs\//, '').replace(/\.[^.]+$/, '')
    const orphan = !knownIds.has(base)
    console.log(`  ${f.name}  base=${base}  ${orphan ? 'ORPHAN' : 'ok'}`)
    if (orphan) {
      await f.delete()
      removed += 1
    }
  }
  console.log(`\nDeleted ${removed} orphan(s).`)
}

main()
