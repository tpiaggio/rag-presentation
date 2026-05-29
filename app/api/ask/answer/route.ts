import { z } from 'zod'
import { streamText } from 'ai'
import { google, GENERATION_MODEL } from '@/lib/gemini'

// Paso 2 del RAG: generación fundamentada. El cliente ya tiene los platos
// recuperados (de /api/ask), así que los manda como contexto. Gemini responde
// usando ÚNICAMENTE ese contexto y la respuesta se devuelve como text stream.
const Dish = z.object({
  name_es: z.string(),
  name_en: z.string().optional(),
  description: z.string().optional(),
  ingredients: z.array(z.string()).optional(),
  recipe: z.string().optional(),
})

const Body = z.object({
  query: z.string().min(1).max(500),
  dishes: z.array(Dish).min(1).max(8),
})

function buildContext(dishes: z.infer<typeof Dish>[]): string {
  return dishes
    .map((d, i) => {
      const lines = [`[${i + 1}] ${d.name_es}${d.name_en ? ` (${d.name_en})` : ''}`]
      if (d.description) lines.push(`Descripción: ${d.description}`)
      if (d.ingredients?.length) lines.push(`Ingredientes: ${d.ingredients.join(', ')}`)
      if (d.recipe) lines.push(`Receta: ${d.recipe}`)
      return lines.join('\n')
    })
    .join('\n\n')
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) {
    return new Response('invalid body', { status: 400 })
  }
  const { query, dishes } = parsed.data

  const result = streamText({
    model: google(GENERATION_MODEL),
    temperature: 0.4,
    system: `Sos un asistente cálido de cocina peruana. Respondé SIEMPRE en español, en tono cercano y conciso (máximo ~110 palabras).
Reglas estrictas:
- Usá ÚNICAMENTE los platos del CONTEXTO. Nunca inventes platos que no estén ahí.
- Mencioná los platos por su nombre exacto (name_es) cuando los recomiendes.
- Si ninguno encaja bien con la pregunta, decilo con honestidad en una sola frase.
- No inventes datos históricos ni nutricionales que no estén en el contexto.`,
    prompt: `CONTEXTO (platos recuperados por búsqueda vectorial multimodal):

${buildContext(dishes)}

PREGUNTA DEL USUARIO:
${query}

Respondé fundamentándote solo en el contexto.`,
  })

  return result.toTextStreamResponse()
}
