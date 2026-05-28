# RAG Presentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone, visually polished Next.js web application that doubles as a 30 to 45 minute live presentation on vector embeddings, RAG, and multimodal RAG, anchored in Peruvian gastronomy and a small music closer, runnable from your laptop on talk day.

**Architecture:** Single Next.js 16 App Router application in a self-contained `rag-presentation/` folder at the worktree root. Nine keyboard-navigated full-viewport scenes wrapped in a Framer Motion scene runner. Server-side Route Handlers call the Gemini API exclusively through Vercel AI SDK (`@ai-sdk/google`), with text embeddings via `gemini-embedding-001` and multimodal embeddings via `gemini-embedding-2`. Firestore stores dish and song documents with `vectorField` embeddings, queried via `findNearest`.

**Tech Stack:** Next.js 16 (App Router, React 19, TypeScript strict), Tailwind v4, shadcn, Framer Motion, Vercel AI SDK (`ai@6.0.191`, `@ai-sdk/google@^3.0.79`), Firebase Admin SDK (server-side Firestore + Storage), Firebase Client SDK (none expected, server-only access), `unpdf` for PDF text extraction on the live indexing demo, plain `fetch` for Wikipedia ingestion.

**Reference spec:** `docs/superpowers/specs/2026-05-28-rag-presentation-design.md`

**Adapted execution model (read before starting):**

- The spec lists "no automated tests" as an explicit non-goal. Tasks below replace the usual "write failing test, make it pass" cadence with "implement, manually verify, move on." Verification steps are explicit: run a dev command, see a specific observable outcome.
- The user's saved preference is no per-task auto-commits. Each task ends with a suggested commit message you can run when you choose. Do not commit inside the task unless instructed.
- All paths in this plan are relative to the worktree root: `/Users/tomaspiaggio/Documents/centinel/.claude/worktrees/rag-presentation/`.

---

## Pre-flight: secrets, accounts, project

Before Task 0, you (Tomás) handle these once. The plan does not automate them.

- [ ] **Step P1: Create a throwaway Firebase project.**
  - Firebase Console, name it `centinel-rag-demo` or similar.
  - Enable Firestore (Native mode) and Cloud Storage.
  - Generate a service-account JSON for Admin SDK, save to your machine outside this repo (for example `~/.config/centinel-rag-demo/sa.json`).
- [ ] **Step P2: Get a Gemini API key.**
  - Go to https://aistudio.google.com/apikey, generate a key tied to a project that has billing enabled (the free tier is fine for ~50 dishes and rehearsal volume).
- [ ] **Step P3: Confirm worktree branch name (optional).**
  - Current branch is `tpiaggio/en-2136`. To rename: `git branch -m tpiaggio/rag-presentation`.
- [ ] **Step P4: Add `.superpowers/` to `.gitignore` if missing.**
  - The visual companion writes ephemeral session files to `.superpowers/brainstorm/`. Keep them out of git.

---

## Task 0: Project bootstrap

**Files:**
- Create: `rag-presentation/package.json`
- Create: `rag-presentation/tsconfig.json`
- Create: `rag-presentation/next.config.ts`
- Create: `rag-presentation/postcss.config.mjs`
- Create: `rag-presentation/app/layout.tsx`
- Create: `rag-presentation/app/globals.css`
- Create: `rag-presentation/app/page.tsx` (placeholder, replaced in Task 2)
- Create: `rag-presentation/.env.local.example`
- Create: `rag-presentation/.gitignore`
- Modify: `.gitignore` at worktree root (add `rag-presentation/.env.local`, `rag-presentation/node_modules`, `rag-presentation/.next`, `rag-presentation/.next-build-cache`)

- [ ] **Step 0.1: Create the project folder and `package.json`.**

Write to `rag-presentation/package.json`:

```json
{
  "name": "rag-presentation",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo --port 3030",
    "build": "next build",
    "start": "next start --port 3030",
    "lint": "next lint",
    "ingest:dishes": "tsx scripts/ingest-dishes.ts",
    "ingest:music": "tsx scripts/ingest-music.ts"
  },
  "dependencies": {
    "next": "16.0.0",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "ai": "6.0.191",
    "@ai-sdk/google": "^3.0.79",
    "@ai-sdk/provider": "3.0.10",
    "@ai-sdk/provider-utils": "4.0.27",
    "firebase-admin": "13.6.0",
    "framer-motion": "12.23.24",
    "lucide-react": "^0.546.0",
    "unpdf": "1.4.0",
    "zod": "4.1.13",
    "clsx": "2.1.1",
    "tailwind-merge": "3.4.0"
  },
  "devDependencies": {
    "@types/node": "22.0.0",
    "@types/react": "19.2.0",
    "@types/react-dom": "19.2.0",
    "typescript": "5.9.4",
    "tailwindcss": "4.1.16",
    "@tailwindcss/postcss": "4.1.16",
    "postcss": "8.5.5",
    "tsx": "4.20.4",
    "dotenv": "16.4.5"
  },
  "packageManager": "pnpm@10.6.5"
}
```

The Next.js, React, and AI SDK versions match Centinel's root `package.json`. Confirm by skimming `/Users/tomaspiaggio/Documents/centinel/package.json` and adjusting any minor drift if Centinel has bumped since this plan was written.

- [ ] **Step 0.2: Create the TypeScript config.**

Write to `rag-presentation/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "verbatimModuleSyntax": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 0.3: Create `next.config.ts`.**

Write to `rag-presentation/next.config.ts`:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
  },
}

export default nextConfig
```

- [ ] **Step 0.4: Create the PostCSS config (Tailwind v4 uses the `@tailwindcss/postcss` plugin).**

Write to `rag-presentation/postcss.config.mjs`:

```js
export default {
  plugins: { '@tailwindcss/postcss': {} },
}
```

- [ ] **Step 0.5: Create `app/globals.css` with Tailwind v4 directives and the design tokens.**

Write to `rag-presentation/app/globals.css`:

```css
@import 'tailwindcss';

@theme {
  --color-bg:        #fafaf7;
  --color-surface:   #ffffff;
  --color-fg:        #0a0a0a;
  --color-muted:     #737373;
  --color-border:    #e8d9c2;
  --color-accent:    #c8553d;
  --color-accent-2:  #e8b04a;
  --color-accent-3:  #7a8f3a;
  --color-code-bg:   #f5f3ee;
  --color-code-fg:   #262626;

  --font-sans: 'Inter Variable', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono Variable', ui-monospace, SFMono-Regular, monospace;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}

html, body {
  background: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-sans);
  font-feature-settings: 'cv11', 'ss01';
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.font-mono, code, pre, .embedding-number {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

::selection {
  background: color-mix(in oklab, var(--color-accent) 25%, transparent);
}
```

- [ ] **Step 0.6: Create the root layout.**

Write to `rag-presentation/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RAG · Embeddings · Multimodal',
  description: 'Una exploración con comida peruana',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource-variable/inter@5/index.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource-variable/jetbrains-mono@5/index.min.css" />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 0.7: Create a placeholder home page.**

Write to `rag-presentation/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">RAG Presentation</h1>
        <p className="text-[var(--color-muted)]">Project bootstrapped. Scene runner lands in Task 2.</p>
      </div>
    </main>
  )
}
```

- [ ] **Step 0.8: Create the env example file.**

Write to `rag-presentation/.env.local.example`:

```bash
# Gemini
GOOGLE_GENERATIVE_AI_API_KEY=

# Firebase Admin (path to service-account JSON outside this repo)
FIREBASE_ADMIN_SA_PATH=/Users/tomaspiaggio/.config/centinel-rag-demo/sa.json
FIREBASE_PROJECT_ID=centinel-rag-demo
FIREBASE_STORAGE_BUCKET=centinel-rag-demo.firebasestorage.app
```

- [ ] **Step 0.9: Create the project-local `.gitignore`.**

Write to `rag-presentation/.gitignore`:

```
node_modules/
.next/
.next-build-cache/
.env.local
.env*.local
.DS_Store
*.tsbuildinfo
next-env.d.ts
data/cache/
```

- [ ] **Step 0.10: Install dependencies.**

Run from the worktree root:

```bash
cd rag-presentation && pnpm install
```

Expected: pnpm resolves and installs cleanly with no peer-dep errors. If `@ai-sdk/google` peer-warns about `ai`, confirm both are on the versions listed in Step 0.1 and that the lockfile is fresh (delete `pnpm-lock.yaml` and re-run if needed).

- [ ] **Step 0.11: Confirm the bootstrap works.**

Copy `.env.local.example` to `.env.local` and fill in your Gemini key and the Firebase service-account path from Pre-flight.

```bash
cd rag-presentation && cp .env.local.example .env.local
# edit .env.local with your real values
pnpm dev
```

Expected: Next.js dev server starts on port 3030, opening `http://localhost:3030` shows the "RAG Presentation" placeholder text on a warm off-white background with Inter font visible. If fonts look wrong, the jsDelivr font CDN URL is the most likely cause; check the network tab.

Suggested commit message when you are ready: `chore(rag-pres): bootstrap Next.js 16 app with Centinel-pinned versions`.

---

## Task 1: Visual system primitives and Firebase Admin singleton

**Files:**
- Create: `rag-presentation/lib/cn.ts`
- Create: `rag-presentation/lib/firebase-admin.ts`
- Create: `rag-presentation/lib/gemini.ts`
- Create: `rag-presentation/components/LoadingDot.tsx`
- Create: `rag-presentation/components/SimilarityBar.tsx`
- Create: `rag-presentation/components/EmbeddingViz.tsx`
- Create: `rag-presentation/components/DishCard.tsx`
- Create: `rag-presentation/components/CodePanel.tsx`
- Create: `rag-presentation/lib/types.ts`

- [ ] **Step 1.1: Create the class merge helper.**

Write to `rag-presentation/lib/cn.ts`:

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 1.2: Create the Firebase Admin singleton.**

Write to `rag-presentation/lib/firebase-admin.ts`:

```ts
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
```

- [ ] **Step 1.3: Create the Gemini client helpers.**

Write to `rag-presentation/lib/gemini.ts`:

```ts
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { embed, embedMany } from 'ai'

export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

export type MultimodalPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }

export async function embedText(value: string): Promise<number[]> {
  const { embedding } = await embed({
    model: google.embedding('gemini-embedding-001'),
    value,
  })
  return embedding
}

export async function embedMultimodal(
  value: string,
  content?: MultimodalPart[],
): Promise<number[]> {
  const { embedding } = await embed({
    model: google.embedding('gemini-embedding-2'),
    value,
    providerOptions: {
      google: {
        outputDimensionality: 1536,
        ...(content ? { content: [content] } : {}),
      },
    },
  })
  return embedding
}

export async function embedManyMultimodal(
  values: string[],
  contents?: (MultimodalPart[] | null)[],
): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: google.embedding('gemini-embedding-2'),
    values,
    providerOptions: {
      google: {
        outputDimensionality: 1536,
        ...(contents ? { content: contents } : {}),
      },
    },
  })
  return embeddings
}
```

Note on the `content` shape: per the AI SDK source inspected during design, `providerOptions.google.content` is an array of arrays. Outer index matches the `values` index; each entry is the multimodal parts that get bundled with the text at that index. A `null` entry means "text-only for this value." The `embedMultimodal` helper above always wraps a single call as `[content]`. The `embedManyMultimodal` helper passes the array straight through.

- [ ] **Step 1.4: Create the shared types.**

Write to `rag-presentation/lib/types.ts`:

```ts
export type DishCategory = 'criollo' | 'marino' | 'sopa' | 'postre' | 'bebida' | 'andino'

export type Dish = {
  id: string
  name_es: string
  name_en: string
  category: DishCategory
  description: string
  recipe: string
  ingredients: string[]
  tags: string[]
  image_url: string
  source_url: string
  embedding_text: number[]
  embedding_mm: number[]
}

export type SongGenre =
  | 'huayno'
  | 'marinera'
  | 'criolla'
  | 'chicha'
  | 'yaravi'
  | 'festejo'

export type Song = {
  id: string
  title: string
  genre: SongGenre
  region: string
  description: string
  mood_tags: string[]
  audio_clip_url: string
  embedding_mm: number[]
}

export type SearchHit<T> = {
  doc: T
  distance: number   // smaller is closer with COSINE
  similarity: number // 1 - distance, presented as cosine similarity
}
```

- [ ] **Step 1.5: Create the loading dot.**

Write to `rag-presentation/components/LoadingDot.tsx`:

```tsx
'use client'

import { motion } from 'framer-motion'

export function LoadingDot({ size = 24 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="relative inline-block"
      aria-label="cargando"
    >
      <div
        className="absolute inset-0 rounded-full border border-[var(--color-border)]"
      />
      <motion.div
        className="absolute size-1.5 rounded-full bg-[var(--color-accent)]"
        style={{ top: 0, left: '50%', marginLeft: -3 }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
      />
    </div>
  )
}
```

- [ ] **Step 1.6: Create the similarity bar.**

Write to `rag-presentation/components/SimilarityBar.tsx`:

```tsx
import { cn } from '@/lib/cn'

export function SimilarityBar({
  similarity,
  className,
}: {
  similarity: number
  className?: string
}) {
  const pct = Math.max(0, Math.min(1, similarity)) * 100
  return (
    <div className={cn('flex items-center gap-2 font-mono text-xs', className)}>
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          className="h-full bg-[var(--color-accent-3)]"
          style={{ width: `${pct.toFixed(1)}%` }}
        />
      </div>
      <span className="tabular-nums text-[var(--color-muted)]">
        {similarity.toFixed(2)}
      </span>
    </div>
  )
}
```

- [ ] **Step 1.7: Create the embedding numbers visualizer.**

Write to `rag-presentation/components/EmbeddingViz.tsx`:

```tsx
'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

type Props = {
  values: number[]
  max?: number       // how many numbers to render
  staggerMs?: number // ms between number reveals
  className?: string
  label?: string
}

export function EmbeddingViz({
  values,
  max = 24,
  staggerMs = 60,
  className,
  label,
}: Props) {
  const visible = values.slice(0, max)
  return (
    <div className={cn('font-mono text-xs leading-relaxed', className)}>
      {label && (
        <div className="text-[var(--color-muted)] mb-1 tracking-wider uppercase text-[10px]">
          {label}
        </div>
      )}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {visible.map((v, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i * staggerMs) / 1000, duration: 0.2 }}
            className="tabular-nums"
          >
            {v >= 0 ? ' ' : ''}
            {v.toFixed(3)}
          </motion.span>
        ))}
        {values.length > max && (
          <span className="text-[var(--color-muted)]">
            … +{values.length - max} más
          </span>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 1.8: Create the dish card.**

Write to `rag-presentation/components/DishCard.tsx`:

```tsx
import Image from 'next/image'
import { cn } from '@/lib/cn'
import { SimilarityBar } from './SimilarityBar'
import type { Dish } from '@/lib/types'

type Props = {
  dish: Dish
  similarity?: number
  className?: string
  onSelect?: (dish: Dish) => void
}

export function DishCard({ dish, similarity, className, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect ? () => onSelect(dish) : undefined}
      className={cn(
        'group flex flex-col rounded-md border border-[var(--color-border)]',
        'bg-[var(--color-surface)] overflow-hidden text-left',
        'transition-transform duration-150 hover:-translate-y-1 hover:shadow-md',
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-border)]">
        <Image
          src={dish.image_url}
          alt={dish.name_es}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-2 p-3">
        <div>
          <div className="font-semibold tracking-tight">{dish.name_es}</div>
          <div className="text-xs text-[var(--color-muted)]">{dish.name_en}</div>
        </div>
        {typeof similarity === 'number' && <SimilarityBar similarity={similarity} />}
      </div>
    </button>
  )
}
```

- [ ] **Step 1.9: Create the code panel.**

Write to `rag-presentation/components/CodePanel.tsx`:

```tsx
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  title?: string
  code: string
  language?: string
  className?: string
  defaultOpen?: boolean
}

export function CodePanel({
  title = 'El código que está corriendo',
  code,
  language = 'ts',
  className,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div
      className={cn(
        'rounded-md border border-[var(--color-border)] bg-[var(--color-code-bg)]',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2 text-xs uppercase tracking-wider text-[var(--color-muted)]"
      >
        <span>{title}</span>
        <span className="font-mono">{open ? '–' : '+'}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.pre
            key="code"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-x-auto px-4 pb-4 text-xs leading-relaxed text-[var(--color-code-fg)]"
            data-language={language}
          >
            <code>{code}</code>
          </motion.pre>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 1.10: Verify the visual primitives render.**

Replace the placeholder `app/page.tsx` temporarily:

```tsx
import { LoadingDot } from '@/components/LoadingDot'
import { SimilarityBar } from '@/components/SimilarityBar'
import { EmbeddingViz } from '@/components/EmbeddingViz'
import { CodePanel } from '@/components/CodePanel'

export default function Home() {
  const fakeEmbedding = Array.from({ length: 30 }, () => Math.random() * 2 - 1)
  return (
    <main className="mx-auto max-w-3xl space-y-8 p-12">
      <h1 className="text-3xl font-semibold tracking-tight">Visual primitives smoke test</h1>
      <div className="flex items-center gap-4">
        <LoadingDot />
        <SimilarityBar similarity={0.87} />
      </div>
      <EmbeddingViz values={fakeEmbedding} label="ceviche · 768 dim" />
      <CodePanel
        defaultOpen
        code={`const { embedding } = await embed({
  model: google.embedding('gemini-embedding-001'),
  value: 'ceviche',
})`}
      />
    </main>
  )
}
```

Run `pnpm dev` and visit `http://localhost:3030`. Expected: terracotta dot orbiting a tiny outline circle, olive-green similarity bar at 0.87, animated cascade of 24 numbers, a collapsible code panel showing the embed call. Tabular-numeral alignment of the numbers should be clean. If alignment looks off, check that the JetBrains Mono variable font loaded (network tab).

Suggested commit message: `feat(rag-pres): visual primitives, Firebase admin singleton, Gemini helpers`.

---

## Task 2: Scene runner, keyboard nav, scene chrome

**Files:**
- Create: `rag-presentation/components/SceneFrame.tsx`
- Create: `rag-presentation/components/SceneRunner.tsx`
- Create: `rag-presentation/components/PresenterNotes.tsx`
- Create: `rag-presentation/components/SceneChrome.tsx`
- Create: `rag-presentation/lib/scenes.ts`
- Create: `rag-presentation/scenes/SceneStub.tsx`
- Modify: `rag-presentation/app/page.tsx` (replace smoke test with `<SceneRunner />`)

- [ ] **Step 2.1: Define the scene registry shape.**

Write to `rag-presentation/lib/scenes.ts`:

```ts
import type { ComponentType } from 'react'

export type SceneDefinition = {
  id: string                 // hash slug, e.g. 'apertura', 'embeddings'
  index: number              // ordinal in the deck
  title: string              // chrome subtitle
  notes: string              // presenter notes (markdown plain text, no rendering pipeline)
  Component: ComponentType
}

export function getSceneByHash(
  scenes: SceneDefinition[],
  hash: string,
): SceneDefinition {
  const cleaned = hash.replace(/^#/, '')
  return scenes.find((s) => s.id === cleaned) ?? scenes[0]
}
```

- [ ] **Step 2.2: Create the scene-frame chrome.**

Write to `rag-presentation/components/SceneChrome.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'

type Props = {
  index: number
  total: number
  title: string
  onOpenNotes: () => void
}

export function SceneChrome({ index, total, title, onOpenNotes }: Props) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const show = () => {
      setVisible(true)
      clearTimeout(t)
      t = setTimeout(() => setVisible(false), 3000)
    }
    show()
    window.addEventListener('mousemove', show)
    window.addEventListener('keydown', show)
    return () => {
      window.removeEventListener('mousemove', show)
      window.removeEventListener('keydown', show)
      clearTimeout(t)
    }
  }, [])
  return (
    <div
      style={{ opacity: visible ? 1 : 0.3 }}
      className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
    >
      <button
        type="button"
        onClick={onOpenNotes}
        className="pointer-events-auto absolute left-4 top-4 size-2.5 rounded-full bg-[var(--color-accent)]"
        aria-label="Abrir notas del presentador"
      />
      <div className="absolute right-4 top-4 font-mono text-xs text-[var(--color-muted)]">
        {String(index).padStart(2, '0')} / {String(total - 1).padStart(2, '0')} · {title}
      </div>
      <div className="absolute bottom-4 right-4 font-mono text-xs text-[var(--color-muted)]">
        ← →
      </div>
    </div>
  )
}
```

- [ ] **Step 2.3: Create the presenter notes overlay.**

Write to `rag-presentation/components/PresenterNotes.tsx`:

```tsx
'use client'

import { AnimatePresence, motion } from 'framer-motion'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  notes: string
}

export function PresenterNotes({ open, onClose, title, notes }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/40"
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-12 bottom-12 max-h-[40vh] overflow-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
          >
            <div className="mb-2 text-xs uppercase tracking-wider text-[var(--color-muted)]">
              Notas · {title}
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed">{notes}</p>
            <div className="mt-4 text-xs text-[var(--color-muted)]">
              Cmd+. para cerrar
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2.4: Create the scene frame.**

Write to `rag-presentation/components/SceneFrame.tsx`:

```tsx
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
```

- [ ] **Step 2.5: Create the scene runner with keyboard nav and hash routing.**

Write to `rag-presentation/components/SceneRunner.tsx`:

```tsx
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

  // hash-based routing for refresh resilience and direct linking
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
```

- [ ] **Step 2.6: Create a stub scene component used as a placeholder for all 9 scenes initially.**

Write to `rag-presentation/scenes/SceneStub.tsx`:

```tsx
type Props = { id: string; title: string }

export default function SceneStub({ id, title }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-2 text-center">
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
          {id}
        </div>
        <h1 className="text-5xl font-semibold tracking-tight">{title}</h1>
        <p className="text-[var(--color-muted)]">
          Placeholder · usa ← y → para navegar, Cmd+. para notas
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2.7: Register all nine scenes with the stub initially.**

Write to `rag-presentation/lib/scenes-registry.ts`:

```ts
import SceneStub from '@/scenes/SceneStub'
import type { SceneDefinition } from './scenes'

function stub(id: string, title: string, notes: string): React.ComponentType {
  function Stub() {
    return <SceneStub id={id} title={title} />
  }
  Stub.displayName = `Stub_${id}`
  return Stub
}

export const SCENES: SceneDefinition[] = [
  { id: 'apertura',     index: 0, title: 'Apertura y quién soy',
    notes: 'Pídeles que apaguen el celular un minuto. Empezar con una pregunta.',
    Component: stub('apertura', 'RAG · Embeddings · Multimodal', '') },
  { id: 'embeddings',   index: 1, title: '¿Qué son los embeddings?',
    notes: 'Llevar la analogía del "número que representa significado".',
    Component: stub('embeddings', '¿Qué son los embeddings?', '') },
  { id: 'como',         index: 2, title: '¿Cómo funcionan?',
    notes: 'Cluster visual + nombrar 3 usos: Spotify, Google, Centinel.',
    Component: stub('como', '¿Cómo funcionan?', '') },
  { id: 'busqueda',     index: 3, title: 'El problema con la búsqueda',
    notes: 'Primero "ceviche" (ambos hits), después "comida reconfortante".',
    Component: stub('busqueda', 'El problema con la búsqueda', '') },
  { id: 'vivo',         index: 4, title: 'Embedding en vivo',
    notes: 'Subir el PDF preparado. Dejar que la animación corra.',
    Component: stub('vivo', 'Embedding en vivo', '') },
  { id: 'reconoce',     index: 5, title: 'Reconoce la comida que ves',
    notes: 'Tener un dish photo listo en el celular.',
    Component: stub('reconoce', 'Reconoce la comida que ves', '') },
  { id: 'cocinar',      index: 6, title: '¿Qué puedo cocinar?',
    notes: 'Pedirle a la audiencia que sume 1 ingrediente.',
    Component: stub('cocinar', '¿Qué puedo cocinar?', '') },
  { id: 'patron',       index: 7, title: 'El mismo patrón, otro mundo',
    notes: 'Si te animás, tocar el instrumento al final.',
    Component: stub('patron', 'El mismo patrón, otro mundo', '') },
  { id: 'debajo',       index: 8, title: 'Lo que pasa por debajo',
    notes: 'Cerrar con la analogía del 1 SDK + 1 modelo nuevo.',
    Component: stub('debajo', 'Lo que pasa por debajo', '') },
]
```

- [ ] **Step 2.8: Replace `app/page.tsx` to render the runner.**

Write to `rag-presentation/app/page.tsx`:

```tsx
import { SceneRunner } from '@/components/SceneRunner'
import { SCENES } from '@/lib/scenes-registry'

export default function Home() {
  return <SceneRunner scenes={SCENES} />
}
```

- [ ] **Step 2.9: Verify the runner works.**

Run `pnpm dev`. Expected behaviour at `http://localhost:3030`:

- Apertura scene visible.
- Right-arrow advances through each scene with a 400 ms slide+fade.
- Left-arrow goes back.
- URL hash updates (`#apertura`, `#embeddings`, ...). Refresh keeps you on the same scene.
- Cmd+. opens the presenter notes overlay; Cmd+. or Esc closes it.
- Chrome (top-left dot, top-right scene index, bottom-right keyboard hint) fades to 30% after 3 seconds of inactivity and reappears on mouse motion.

If hash routing does not survive refresh, confirm the `useEffect` initial sync runs after mount (Next.js streaming can hide hydration-only state otherwise).

Suggested commit message: `feat(rag-pres): scene runner with keyboard nav, hash routing, presenter notes`.

---

## Task 3: Dish data ingestion script

**Files:**
- Create: `rag-presentation/data/dishes.json`
- Create: `rag-presentation/scripts/lib/wikipedia.ts`
- Create: `rag-presentation/scripts/lib/augment.ts`
- Create: `rag-presentation/scripts/ingest-dishes.ts`

- [ ] **Step 3.1: Hand-curate the dish source list.**

Write to `rag-presentation/data/dishes.json`. This is the seed list (about 50 entries). Each entry has the Spanish name and the Wikipedia article slug (the URL path component after `/wiki/`). Use a Spanish Wikipedia slug because the Spanish articles are more comprehensive for Peruvian dishes.

```json
[
  { "slug": "Ceviche",                         "category": "marino" },
  { "slug": "Tiradito",                        "category": "marino" },
  { "slug": "Aj%C3%AD_de_gallina",             "category": "criollo" },
  { "slug": "Lomo_saltado",                    "category": "criollo" },
  { "slug": "Anticucho",                       "category": "criollo" },
  { "slug": "Causa_lime%C3%B1a",               "category": "criollo" },
  { "slug": "Papa_a_la_hua%C3%ADnca%C3%ADna",  "category": "criollo" },
  { "slug": "Arroz_con_pollo",                 "category": "criollo" },
  { "slug": "Tacu_tacu",                       "category": "criollo" },
  { "slug": "Carapulcra",                      "category": "criollo" },
  { "slug": "Seco_de_res",                     "category": "criollo" },
  { "slug": "Aji_de_camarones",                "category": "marino" },
  { "slug": "Jalea_(comida)",                  "category": "marino" },
  { "slug": "Chupe_de_camarones",              "category": "sopa" },
  { "slug": "Aguadito",                        "category": "sopa" },
  { "slug": "Caldo_de_gallina",                "category": "sopa" },
  { "slug": "Sopa_a_la_minuta",                "category": "sopa" },
  { "slug": "Sopa_criolla",                    "category": "sopa" },
  { "slug": "Parihuela",                       "category": "sopa" },
  { "slug": "Pachamanca",                      "category": "andino" },
  { "slug": "Cuy_chactado",                    "category": "andino" },
  { "slug": "Olluquito_con_charqui",           "category": "andino" },
  { "slug": "Rocoto_relleno",                  "category": "andino" },
  { "slug": "Pollo_a_la_brasa",                "category": "criollo" },
  { "slug": "Suspiro_a_la_lime%C3%B1a",        "category": "postre" },
  { "slug": "Mazamorra_morada",                "category": "postre" },
  { "slug": "Picarones",                       "category": "postre" },
  { "slug": "Arroz_con_leche",                 "category": "postre" },
  { "slug": "Turr%C3%B3n_de_do%C3%B1a_Pepa",   "category": "postre" },
  { "slug": "Alfajor",                         "category": "postre" },
  { "slug": "Tejas_(dulce)",                   "category": "postre" },
  { "slug": "Chicha_morada",                   "category": "bebida" },
  { "slug": "Pisco_sour",                      "category": "bebida" },
  { "slug": "Inca_Kola",                       "category": "bebida" },
  { "slug": "Emoliente",                       "category": "bebida" },
  { "slug": "Chilcano",                        "category": "bebida" },
  { "slug": "Adobo_de_chancho",                "category": "criollo" },
  { "slug": "Cau_cau",                         "category": "criollo" },
  { "slug": "Mondonguito_a_la_italiana",       "category": "criollo" },
  { "slug": "Esc%C3%A1bechede_pescado",        "category": "marino" },
  { "slug": "Tallarines_verdes",               "category": "criollo" },
  { "slug": "Choclo_con_queso",                "category": "andino" },
  { "slug": "Humitas",                         "category": "andino" },
  { "slug": "Tamal_peruano",                   "category": "andino" },
  { "slug": "Chairo_(sopa)",                   "category": "sopa" },
  { "slug": "Solterito",                       "category": "andino" },
  { "slug": "Patarashca",                      "category": "marino" },
  { "slug": "Juane",                           "category": "andino" },
  { "slug": "Tacacho",                         "category": "andino" },
  { "slug": "Cebiche_de_conchas_negras",       "category": "marino" }
]
```

You may need to adjust a few slugs if the Spanish article was renamed; the ingest script (Step 3.4) prints which slugs failed so you can fix them in a second pass.

- [ ] **Step 3.2: Create the Wikipedia helper.**

Write to `rag-presentation/scripts/lib/wikipedia.ts`:

```ts
// Spanish Wikipedia REST API:
//   summary endpoint returns title, extract (intro), thumbnail, originalimage.
//   https://es.wikipedia.org/api/rest_v1/page/summary/{slug}

export type WikipediaSummary = {
  title: string
  extract: string
  image_url: string | null
  source_url: string
}

export async function fetchWikipediaSummary(slug: string): Promise<WikipediaSummary> {
  const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${slug}`
  const res = await fetch(url, { headers: { 'accept': 'application/json' } })
  if (!res.ok) {
    throw new Error(`Wikipedia ${slug}: ${res.status} ${res.statusText}`)
  }
  const data = (await res.json()) as {
    title: string
    extract: string
    originalimage?: { source: string }
    thumbnail?: { source: string }
    content_urls?: { desktop: { page: string } }
  }
  return {
    title: data.title,
    extract: data.extract,
    image_url: data.originalimage?.source ?? data.thumbnail?.source ?? null,
    source_url: data.content_urls?.desktop?.page ?? `https://es.wikipedia.org/wiki/${slug}`,
  }
}

export async function fetchImageBytes(imageUrl: string): Promise<{ data: Buffer; mimeType: string }> {
  const res = await fetch(imageUrl, {
    headers: { 'user-agent': 'rag-presentation/0.0.0 (local talk app)' },
  })
  if (!res.ok) throw new Error(`Image fetch ${imageUrl}: ${res.status}`)
  const mimeType = res.headers.get('content-type') ?? 'image/jpeg'
  const buf = Buffer.from(await res.arrayBuffer())
  return { data: buf, mimeType }
}
```

- [ ] **Step 3.3: Create the Gemini augmentation helper.**

Write to `rag-presentation/scripts/lib/augment.ts`:

```ts
import { generateObject } from 'ai'
import { z } from 'zod'
import { google } from '@/lib/gemini'

const dishAugmentation = z.object({
  name_en: z.string(),
  description: z.string().describe('2 to 3 sentences, evocative, en español.'),
  recipe: z.string().describe('Compact recipe in español, max 200 palabras.'),
  ingredients: z.array(z.string()).min(3).max(20).describe('Ingredientes principales en español.'),
  tags: z.array(z.string()).min(3).max(8).describe('Mood, occasion, region tags. español.'),
})

export type DishAugmentation = z.infer<typeof dishAugmentation>

export async function augmentDish(input: {
  name_es: string
  wikipedia_extract: string
}): Promise<DishAugmentation> {
  const { object } = await generateObject({
    model: google('gemini-2.5-flash'),
    schema: dishAugmentation,
    prompt: `Plato peruano: ${input.name_es}

Resumen de Wikipedia:
${input.wikipedia_extract}

Genera datos enriquecidos en español: traducción al inglés del nombre (name_en), una descripción evocativa (description, 2-3 frases), una receta compacta (recipe, máximo 200 palabras), ingredientes principales (ingredients), y etiquetas de mood/ocasión/región (tags).`,
  })
  return object
}
```

- [ ] **Step 3.4: Create the ingestion entry point.**

Write to `rag-presentation/scripts/ingest-dishes.ts`:

```ts
import 'dotenv/config'
import { adminDb, adminStorage } from '@/lib/firebase-admin'
import { embedText, embedMultimodal } from '@/lib/gemini'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fetchImageBytes, fetchWikipediaSummary } from './lib/wikipedia'
import { augmentDish } from './lib/augment'
import { FieldValue, type VectorValue } from 'firebase-admin/firestore'
import { Firestore } from 'firebase-admin/firestore'
import type { Dish, DishCategory } from '@/lib/types'

type SeedEntry = { slug: string; category: DishCategory }

async function uploadImage(slug: string, buf: Buffer, mimeType: string): Promise<string> {
  const ext = mimeType.includes('png') ? 'png' : 'jpg'
  const file = adminStorage.bucket().file(`dishes/${slug}.${ext}`)
  await file.save(buf, { contentType: mimeType, public: true, resumable: false })
  await file.makePublic()
  return file.publicUrl()
}

async function processOne(entry: SeedEntry): Promise<void> {
  const summary = await fetchWikipediaSummary(entry.slug)
  if (!summary.image_url) throw new Error(`No image for ${entry.slug}`)

  const { data, mimeType } = await fetchImageBytes(summary.image_url)
  const image_url = await uploadImage(entry.slug, data, mimeType)

  const aug = await augmentDish({
    name_es: summary.title,
    wikipedia_extract: summary.extract,
  })

  const textForEmbedding = [
    summary.title,
    aug.description,
    aug.ingredients.join(', '),
    aug.tags.join(', '),
  ].join('\n')

  const [embedding_text, embedding_mm] = await Promise.all([
    embedText(textForEmbedding),
    embedMultimodal(textForEmbedding, [
      { text: textForEmbedding },
      { inlineData: { mimeType, data: data.toString('base64') } },
    ]),
  ])

  const doc: Dish = {
    id: entry.slug,
    name_es: summary.title,
    name_en: aug.name_en,
    category: entry.category,
    description: aug.description,
    recipe: aug.recipe,
    ingredients: aug.ingredients,
    tags: aug.tags,
    image_url,
    source_url: summary.source_url,
    embedding_text,
    embedding_mm,
  }

  // Firestore vectorField: use FieldValue.vector() to mark these as vector fields
  // so findNearest can query them.
  const ref = adminDb.collection('presentation_dishes').doc(entry.slug)
  await ref.set({
    ...doc,
    embedding_text: FieldValue.vector(embedding_text),
    embedding_mm: FieldValue.vector(embedding_mm),
  })

  process.stdout.write(`  OK  ${entry.slug}\n`)
}

async function main() {
  const entries = JSON.parse(
    readFileSync(resolve(process.cwd(), 'data/dishes.json'), 'utf-8'),
  ) as SeedEntry[]

  const errors: { slug: string; error: string }[] = []

  for (const entry of entries) {
    try {
      await processOne(entry)
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e)
      errors.push({ slug: entry.slug, error })
      process.stdout.write(`  FAIL ${entry.slug} :: ${error}\n`)
    }
  }

  process.stdout.write(`\nDone. ${entries.length - errors.length}/${entries.length} succeeded.\n`)
  if (errors.length) {
    process.stdout.write('\nErrors:\n')
    for (const e of errors) process.stdout.write(`  ${e.slug}: ${e.error}\n`)
    process.exit(1)
  }
}

main()
```

- [ ] **Step 3.5: Enable Firestore vector index (one-time bootstrap).**

The Firestore vector field needs an index per collection per field. Create the indexes manually via the gcloud CLI (the dashboard does not expose vector indexes for new collections cleanly). From any folder:

```bash
gcloud firestore indexes composite create \
  --project=centinel-rag-demo \
  --collection-group=presentation_dishes \
  --query-scope=COLLECTION \
  --field-config=vector-config='{"dimension":768,"flat":{}}',field-path=embedding_text

gcloud firestore indexes composite create \
  --project=centinel-rag-demo \
  --collection-group=presentation_dishes \
  --query-scope=COLLECTION \
  --field-config=vector-config='{"dimension":1536,"flat":{}}',field-path=embedding_mm
```

If you do not have `gcloud` installed, install via `brew install --cask google-cloud-sdk` and then `gcloud auth login`.

The first time you run a `findNearest` query without an index, the Firestore SDK error message contains a click-through URL to create the index too. Either path is fine.

- [ ] **Step 3.6: Run the ingestion script.**

```bash
cd rag-presentation
pnpm ingest:dishes
```

Expected output (truncated):

```
  OK  Ceviche
  OK  Tiradito
  FAIL Esc%C3%A1bechede_pescado :: Wikipedia 404
  ...

Done. 48/50 succeeded.
```

Address any FAIL entries by correcting the slug in `data/dishes.json` and re-running. The script is idempotent (it overwrites docs on collision), so re-running on the full list is safe.

- [ ] **Step 3.7: Hand-review the augmented Spanish content.**

In the Firebase console, open `presentation_dishes` and skim each doc's `description` and `recipe`. Fix obvious AI-isms or factual mistakes by editing in the console (or by tweaking the prompt in `augment.ts` and re-running specific dishes).

Suggested commit message: `feat(rag-pres): wikipedia + gemini dish ingestion script`.

---

## Task 4: Scene 3 (Keyword vs Semantic) and the search API

**Files:**
- Create: `rag-presentation/app/api/embed/text/route.ts`
- Create: `rag-presentation/app/api/search/route.ts`
- Create: `rag-presentation/lib/search.ts`
- Create: `rag-presentation/scenes/Busqueda.tsx`
- Modify: `rag-presentation/lib/scenes-registry.ts` (swap stub for real Busqueda)

- [ ] **Step 4.1: Create the text embed route.**

Write to `rag-presentation/app/api/embed/text/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { embedText } from '@/lib/gemini'

const Body = z.object({ value: z.string().min(1).max(2000) })

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  const embedding = await embedText(parsed.data.value)
  return NextResponse.json({ embedding })
}
```

- [ ] **Step 4.2: Create the search helper.**

Write to `rag-presentation/lib/search.ts`:

```ts
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
  // Naive substring match in name and ingredient list, server-side.
  // Intentionally dumb to show the contrast with semantic search.
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
```

- [ ] **Step 4.3: Create the search route.**

Write to `rag-presentation/app/api/search/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { embedText } from '@/lib/gemini'
import { findNearestDishes, keywordSearchDishes } from '@/lib/search'

const Body = z.object({
  query: z.string().min(1).max(500),
  mode: z.enum(['keyword', 'semantic']),
  k: z.number().int().min(1).max(20).optional(),
})

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  const { query, mode, k = 6 } = parsed.data

  if (mode === 'keyword') {
    const hits = await keywordSearchDishes(query, k)
    return NextResponse.json({ hits })
  }

  const vector = await embedText(query)
  const hits = await findNearestDishes(vector, 'embedding_text', k)
  return NextResponse.json({ hits, embedding_preview: vector.slice(0, 12) })
}
```

- [ ] **Step 4.4: Create the Busqueda scene.**

Write to `rag-presentation/scenes/Busqueda.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { DishCard } from '@/components/DishCard'
import { LoadingDot } from '@/components/LoadingDot'
import { CodePanel } from '@/components/CodePanel'
import type { Dish, SearchHit } from '@/lib/types'

type Mode = 'keyword' | 'semantic'

async function runSearch(query: string, mode: Mode): Promise<SearchHit<Dish>[]> {
  const res = await fetch('/api/search', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, mode, k: 6 }),
  })
  const json = (await res.json()) as { hits: SearchHit<Dish>[] }
  return json.hits
}

const CODE = `// app/api/search/route.ts
const vector = await embedText(query)            // gemini-embedding-001
const snap = await adminDb
  .collection('presentation_dishes')
  .findNearest({
    vectorField: 'embedding_text',
    queryVector: FieldValue.vector(vector),
    limit: 6,
    distanceMeasure: 'COSINE',
  })
  .get()`

const SUGERIDAS = [
  'ceviche',
  'comida reconfortante en día lluvioso',
  'algo dulce y cremoso',
  'plato típico de la sierra',
]

export default function Busqueda() {
  const [query, setQuery] = useState('')
  const [keywordHits, setKeywordHits] = useState<SearchHit<Dish>[]>([])
  const [semanticHits, setSemanticHits] = useState<SearchHit<Dish>[]>([])
  const [loading, setLoading] = useState(false)

  async function go(q: string) {
    setQuery(q)
    setLoading(true)
    const [kw, sem] = await Promise.all([
      runSearch(q, 'keyword'),
      runSearch(q, 'semantic'),
    ])
    setKeywordHits(kw)
    setSemanticHits(sem)
    setLoading(false)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-6 px-12 py-16">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
          Escena 03
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">
          El problema con la búsqueda tradicional
        </h1>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (query.trim()) go(query.trim())
        }}
        className="flex gap-2"
      >
        <input
          className="flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-lg outline-none focus:border-[var(--color-accent)]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="comida reconfortante en día lluvioso…"
        />
        <button
          type="submit"
          className="rounded-md bg-[var(--color-fg)] px-5 text-sm text-white"
        >
          Buscar
        </button>
      </form>

      <div className="flex gap-2 text-xs">
        {SUGERIDAS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => go(s)}
            className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[var(--color-muted)] hover:text-[var(--color-fg)]"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-2 gap-8 pt-4">
        <Column title="Búsqueda por palabra clave" hits={keywordHits} loading={loading} />
        <Column title="Búsqueda semántica" hits={semanticHits} loading={loading} highlight />
      </div>

      <CodePanel code={CODE} />
    </div>
  )
}

function Column({
  title,
  hits,
  loading,
  highlight,
}: {
  title: string
  hits: SearchHit<Dish>[]
  loading: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2
          className={
            'text-sm uppercase tracking-widest ' +
            (highlight ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]')
          }
        >
          {title}
        </h2>
        {loading && <LoadingDot size={16} />}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {hits.length === 0 && !loading && (
          <div className="col-span-3 rounded-md border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-muted)]">
            sin resultados
          </div>
        )}
        {hits.map((h) => (
          <DishCard key={h.doc.id} dish={h.doc} similarity={h.similarity} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4.5: Register the Busqueda scene.**

Modify `rag-presentation/lib/scenes-registry.ts`:

```ts
import dynamic from 'next/dynamic'
import SceneStub from '@/scenes/SceneStub'
import type { SceneDefinition } from './scenes'

const Busqueda = dynamic(() => import('@/scenes/Busqueda'), { ssr: false })

// ... keep the stub helper from Task 2.7, then swap the Busqueda entry:
//   Component: Busqueda
```

In practice, replace the existing `busqueda` entry's `Component` with the imported `Busqueda` component. Leave the other 8 entries as stubs for now.

- [ ] **Step 4.6: Verify Scene 3 end-to-end.**

Run `pnpm dev`, navigate to `#busqueda`.

Manual checks:
1. Click suggestion `ceviche`. Keyword column returns Ceviche (and possibly Cebiche de conchas negras, Tiradito if they share the substring). Semantic column returns Ceviche, Tiradito, Jalea, etc. with similarity badges.
2. Click suggestion `comida reconfortante en día lluvioso`. Keyword returns "sin resultados". Semantic returns Ají de gallina, Caldo de gallina, Chupe, etc. with reasonable similarity (0.5 to 0.8).
3. Open the code panel: confirm the snippet text is the actual route handler logic.

If the semantic side returns nothing or errors, inspect the Next.js server logs for Firestore `FAILED_PRECONDITION` (missing index) or `INVALID_ARGUMENT` (wrong dim). Confirm Step 3.5 ran successfully.

Suggested commit message: `feat(rag-pres): scene 3 keyword vs semantic, /api/search`.

---

## Task 5: Scene 4 (Live indexing)

**Files:**
- Create: `rag-presentation/app/api/embed/multimodal/route.ts`
- Create: `rag-presentation/app/api/index/route.ts`
- Create: `rag-presentation/lib/pdf.ts`
- Create: `rag-presentation/components/IndexingAnimation.tsx`
- Create: `rag-presentation/scenes/Vivo.tsx`
- Modify: `rag-presentation/lib/scenes-registry.ts` (swap stub for Vivo)

- [ ] **Step 5.1: Create the multimodal embed route.**

Write to `rag-presentation/app/api/embed/multimodal/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { embedMultimodal } from '@/lib/gemini'

const Part = z.union([
  z.object({ text: z.string() }),
  z.object({
    inlineData: z.object({ mimeType: z.string(), data: z.string() }),
  }),
])

const Body = z.object({
  value: z.string().default(''),
  content: z.array(Part).optional(),
})

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  const { value, content } = parsed.data
  const embedding = await embedMultimodal(value, content)
  return NextResponse.json({ embedding })
}
```

- [ ] **Step 5.2: Create the PDF text extractor.**

Write to `rag-presentation/lib/pdf.ts`:

```ts
import { extractText, getDocumentProxy } from 'unpdf'

export type PdfExtract = {
  text: string
  pages: number
  chunks: string[] // ~400-char chunks for visualization, not for embedding
}

export async function extractPdf(buf: ArrayBuffer): Promise<PdfExtract> {
  const pdf = await getDocumentProxy(new Uint8Array(buf))
  const { text, totalPages } = await extractText(pdf, { mergePages: true })
  const flat = Array.isArray(text) ? text.join('\n') : text
  const chunks: string[] = []
  for (let i = 0; i < flat.length; i += 400) chunks.push(flat.slice(i, i + 400))
  return { text: flat, pages: totalPages, chunks }
}
```

- [ ] **Step 5.3: Create the index route.**

Write to `rag-presentation/app/api/index/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { adminDb } from '@/lib/firebase-admin'
import { embedMultimodal } from '@/lib/gemini'
import { extractPdf } from '@/lib/pdf'
import { FieldValue } from 'firebase-admin/firestore'

const Body = z.object({
  filename: z.string(),
  pdfBase64: z.string(),
})

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  const { filename, pdfBase64 } = parsed.data
  const bytes = Buffer.from(pdfBase64, 'base64')
  const extract = await extractPdf(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))

  const embedding = await embedMultimodal(extract.text.slice(0, 8000), [
    { text: extract.text.slice(0, 8000) },
    { inlineData: { mimeType: 'application/pdf', data: pdfBase64 } },
  ])

  const id = `live_${Date.now()}`
  await adminDb.collection('presentation_dishes').doc(id).set({
    id,
    name_es: filename.replace(/\.pdf$/i, ''),
    name_en: filename.replace(/\.pdf$/i, ''),
    category: 'criollo',
    description: extract.text.slice(0, 240),
    recipe: extract.text,
    ingredients: [],
    tags: ['live', 'indexed_on_stage'],
    image_url: '',
    source_url: '',
    embedding_text: FieldValue.vector(new Array(768).fill(0)), // placeholder, not used
    embedding_mm: FieldValue.vector(embedding),
  })

  return NextResponse.json({
    id,
    pages: extract.pages,
    chunks: extract.chunks.length,
    embedding_preview: embedding.slice(0, 16),
  })
}
```

Note: we write a placeholder text embedding (zero vector) because the doc shape demands one. The live-indexed doc is only ever queried via `embedding_mm` (multimodal lookup), so the placeholder is never used by `findNearest`.

- [ ] **Step 5.4: Create the indexing animation component.**

Write to `rag-presentation/components/IndexingAnimation.tsx`:

```tsx
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/cn'

type Stage = 'idle' | 'reading' | 'chunking' | 'embedding' | 'storing' | 'done' | 'error'

export function IndexingAnimation({
  stage,
  embeddingPreview,
  errorMessage,
  className,
}: {
  stage: Stage
  embeddingPreview?: number[]
  errorMessage?: string
  className?: string
}) {
  const steps: { id: Stage; label: string }[] = [
    { id: 'reading', label: 'Leyendo el PDF' },
    { id: 'chunking', label: 'Dividiendo en fragmentos' },
    { id: 'embedding', label: 'Generando el embedding' },
    { id: 'storing', label: 'Escribiendo en Firestore' },
  ]
  const order: Stage[] = ['idle', 'reading', 'chunking', 'embedding', 'storing', 'done', 'error']
  const reached = (s: Stage) => order.indexOf(stage) >= order.indexOf(s)

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {steps.map((step) => (
        <div key={step.id} className="flex items-center gap-3">
          <div
            className={cn(
              'size-2 rounded-full transition-colors duration-200',
              reached(step.id) ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]',
            )}
          />
          <span
            className={cn(
              'text-sm transition-colors duration-200',
              reached(step.id) ? 'text-[var(--color-fg)]' : 'text-[var(--color-muted)]',
            )}
          >
            {step.label}
          </span>
        </div>
      ))}

      <AnimatePresence>
        {stage === 'embedding' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="font-mono text-xs text-[var(--color-muted)]"
          >
            calculando 1536 números…
          </motion.div>
        )}
        {stage === 'done' && embeddingPreview && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-xs"
          >
            {embeddingPreview.map((v, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="mr-2 tabular-nums"
              >
                {v.toFixed(3)}
              </motion.span>
            ))}
            …
          </motion.div>
        )}
        {stage === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-[var(--color-accent)]"
          >
            Error: {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 5.5: Create the Vivo scene.**

Write to `rag-presentation/scenes/Vivo.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { IndexingAnimation } from '@/components/IndexingAnimation'
import { DishCard } from '@/components/DishCard'
import { CodePanel } from '@/components/CodePanel'
import type { Dish, SearchHit } from '@/lib/types'

type Stage = 'idle' | 'reading' | 'chunking' | 'embedding' | 'storing' | 'done' | 'error'

async function readAsBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  let binary = ''
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

const CODE = `// app/api/index/route.ts
const extract = await extractPdf(pdfBytes)
const embedding = await embedMultimodal(extract.text.slice(0, 8000), [
  { text: extract.text.slice(0, 8000) },
  { inlineData: { mimeType: 'application/pdf', data: pdfBase64 } },
])
await adminDb.collection('presentation_dishes').doc(id).set({
  ...,
  embedding_mm: FieldValue.vector(embedding),
})`

export default function Vivo() {
  const [stage, setStage] = useState<Stage>('idle')
  const [preview, setPreview] = useState<number[]>()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [hits, setHits] = useState<SearchHit<Dish>[]>([])
  const [query, setQuery] = useState('')

  async function onFile(file: File) {
    try {
      setStage('reading')
      const pdfBase64 = await readAsBase64(file)
      setStage('chunking')
      await new Promise((r) => setTimeout(r, 250)) // a beat for the animation
      setStage('embedding')

      const res = await fetch('/api/index', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ filename: file.name, pdfBase64 }),
      })
      if (!res.ok) throw new Error(`Index ${res.status}`)
      const { embedding_preview } = (await res.json()) as { embedding_preview: number[] }

      setStage('storing')
      await new Promise((r) => setTimeout(r, 250))
      setPreview(embedding_preview)
      setStage('done')
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e))
      setStage('error')
    }
  }

  async function querySemantic(q: string) {
    const res = await fetch('/api/search-mm', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: q, k: 6 }),
    })
    const { hits } = (await res.json()) as { hits: SearchHit<Dish>[] }
    setHits(hits)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-6 px-12 py-16">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
          Escena 04
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">Embedding en vivo</h1>
        <p className="text-[var(--color-muted)]">
          Arrastrá un PDF de receta sobre el panel. Lo dividimos, lo embebemos y lo guardamos en Firestore acá mismo.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-8 pt-2">
        <DropZone onFile={onFile} stage={stage} />
        <div className="flex flex-col gap-4">
          <IndexingAnimation
            stage={stage}
            embeddingPreview={preview}
            errorMessage={errorMessage}
          />
          {stage === 'done' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (query.trim()) querySemantic(query.trim())
              }}
              className="flex gap-2 pt-2"
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="probá una búsqueda nueva…"
                className="flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2"
              />
              <button
                type="submit"
                className="rounded-md bg-[var(--color-fg)] px-4 text-sm text-white"
              >
                Buscar
              </button>
            </form>
          )}
        </div>
      </div>

      {hits.length > 0 && (
        <div className="grid grid-cols-6 gap-3 pt-4">
          {hits.map((h) => (
            <DishCard key={h.doc.id} dish={h.doc} similarity={h.similarity} />
          ))}
        </div>
      )}

      <CodePanel code={CODE} />
    </div>
  )
}

function DropZone({
  onFile,
  stage,
}: {
  onFile: (file: File) => void
  stage: Stage
}) {
  return (
    <label
      className="flex aspect-square min-h-[280px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface)] text-center"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const f = e.dataTransfer.files[0]
        if (f) onFile(f)
      }}
    >
      <span className="text-3xl">📄</span>
      <span className="font-semibold">
        {stage === 'idle' ? 'Arrastrá un PDF acá' : 'Procesando…'}
      </span>
      <span className="text-xs text-[var(--color-muted)]">o hacé click</span>
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
        }}
      />
    </label>
  )
}
```

Note: the Vivo scene references `/api/search-mm`, which Task 6 creates. If you build Task 5 first, the "after-index query" feature errors until Task 6 ships. Workable for the live demo because the visual flow ends at the embedding cascade; the post-query is optional polish.

- [ ] **Step 5.6: Register Vivo and verify.**

Update `lib/scenes-registry.ts` to import `Vivo` and replace the `vivo` stub:

```ts
const Vivo = dynamic(() => import('@/scenes/Vivo'), { ssr: false })
// ... and use Component: Vivo on the 'vivo' entry
```

Verify: drag a sample PDF (your own dish recipe, or a Wikipedia print-to-PDF of any dish article) onto the drop zone. Expected: stage progresses through reading → chunking → embedding → storing → done. The four-step indicator turns terracotta one row at a time. Final state shows a 16-number preview of the embedding cascade.

Suggested commit message: `feat(rag-pres): scene 4 live indexing, /api/index, /api/embed/multimodal`.

---

## Task 6: Scene 5 (Photo to dish) and the multimodal-search API

**Files:**
- Create: `rag-presentation/app/api/search-mm/route.ts`
- Create: `rag-presentation/components/WebcamCapture.tsx`
- Create: `rag-presentation/scenes/Reconoce.tsx`
- Modify: `rag-presentation/lib/scenes-registry.ts` (swap stub for Reconoce)

- [ ] **Step 6.1: Create the multimodal search route.**

Write to `rag-presentation/app/api/search-mm/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { embedMultimodal } from '@/lib/gemini'
import { findNearestDishes } from '@/lib/search'

const Part = z.union([
  z.object({ text: z.string() }),
  z.object({ inlineData: z.object({ mimeType: z.string(), data: z.string() }) }),
])

const Body = z.object({
  query: z.string().default(''),
  content: z.array(Part).optional(),
  k: z.number().int().min(1).max(20).optional(),
})

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  const { query, content, k = 6 } = parsed.data
  const vector = await embedMultimodal(query, content)
  const hits = await findNearestDishes(vector, 'embedding_mm', k)
  return NextResponse.json({ hits, embedding_preview: vector.slice(0, 16) })
}
```

- [ ] **Step 6.2: Create the webcam capture component.**

Write to `rag-presentation/components/WebcamCapture.tsx`:

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  onCapture: (dataUrl: string, mimeType: string) => void
  className?: string
}

export function WebcamCapture({ onCapture, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    let stream: MediaStream | undefined
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
      .then((s) => {
        stream = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
          videoRef.current.play()
        }
        setReady(true)
      })
      .catch((e) => setError(e.message))
    return () => stream?.getTracks().forEach((t) => t.stop())
  }, [])

  function capture() {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(videoRef.current, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    onCapture(dataUrl, 'image/jpeg')
  }

  if (error) {
    return <div className="text-sm text-[var(--color-accent)]">Cámara: {error}</div>
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <video
        ref={videoRef}
        playsInline
        muted
        className="aspect-video w-full rounded-md border border-[var(--color-border)] bg-black object-cover"
      />
      <button
        type="button"
        onClick={capture}
        disabled={!ready}
        className="self-start rounded-md bg-[var(--color-fg)] px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        Capturar
      </button>
    </div>
  )
}
```

- [ ] **Step 6.3: Create the Reconoce scene.**

Write to `rag-presentation/scenes/Reconoce.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { WebcamCapture } from '@/components/WebcamCapture'
import { DishCard } from '@/components/DishCard'
import { LoadingDot } from '@/components/LoadingDot'
import { CodePanel } from '@/components/CodePanel'
import type { Dish, SearchHit } from '@/lib/types'

const CODE = `// app/api/search-mm/route.ts
const vector = await embedMultimodal('', [
  { inlineData: { mimeType: 'image/jpeg', data: photoBase64 } },
])
const hits = await findNearestDishes(vector, 'embedding_mm', 6)`

export default function Reconoce() {
  const [photo, setPhoto] = useState<string>()
  const [hits, setHits] = useState<SearchHit<Dish>[]>([])
  const [loading, setLoading] = useState(false)

  async function search(dataUrl: string, mimeType: string) {
    const data = dataUrl.split(',')[1]
    setLoading(true)
    setPhoto(dataUrl)
    try {
      const res = await fetch('/api/search-mm', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          query: '',
          content: [{ inlineData: { mimeType, data } }],
          k: 6,
        }),
      })
      const { hits } = (await res.json()) as { hits: SearchHit<Dish>[] }
      setHits(hits)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-6 px-12 py-16">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
          Escena 05
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">Reconoce la comida que ves</h1>
      </header>

      <div className="grid grid-cols-2 gap-8">
        {!photo ? (
          <WebcamCapture onCapture={search} />
        ) : (
          <div className="flex flex-col gap-2">
            <img
              src={photo}
              alt="captura"
              className="aspect-video w-full rounded-md border border-[var(--color-border)] object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setPhoto(undefined)
                setHits([])
              }}
              className="self-start text-sm text-[var(--color-muted)] underline"
            >
              ↻ otra foto
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-sm uppercase tracking-widest text-[var(--color-muted)]">
            Resultados {loading && <LoadingDot size={16} />}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {hits.map((h) => (
              <DishCard key={h.doc.id} dish={h.doc} similarity={h.similarity} />
            ))}
          </div>
          {hits[0] && (
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm leading-relaxed">
              <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
                Receta · {hits[0].doc.name_es}
              </div>
              <p className="pt-1 whitespace-pre-line">{hits[0].doc.recipe}</p>
            </div>
          )}
        </div>
      </div>

      <CodePanel code={CODE} />
    </div>
  )
}
```

- [ ] **Step 6.4: Register and verify.**

Update `lib/scenes-registry.ts` similarly:

```ts
const Reconoce = dynamic(() => import('@/scenes/Reconoce'), { ssr: false })
// swap the 'reconoce' entry's Component
```

Verify: navigate to `#reconoce`. Browser asks for webcam permission (grant once). Click "Capturar" while pointing the laptop camera at a dish photo on your phone. Expected: spinner appears, then 3 to 6 dish results with similarity scores, and the top result's recipe rendered below.

If the camera does not initialize, confirm you are on `http://localhost`. The MediaDevices API requires secure context, and localhost counts.

Suggested commit message: `feat(rag-pres): scene 5 photo-to-dish, /api/search-mm`.

---

## Task 7: Scene 6 (Ingredients to dishes)

**Files:**
- Create: `rag-presentation/data/ingredients.json`
- Create: `rag-presentation/scenes/Cocinar.tsx`
- Modify: `rag-presentation/lib/scenes-registry.ts` (swap stub for Cocinar)

- [ ] **Step 7.1: Create the ingredient grid data.**

Write to `rag-presentation/data/ingredients.json`. About 32 entries covering common Peruvian-cooking ingredients:

```json
[
  { "name": "pollo",        "emoji": "🍗" },
  { "name": "res",          "emoji": "🥩" },
  { "name": "chancho",      "emoji": "🐖" },
  { "name": "pescado",      "emoji": "🐟" },
  { "name": "camarones",    "emoji": "🦐" },
  { "name": "pulpo",        "emoji": "🐙" },
  { "name": "arroz",        "emoji": "🍚" },
  { "name": "papa",         "emoji": "🥔" },
  { "name": "yuca",         "emoji": "🥖" },
  { "name": "camote",       "emoji": "🍠" },
  { "name": "choclo",       "emoji": "🌽" },
  { "name": "frijol",       "emoji": "🫘" },
  { "name": "ají amarillo", "emoji": "🌶️" },
  { "name": "rocoto",       "emoji": "🌶️" },
  { "name": "ají panca",    "emoji": "🌶️" },
  { "name": "limón",        "emoji": "🍋" },
  { "name": "cebolla",      "emoji": "🧅" },
  { "name": "ajo",          "emoji": "🧄" },
  { "name": "tomate",       "emoji": "🍅" },
  { "name": "huevo",        "emoji": "🥚" },
  { "name": "queso fresco", "emoji": "🧀" },
  { "name": "leche",        "emoji": "🥛" },
  { "name": "pan",          "emoji": "🥖" },
  { "name": "harina",       "emoji": "🌾" },
  { "name": "azúcar",       "emoji": "🍬" },
  { "name": "canela",       "emoji": "🌿" },
  { "name": "culantro",     "emoji": "🌿" },
  { "name": "huacatay",     "emoji": "🌿" },
  { "name": "maní",         "emoji": "🥜" },
  { "name": "quinua",       "emoji": "🌾" },
  { "name": "trigo",        "emoji": "🌾" },
  { "name": "chicha",       "emoji": "🥣" }
]
```

- [ ] **Step 7.2: Create the Cocinar scene.**

Write to `rag-presentation/scenes/Cocinar.tsx`:

```tsx
'use client'

import { useState } from 'react'
import ingredients from '@/data/ingredients.json'
import { DishCard } from '@/components/DishCard'
import { LoadingDot } from '@/components/LoadingDot'
import { CodePanel } from '@/components/CodePanel'
import { cn } from '@/lib/cn'
import type { Dish, SearchHit } from '@/lib/types'

const CODE = `// app/api/search-mm/route.ts
const query = \`Quiero cocinar algo con \${selected.join(', ')}.\`
const vector = await embedMultimodal(query)
const hits = await findNearestDishes(vector, 'embedding_mm', 6)`

export default function Cocinar() {
  const [selected, setSelected] = useState<string[]>([])
  const [hits, setHits] = useState<SearchHit<Dish>[]>([])
  const [loading, setLoading] = useState(false)

  function toggle(name: string) {
    setSelected((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]))
  }

  async function search() {
    if (selected.length === 0) return
    setLoading(true)
    try {
      const query = `Quiero cocinar algo con: ${selected.join(', ')}. ¿Qué platos peruanos puedo hacer?`
      const res = await fetch('/api/search-mm', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query, k: 6 }),
      })
      const { hits } = (await res.json()) as { hits: SearchHit<Dish>[] }
      setHits(hits)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-6 px-12 py-16">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
          Escena 06
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">¿Qué puedo cocinar?</h1>
        <p className="text-[var(--color-muted)]">
          Elegí ingredientes (la audiencia también puede sumar pidiendo en voz alta).
        </p>
      </header>

      <div className="grid grid-cols-8 gap-2">
        {ingredients.map((ing) => (
          <button
            key={ing.name}
            type="button"
            onClick={() => toggle(ing.name)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-md border p-3 text-xs transition-colors',
              selected.includes(ing.name)
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                : 'border-[var(--color-border)] bg-[var(--color-surface)]',
            )}
          >
            <span className="text-2xl">{ing.emoji}</span>
            <span>{ing.name}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={search}
          disabled={selected.length === 0 || loading}
          className="rounded-md bg-[var(--color-fg)] px-5 py-2 text-sm text-white disabled:opacity-40"
        >
          Buscar platos ({selected.length})
        </button>
        {loading && <LoadingDot size={16} />}
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => setSelected([])}
            className="text-xs text-[var(--color-muted)] underline"
          >
            limpiar
          </button>
        )}
      </div>

      <div className="grid grid-cols-6 gap-3 pt-2">
        {hits.map((h) => (
          <DishCard key={h.doc.id} dish={h.doc} similarity={h.similarity} />
        ))}
      </div>

      <CodePanel code={CODE} />
    </div>
  )
}
```

- [ ] **Step 7.3: Register and verify.**

Update `lib/scenes-registry.ts`. Navigate to `#cocinar`. Click 3 to 5 ingredients (for example: limón, pescado, cebolla, ají amarillo). Click "Buscar platos." Expected: returns Ceviche, Tiradito, Jalea, Cebiche de conchas negras, etc. with similarity scores.

Suggested commit message: `feat(rag-pres): scene 6 ingredients-to-dishes`.

---

## Task 8: Music ingestion + Scene 7 (Music closer with live instrument)

**Files:**
- Create: `rag-presentation/data/songs.json`
- Create: `rag-presentation/data/audio/*.mp3` (12 short Creative Commons or self-recorded clips)
- Create: `rag-presentation/scripts/ingest-music.ts`
- Create: `rag-presentation/components/AudioRecorder.tsx`
- Create: `rag-presentation/scenes/Patron.tsx`
- Modify: `rag-presentation/lib/scenes-registry.ts` (swap stub for Patron)

- [ ] **Step 8.1: Source the music clips.**

Pick 12 short Peruvian music snippets, 10 to 15 seconds each, 2 per genre (huayno, marinera, criolla, chicha, yaraví, festejo). Sources, in order of effort:

1. **Self-record** from public-domain folk recordings using QuickTime, trim to 12 seconds. Lowest licensing risk.
2. **Freemusicarchive.org** filtered by Latin Folk, license CC-BY. Attribute in the doc footer.
3. **archive.org** Audio Archive, search "huayno" "marinera" "festejo" filter for CC licenses.

Save the 12 clips into `rag-presentation/data/audio/` with descriptive filenames: `huayno-andino-cuzco-01.mp3`, `marinera-norteña-trujillo-01.mp3`, etc.

- [ ] **Step 8.2: Write the seed metadata.**

Write to `rag-presentation/data/songs.json`. Each entry mirrors the file in `data/audio/`:

```json
[
  {
    "id": "huayno-01",
    "title": "Llaqtaymanta",
    "genre": "huayno",
    "region": "Cuzco",
    "description": "Huayno tradicional cuzqueño, melancólico, charango y quena.",
    "mood_tags": ["melancólico", "andino", "tradicional", "esperanzador"],
    "file": "huayno-andino-cuzco-01.mp3"
  },
  {
    "id": "huayno-02",
    "title": "Adios Pueblo de Ayacucho",
    "genre": "huayno",
    "region": "Ayacucho",
    "description": "Huayno ayacuchano, romántico y triste, voz alta.",
    "mood_tags": ["romántico", "triste", "andino"],
    "file": "huayno-ayacucho-01.mp3"
  }
  // ... and so on for marinera, criolla, chicha, yaraví, festejo
]
```

Fill the list to 12 entries total before running the ingestion.

- [ ] **Step 8.3: Bootstrap the Firestore vector index for songs.**

```bash
gcloud firestore indexes composite create \
  --project=centinel-rag-demo \
  --collection-group=presentation_songs \
  --query-scope=COLLECTION \
  --field-config=vector-config='{"dimension":1536,"flat":{}}',field-path=embedding_mm
```

- [ ] **Step 8.4: Create the music ingestion script.**

Write to `rag-presentation/scripts/ingest-music.ts`:

```ts
import 'dotenv/config'
import { adminDb, adminStorage } from '@/lib/firebase-admin'
import { embedMultimodal } from '@/lib/gemini'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { FieldValue } from 'firebase-admin/firestore'
import type { Song, SongGenre } from '@/lib/types'

type SeedEntry = {
  id: string
  title: string
  genre: SongGenre
  region: string
  description: string
  mood_tags: string[]
  file: string
}

async function uploadAudio(entry: SeedEntry, buf: Buffer): Promise<string> {
  const file = adminStorage.bucket().file(`songs/${entry.id}.mp3`)
  await file.save(buf, { contentType: 'audio/mpeg', resumable: false })
  await file.makePublic()
  return file.publicUrl()
}

async function processOne(entry: SeedEntry): Promise<void> {
  const audioBuf = readFileSync(resolve(process.cwd(), 'data/audio', entry.file))
  const audio_clip_url = await uploadAudio(entry, audioBuf)

  const text = [
    entry.title,
    entry.genre,
    entry.region,
    entry.description,
    entry.mood_tags.join(', '),
  ].join('\n')

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
}

async function main() {
  const entries = JSON.parse(
    readFileSync(resolve(process.cwd(), 'data/songs.json'), 'utf-8'),
  ) as SeedEntry[]

  for (const entry of entries) {
    try {
      await processOne(entry)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      process.stdout.write(`  FAIL ${entry.id} :: ${msg}\n`)
    }
  }
  process.stdout.write('\nDone.\n')
}

main()
```

Run `pnpm ingest:music` and confirm 12/12 succeed.

- [ ] **Step 8.5: Create the audio recorder component.**

Write to `rag-presentation/components/AudioRecorder.tsx`:

```tsx
'use client'

import { useRef, useState } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  maxSeconds?: number
  onRecorded: (mimeType: string, base64: string) => void
  className?: string
}

export function AudioRecorder({ maxSeconds = 5, onRecorded, className }: Props) {
  const [state, setState] = useState<'idle' | 'recording' | 'processing'>('idle')
  const [seconds, setSeconds] = useState(0)
  const chunks = useRef<Blob[]>([])
  const recorder = useRef<MediaRecorder | null>(null)

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    chunks.current = []
    mr.ondataavailable = (e) => chunks.current.push(e.data)
    mr.onstop = async () => {
      setState('processing')
      stream.getTracks().forEach((t) => t.stop())
      const blob = new Blob(chunks.current, { type: 'audio/webm' })
      const buf = await blob.arrayBuffer()
      const b64 = btoa(
        Array.from(new Uint8Array(buf))
          .map((b) => String.fromCharCode(b))
          .join(''),
      )
      onRecorded('audio/webm', b64)
      setState('idle')
      setSeconds(0)
    }
    recorder.current = mr
    mr.start()
    setState('recording')
    setSeconds(0)

    const start = Date.now()
    const tick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000)
      setSeconds(elapsed)
      if (elapsed >= maxSeconds) {
        clearInterval(tick)
        mr.stop()
      }
    }, 100)
  }

  return (
    <button
      type="button"
      onClick={() => state === 'idle' && start()}
      className={cn(
        'flex items-center gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm',
        className,
      )}
      disabled={state !== 'idle'}
    >
      <span
        className={cn(
          'inline-block size-2.5 rounded-full',
          state === 'recording' ? 'animate-pulse bg-[var(--color-accent)]' : 'bg-[var(--color-muted)]',
        )}
      />
      {state === 'idle' && 'Grabar 5 segundos en vivo'}
      {state === 'recording' && `Grabando · ${seconds}s / ${maxSeconds}s`}
      {state === 'processing' && 'Procesando…'}
    </button>
  )
}
```

- [ ] **Step 8.6: Create the music search route.**

Append to `rag-presentation/app/api/search-mm/route.ts` (extend, do not replace) to support a `collection` parameter switching between `presentation_dishes` and `presentation_songs`:

```ts
// Replace the existing route.ts with the following expanded version.
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { embedMultimodal } from '@/lib/gemini'
import { findNearestDishes } from '@/lib/search'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import type { Song, SearchHit } from '@/lib/types'

const Part = z.union([
  z.object({ text: z.string() }),
  z.object({ inlineData: z.object({ mimeType: z.string(), data: z.string() }) }),
])

const Body = z.object({
  query: z.string().default(''),
  content: z.array(Part).optional(),
  k: z.number().int().min(1).max(20).optional(),
  collection: z.enum(['dishes', 'songs']).default('dishes'),
})

async function findNearestSongs(vector: number[], k: number): Promise<SearchHit<Song>[]> {
  const snap = await adminDb
    .collection('presentation_songs')
    .findNearest({
      vectorField: 'embedding_mm',
      queryVector: FieldValue.vector(vector),
      limit: k,
      distanceMeasure: 'COSINE',
      distanceResultField: '_distance',
    })
    .get()
  return snap.docs.map((d) => {
    const raw = d.data() as Song & { _distance: number }
    return { doc: raw, distance: raw._distance, similarity: 1 - raw._distance }
  })
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  const { query, content, k = 6, collection } = parsed.data
  const vector = await embedMultimodal(query, content)
  const hits =
    collection === 'songs'
      ? await findNearestSongs(vector, k)
      : await findNearestDishes(vector, 'embedding_mm', k)
  return NextResponse.json({ hits, embedding_preview: vector.slice(0, 16) })
}
```

- [ ] **Step 8.7: Create the Patron scene.**

Write to `rag-presentation/scenes/Patron.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { AudioRecorder } from '@/components/AudioRecorder'
import { LoadingDot } from '@/components/LoadingDot'
import { SimilarityBar } from '@/components/SimilarityBar'
import { CodePanel } from '@/components/CodePanel'
import type { Song, SearchHit } from '@/lib/types'

const CODE = `// audio path
const vector = await embedMultimodal('', [
  { inlineData: { mimeType: 'audio/webm', data: recordedBase64 } },
])
const hits = await findNearestSongs(vector, 6)`

const MOODS = [
  'triste pero esperanzador',
  'celebración del verano costeño',
  'andino festivo',
  'tarde nostálgica con guitarra criolla',
]

export default function Patron() {
  const [hits, setHits] = useState<SearchHit<Song>[]>([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'mood' | 'live'>('mood')

  async function searchByMood(mood: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/search-mm', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: mood, collection: 'songs', k: 6 }),
      })
      const { hits } = (await res.json()) as { hits: SearchHit<Song>[] }
      setHits(hits)
    } finally {
      setLoading(false)
    }
  }

  async function searchByAudio(mimeType: string, base64: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/search-mm', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          query: '',
          content: [{ inlineData: { mimeType, data: base64 } }],
          collection: 'songs',
          k: 6,
        }),
      })
      const { hits } = (await res.json()) as { hits: SearchHit<Song>[] }
      setHits(hits)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-6 px-12 py-16">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
          Escena 07
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">El mismo patrón, otro mundo</h1>
        <p className="text-[var(--color-muted)]">
          Música peruana. La misma forma de embebido aplica.
        </p>
      </header>

      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => setMode('mood')}
          className={
            'rounded-full border px-3 py-1 ' +
            (mode === 'mood'
              ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
              : 'border-[var(--color-border)] text-[var(--color-muted)]')
          }
        >
          Buscar por mood
        </button>
        <button
          type="button"
          onClick={() => setMode('live')}
          className={
            'rounded-full border px-3 py-1 ' +
            (mode === 'live'
              ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
              : 'border-[var(--color-border)] text-[var(--color-muted)]')
          }
        >
          Grabar en vivo (instrumento)
        </button>
      </div>

      {mode === 'mood' && (
        <div className="flex flex-wrap gap-2 text-xs">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => searchByMood(m)}
              className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[var(--color-muted)] hover:text-[var(--color-fg)]"
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {mode === 'live' && (
        <div className="flex items-center gap-3">
          <AudioRecorder onRecorded={searchByAudio} />
          {loading && <LoadingDot size={16} />}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 pt-4">
        {hits.map((h) => (
          <div
            key={h.doc.id}
            className="flex flex-col gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
          >
            <div>
              <div className="font-semibold tracking-tight">{h.doc.title}</div>
              <div className="text-xs text-[var(--color-muted)]">
                {h.doc.genre} · {h.doc.region}
              </div>
            </div>
            <audio src={h.doc.audio_clip_url} controls preload="none" className="w-full" />
            <p className="text-xs text-[var(--color-muted)]">{h.doc.description}</p>
            <SimilarityBar similarity={h.similarity} />
          </div>
        ))}
      </div>

      <CodePanel code={CODE} />
    </div>
  )
}
```

- [ ] **Step 8.8: Register and verify.**

Update `lib/scenes-registry.ts`. Navigate to `#patron`.

Verify:
1. Mode "Buscar por mood": click "triste pero esperanzador". Expected: yaravíes and slower huaynos rank highest.
2. Mode "Grabar en vivo": click the recorder. Hum a melody or play 5 seconds of charango. Expected: some result list (similarity scores may be low and that is the honest moment).

Suggested commit message: `feat(rag-pres): scene 7 music closer with live recording`.

---

## Task 9: Scenes 0, 1, 2, 8 (bookends and concept scenes)

**Files:**
- Create: `rag-presentation/components/PCAProjection.tsx`
- Create: `rag-presentation/lib/pca.ts`
- Create: `rag-presentation/app/api/dishes/route.ts`
- Create: `rag-presentation/scenes/Apertura.tsx`
- Create: `rag-presentation/scenes/Embeddings.tsx`
- Create: `rag-presentation/scenes/Como.tsx`
- Create: `rag-presentation/scenes/Debajo.tsx`
- Modify: `rag-presentation/lib/scenes-registry.ts` (swap stubs for all four)

- [ ] **Step 9.1: Create the dishes-listing route.**

Write to `rag-presentation/app/api/dishes/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import type { Dish } from '@/lib/types'

export async function GET() {
  const snap = await adminDb.collection('presentation_dishes').get()
  const dishes = snap.docs
    .map((d) => d.data() as Dish)
    .filter((d) => !d.id.startsWith('live_')) // skip stage-indexed docs
  return NextResponse.json({ dishes })
}
```

- [ ] **Step 9.2: Create a minimal 2D-projection helper using power iteration on the covariance matrix.**

Write to `rag-presentation/lib/pca.ts`. This is intentionally compact: PCA for visualization is approximate by nature, and we only need 2D from 768-dim text embeddings.

```ts
// Approximate PCA via power iteration. Good enough for visualization.
// Not numerically rigorous; do not use for analytics.

function center(matrix: number[][]): number[][] {
  const cols = matrix[0].length
  const means = new Array(cols).fill(0)
  for (const row of matrix) for (let i = 0; i < cols; i++) means[i] += row[i]
  for (let i = 0; i < cols; i++) means[i] /= matrix.length
  return matrix.map((row) => row.map((v, i) => v - means[i]))
}

function dot(a: number[], b: number[]): number {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i] * b[i]
  return s
}

function norm(a: number[]): number {
  return Math.sqrt(dot(a, a))
}

function multiplyMatTransposeMat(m: number[][], v: number[]): number[] {
  // Computes (m^T @ m) @ v, but lazily to avoid building m^T @ m explicitly.
  // First compute u = m @ v (n-dim), then result = m^T @ u (cols-dim).
  const u = m.map((row) => dot(row, v))
  const cols = m[0].length
  const out = new Array(cols).fill(0)
  for (let r = 0; r < m.length; r++) {
    const ur = u[r]
    const row = m[r]
    for (let c = 0; c < cols; c++) out[c] += row[c] * ur
  }
  return out
}

function powerIteration(matrix: number[][], iters = 50): number[] {
  const cols = matrix[0].length
  let v: number[] = new Array(cols).fill(0).map(() => Math.random() - 0.5)
  for (let i = 0; i < iters; i++) {
    v = multiplyMatTransposeMat(matrix, v)
    const n = norm(v) || 1
    v = v.map((x) => x / n)
  }
  return v
}

function deflate(matrix: number[][], v: number[]): number[][] {
  return matrix.map((row) => {
    const proj = dot(row, v)
    return row.map((x, i) => x - proj * v[i])
  })
}

export function pca2(matrix: number[][]): { x: number; y: number }[] {
  if (matrix.length === 0) return []
  const centered = center(matrix)
  const pc1 = powerIteration(centered)
  const deflated = deflate(centered, pc1)
  const pc2 = powerIteration(deflated)
  return centered.map((row) => ({ x: dot(row, pc1), y: dot(row, pc2) }))
}
```

- [ ] **Step 9.3: Create the PCA-projection visual component.**

Write to `rag-presentation/components/PCAProjection.tsx`:

```tsx
'use client'

import { useMemo, useState } from 'react'
import { pca2 } from '@/lib/pca'
import type { Dish, DishCategory } from '@/lib/types'

const CATEGORY_COLOR: Record<DishCategory, string> = {
  marino: '#1d4ed8',
  criollo: '#c8553d',
  sopa: '#7a8f3a',
  postre: '#e8b04a',
  bebida: '#9333ea',
  andino: '#0a0a0a',
}

export function PCAProjection({ dishes }: { dishes: Dish[] }) {
  const [hover, setHover] = useState<Dish | null>(null)

  const points = useMemo(() => {
    if (dishes.length === 0) return []
    const matrix = dishes.map((d) => d.embedding_text)
    const projected = pca2(matrix)
    const xs = projected.map((p) => p.x)
    const ys = projected.map((p) => p.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const nx = (v: number) => (v - minX) / (maxX - minX || 1)
    const ny = (v: number) => (v - minY) / (maxY - minY || 1)
    return projected.map((p, i) => ({
      dish: dishes[i],
      x: nx(p.x) * 100,
      y: ny(p.y) * 100,
    }))
  }, [dishes])

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        {points.map(({ dish, x, y }) => (
          <circle
            key={dish.id}
            cx={x}
            cy={y}
            r={1.2}
            fill={CATEGORY_COLOR[dish.category]}
            opacity={hover && hover.id !== dish.id ? 0.3 : 0.9}
            onMouseEnter={() => setHover(dish)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </svg>
      {hover && (
        <div className="absolute bottom-3 left-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs">
          <div className="font-semibold">{hover.name_es}</div>
          <div className="text-[var(--color-muted)]">{hover.category}</div>
        </div>
      )}
      <div className="absolute right-3 top-3 flex flex-col gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-xs">
        {(Object.keys(CATEGORY_COLOR) as DishCategory[]).map((c) => (
          <div key={c} className="flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ background: CATEGORY_COLOR[c] }} />
            {c}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 9.4: Create the Apertura scene.**

Write to `rag-presentation/scenes/Apertura.tsx`. Replace the placeholder bio paragraph with your own once Step 9.7 lists the content you want.

```tsx
export default function Apertura() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
      <div className="mx-auto max-w-3xl px-12 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
          Centinel · Lima · 2026
        </div>
        <h1 className="mt-6 text-6xl font-semibold tracking-tight">
          RAG · Embeddings · Multimodal
        </h1>
        <p className="mt-4 text-xl text-[var(--color-muted)]">
          Una exploración con comida peruana
        </p>
        <div className="mt-12 space-y-2 text-base leading-relaxed">
          <p className="font-semibold">Tomás Piaggio</p>
          <p className="text-[var(--color-muted)]">
            {/* Reemplazá con tu bio. Una a tres frases. */}
            Soy parte del equipo de Centinel. Trabajo en pre-contabilidad automatizada y vector search.
            Hoy: cómo las máquinas entienden el significado, usando algo que todos conocemos.
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 9.5: Create the Embeddings scene.**

Write to `rag-presentation/scenes/Embeddings.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { EmbeddingViz } from '@/components/EmbeddingViz'
import { LoadingDot } from '@/components/LoadingDot'
import { CodePanel } from '@/components/CodePanel'

const CODE = `import { google } from '@/lib/gemini'
import { embed } from 'ai'

const { embedding } = await embed({
  model: google.embedding('gemini-embedding-001'),
  value: 'ceviche',
})

// embedding.length === 768`

export default function Embeddings() {
  const [value, setValue] = useState('ceviche')
  const [embedding, setEmbedding] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  async function go() {
    setLoading(true)
    try {
      const res = await fetch('/api/embed/text', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ value }),
      })
      const { embedding } = (await res.json()) as { embedding: number[] }
      setEmbedding(embedding)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-10 px-12">
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
          Escena 01
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">¿Qué son los embeddings?</h1>
        <p className="text-[var(--color-muted)]">
          ¿Cómo le explico el sabor del ceviche a una máquina? Con números.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') go()
          }}
          className="flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-lg"
        />
        <button
          type="button"
          onClick={go}
          className="rounded-md bg-[var(--color-fg)] px-5 py-3 text-sm text-white"
        >
          Embebir
        </button>
        {loading && <LoadingDot size={20} />}
      </div>

      <EmbeddingViz
        values={embedding}
        max={48}
        label={`${value} · ${embedding.length || 0} dim`}
      />

      <CodePanel code={CODE} defaultOpen />
    </div>
  )
}
```

- [ ] **Step 9.6: Create the Como scene with the PCA projection.**

Write to `rag-presentation/scenes/Como.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { PCAProjection } from '@/components/PCAProjection'
import { LoadingDot } from '@/components/LoadingDot'
import type { Dish } from '@/lib/types'

const USES = [
  { who: 'Spotify', what: 'recomendaciones de canciones por gusto' },
  { who: 'Google', what: 'búsqueda semántica' },
  { who: 'ChatGPT', what: 'memoria de conversaciones largas' },
  { who: 'Centinel', what: 'reconocimiento de proveedores en facturas' },
]

export default function Como() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dishes')
      .then((r) => r.json())
      .then((j: { dishes: Dish[] }) => setDishes(j.dishes))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-6 px-12 py-16">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
          Escena 02
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">
          ¿Cómo funcionan y para qué sirven?
        </h1>
        <p className="text-[var(--color-muted)]">
          Cada plato es un punto. Los parecidos se agrupan.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          {loading ? (
            <div className="flex aspect-[4/3] items-center justify-center rounded-md border border-[var(--color-border)]">
              <LoadingDot />
            </div>
          ) : (
            <PCAProjection dishes={dishes} />
          )}
        </div>
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
            Donde ya las usás
          </div>
          {USES.map((u) => (
            <div key={u.who} className="space-y-1">
              <div className="font-semibold">{u.who}</div>
              <div className="text-sm text-[var(--color-muted)]">{u.what}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 9.7: Create the Debajo scene.**

Write to `rag-presentation/scenes/Debajo.tsx`:

```tsx
import { CodePanel } from '@/components/CodePanel'

const STACK = [
  ['Stack', 'Next.js 16, React 19, TypeScript estricto, Tailwind v4, Framer Motion'],
  ['SDK de AI', 'Vercel AI SDK (@ai-sdk/google 3.0.x sobre ai 6.x), igual que Centinel'],
  ['Modelos', 'gemini-embedding-001 (texto, 768d) · gemini-embedding-2 (multimodal, 1536d)'],
  ['Vector DB', 'Firestore vectorField + findNearest, igual que Centinel'],
  ['Lo nuevo', 'Sólo el modelo nuevo y un providerOption nuevo. No hay SDK nuevo.'],
]

const COSTS = [
  ['gemini-embedding-001', '$0.00002 / 1k tokens'],
  ['gemini-embedding-2',   '$0.0001 / request (orden de magnitud)'],
  ['Firestore findNearest', 'Reads normales × k'],
  ['Total estimado por consulta', '~$0.0001 a $0.0002'],
]

const CODE = `// El cambio para sumar multimodal a Centinel
- const model = google.embedding('gemini-embedding-001')
+ const model = google.embedding('gemini-embedding-2')

  await embed({
    model,
    value: '',
+   providerOptions: {
+     google: {
+       outputDimensionality: 1536,
+       content: [[{ inlineData: { mimeType, data } }]],
+     },
+   },
  })`

export default function Debajo() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-8 px-12 py-16">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
          Escena 08
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">Lo que pasa por debajo</h1>
      </header>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">El stack</div>
          {STACK.map(([k, v]) => (
            <div key={k}>
              <div className="font-semibold">{k}</div>
              <div className="text-sm text-[var(--color-muted)]">{v}</div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-widest text-[var(--color-muted)]">Costos</div>
          {COSTS.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between font-mono text-sm">
              <span>{k}</span>
              <span className="text-[var(--color-muted)]">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <CodePanel
        title="El diff completo para que Centinel use multimodal"
        code={CODE}
        defaultOpen
      />

      <div className="mt-auto text-center text-[var(--color-muted)]">
        Gracias.
      </div>
    </div>
  )
}
```

- [ ] **Step 9.8: Register all four scenes and verify.**

Update `lib/scenes-registry.ts` to import all four and replace the corresponding stubs.

Verify each by navigating to the hash and clicking through:
- `#apertura`: hero title with your bio.
- `#embeddings`: type "ceviche," press Embebir, watch 48 numbers cascade.
- `#como`: 2D scatter with clusters by category, hover shows dish name.
- `#debajo`: stack table, costs table, diff code panel.

Suggested commit message: `feat(rag-pres): scenes 0, 1, 2, 8 (bookends + concept scenes)`.

---

## Task 10: Polish, rehearsal, screen-recording backup

**Files:**
- Modify: any scene that needs visual or copy adjustments after rehearsal
- Create: `rehearsal-notes.md` (optional, your scratchpad)

- [ ] **Step 10.1: Run through the entire deck once at presenter pace.**

Start fresh: `pnpm dev`, full-screen the browser (F11 or fn+F11 on macOS), set the laptop volume halfway up. Walk through scenes 0 to 8 using only `← →` and Cmd+. for notes. Time each scene. If any scene runs significantly long or short, adjust the copy or the demo flow.

- [ ] **Step 10.2: Adjust the loading dot timing if Gemini calls feel slow.**

If the multimodal calls (Scenes 5, 6, 7) consistently take more than 1.5 seconds in your venue WiFi, consider:
- Adding a "preheat" call on scene-mount that fires a tiny embed to warm any cold paths (cheap, hidden).
- Adding a subtle text under the loading dot showing what is happening: "embedding la imagen…" so the wait feels intentional.

The polish is light-touch; do not over-engineer.

- [ ] **Step 10.3: Take a clean screen recording as fallback.**

```bash
# macOS native: Cmd+Shift+5 picks the recording option. Record the whole deck
# at a calm pace. Save to ~/Movies/rag-presentation-rehearsal.mp4.
```

This is the absolute fallback if WiFi dies at the venue. Have VLC or QuickTime ready to play it.

- [ ] **Step 10.4: Pre-stage demo materials on your machine.**

- A PDF of a recipe ready in your Downloads folder for Scene 4.
- A dish photo open on your phone, brightness up, for Scene 5.
- Your instrument (if you are bringing one) with the laptop mic placement tested for Scene 7.

- [ ] **Step 10.5: Final check before going on stage.**

- [ ] Phone is on hotspot mode and your laptop is paired.
- [ ] `pnpm dev` runs cleanly with no console errors.
- [ ] Firestore console open in a side tab for the Scene 4 reveal moment.
- [ ] Browser zoom set to 100%; full screen verified at the projector resolution.

Suggested commit message at this point if you want a snapshot: `chore(rag-pres): rehearsal polish pass`.

---

## Post-talk wrap-up (optional)

If you want to extract the app to a standalone repo after the talk:

- [ ] **Step W.1: Extract.**

```bash
cp -r /Users/tomaspiaggio/Documents/centinel/.claude/worktrees/rag-presentation/rag-presentation/ ~/code/rag-presentation/
cd ~/code/rag-presentation
git init
git add .
git commit -m "init: import RAG presentation from Centinel worktree"
```

- [ ] **Step W.2: Optional Vercel deploy.**

```bash
pnpm i -g vercel
vercel link
vercel env add GOOGLE_GENERATIVE_AI_API_KEY production
vercel env add FIREBASE_ADMIN_SA_PATH production
# ... and the rest, then
vercel --prod
```

Then share the URL with the team after the talk.

---

## Spec-coverage self-review

Cross-check the spec against the plan:

- Scene 0 (Apertura) - Task 9 (Step 9.4) `Apertura.tsx`.
- Scene 1 (¿Qué son los embeddings?) - Task 9 (Step 9.5) `Embeddings.tsx`, uses `/api/embed/text` from Task 4.
- Scene 2 (¿Cómo funcionan?) - Task 9 (Steps 9.2, 9.3, 9.6) PCA helper + projection + Como scene.
- Scene 3 (Búsqueda) - Task 4 entirely.
- Scene 4 (Live indexing) - Task 5 entirely.
- Scene 5 (Photo a dish) - Task 6 entirely.
- Scene 6 (Ingredientes a dishes) - Task 7 entirely.
- Scene 7 (Música) - Task 8 entirely.
- Scene 8 (Lo que pasa por debajo) - Task 9 (Step 9.7) `Debajo.tsx`.
- Visual system tokens - Task 0 Step 0.5 (globals.css), Task 1 components.
- Two embedding fields per dish - Task 3 ingestion script writes both, Task 4 uses `embedding_text`, Tasks 5 to 8 use `embedding_mm`.
- 1536-dim multimodal - Task 1 Step 1.3 (`embedMultimodal` passes `outputDimensionality: 1536`).
- `gemini-embedding-2` model id - Task 1 Step 1.3.
- AI SDK only - confirmed; no `@google/genai` import anywhere in the plan.
- Firestore vector indexes - Task 3 Step 3.5, Task 8 Step 8.3.
- Keyboard nav, hash routing, presenter notes - Task 2.
- Scene chrome that fades after 3s - Task 2 Step 2.2.
- Loading dot, similarity bar, embedding viz, dish card, code panel - Task 1.
- Music ingestion script - Task 8.
- Audio MediaRecorder live moment - Task 8 Step 8.5.
- Honest cosine for live instrument - inherent in `SimilarityBar` rendering, which always shows the actual score.
- 30-45 min run - Task 10 rehearsal step.

No spec section is uncovered.

