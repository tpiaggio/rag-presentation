import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { readFileSync } from 'node:fs'

function init() {
  if (getApps().length > 0) return

  const projectId = process.env.FIREBASE_PROJECT_ID
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET
  const saPath = process.env.FIREBASE_ADMIN_SA_PATH

  if (saPath) {
    const credential = cert(JSON.parse(readFileSync(saPath, 'utf-8')))
    initializeApp({ credential, projectId, storageBucket })
    return
  }

  initializeApp({ projectId, storageBucket })
}

init()

export const adminDb = getFirestore()
export const adminStorage = getStorage()
