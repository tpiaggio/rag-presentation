import type { ComponentType } from 'react'

export type SceneDefinition = {
  id: string
  index: number
  title: string
  notes: string
  Component: ComponentType
}

export function getSceneByHash(
  scenes: SceneDefinition[],
  hash: string,
): SceneDefinition {
  const cleaned = hash.replace(/^#/, '')
  return scenes.find((s) => s.id === cleaned) ?? scenes[0]
}
