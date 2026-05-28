<div align="center">

# RAG · Embeddings · Multimodal

Una exploración con comida peruana

A live, keyboard-driven presentation that walks through vector embeddings, retrieval-augmented generation, and multimodal RAG, anchored in 36 Peruvian dishes pulled from Wikipedia and enriched with Gemini.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-149eca?style=flat-square)](https://react.dev)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-6.0-c8553d?style=flat-square)](https://ai-sdk.dev)
[![Gemini](https://img.shields.io/badge/Gemini-embedding--001%20%2B%20embedding--2-7a8f3a?style=flat-square)](https://ai.google.dev/gemini-api/docs/embeddings)
[![Firestore](https://img.shields.io/badge/Firestore-vectorField-e8b04a?style=flat-square)](https://firebase.google.com/docs/firestore/vector-search)

</div>

---

## What this is

Built for **Build with AI · OPEN 2026**, a Google Developer Group event in Lima (30 May 2026, UPC San Isidro). The talk is **"Más allá del texto: RAG Multimodal con Gemini y Firestore"**. The slide deck is the app: every "slide" is a real, interactive React component that talks to live Gemini and Firestore. The audience sees the actual model identifiers, the actual embeddings, the actual cosine scores. No screenshots, no smoke and mirrors.

The anchor domain is Peruvian gastronomy because it is universally recognizable to the audience and works across every demo: text descriptions for semantic search, dish photos for image embedding, song clips for audio.

## The talk, in ten scenes

| # | Scene | What happens |
|---|---|---|
| 0 | Apertura | Animated WOW intro with character-morph reveal of the title, drifting embedding numbers, mouse parallax |
| 1 | Quién soy | Presenter bio: Google Developer Expert for Firebase |
| 2 | ¿Qué son los embeddings? | Type any word, watch it become 768 numbers via `gemini-embedding-001` |
| 3 | ¿Cómo funcionan? | Project 36 dishes into 2D via PCA, hover to inspect clusters |
| 4 | El problema con la búsqueda | Side by side: keyword search returns nothing for "comida reconfortante en día lluvioso", semantic returns ají de gallina, caldo, chupe |
| 5 | Embedding en vivo | Drag a recipe PDF onto the stage, watch chunking, embedding, and Firestore write animate in real time |
| 6 | Reconoce la comida que ves | Webcam capture, sent to `gemini-embedding-2` as `inlineData`, top dish matches returned with full recipes |
| 7 | ¿Qué puedo cocinar? | Pick ingredients from a grid, query as natural-language Spanish, get ranked dishes |
| 8 | El mismo patrón, otro mundo | Music closer: mood-based search and live MediaRecorder capture against a small Peruvian music collection (huayno, marinera, criolla, chicha, yaraví, festejo) |
| 9 | Lo que pasa por debajo | The actual stack, costs, model identifiers, and the minimal diff to add multimodal to a text-only Firebase app |

Total runtime: about 35 to 40 minutes.

## Stack

Vercel AI SDK on top of Gemini, Firestore for the vector store. Architecture stays 100% inside Firebase.

| Layer | Choice |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript strict |
| Styling | Tailwind v4, design tokens via `@theme` |
| Animation | Framer Motion |
| AI SDK | Vercel AI SDK (`ai@6.x`, `@ai-sdk/google@3.x`) |
| Text embeddings | `gemini-embedding-001`, 768 dim |
| Multimodal embeddings | `gemini-embedding-2`, 1536 dim, text plus image plus audio plus PDF, shared vector space |
| Vector store | Firestore `vectorField` and `findNearest` (cosine) |
| PDF text extraction | `unpdf` |

No `@google/genai`, no Pinecone, no custom embedding API. The "multimodal upgrade" from a text-only Firebase app is exactly two lines of code: a new model identifier, and a new provider option. The whole point of Scene 9 is showing that diff.

## Setup

### Prerequisites

- Node 20 or newer (Node 24 works)
- pnpm 10
- A Firebase project with Firestore (Native mode) and Cloud Storage enabled
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey) on a billing-enabled GCP project (free tier covers this app's volume; billing must be flagged on for `gemini-embedding-2`)

### Environment

```bash
cp .env.local.example .env.local
```

Then fill in:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
FIREBASE_ADMIN_SA_PATH=/Users/you/.config/your-project/sa.json
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
```

The service-account JSON should live **outside** this repo. Anywhere under `~/.config/` is fine. The `.gitignore` blocks the common filenames as defense in depth, but the right move is to keep credentials off the source tree.

### Install and run

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3030`. Use `←` and `→` to advance. `Cmd+.` toggles presenter notes. `Esc` closes overlays. The URL hash tracks the active scene so refreshing keeps you in place.

## Data ingestion

Two one-shot scripts. Run each once before the talk.

### Dishes

```bash
pnpm ingest:dishes
```

For each entry in `data/dishes.json` (about 50 hand-curated Peruvian dishes):

1. Fetches the page summary from the Spanish Wikipedia REST API.
2. Downloads the article's featured image, uploads it to Firebase Storage.
3. Asks `gemini-2.5-flash` for a richer description, recipe text, ingredients, and mood tags.
4. Generates two embeddings: text-only into `embedding_text` (768 dim) and multimodal (text plus image bundled) into `embedding_mm` (1536 dim).
5. Writes the document to Firestore at `presentation_dishes/{slug}`.

Wikipedia coverage is uneven. Around 30 percent of the curated slugs either 404 or have no usable image, and the script logs failures and continues. A successful run produces 30 to 40 dishes, which is more than enough for the talk.

### Music

```bash
pnpm ingest:music
```

Same flow for `data/songs.json`, with audio clips at `data/audio/*.mp3` (intentionally not checked in, source your own Creative Commons clips). Each song is embedded into `presentation_songs/{id}` with `embedding_mm`.

### Firestore vector indexes

Each `vectorField` needs a composite index per collection per field. Either let the first `findNearest` query fail and click the URL in the error response, or create them upfront:

```bash
gcloud firestore indexes composite create \
  --project=YOUR_PROJECT_ID \
  --collection-group=presentation_dishes \
  --query-scope=COLLECTION \
  --field-config=vector-config='{"dimension":768,"flat":{}}',field-path=embedding_text

gcloud firestore indexes composite create \
  --project=YOUR_PROJECT_ID \
  --collection-group=presentation_dishes \
  --query-scope=COLLECTION \
  --field-config=vector-config='{"dimension":1536,"flat":{}}',field-path=embedding_mm

gcloud firestore indexes composite create \
  --project=YOUR_PROJECT_ID \
  --collection-group=presentation_songs \
  --query-scope=COLLECTION \
  --field-config=vector-config='{"dimension":1536,"flat":{}}',field-path=embedding_mm
```

Indexes take 30 seconds to a few minutes to come `READY`.

## Architecture

```
Browser
  Scene runner with keyboard nav and hash routing
  Framer Motion transitions, code panels, embedding visualizations
  getUserMedia (Scene 5), MediaRecorder (Scene 7)
       │
       ▼
Next.js Route Handlers (server only, hold the API keys)
  POST /api/embed/text         gemini-embedding-001, 768d
  POST /api/embed/multimodal   gemini-embedding-2, 1536d
  POST /api/search             findNearest on embedding_text
  POST /api/search-mm          findNearest on embedding_mm (dishes or songs)
  POST /api/index              PDF text extract + embed + Firestore write
  GET  /api/dishes             dishes list for the PCA viz
       │
       ▼
External
  Gemini API (Vercel AI SDK only)
  Firestore (vectorField + findNearest)
  Cloud Storage (dish photos, song audio)
```

The full design document is at `docs/superpowers/specs/2026-05-28-rag-presentation-design.md`. The task-by-task implementation plan is at `docs/superpowers/plans/2026-05-28-rag-presentation.md`. Both lived through brainstorming before any code was written.

## Project layout

```
.
├── app/
│   ├── api/
│   │   ├── dishes/route.ts          GET all dishes (for PCA)
│   │   ├── embed/
│   │   │   ├── text/route.ts        gemini-embedding-001 wrapper
│   │   │   └── multimodal/route.ts  gemini-embedding-2 wrapper
│   │   ├── index/route.ts           PDF to Firestore in one shot
│   │   ├── search/route.ts          keyword + semantic split on text
│   │   └── search-mm/route.ts       findNearest on embedding_mm
│   ├── globals.css                  design tokens via @theme
│   ├── layout.tsx
│   └── page.tsx                     mounts the scene runner
├── components/                      shared UI (DishCard, LoadingDot, EmbeddingViz, CodePanel, ...)
├── scenes/                          one file per scene (Apertura, Embeddings, Como, ...)
├── lib/
│   ├── gemini.ts                    AI SDK wrapper, both models
│   ├── firebase-admin.ts            Admin SDK singleton
│   ├── search.ts                    findNearest helpers
│   ├── pca.ts                       power-iteration PCA for the 2D viz
│   ├── scenes.ts                    scene types
│   ├── scenes-registry.tsx          the deck definition
│   └── types.ts                     Dish, Song, SearchHit
├── scripts/
│   ├── ingest-dishes.ts
│   ├── ingest-music.ts
│   ├── lib/wikipedia.ts
│   └── lib/augment.ts
├── data/
│   ├── dishes.json                  50 curated Wikipedia slugs
│   ├── ingredients.json             32 cooking ingredients with emojis
│   ├── songs.json                   12 song metadata placeholders
│   └── audio/                       drop CC-licensed mp3s here (gitignored)
└── docs/superpowers/
    ├── specs/2026-05-28-rag-presentation-design.md
    └── plans/2026-05-28-rag-presentation.md
```

## Status

This is exploratory code for a one-time talk, not a product. Specifically:

- No authentication, no users, no role checks.
- No automated tests. Verification is the rehearsal.
- No mobile or responsive layout. Designed for a single laptop at projector resolution.
- No analytics, no telemetry, no error reporting.
- Spanish copy everywhere. The few UI affordances are also Spanish.
- `gemini-embedding-2` is GA in the Gemini API but the AI SDK's TypeScript literal still says `'gemini-embedding-2-preview'`. The union accepts arbitrary strings; we pass `'gemini-embedding-2'` and it works.

## Credits

- Dish content sourced from [Wikipedia en español](https://es.wikipedia.org), Creative Commons.
- Dish images attributed via `source_url` on each Firestore document.
- Augmented descriptions and recipes generated by `gemini-2.5-flash`. Spot-checked but not edited line by line.
- Built collaboratively with [Claude Code](https://claude.com/claude-code) through brainstorming, design, and subagent-driven execution.

## License

No license. This is a personal exploration, presented at one venue, not intended for redistribution. If you want to adapt the pattern for your own talk, fork and rip out the Peruvian content; the structure is the only thing worth keeping.
