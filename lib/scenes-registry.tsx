import dynamic from 'next/dynamic'
import type { SceneDefinition } from './scenes'

const Apertura = dynamic(() => import('@/scenes/Apertura'), { ssr: false })
const QuienSoy = dynamic(() => import('@/scenes/QuienSoy'), { ssr: false })
const Embeddings = dynamic(() => import('@/scenes/Embeddings'), { ssr: false })
const Como = dynamic(() => import('@/scenes/Como'), { ssr: false })
const Busqueda = dynamic(() => import('@/scenes/Busqueda'), { ssr: false })
const Vivo = dynamic(() => import('@/scenes/Vivo'), { ssr: false })
const Reconoce = dynamic(() => import('@/scenes/Reconoce'), { ssr: false })
const Cocinar = dynamic(() => import('@/scenes/Cocinar'), { ssr: false })
const Patron = dynamic(() => import('@/scenes/Patron'), { ssr: false })
const Debajo = dynamic(() => import('@/scenes/Debajo'), { ssr: false })
const Gracias = dynamic(() => import('@/scenes/Gracias'), { ssr: false })

export const SCENES: SceneDefinition[] = [
  { id: 'apertura',     index: 0, title: 'Apertura',
    notes: 'Apagá el celular un minuto. Empezar con una pregunta para enganchar.',
    Component: Apertura },
  { id: 'quien-soy',    index: 1, title: 'Quién soy',
    notes: 'GDE Firebase. Bio breve, por qué te importa el tema.',
    Component: QuienSoy },
  { id: 'embeddings',   index: 2, title: '¿Qué son los embeddings?',
    notes: 'Llevar la analogía del "número que representa significado".',
    Component: Embeddings },
  { id: 'como',         index: 3, title: '¿Cómo funcionan?',
    notes: 'Cluster visual + nombrar usos: Spotify, Google, e-commerce.',
    Component: Como },
  { id: 'busqueda',     index: 4, title: 'El problema con la búsqueda',
    notes: 'Primero "ceviche" (ambos hits), después "comida reconfortante".',
    Component: Busqueda },
  { id: 'vivo',         index: 5, title: 'Embedding en vivo',
    notes: 'Subir el PDF preparado. Dejar que la animación corra.',
    Component: Vivo },
  { id: 'reconoce',     index: 6, title: 'Reconoce la comida que ves',
    notes: 'Tener un dish photo listo en el celular.',
    Component: Reconoce },
  { id: 'cocinar',      index: 7, title: '¿Qué puedo cocinar?',
    notes: 'Pedirle a la audiencia que sume 1 ingrediente.',
    Component: Cocinar },
  { id: 'patron',       index: 8, title: 'El mismo patrón, otro mundo',
    notes: 'Si te animás, tocar el instrumento al final.',
    Component: Patron },
  { id: 'debajo',       index: 9, title: 'Lo que pasa por debajo',
    notes: 'Cerrar con la analogía del 1 SDK + 1 modelo nuevo.',
    Component: Debajo },
  { id: 'gracias',      index: 10, title: 'Gracias',
    notes: 'Dejá que la imagen se anime. No leas la slide; mirá a la gente. Esperá los aplausos. Después abrí Q&A.',
    Component: Gracias },
]
