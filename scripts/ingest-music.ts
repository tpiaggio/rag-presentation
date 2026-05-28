import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import { FieldValue } from 'firebase-admin/firestore'
import type { Storage } from 'firebase-admin/storage'

loadEnv({ path: resolve(__dirname, '..', '.env.local') })

import type { Song, SongGenre } from '../lib/types'

type SeedEntry = {
  id: string
  title: string
  genre: SongGenre
  region: string
  description: string
  mood_tags: string[]
  file: string
}

async function uploadAudio(storage: Storage, entry: SeedEntry, buf: Buffer): Promise<string> {
  const file = storage.bucket().file(`songs/${entry.id}.mp3`)
  await file.save(buf, { contentType: 'audio/mpeg', resumable: false })
  await file.makePublic()
  return file.publicUrl()
}

async function main() {
  const { adminDb, adminStorage } = await import('../lib/firebase-admin')
  const { embedMultimodal } = await import('../lib/gemini')

  const entries = JSON.parse(
    readFileSync(resolve(process.cwd(), 'data/songs.json'), 'utf-8'),
  ) as SeedEntry[]

  for (const entry of entries) {
    try {
      const audioPath = resolve(process.cwd(), 'data/audio', entry.file)
      if (!existsSync(audioPath)) {
        throw new Error(`audio file missing: data/audio/${entry.file}`)
      }
      const audioBuf = readFileSync(audioPath)
      const audio_clip_url = await uploadAudio(adminStorage, entry, audioBuf)

      const text = [entry.title, entry.genre, entry.region, entry.description, entry.mood_tags.join(', ')].join('\n')

      const embedding_mm = await embedMultimodal(text, [
        { text },
        { inlineData: { mimeType: 'audio/mpeg', data: audioBuf.toString('base64') } },
      ])

      const doc: Song = {
        id: entry.id,
        title: entry.title,
        genre: entry.genre,
        region: entry.region,
        description: entry.description,
        mood_tags: entry.mood_tags,
        audio_clip_url,
        embedding_mm,
      }

      await adminDb.collection('presentation_songs').doc(entry.id).set({
        ...doc,
        embedding_mm: FieldValue.vector(embedding_mm),
      })

      process.stdout.write(`  OK  ${entry.id}\n`)
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e)
      process.stdout.write(`  FAIL ${entry.id} :: ${error}\n`)
    }
  }
  process.stdout.write('\nDone.\n')
}

main()
