'use client'

import { SceneRunner } from '@/components/SceneRunner'
import { SCENES } from '@/lib/scenes-registry'

export default function Home() {
  return <SceneRunner scenes={SCENES} />
}
