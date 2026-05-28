import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

type Recipe = {
  slug: string
  name_es: string
  description: string
  ingredients: string[]
  steps: string[]
}

const RECIPES: Recipe[] = [
  {
    slug: 'conchitas-a-la-parmesana',
    name_es: 'Conchitas a la Parmesana',
    description:
      'Conchas de abanico horneadas con queso parmesano, mantequilla y un toque de limón. Plato tradicional del litoral peruano, ideal como entrada.',
    ingredients: [
      '12 conchas de abanico frescas con su caparazón',
      '80 g de queso parmesano rallado',
      '50 g de mantequilla a temperatura ambiente',
      '2 limones (jugo)',
      '2 dientes de ajo finamente picados',
      '1 ramita de perejil picado',
      'Sal y pimienta blanca al gusto',
      'Una pizca de pimentón dulce',
    ],
    steps: [
      'Precalentar el horno a 200 °C.',
      'Lavar las conchas y dejarlas sobre su caparazón seco. Verificar que no tengan arena.',
      'Mezclar la mantequilla pomada con el ajo, el jugo de limón, la sal y la pimienta.',
      'Untar una cucharadita de la mezcla sobre cada concha.',
      'Cubrir generosamente cada concha con queso parmesano rallado.',
      'Hornear de 6 a 8 minutos, hasta que el queso esté dorado y burbujeante.',
      'Espolvorear el pimentón y el perejil antes de servir.',
      'Servir inmediatamente con rodajas de limón fresco al costado.',
    ],
  },
  {
    slug: 'sancochado-limeno',
    name_es: 'Sancochado Limeño',
    description:
      'Sopa contundente del Perú colonial, hecha con res, pollo, garbanzos y verduras. Se sirve en dos tiempos: primero el caldo, después la carne con sus presas.',
    ingredients: [
      '1 kg de pecho de res en trozos grandes',
      '1/2 pollo entero cortado en presas',
      '200 g de garbanzos remojados desde la noche anterior',
      '4 papas amarillas peladas',
      '2 camotes morados pelados',
      '1 yuca grande pelada y cortada en bastones',
      '1/2 col blanca cortada en cuartos',
      '4 zanahorias',
      '2 puerros',
      '2 nabos',
      '1 choclo serrano cortado en rodajas gruesas',
      '1 ramita de hierbabuena',
      'Sal en grano',
    ],
    steps: [
      'En una olla grande con agua fría, colocar la carne de res junto con los garbanzos. Llevar a hervor y retirar la espuma.',
      'Bajar el fuego y cocinar a fuego lento por 1 hora.',
      'Agregar el pollo y la hierbabuena. Cocinar 30 minutos más.',
      'Incorporar el choclo, los puerros, los nabos y las zanahorias. Cocinar 15 minutos.',
      'Añadir la col, las papas, el camote y la yuca. Cocinar hasta que las verduras estén tiernas, aproximadamente 20 minutos.',
      'Probar y ajustar la sal.',
      'Servir el caldo solo en un primer tiempo, con culantro picado.',
      'En un segundo tiempo, llevar a la mesa una fuente con la carne, el pollo y las verduras. Acompañar con ají de huacatay, crema de rocoto y cancha serrana.',
    ],
  },
  {
    slug: 'quinotto-de-camarones',
    name_es: 'Quinotto de Camarones',
    description:
      'Versión peruana del risotto italiano, hecho con quinua andina en lugar de arroz arborio. Se termina con camarones salteados y un toque de ají amarillo.',
    ingredients: [
      '300 g de quinua blanca lavada',
      '500 g de colas de camarón limpias',
      '1 litro de caldo de mariscos caliente',
      '1 cebolla roja picada finamente',
      '3 dientes de ajo picados',
      '2 cucharadas de pasta de ají amarillo',
      '1/2 taza de vino blanco seco',
      '80 g de queso parmesano rallado',
      '60 g de mantequilla',
      '2 cucharadas de aceite de oliva',
      'Sal y pimienta',
      'Cilantro fresco para decorar',
    ],
    steps: [
      'En una sartén grande, calentar el aceite y dorar las colas de camarón por 1 minuto de cada lado. Retirar y reservar.',
      'En la misma sartén, sudar la cebolla y el ajo hasta que estén translúcidos.',
      'Agregar la pasta de ají amarillo y sofreír 2 minutos hasta que el aroma se intensifique.',
      'Incorporar la quinua lavada y mezclar bien por 1 minuto.',
      'Verter el vino blanco y dejar evaporar el alcohol.',
      'Añadir el caldo caliente de a poco, removiendo constantemente, hasta que la quinua esté cremosa pero al dente, unos 18 minutos.',
      'Retirar del fuego e incorporar la mantequilla fría y el queso parmesano. Mezclar enérgicamente para mantecar.',
      'Volver a poner los camarones sobre el quinotto para calentarlos brevemente.',
      'Servir inmediatamente, decorar con cilantro fresco picado.',
    ],
  },
]

async function buildPdf(recipe: Recipe): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  pdf.setTitle(recipe.name_es)
  pdf.setAuthor('RAG Presentation · Sample recipe')
  pdf.setSubject('Receta peruana')

  const sans = await pdf.embedFont(StandardFonts.Helvetica)
  const sansBold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const sansItalic = await pdf.embedFont(StandardFonts.HelveticaOblique)

  const margin = 56
  const pageW = 612
  const pageH = 792
  const contentW = pageW - 2 * margin

  let page = pdf.addPage([pageW, pageH])
  let cursor = pageH - margin

  const accent = rgb(0.784, 0.333, 0.239)
  const muted = rgb(0.451, 0.451, 0.451)
  const fg = rgb(0.039, 0.039, 0.039)

  function ensureSpace(needed: number) {
    if (cursor - needed < margin) {
      page = pdf.addPage([pageW, pageH])
      cursor = pageH - margin
    }
  }

  function drawLine(text: string, opts: { font: typeof sans; size: number; color?: ReturnType<typeof rgb>; gapAfter?: number }) {
    const { font, size, color = fg, gapAfter = 6 } = opts
    const wrapped = wrap(text, font, size, contentW)
    for (const line of wrapped) {
      ensureSpace(size + 4)
      page.drawText(line, { x: margin, y: cursor - size, size, font, color })
      cursor -= size + 4
    }
    cursor -= gapAfter
  }

  function wrap(text: string, font: typeof sans, size: number, maxW: number): string[] {
    const words = text.split(/\s+/)
    const lines: string[] = []
    let current = ''
    for (const w of words) {
      const candidate = current ? `${current} ${w}` : w
      if (font.widthOfTextAtSize(candidate, size) > maxW) {
        if (current) lines.push(current)
        current = w
      } else {
        current = candidate
      }
    }
    if (current) lines.push(current)
    return lines
  }

  page.drawText('RECETA PERUANA', {
    x: margin,
    y: cursor - 9,
    size: 9,
    font: sansBold,
    color: accent,
    rotate: undefined,
  })
  cursor -= 26

  drawLine(recipe.name_es, { font: sansBold, size: 26, gapAfter: 14 })
  drawLine(recipe.description, { font: sansItalic, size: 11, color: muted, gapAfter: 22 })

  drawLine('Ingredientes', { font: sansBold, size: 14, color: accent, gapAfter: 10 })
  for (const ing of recipe.ingredients) {
    drawLine(`• ${ing}`, { font: sans, size: 11, gapAfter: 2 })
  }
  cursor -= 12

  drawLine('Preparación', { font: sansBold, size: 14, color: accent, gapAfter: 10 })
  for (let i = 0; i < recipe.steps.length; i++) {
    drawLine(`${i + 1}. ${recipe.steps[i]}`, { font: sans, size: 11, gapAfter: 6 })
  }

  return pdf.save()
}

async function main() {
  const outDir = resolve(process.cwd(), 'data/sample-recipes')
  for (const recipe of RECIPES) {
    const bytes = await buildPdf(recipe)
    const outPath = resolve(outDir, `${recipe.slug}.pdf`)
    writeFileSync(outPath, bytes)
    console.log('  OK ', outPath)
  }
  console.log(`\nGenerated ${RECIPES.length} PDFs in ${outDir}`)
}

main()
