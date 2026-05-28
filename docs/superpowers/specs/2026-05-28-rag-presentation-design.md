# RAG Presentation App: Design

**Date:** 2026-05-28
**Author:** Tomás Piaggio, with Claude
**Status:** Draft for review
**Audience for the talk:** Centinel team (mixed engineering, product, design), Lima, Peru
**Length of the talk:** 30 to 45 minutes
**Posture:** Exploratory, not for the Centinel repo. Throwaway code, real WOW factor.

## Goal

Build a standalone web application that doubles as a 30-to-45-minute live presentation introducing vector embeddings, RAG, and multimodal RAG to a mixed audience. The app should be visually polished enough to function as the entire slide deck, while exposing the underlying code and embeddings as first-class visual artifacts so the engineers in the room can see exactly how it works.

The anchor domain is Peruvian gastronomy. The audience is in Lima; the personalization is intentional but never kitsch. A music micro-segment at the end shows the same pattern generalizes beyond food.

## Narrative spine

Nine scenes, total around 43 minutes. Keyboard-navigated, full-viewport, transitions handled by Framer Motion.

| # | Scene | Time | Beat |
|---|---|---|---|
| 0 | **Apertura y quién soy** | 3 min | Hero photo of a Peruvian dish behind the title "RAG, Embeddings, y Multimodal: una exploración con comida peruana." Presenter intro (`{{ presenter-bio }}`, see Open placeholders). One-line setup: "Today, cómo las máquinas entienden el significado, usando algo que todos conocemos." |
| 1 | **¿Qué son los embeddings?** | 4 min | Hook: "¿Cómo le explico el sabor del ceviche a una máquina?" Build intuition: every word, image, dish becomes a list of numbers (a vector); each dimension is a learned "feature"; similar things have similar vectors. Animate one dish turning into 768 numbers. Code panel reveals the literal `embed()` call. |
| 2 | **¿Cómo funcionan y para qué sirven?** | 5 min | Project ~30 real dish embeddings into 2D (PCA from `gemini-embedding-001`). Watch them cluster by category (criollo, marino, postres, sopas). Hover any dish to highlight its nearest neighbors. Quick mention: "esto es lo que está detrás de Spotify, Google Search, la memoria de ChatGPT, y el matching de proveedores en Centinel." Transition: "ahora, ¿qué cambia esto sobre la búsqueda?" |
| 3 | **El problema con la búsqueda tradicional** | 5 min | Split view: KEYWORD vs SEMANTIC. Both wired to the same input. First query "ceviche" returns both. Second query "comida reconfortante en día lluvioso" returns nothing on keyword and returns ají de gallina, caldo de gallina, chupe on semantic. Show similarity scores. Code panel reveals `google.embedding('gemini-embedding-001')`. |
| 4 | **Embedding en vivo** | 7 min | Drop a recipe PDF onto the stage. Animation: PDF → text chunks → embedding (real Gemini numbers cascade in) → Firestore row appears with a `vectorField` value. Query the new dish: it returns. Punchline: "no hay magia, solo álgebra." |
| 5 | **Reconoce la comida que ves** | 6 min | Webcam preview. Point laptop camera at a phone showing a dish photo. `gemini-embedding-2` embeds the image; Firestore `findNearest` on `embedding_mm` returns top matches with recipe and similar dishes. Code panel shows the `providerOptions.google.content` call. |
| 6 | **¿Qué puedo cocinar con esto?** | 6 min | Ingredient picker (grid of common ingredients) plus an optional "upload fridge photo" path that uses Gemini for multi-ingredient extraction. Combine into a query embedding, return ranked dishes. Audience-friendly: people can shout ingredients to add. |
| 7 | **El mismo patrón, otro mundo** | 3 min | Pivot to a small Peruvian-music collection (12 song snippets across huayno, marinera, criolla, chicha, yaraví, festejo). Type a mood: "triste pero esperanzador" returns yaravíes / vals criollo. Then the optional live moment: record 5 seconds of a real instrument via MediaRecorder, embed via `gemini-embedding-2`, search. Visualize where the embedding lands in 2D regardless of cosine score. Honest narration if the match is weak. Closes with "anything you can describe, you can embed." |
| 8 | **Lo que pasa por debajo** | 4 min | Architecture diagram, costs ($0.0001 per query order of magnitude), latencies (300 to 1500 ms multimodal), the actual model identifiers in use (`gemini-embedding-001` and `gemini-embedding-2`), what Centinel runs in production today (text embedding for supplier matching), what we would need to add to bring multimodal in (almost nothing, since the SDK already supports it). Closing thank-you slide. |

Scene 0 and 8 are short bookends. Scenes 4, 5, 6 are the engineering-heaviest. Scenes 1 and 2 are the teaching backbone, added because the audience is mixed and needs the conceptual scaffolding before the demos hit.

## Architecture

```
Browser (one Next.js 16 app, App Router, single user, laptop-only)
  Scene runner (keyboard nav with ← → ESC Cmd+. , hash-based routing for refresh resilience)
  Framer Motion (scene transitions, embedding-number animations)
  Tailwind v4 + shadcn (editorial visual system with Peruvian accents)
  getUserMedia (webcam for Scene 5)
  MediaRecorder (audio for Scene 7)

Next.js Route Handlers (server-only, holds GEMINI_API_KEY)
  POST /api/embed/text         google.embedding('gemini-embedding-001'),      768 dim
  POST /api/embed/multimodal   google.embedding('gemini-embedding-2'),          1536 dim
                                 outputDimensionality: 1536
                                 content: multimodal parts via providerOptions.google.content
  POST /api/search             Firestore findNearest on embedding_text or embedding_mm
  POST /api/index              embed (text or multimodal), write vectorField doc
  POST /api/describe-image     (only if a scene needs a caption; uses gemini-2.5-flash)

External services
  Gemini API, accessed exclusively via @ai-sdk/google (Vercel AI SDK)
  Firestore (project: centinel-rag-demo)
    presentation/dishes/{dishId}     dish docs with two embedding fields
    presentation/songs/{songId}      song snippet docs with one embedding field
```

### Stack alignment with Centinel

Centinel today pins `ai: 6.0.191`, `@ai-sdk/google: ^3.0.79` (resolves to 3.0.80), `@ai-sdk/provider: 3.0.10`, `@ai-sdk/provider-utils: 4.0.27`. The presentation app uses the same exact versions. The multimodal capability is already present in `@ai-sdk/google@3.0.80` via `googleEmbeddingModelOptions.content`; no new dependency is required.

The only thing Centinel does not run today is the `gemini-embedding-2` model identifier and the `providerOptions.google.content` provider option. The model is GA in the Gemini API; the SDK accepts arbitrary string model ids (its type literal still says `'gemini-embedding-2-preview'`, but the union ends with `| (string & {})` and the id is passed through verbatim to the REST endpoint).

### Why two embedding fields per dish, on purpose

`embedding_text` (768 dim, `gemini-embedding-001`) is what Centinel runs in production for supplier matching today. Scenes 1, 2, 3, 4 use it, so when you say "this is literally our stack" it is literally true.

`embedding_mm` (1536 dim, `gemini-embedding-2`) lives in the same vector space across text, image, audio, and PDF. Scenes 5, 6, 7 use it. The dimension is 1536 because Firestore `findNearest` accepts up to 2048 dimensions and Google trains `gemini-embedding-2` with Matryoshka representation learning, so 768, 1536, and 3072 are all valid truncations. 1536 keeps the most nuance that still fits Firestore.

### Why Firestore vector search

Centinel uses Firestore `vectorField` and `findNearest` in production. Choosing the same backend for the talk earns the authenticity. Pinecone or pgvector would also work; we are choosing on-stack credibility over feature parity.

## Visual system

### Color tokens

| Token | Value | Used for |
|---|---|---|
| `bg` | `#fafaf7` | Page background, warm off-white |
| `surface` | `#ffffff` | Cards, panels |
| `fg` | `#0a0a0a` | Primary text |
| `muted` | `#737373` | Secondary text, labels |
| `border` | `#e8d9c2` | Default borders, hairlines |
| `accent` | `#c8553d` | Terracotta. Focus rings, active states. Used sparingly. |
| `accent-2` | `#e8b04a` | Saffron. Highlight tags, badges. |
| `accent-3` | `#7a8f3a` | Olive. Data accent for cosine bars, vector charts. |
| `code-bg` | `#f5f3ee` | Code panel backgrounds |
| `code-fg` | `#262626` | Code panel text |

### Typography

* **Sans**: Inter, variable weight, full Latin Extended-A coverage so ñ and accented characters look natural.
* **Mono**: JetBrains Mono Variable for embeddings, code panels, numbers (tabular numerals required).
* **Display**: optional override to Editorial New or General Sans for the hero title only.

### Animation system (Framer Motion)

* Scene transition: 400 ms, 24 px slide combined with fade.
* Embedding-number cascade: 60 ms stagger per number, total around 1.6 s for the visible range.
* Hover lift: 150 ms, 4 px translateY plus soft shadow.
* Loading state: a single terracotta dot orbiting a 24 px outlined circle. The motion is deliberately calm so a 1.5 s Gemini call reads as intentional, not slow.

### Scene chrome

* Top right: `2 / 9` and the scene title, very small, muted.
* Top left: a discrete dot for "presenter notes," opens on `Cmd+.`.
* Bottom right: tiny `← →` keyboard hint.
* All chrome fades to 30% opacity after 3 seconds of mouse inactivity. Mouse motion brings it back.

## Data shape

```ts
// presentation/dishes/{dishId}
type Dish = {
  id: string
  name_es: string
  name_en: string
  category: 'criollo' | 'marino' | 'sopa' | 'postre' | 'bebida' | 'andino'
  description: string       // 2 to 3 sentences, Gemini-augmented from Wikipedia intro
  recipe: string             // full recipe text, Gemini-generated
  ingredients: string[]
  tags: string[]             // mood, occasion, region
  image_url: string          // Firebase Storage public URL
  source_url: string         // Wikipedia URL for attribution
  embedding_text: number[]   // 768 dim,  gemini-embedding-001
  embedding_mm: number[]     // 1536 dim, gemini-embedding-2 (image + description bundled)
}

// presentation/songs/{songId}
type Song = {
  id: string
  title: string
  genre: 'huayno' | 'marinera' | 'criolla' | 'chicha' | 'yaraví' | 'festejo'
  region: string
  description: string
  mood_tags: string[]
  audio_clip_url: string     // 10 to 15 sec snippet, Firebase Storage
  embedding_mm: number[]     // 1536 dim, gemini-embedding-2 (audio + description bundled)
}

// Live-indexed docs from Scene 4 are written to presentation/dishes too,
// with embedding_mm only (showcasing the new model's PDF-native flow).
```

### Dataset size targets

* 50 dishes across the 6 categories (around 8 per category).
* 12 song snippets, 2 per genre.
* Total Firestore size around 5 MB. Total embedding cost to seed: a few cents on Gemini API at current pricing.

## Components catalog

### Shared

* `SceneFrame` (full-viewport container, chrome, transition wrapper)
* `KeyboardNav` (controller with ← → ESC Cmd+. handlers, hash routing)
* `CodePanel` (collapsible drawer revealing the actual code that ran for the scene)
* `EmbeddingViz` (animated numerical embedding, optional 2D projection mode)
* `SimilarityBar` (cosine score visualizer, olive accent)
* `DishCard` (image, name in es/en, tags, optional similarity badge)
* `LoadingDot` (the orbit animation used during real Gemini calls)
* `PresenterNotes` (overlay opened by `Cmd+.`, shows per-scene speaker notes)

### Scene-specific

* `HeroOpen` (Scene 0)
* `EmbeddingExplainer` (Scene 1)
* `EmbeddingSpaceViz` (Scene 2, PCA 2D projection with hover-to-light-up neighbors)
* `KeywordVsSemantic` (Scene 3)
* `LiveIndexer` (Scene 4, dropzone, chunking visualization, Firestore writer)
* `PhotoCapture` (Scene 5, webcam, capture, multimodal embed)
* `IngredientGrid` (Scene 6)
* `MusicCloser` (Scene 7, song grid plus live recording path)
* `BehindTheScenes` (Scene 8, architecture diagram, costs, model identifiers)

## Data ingestion

Two scripts, run once before the talk, write to Firestore directly via Firebase Admin.

### `scripts/ingest.ts`

1. Read `data/dishes.json`, a hand-curated list of approximately 50 Peruvian dishes with Wikipedia URLs.
2. For each dish, fetch its Wikipedia page, extract the intro paragraph and the featured image, upload the image to Firebase Storage.
3. Call Gemini to expand the intro into richer recipe text, ingredients, mood tags, cross-references.
4. Embed twice: text-only into `embedding_text` (`gemini-embedding-001`); multimodal (image plus description bundled via `providerOptions.google.content`) into `embedding_mm` (`gemini-embedding-2`, `outputDimensionality: 1536`).
5. Write the doc to `presentation/dishes/{id}`.

A human review pass after step 3 fixes any Spanish quality issues from the Gemini augmentation.

### `scripts/ingest-music.ts`

1. Read `data/songs.json`, a curated list of 12 Peruvian song snippets, sourced from Creative Commons audio (or self-recorded 10 to 15 second clips).
2. Upload each clip to Firebase Storage.
3. Embed multimodal (audio plus written description bundled) into `embedding_mm`.
4. Write to `presentation/songs/{id}`.

## Build sequence

| Day | Work |
|---|---|
| 1 | Project bootstrap. Next.js 16, TypeScript strict, Tailwind v4, shadcn, Framer Motion, `@ai-sdk/google@3.0.80`, `ai@6.0.191`, Firebase Admin and Client. Tokens, fonts, base shared components. |
| 2 | Scene runner: keyboard nav, hash routing, transition system, scene chrome, presenter notes overlay. Validated with three placeholder scenes. |
| 3 | `scripts/ingest.ts` for dishes. Curate `data/dishes.json`, fetch Wikipedia, augment with Gemini, dual embeddings, write to Firestore. Hand-review pass on Spanish quality. |
| 4 | Scene 3 (Keyword vs Semantic). Validates the text embedding and search path. |
| 5 | Scene 4 (Live indexing). Animation-heavy; build while fresh. |
| 6 | Scene 5 (Photo to dish). First multimodal scene. |
| 7 | Scene 6 (Ingredients to dishes). Reuses Scene 5 plumbing. |
| 8 | `scripts/ingest-music.ts` plus Scene 7 (Music closer including live MediaRecorder path). |
| 9 | Scene 1, Scene 2 (2D projection visualization), Scene 0, Scene 8. Mostly conceptual or visual, no new data plumbing. |
| 10 | Polish, transition tuning, rehearsal pass, screen recording as backup. |

Total roughly 8 to 10 dev days. The high-risk scenes (5, 7) land on days 6 and 8 so animation and visual polish dominate the final stretch.

## Risks

| Risk | Why it stays | Mitigation |
|---|---|---|
| Live instrument matches poorly | `gemini-embedding-2` has not been empirically tested by us on a 5-second charango or quena clip. | Visualize the embedding landing in 2D regardless of cosine score. Surface the score honestly on screen. |
| Venue WiFi fails mid-talk | Independent of code. | Phone hotspot as primary. Record a clean rehearsal as the absolute fallback. |
| Spanish content quality from Gemini augmentation | Independent of code; depends on human review. | Hand-review every dish description and recipe during the Day 3 ingestion pass. |
| AI SDK type hint for `gemini-embedding-2` is stale | The literal union in `@ai-sdk/google@3.0.80` still says `'gemini-embedding-2-preview'`. | The union accepts arbitrary strings (`| (string & {})`) and the SDK passes the id through verbatim. We pass `'gemini-embedding-2'`; the model is GA in the Gemini API. Watch for SDK updates that may add the literal. |

Stack-level risks (Firestore availability, SDK compatibility, deploy infrastructure) are mitigated by mirroring Centinel's production versions exactly. If it works in Centinel's invoice pipeline, it works here.

## Explicit non-goals

* No authentication, no users, no Firebase Auth.
* No multi-language UI. Spanish content; Spanish labels where natural.
* No mobile or responsive layout. Laptop-only at the projector resolution.
* No automated tests. Rehearsals are the test.
* No CI / CD. `pnpm dev` is the entire runtime.
* No analytics, no telemetry, no error reporting.
* No backwards compatibility, no feature flags, no admin panel, no settings page.
* No Vercel deploy in v1 (can be added in 30 minutes after the talk if you want to share).

## Open placeholders

* **`presenter-bio`**: name, role, your relationship to AI and RAG, why this matters to you personally. Used in Scene 0.
* **`music-clips`**: confirm whether you have Creative Commons sources you prefer, or whether the ingestion script should pull from Freemusicarchive / a curated folkloric set.
* **`projection-resolution`**: confirm the venue projector resolution and aspect ratio (default assumed 1920×1080 16:9).

## Success criteria

* The presentation runs end-to-end on your laptop in 30 to 45 minutes.
* Every scene transitions cleanly via `←` and `→`.
* Every demo scene (3, 4, 5, 6, 7) returns a sensible result for a query you choose during rehearsal.
* The code panels in each scene show the actual code that just ran, not a sanitized mock.
* The audience leaves with a clear mental model of what an embedding is, what RAG is, and what multimodal RAG unlocks.
* You feel confident on stage that nothing surprising will happen.

