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
