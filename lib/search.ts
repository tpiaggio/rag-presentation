import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import type { Dish, SearchHit } from './types'

type Field = 'embedding_text' | 'embedding_mm'

export async function findNearestDishes(
  vector: number[],
  field: Field,
  k = 6,
): Promise<SearchHit<Dish>[]> {
  const snap = await adminDb
    .collection('presentation_dishes')
    .findNearest({
      vectorField: field,
      queryVector: FieldValue.vector(vector),
      limit: k,
      distanceMeasure: 'COSINE',
      distanceResultField: '_distance',
    })
    .get()

  return snap.docs.map((d) => {
    const raw = d.data() as Dish & { _distance: number }
    return {
      doc: raw,
      distance: raw._distance,
      similarity: 1 - raw._distance,
    }
  })
}

export async function keywordSearchDishes(query: string, k = 6): Promise<SearchHit<Dish>[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const snap = await adminDb.collection('presentation_dishes').get()
  const hits: SearchHit<Dish>[] = []
  for (const d of snap.docs) {
    const dish = d.data() as Dish
    const hay = [dish.name_es, dish.name_en, ...dish.ingredients].join(' ').toLowerCase()
    if (hay.includes(q)) hits.push({ doc: dish, distance: 0, similarity: 1 })
    if (hits.length >= k) break
  }
  return hits
}
