'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function SceneFrame({ children, sceneId }: { children: ReactNode; sceneId: string }) {
  return (
    <motion.section
      key={sceneId}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative min-h-screen w-full"
    >
      {children}
    </motion.section>
  )
}
