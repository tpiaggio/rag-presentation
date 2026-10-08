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

    // Unlock page
    'unlock.title': 'Más allá del texto',
    'unlock.subtitle': 'RAG Multimodal con Gemini y Firestore',
    'unlock.placeholder': 'Código de acceso',
    'unlock.button': 'Entrar',
    'unlock.submitting': 'Verificando…',
    'unlock.error': 'Código no válido',
    'unlock.footer': '¿No tenés un código pero te interesa explorar la demo?',
    'unlock.footer-cta': 'Escribime por LinkedIn',
    'unlock.footer-end': 'y te lo paso.',

    // Apertura scene
    'apertura.title': 'Más allá del texto',
    'apertura.subtitle': 'RAG Multimodal con Gemini y Firestore',
    'apertura.description': 'Una exploración con comida peruana',
    'apertura.press': 'presioná',
    'apertura.start': 'para empezar',

    // QuienSoy scene
    'quien-soy.label': 'Quién soy',
    'quien-soy.bio': 'Trabajo con vector search y modelos de IA todos los días. Hoy les muestro lo que aprendí, usando algo que todos conocemos.',

    // Embeddings scene
    'embeddings.sceneLabel': 'Escena 02',
    'embeddings.question': '¿Cómo le explico el sabor del ceviche a una máquina? Con números.',
    'embeddings.button': 'Embebir',
    'embeddings.dim': 'dim',
    'embeddings.more': '+{count} más',
    'embeddings.codeTitle': 'El código que está corriendo',

    // Como scene
    'como.description': 'Cada plato es un punto. Los parecidos se agrupan.',
    'como.where': 'Donde ya las usás',
    'como.use1': 'recomendaciones de canciones por gusto',
    'como.use2': 'búsqueda semántica',
    'como.use3': 'memoria de conversaciones largas',
    'como.use4': 'productos similares y recomendaciones',

    // Busqueda scene
    'busqueda.placeholder': 'comida reconfortante en día lluvioso…',
    'busqueda.button': 'Buscar',
    'busqueda.sugerencia1': 'ceviche',
    'busqueda.sugerencia2': 'comida reconfortante en día lluvioso',
    'busqueda.sugerencia3': 'algo dulce y cremoso',
    'busqueda.sugerencia4': 'plato típico de la sierra',

    // Vivo scene
    'vivo.instruction': 'Arrastrá un PDF de receta sobre el panel. Lo dividimos, lo embebemos y lo guardamos en Firestore acá mismo.',

    // Reconoce scene
    'reconoce.button': '↻ otra foto',
    'reconoce.results': 'Resultados',

    // Cocinar scene
    'cocinar.instruction': 'Elegí ingredientes (la audiencia también puede sumar pidiendo en voz alta).',
    'cocinar.button': 'Buscar platos',
    'cocinar.clear': 'limpiar',
    'cocinar.query': 'Quiero cocinar algo con: {ingredients}. ¿Qué platos peruanos puedo hacer?',

    // Pregunta scene
    'pregunta.sugerencia1': '¿Qué me conviene comer si estoy resfriado?',
    'pregunta.sugerencia2': 'Quiero algo picante con mariscos, ¿qué pido?',
    'pregunta.sugerencia3': 'Un postre cremoso para una celebración',
    'pregunta.sugerencia4': '¿Qué plato abriga en un día frío de sierra?',
    'pregunta.step1': 'Pregunta',
    'pregunta.step2': 'Vector 1536-d',
    'pregunta.step3': 'Contexto · k=4',
    'pregunta.step4': 'Gemini 3.5 Flash',
    'pregunta.step5': 'Respuesta',
    'pregunta.process': 'Recuperación + generación = RAG. La respuesta sale',
    'pregunta.error': 'No encontré platos para esa pregunta. Probá con otra.',

    // Patron scene
    'patron.mood1': 'paisajes andinos con zampoñas, instrumental y nostálgico',
    'patron.mood2': 'fiesta del pueblo con interacción de guitarra y charango',
    'patron.mood3': 'tristeza por un amor que se fue',
    'patron.placeholderTitle': 'Título *',
    'patron.placeholderRegion': 'Región (opcional) — Cuzco, Lima, Arequipa…',
    'patron.placeholderDescription': 'Descripción corta (opcional) — instrumentos, sentimiento, contexto',
    'patron.placeholderMood': 'Mood tags separados por coma (opcional) — triste, festivo, andino',
    'patron.dragDrop': 'Arrastrá un mp3 acá',
    'patron.or': 'o hacé click',

    // Debajo scene
    'debajo.stack': 'El stack',
    'debajo.costs': 'Costos',
    'debajo.codeTitle': 'El diff completo para sumar multimodal a un stack de Firebase',

    // Gracias scene
    'gracias.message': 'Lo que viene a continuación lo construyen ustedes.',
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

    // Unlock page
    'unlock.title': 'Beyond Text',
    'unlock.subtitle': 'Multimodal RAG with Gemini and Firestore',
    'unlock.placeholder': 'Access code',
    'unlock.button': 'Enter',
    'unlock.submitting': 'Verifying…',
    'unlock.error': 'Invalid code',
    'unlock.footer': 'Don\'t have a code but want to explore the demo?',
    'unlock.footer-cta': 'Message me on LinkedIn',
    'unlock.footer-end': 'and I\'ll send it to you.',

    // Apertura scene
    'apertura.title': 'Beyond Text',
    'apertura.subtitle': 'Multimodal RAG with Gemini and Firestore',
    'apertura.description': 'An exploration with Peruvian food',
    'apertura.press': 'press',
    'apertura.start': 'to begin',

    // QuienSoy scene
    'quien-soy.label': 'Who I Am',
    'quien-soy.bio': 'I work with vector search and AI models every day. Today I show you what I\'ve learned, using something we all know.',

    // Embeddings scene
    'embeddings.sceneLabel': 'Scene 02',
    'embeddings.question': 'How do I explain the flavor of ceviche to a machine? With numbers.',
    'embeddings.button': 'Embed',
    'embeddings.dim': 'dim',
    'embeddings.more': '+{count} more',
    'embeddings.codeTitle': 'The code that\'s running',

    // Como scene
    'como.description': 'Each dish is a point. Similar ones cluster together.',
    'como.where': 'Where you already use them',
    'como.use1': 'music recommendations by taste',
    'como.use2': 'semantic search',
    'como.use3': 'memory for long conversations',
    'como.use4': 'similar products and recommendations',

    // Busqueda scene
    'busqueda.placeholder': 'comfort food on a rainy day…',
    'busqueda.button': 'Search',
    'busqueda.sugerencia1': 'ceviche',
    'busqueda.sugerencia2': 'comfort food on a rainy day',
    'busqueda.sugerencia3': 'something sweet and creamy',
    'busqueda.sugerencia4': 'typical mountain dish',

    // Vivo scene
    'vivo.instruction': 'Drag a recipe PDF onto the panel. We chunk it, embed it, and save it to Firestore right here.',

    // Reconoce scene
    'reconoce.button': '↻ another photo',
    'reconoce.results': 'Results',

    // Cocinar scene
    'cocinar.instruction': 'Pick ingredients (the audience can also add by calling out).',
    'cocinar.button': 'Search dishes',
    'cocinar.clear': 'clear',
    'cocinar.query': 'I want to cook something with: {ingredients}. What Peruvian dishes can I make?',

    // Pregunta scene
    'pregunta.sugerencia1': 'What should I eat if I have a cold?',
    'pregunta.sugerencia2': 'I want something spicy with seafood, what do I order?',
    'pregunta.sugerencia3': 'A creamy dessert for a celebration',
    'pregunta.sugerencia4': 'What dish warms you up on a cold mountain day?',
    'pregunta.step1': 'Question',
    'pregunta.step2': 'Vector 1536-d',
    'pregunta.step3': 'Context · k=4',
    'pregunta.step4': 'Gemini 3.5 Flash',
    'pregunta.step5': 'Answer',
    'pregunta.process': 'Retrieval + generation = RAG. The answer comes',
    'pregunta.error': 'I didn\'t find dishes for that question. Try another.',

    // Patron scene
    'patron.mood1': 'Andean landscapes with pan flutes, instrumental and nostalgic',
    'patron.mood2': 'village party with guitar and charango interaction',
    'patron.mood3': 'heartbreak sadness',
    'patron.placeholderTitle': 'Title *',
    'patron.placeholderRegion': 'Region (optional) — Cusco, Lima, Arequipa…',
    'patron.placeholderDescription': 'Short description (optional) — instruments, feeling, context',
    'patron.placeholderMood': 'Mood tags separated by comma (optional) — sad, festive, Andean',
    'patron.dragDrop': 'Drag an mp3 here',
    'patron.or': 'or click',

    // Debajo scene
    'debajo.stack': 'The stack',
    'debajo.costs': 'Costs',
    'debajo.codeTitle': 'The complete diff to add multimodal to a Firebase stack',

    // Gracias scene
    'gracias.message': 'What comes next is built by you.',
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

    // Unlock page
    'unlock.title': 'Oltre il Testo',
    'unlock.subtitle': 'RAG Multimodale con Gemini e Firestore',
    'unlock.placeholder': 'Codice di accesso',
    'unlock.button': 'Entra',
    'unlock.submitting': 'Verifica in corso…',
    'unlock.error': 'Codice non valido',
    'unlock.footer': 'Non hai un codice ma sei interessato a provare la demo?',
    'unlock.footer-cta': 'Scrivimi su LinkedIn',
    'unlock.footer-end': 'e te lo invio.',

    // Apertura scene
    'apertura.title': 'Oltre il Testo',
    'apertura.subtitle': 'RAG Multimodale con Gemini e Firestore',
    'apertura.description': 'Un\'esplorazione con cibo peruviano',
    'apertura.press': 'premi',
    'apertura.start': 'per iniziare',

    // QuienSoy scene
    'quien-soy.label': 'Chi Sono',
    'quien-soy.bio': 'Lavoro con vector search e modelli di IA ogni giorno. Oggi ti mostro quello che ho imparato, usando qualcosa che tutti conosciamo.',

    // Embeddings scene
    'embeddings.sceneLabel': 'Scena 02',
    'embeddings.question': 'Come spiego il sapore del ceviche a una macchina? Con i numeri.',
    'embeddings.button': 'Incorpora',
    'embeddings.dim': 'dim',
    'embeddings.more': '+{count} più',
    'embeddings.codeTitle': 'Il codice in esecuzione',

    // Como scene
    'como.description': 'Ogni piatto è un punto. Quelli simili si raggruppano insieme.',
    'como.where': 'Dove li usi già',
    'como.use1': 'consigli musicali per gusto',
    'como.use2': 'ricerca semantica',
    'como.use3': 'memoria per conversazioni lunghe',
    'como.use4': 'prodotti simili e consigli',

    // Busqueda scene
    'busqueda.placeholder': 'cibo confortante in un giorno di pioggia…',
    'busqueda.button': 'Cerca',
    'busqueda.sugerencia1': 'ceviche',
    'busqueda.sugerencia2': 'cibo confortante in un giorno di pioggia',
    'busqueda.sugerencia3': 'qualcosa di dolce e cremoso',
    'busqueda.sugerencia4': 'piatto tipico della montagna',

    // Vivo scene
    'vivo.instruction': 'Trascina un PDF di ricetta sul pannello. Lo dividiamo, lo incorporiamo e lo salviamo su Firestore qui.',

    // Reconoce scene
    'reconoce.button': '↻ un\'altra foto',
    'reconoce.results': 'Risultati',

    // Cocinar scene
    'cocinar.instruction': 'Scegli ingredienti (il pubblico può anche aggiungerne gridando).',
    'cocinar.button': 'Cerca piatti',
    'cocinar.clear': 'ripulisci',
    'cocinar.query': 'Voglio cucinare qualcosa con: {ingredients}. Quali piatti peruviani posso fare?',

    // Pregunta scene
    'pregunta.sugerencia1': 'Cosa dovrei mangiare se ho il raffreddore?',
    'pregunta.sugerencia2': 'Voglio qualcosa di piccante con frutti di mare, cosa ordino?',
    'pregunta.sugerencia3': 'Un dolce cremoso per una celebrazione',
    'pregunta.sugerencia4': 'Quale piatto ti riscalda in una fredda giornata di montagna?',
    'pregunta.step1': 'Domanda',
    'pregunta.step2': 'Vettore 1536-d',
    'pregunta.step3': 'Contesto · k=4',
    'pregunta.step4': 'Gemini 3.5 Flash',
    'pregunta.step5': 'Risposta',
    'pregunta.process': 'Recupero + generazione = RAG. La risposta viene',
    'pregunta.error': 'Non ho trovato piatti per quella domanda. Prova un\'altra.',

    // Patron scene
    'patron.mood1': 'paesaggi andini con zampogne, strumentale e nostalgico',
    'patron.mood2': 'festa del paese con interazione di chitarra e charango',
    'patron.mood3': 'tristezza per un amore perduto',
    'patron.placeholderTitle': 'Titolo *',
    'patron.placeholderRegion': 'Regione (facoltativo) — Cusco, Lima, Arequipa…',
    'patron.placeholderDescription': 'Breve descrizione (facoltativo) — strumenti, sentimento, contesto',
    'patron.placeholderMood': 'Tag di mood separati da virgola (facoltativo) — triste, festivo, andino',
    'patron.dragDrop': 'Trascina un mp3 qui',
    'patron.or': 'o fai click',

    // Debajo scene
    'debajo.stack': 'Lo stack',
    'debajo.costs': 'Costi',
    'debajo.codeTitle': 'Il diff completo per aggiungere multimodale a uno stack Firebase',

    // Gracias scene
    'gracias.message': 'Quello che viene dopo lo costruisci tu.',
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
