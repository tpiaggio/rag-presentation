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
    providerOptions: {
      google: { outputDimensionality: 768 },
    },
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

// Modelo generativo para la respuesta RAG (escena "Pregúntale a la comida").
// Si este id devuelve 404 en tu proyecto, cambialo acá en un solo lugar.
export const GENERATION_MODEL = 'gemini-3.5-flash'
