'use client'

import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { getSceneByHash, type SceneDefinition } from '@/lib/scenes'
import { SceneChrome } from './SceneChrome'
import { SceneFrame } from './SceneFrame'
import { PresenterNotes } from './PresenterNotes'

export function SceneRunner({ scenes }: { scenes: SceneDefinition[] }) {
  const [active, setActive] = useState(() => scenes[0])
  const [notesOpen, setNotesOpen] = useState(false)

  useEffect(() => {
    const sync = () => setActive(getSceneByHash(scenes, window.location.hash))
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [scenes])

  const go = useCallback(
    (delta: number) => {
      const next = Math.max(0, Math.min(scenes.length - 1, active.index + delta))
      window.location.hash = scenes[next].id
    },
    [active, scenes],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === '.') {
        e.preventDefault()
        setNotesOpen((v) => !v)
        return
      }
      if (e.key === 'Escape') {
        setNotesOpen(false)
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') go(1)
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  return (
    <>
      <AnimatePresence mode="wait">
        <SceneFrame key={active.id} sceneId={active.id}>
          <active.Component />
        </SceneFrame>
      </AnimatePresence>
      <SceneChrome
        index={active.index}
        total={scenes.length}
        title={active.title}
        onOpenNotes={() => setNotesOpen(true)}
      />
      <PresenterNotes
        open={notesOpen}
        onClose={() => setNotesOpen(false)}
        title={active.title}
        notes={active.notes}
      />
    </>
  )
}
