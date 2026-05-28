import { generateObject } from 'ai'
import { z } from 'zod'
import { google } from '../../lib/gemini'

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
