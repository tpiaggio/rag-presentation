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
const Pregunta = dynamic(() => import('@/scenes/Pregunta'), { ssr: false })
const Patron = dynamic(() => import('@/scenes/Patron'), { ssr: false })
const Debajo = dynamic(() => import('@/scenes/Debajo'), { ssr: false })
const Gracias = dynamic(() => import('@/scenes/Gracias'), { ssr: false })

export const SCENES: SceneDefinition[] = [
  { id: 'apertura',     index: 0, titleKey: 'scene.apertura',
    notes: 'Apagá el celular un minuto. Empezar con una pregunta para enganchar.',
    Component: Apertura },
  { id: 'quien-soy',    index: 1, titleKey: 'scene.quien-soy',
    notes: 'GDE Firebase. Bio breve, por qué te importa el tema.',
    Component: QuienSoy },
  { id: 'embeddings',   index: 2, titleKey: 'scene.embeddings',
    notes: 'Llevar la analogía del "número que representa significado".',
    Component: Embeddings },
  { id: 'como',         index: 3, titleKey: 'scene.como',
    notes: 'Cluster visual + nombrar usos: Spotify, Google, e-commerce.',
    Component: Como },
  { id: 'busqueda',     index: 4, titleKey: 'scene.busqueda',
    notes: 'Primero "ceviche" (ambos hits), después "comida reconfortante".',
    Component: Busqueda },
  { id: 'vivo',         index: 5, titleKey: 'scene.vivo',
    notes: 'Subir el PDF preparado. Dejar que la animación corra.',
    Component: Vivo },
  { id: 'reconoce',     index: 6, titleKey: 'scene.reconoce',
    notes: 'Tener un dish photo listo en el celular.',
    Component: Reconoce },
  { id: 'cocinar',      index: 7, titleKey: 'scene.cocinar',
    notes: 'Pedirle a la audiencia que sume 1 ingrediente.',
    Component: Cocinar },
  { id: 'pregunta',     index: 8, titleKey: 'scene.pregunta',
    notes: 'Acá se cierra el RAG: mostrar primero el contexto recuperado, después la respuesta. Recalcar que la respuesta sale SOLO de esos platos.',
    Component: Pregunta },
  { id: 'patron',       index: 9, titleKey: 'scene.patron',
    notes: 'Si te animás, tocar el instrumento al final.',
    Component: Patron },
  { id: 'debajo',       index: 10, titleKey: 'scene.debajo',
    notes: 'Cerrar con la analogía del 1 SDK + 1 modelo nuevo.',
    Component: Debajo },
  { id: 'gracias',      index: 11, titleKey: 'scene.gracias',
    notes: 'Dejá que la imagen se anime. No leas la slide; mirá a la gente. Esperá los aplausos. Después abrí Q&A.',
    Component: Gracias },
  ]
