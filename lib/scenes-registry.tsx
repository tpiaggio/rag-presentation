import SceneStub from '@/scenes/SceneStub'
import dynamic from 'next/dynamic'
import type { SceneDefinition } from './scenes'

const Busqueda = dynamic(() => import('@/scenes/Busqueda'), { ssr: false })
const Vivo = dynamic(() => import('@/scenes/Vivo'), { ssr: false })
const Reconoce = dynamic(() => import('@/scenes/Reconoce'), { ssr: false })
const Cocinar = dynamic(() => import('@/scenes/Cocinar'), { ssr: false })

function stub(id: string, title: string): React.ComponentType {
  function Stub() {
    return <SceneStub id={id} title={title} />
  }
  Stub.displayName = `Stub_${id}`
  return Stub
}

export const SCENES: SceneDefinition[] = [
  { id: 'apertura',     index: 0, title: 'Apertura y quién soy',
    notes: 'Pídeles que apaguen el celular un minuto. Empezar con una pregunta.',
    Component: stub('apertura', 'RAG · Embeddings · Multimodal') },
  { id: 'embeddings',   index: 1, title: '¿Qué son los embeddings?',
    notes: 'Llevar la analogía del "número que representa significado".',
    Component: stub('embeddings', '¿Qué son los embeddings?') },
  { id: 'como',         index: 2, title: '¿Cómo funcionan?',
    notes: 'Cluster visual + nombrar 3 usos: Spotify, Google, Centinel.',
    Component: stub('como', '¿Cómo funcionan?') },
  { id: 'busqueda',     index: 3, title: 'El problema con la búsqueda',
    notes: 'Primero "ceviche" (ambos hits), después "comida reconfortante".',
    Component: Busqueda },
  { id: 'vivo',         index: 4, title: 'Embedding en vivo',
    notes: 'Subir el PDF preparado. Dejar que la animación corra.',
    Component: Vivo },
  { id: 'reconoce',     index: 5, title: 'Reconoce la comida que ves',
    notes: 'Tener un dish photo listo en el celular.',
    Component: Reconoce },
  { id: 'cocinar',      index: 6, title: '¿Qué puedo cocinar?',
    notes: 'Pedirle a la audiencia que sume 1 ingrediente.',
    Component: Cocinar },
  { id: 'patron',       index: 7, title: 'El mismo patrón, otro mundo',
    notes: 'Si te animás, tocar el instrumento al final.',
    Component: stub('patron', 'El mismo patrón, otro mundo') },
  { id: 'debajo',       index: 8, title: 'Lo que pasa por debajo',
    notes: 'Cerrar con la analogía del 1 SDK + 1 modelo nuevo.',
    Component: stub('debajo', 'Lo que pasa por debajo') },
]
