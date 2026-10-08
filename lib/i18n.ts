export type Language = 'es' | 'en' | 'it'

export const LANGUAGES: Record<Language, { name: string; nativeName: string }> = {
  es: { name: 'Spanish', nativeName: 'Español' },
  en: { name: 'English', nativeName: 'English' },
  it: { name: 'Italian', nativeName: 'Italiano' },
}

export const translations: Record<Language, Record<string, string>> = {
  es: {
    // UI
    'ui.notes': 'Notas',
    'ui.notes.aria': 'Abrir notas del presentador',
    'ui.slides': 'Diapositivas',
    'ui.language': 'Idioma',

    // Scene titles
    'scene.apertura': 'Apertura',
    'scene.quien-soy': 'Quién soy',
    'scene.embeddings': '¿Qué son los embeddings?',
    'scene.como': '¿Cómo funcionan?',
    'scene.busqueda': 'El problema con la búsqueda',
    'scene.vivo': 'Embedding en vivo',
    'scene.reconoce': 'Reconoce la comida que ves',
    'scene.cocinar': '¿Qué puedo cocinar?',
    'scene.pregunta': 'Pregúntale a la comida',
    'scene.patron': 'El mismo patrón, otro mundo',
    'scene.debajo': 'Lo que pasa por debajo',
    'scene.gracias': 'Gracias',
  },
  en: {
    // UI
    'ui.notes': 'Notes',
    'ui.notes.aria': 'Open presenter notes',
    'ui.slides': 'Slides',
    'ui.language': 'Language',

    // Scene titles
    'scene.apertura': 'Opening',
    'scene.quien-soy': 'Who I Am',
    'scene.embeddings': 'What Are Embeddings?',
    'scene.como': 'How Do They Work?',
    'scene.busqueda': 'The Search Problem',
    'scene.vivo': 'Embedding Live',
    'scene.reconoce': 'Recognize the Food You See',
    'scene.cocinar': 'What Can I Cook?',
    'scene.pregunta': 'Ask the Food',
    'scene.patron': 'The Same Pattern, Another World',
    'scene.debajo': 'What Happens Below',
    'scene.gracias': 'Thank You',
  },
  it: {
    // UI
    'ui.notes': 'Note',
    'ui.notes.aria': 'Apri le note del presentatore',
    'ui.slides': 'Diapositive',
    'ui.language': 'Lingua',

    // Scene titles
    'scene.apertura': 'Apertura',
    'scene.quien-soy': 'Chi Sono',
    'scene.embeddings': 'Cosa Sono Gli Embeddings?',
    'scene.como': 'Come Funzionano?',
    'scene.busqueda': 'Il Problema della Ricerca',
    'scene.vivo': 'Embedding dal Vivo',
    'scene.reconoce': 'Riconosci il Cibo che Vedi',
    'scene.cocinar': 'Cosa Posso Cucinare?',
    'scene.pregunta': 'Chiedi al Cibo',
    'scene.patron': 'Lo Stesso Modello, Un Altro Mondo',
    'scene.debajo': 'Cosa Succede Sotto',
    'scene.gracias': 'Grazie',
  },
}

export function t(key: string, language: Language): string {
  return translations[language][key] || key
}

export function getLanguageFromURL(): Language | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const lang = params.get('lang')
  return lang && lang in translations ? (lang as Language) : null
}

export function getLanguageFromCookie(): Language | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|; )language=([^;]*)/)
  const lang = match ? match[1] : null
  return lang && lang in translations ? (lang as Language) : null
}

export function setLanguageCookie(language: Language): void {
  if (typeof document === 'undefined') return
  document.cookie = `language=${language}; path=/; max-age=${60 * 60 * 24 * 365}`
}

export function setLanguageInURL(language: Language): void {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set('lang', language)
  window.history.pushState({}, '', url)
}
