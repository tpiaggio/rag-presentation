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

A conference talk, **"Más allá del texto: RAG Multimodal con Gemini y Firestore"** (*Beyond Text: Multimodal RAG with Gemini and Firestore*), given at multiple events in Spanish, English, and Italian. The slide deck is the app: every "slide" is a real, interactive React component that talks to live Gemini and Firestore. The audience sees the actual model identifiers, the actual embeddings, the actual cosine scores. No screenshots, no smoke and mirrors.

The anchor domain is Peruvian gastronomy because it is vivid and works across every demo: text descriptions for semantic search, dish photos for image embedding, song clips for audio.

## The talk, in twelve scenes

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
| 8 | Pregúntale a la comida | The full RAG loop: the question is embedded with `gemini-embedding-2`, the top 4 dishes are retrieved as context, then `gemini-3.5-flash` streams an answer grounded only in those dishes |
| 9 | El mismo patrón, otro mundo | Music closer: mood-based search and live MediaRecorder capture against a small Peruvian music collection (huayno, marinera, criolla, chicha, yaraví, festejo) |
| 10 | Lo que pasa por debajo | The actual stack, costs, model identifiers, and the minimal diff to add multimodal to a text-only Firebase app |
| 11 | Gracias | Closing slide that mirrors the opening animation |

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

No `@google/genai`, no Pinecone, no custom embedding API. The "multimodal upgrade" from a text-only Firebase app is exactly two lines of code: a new model identifier, and a new provider option. The whole point of scene 10 is showing that diff.

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
ACCESS_PASSCODE=                # optional, see below
```

`ACCESS_PASSCODE` gates the whole app behind `/unlock`. Leave it empty locally to skip the gate. In production on Firebase App Hosting it is a Secret Manager secret referenced from `apphosting.yaml`; change it with:

```bash
firebase apphosting:secrets:set ACCESS_PASSCODE
```

Never put the passcode in `firebase.json`, `apphosting.yaml`, or any other committed file: the repo is public.

The service-account JSON should live **outside** this repo. Anywhere under `~/.config/` is fine. The `.gitignore` blocks the common filenames as defense in depth, but the right move is to keep credentials off the source tree.

### Install and run

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3030`. Use `←` and `→` to advance. `Cmd+.` toggles presenter notes. `Esc` closes overlays. The URL hash tracks the active scene so refreshing keeps you in place.

Before each event, set the event name shown on the opening slide, closing slide, and unlock page in `lib/event.ts`.

## Languages

The deck runs in Spanish (default), English, and Italian. Pick the language before the talk with a URL parameter, or switch any time with the ES / EN / IT selector in the top-right corner:

```
http://localhost:3030/?lang=it#apertura
```

The choice is stored in a cookie, so later visits remember it; a `?lang=` parameter always wins over the cookie.

- **UI text** lives in `lib/i18n.ts`, one dictionary per language. Components read it through `useLanguage()` from `lib/useLanguage.tsx` and call `t('key')`. To add a string, add the same key to all three dictionaries; a missing key renders as the raw key, which makes gaps easy to spot in rehearsal.
- **Generated answers** in scene 8 follow the selected language: the client sends `lang` to `/api/ask/answer` and the prompt asks Gemini to answer in it.
- **Dish and song data** in Firestore stays in Spanish on purpose. Dish names are proper nouns, and the embedding models are multilingual, so an Italian or English query still retrieves the right Spanish documents.
- **Presenter notes** (`Cmd+.`) are Spanish only.

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
  getUserMedia (scene 6), MediaRecorder (scene 9)
       │
       ▼
Next.js Route Handlers (server only, hold the API keys)
  POST /api/embed/text         gemini-embedding-001, 768d
  POST /api/embed/multimodal   gemini-embedding-2, 1536d
  POST /api/search             findNearest on embedding_text
  POST /api/search-mm          findNearest on embedding_mm (dishes or songs)
  POST /api/index              PDF text extract + embed + Firestore write
  POST /api/ask                RAG step 1: embed question, retrieve top-k dishes
  POST /api/ask/answer         RAG step 2: stream a grounded answer in the chosen language
  POST /api/songs/analyze      Gemini fills in metadata for an uploaded song clip
  POST /api/songs/upload       store and embed a new song
  POST /api/unlock             check the passcode, set the access cookie
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
│   │   ├── ask/route.ts             RAG retrieval
│   │   ├── ask/answer/route.ts      RAG generation (streamed)
│   │   ├── songs/                   song analyze + upload
│   │   ├── unlock/route.ts          passcode check
│   │   ├── dishes/route.ts          GET all dishes (for PCA)
│   │   ├── embed/
│   │   │   ├── text/route.ts        gemini-embedding-001 wrapper
│   │   │   └── multimodal/route.ts  gemini-embedding-2 wrapper
│   │   ├── index/route.ts           PDF to Firestore in one shot
│   │   ├── search/route.ts          keyword + semantic split on text
│   │   └── search-mm/route.ts       findNearest on embedding_mm
│   ├── globals.css                  design tokens via @theme
│   ├── layout.tsx                   wraps everything in LanguageProvider
│   ├── page.tsx                     mounts the scene runner
│   └── unlock/page.tsx              passcode screen
├── components/                      shared UI (DishCard, LanguageSelector, EmbeddingViz, CodePanel, ...)
├── scenes/                          one file per scene (Apertura, Embeddings, Como, ...)
├── lib/
│   ├── gemini.ts                    AI SDK wrapper, both models
│   ├── firebase-admin.ts            Admin SDK singleton
│   ├── i18n.ts                      ES / EN / IT dictionaries, URL + cookie helpers
│   ├── useLanguage.tsx              LanguageProvider and useLanguage() hook
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

This is exploratory code for a talk, not a product. Specifically:

- No user accounts or roles; the only access control is the shared passcode gate.
- No automated tests. Verification is the rehearsal.
- No mobile or responsive layout. Designed for a single laptop at projector resolution.
- No analytics, no telemetry, no error reporting.
- `gemini-embedding-2` is GA in the Gemini API but the AI SDK's TypeScript literal still says `'gemini-embedding-2-preview'`. The union accepts arbitrary strings; we pass `'gemini-embedding-2'` and it works.

## Credits

- Dish content sourced from [Wikipedia en español](https://es.wikipedia.org), Creative Commons.
- Dish images attributed via `source_url` on each Firestore document.
- Augmented descriptions and recipes generated by `gemini-2.5-flash`. Spot-checked but not edited line by line.
- Built collaboratively with [Claude Code](https://claude.com/claude-code) through brainstorming, design, and subagent-driven execution.

## License

No license. This is a personal exploration, not intended for redistribution. If you want to adapt the pattern for your own talk, fork and rip out the Peruvian content; the structure is the only thing worth keeping.
