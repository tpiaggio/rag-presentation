import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'

loadEnv({ path: resolve(__dirname, '..', '.env.local') })

async function main() {
  const { adminDb } = await import('../lib/firebase-admin')
  const snap = await adminDb.collection('presentation_dishes').get()
  let removed = 0
  for (const d of snap.docs) {
    if (d.id.startsWith('live_')) {
      await d.ref.delete()
      console.log('  removed', d.id)
      removed += 1
    }
  }
  console.log(`\nDeleted ${removed} live_ doc(s).`)
}

main()
