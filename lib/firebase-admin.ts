import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { readFileSync } from 'node:fs'

function init() {
  if (getApps().length > 0) return
  const path = process.env.FIREBASE_ADMIN_SA_PATH
  if (!path) throw new Error('FIREBASE_ADMIN_SA_PATH is not set')
  const credential = cert(JSON.parse(readFileSync(path, 'utf-8')))
  initializeApp({
    credential,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  })
}

init()

export const adminDb = getFirestore()
export const adminStorage = getStorage()
