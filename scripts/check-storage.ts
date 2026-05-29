import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'

loadEnv({ path: resolve(__dirname, '..', '.env.local') })

async function main() {
  const { adminStorage } = await import('../lib/firebase-admin')
  const configured = process.env.FIREBASE_STORAGE_BUCKET
  console.log('configured bucket:', configured)

  const candidates = [
    configured,
    `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`,
    `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  ]
  for (const name of candidates) {
    if (!name) continue
    try {
      const [exists] = await adminStorage.bucket(name).exists()
      console.log(`  ${name} exists=${exists}`)
    } catch (e) {
      console.log(`  ${name} ERROR: ${e instanceof Error ? e.message : e}`)
    }
  }
}

main()
