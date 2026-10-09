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
    'como.sceneLabel': 'Escena 03',
    'como.description': 'Cada plato es un punto. Los parecidos se agrupan.',
    'como.where': 'Donde ya las usás',
    'como.use1': 'recomendaciones de canciones por gusto',
    'como.use2': 'búsqueda semántica',
    'como.use3': 'memoria de conversaciones largas',
    'como.use4': 'productos similares y recomendaciones',

    // Busqueda scene
    'busqueda.sceneLabel': 'Escena 04',
    'busqueda.keyword': 'Búsqueda por palabra clave',
    'busqueda.semantic': 'Búsqueda semántica',
    'busqueda.placeholder': 'comida reconfortante en día lluvioso…',
    'busqueda.button': 'Buscar',
    'busqueda.sugerencia1': 'ceviche',
    'busqueda.sugerencia2': 'comida reconfortante en día lluvioso',
    'busqueda.sugerencia3': 'algo dulce y cremoso',
    'busqueda.sugerencia4': 'plato típico de la sierra',

    // Vivo scene
    'vivo.sceneLabel': 'Escena 05',
    'vivo.placeholder': 'probá una búsqueda nueva…',
    'vivo.instruction': 'Arrastrá un PDF de receta sobre el panel. Lo dividimos, lo embebemos y lo guardamos en Firestore acá mismo.',

    // Reconoce scene
    'reconoce.sceneLabel': 'Escena 06',
    'reconoce.button': '↻ otra foto',
    'reconoce.results': 'Resultados',

    // Cocinar scene
    'cocinar.sceneLabel': 'Escena 07',
    'cocinar.instruction': 'Elegí ingredientes (la audiencia también puede sumar pidiendo en voz alta).',
    'cocinar.button': 'Buscar platos',
    'cocinar.clear': 'limpiar',
    'cocinar.query': 'Quiero cocinar algo con: {ingredients}. ¿Qué platos peruanos puedo hacer?',

    // Pregunta scene
    'pregunta.sceneLabel': 'Escena 08',
    'pregunta.placeholder': '¿Qué me conviene comer si estoy resfriado?',
    'pregunta.sugerencia1': '¿Qué me conviene comer si estoy resfriado?',
    'pregunta.sugerencia2': 'Quiero algo picante con mariscos, ¿qué pido?',
    'pregunta.sugerencia3': 'Un postre cremoso para una celebración',
    'pregunta.sugerencia4': '¿Qué plato abriga en un día frío de sierra?',
    'pregunta.step1': 'Pregunta',
    'pregunta.step2': 'Vector 1536-d',
    'pregunta.step3': 'Contexto · k=4',
    'pregunta.step4': 'Gemini 3.8 Flash',
    'pregunta.step5': 'Respuesta',
    'pregunta.error': 'No encontré platos para esa pregunta. Probá con otra.',

    // Patron scene
    'patron.sceneLabel': 'Escena 09',
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
    'debajo.sceneLabel': 'Escena 10',
    'debajo.stack': 'El stack',
    'debajo.costs': 'Costos',
    'debajo.codeTitle': 'El diff completo para sumar multimodal a un stack de Firebase',

    // Gracias scene
    'gracias.sceneLabel': 'Gracias',
    'gracias.message': 'Lo que viene a continuación lo construyen ustedes.',

    // Added: remaining UI text
    'ui.processing': 'Procesando…',
    'ui.orClick': 'o hacé click',
    'ui.recordLive': 'Grabar en vivo',
    'ui.clickToStop': 'Click para detener',
    'ui.error': 'Error',
    'ui.loading': 'cargando',
    'ui.notesClose': 'Cmd+. para cerrar',
    'ui.camera': 'Cámara',
    'ui.capture': 'Capturar',
    'indexing.reading': 'Leyendo el PDF',
    'indexing.chunking': 'Dividiendo en fragmentos',
    'indexing.embedding': 'Generando el embedding',
    'indexing.storing': 'Escribiendo en Firestore',
    'indexing.computing': 'calculando 1536 números…',
    'busqueda.noResults': 'sin resultados',
    'vivo.searchButton': 'Buscar',
    'vivo.dragDrop': 'Arrastrá un PDF acá',
    'reconoce.recipe': 'Receta',
    'reconoce.captureAlt': 'captura',
    'pregunta.retrieval': 'Recuperación',
    'pregunta.generation': 'generación',
    'pregunta.answerSource': 'La respuesta sale únicamente de los platos recuperados.',
    'pregunta.button': 'Preguntar',
    'pregunta.clear': 'limpiar',
    'pregunta.contextTitle': 'Contexto recuperado',
    'pregunta.emptyContext': 'Hacé una pregunta para recuperar platos.',
    'pregunta.answerTitle': 'Respuesta fundamentada',
    'pregunta.retrieving': 'Recuperando contexto…',
    'pregunta.thinking': 'Pensando…',
    'pregunta.answerPlaceholder': 'La respuesta de Gemini aparecerá acá, citando los platos recuperados.',
    'pregunta.groundedIn': 'Fundamentado en {count} platos · modelo',
    'pregunta.codeRetrieve': 'Recuperar: la pregunta se vuelve un vector multimodal',
    'pregunta.codeGenerate': 'Generar: Gemini responde fundamentado SOLO en lo recuperado',
    'pregunta.codeSystem': 'Usá únicamente los platos del contexto…',
    'patron.subtitle': 'Música peruana. La misma forma de embebido aplica.',
    'patron.modeMood': 'Buscar por mood',
    'patron.modeLive': 'Grabar en vivo (instrumento)',
    'patron.modeUpload': 'Subir canción',
    'patron.genre': 'Género *',
    'patron.uploading': 'Subiendo…',
    'patron.ready': '¡Listo!',
    'patron.waitingAnalysis': 'Esperando análisis…',
    'patron.uploadButton': 'Subir y embeber',
    'patron.saved': '¡Embebida y guardada!',
    'patron.savedTextOnly': '(audio muy largo, usamos texto solo)',
    'patron.savedAudioText': '(audio + texto)',
    'patron.tryMood': 'Probá "Buscar por mood" cuando quieras.',
    'patron.analyzing': 'Gemini está analizando el clip…',
    'patron.analyzed': 'Metadatos sugeridos por Gemini, editá si querés',
    'patron.uploadingStorage': 'Subiendo a Firebase Storage…',
    'patron.readyToUpload': 'Listo para subir',
    'patron.changeFile': 'Cambiar archivo',
    'debajo.stack.stack.label': 'Stack',
    'debajo.stack.stack.value': 'Next.js 16, React 19, TypeScript estricto, Tailwind v4, Framer Motion',
    'debajo.stack.sdk.label': 'SDK de AI',
    'debajo.stack.sdk.value': 'Vercel AI SDK (@ai-sdk/google 3.0.x sobre ai 6.x)',
    'debajo.stack.models.label': 'Modelos',
    'debajo.stack.models.value': 'gemini-embedding-001 (texto, 768d) · gemini-embedding-2 (multimodal, 1536d)',
    'debajo.stack.vectorDb.label': 'Vector DB',
    'debajo.stack.vectorDb.value': 'Firestore vectorField + findNearest, 100% en Firebase',
    'debajo.stack.new.label': 'Lo nuevo',
    'debajo.stack.new.value': 'Sólo el modelo nuevo y un providerOption nuevo. No hay SDK nuevo.',
    'debajo.cost.mm': '$0.0001 / request (orden de magnitud)',
    'debajo.cost.firestore': 'Reads normales × k',
    'debajo.cost.totalLabel': 'Total estimado por consulta',
    'debajo.cost.total': '~$0.0001 a $0.0002',
    'debajo.codeComment': 'para multimodal:',
    'gracias.headline': 'El embedding ya aprendió el sabor del ceviche.',
    'gracias.cta': 'Construyan algo · Pregúntenme · Hablemos',
    'cocinar.codeQuery': 'Quiero cocinar algo con',
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
    'como.sceneLabel': 'Scene 03',
    'como.description': 'Each dish is a point. Similar ones cluster together.',
    'como.where': 'Where you already use them',
    'como.use1': 'music recommendations by taste',
    'como.use2': 'semantic search',
    'como.use3': 'memory for long conversations',
    'como.use4': 'similar products and recommendations',

    // Busqueda scene
    'busqueda.sceneLabel': 'Scene 04',
    'busqueda.keyword': 'Keyword search',
    'busqueda.semantic': 'Semantic search',
    'busqueda.placeholder': 'comfort food on a rainy day…',
    'busqueda.button': 'Search',
    'busqueda.sugerencia1': 'ceviche',
    'busqueda.sugerencia2': 'comfort food on a rainy day',
    'busqueda.sugerencia3': 'something sweet and creamy',
    'busqueda.sugerencia4': 'typical mountain dish',

    // Vivo scene
    'vivo.sceneLabel': 'Scene 05',
    'vivo.placeholder': 'try a new search…',
    'vivo.instruction': 'Drag a recipe PDF onto the panel. We chunk it, embed it, and save it to Firestore right here.',

    // Reconoce scene
    'reconoce.sceneLabel': 'Scene 06',
    'reconoce.button': '↻ another photo',
    'reconoce.results': 'Results',

    // Cocinar scene
    'cocinar.sceneLabel': 'Scene 07',
    'cocinar.instruction': 'Pick ingredients (the audience can also add by calling out).',
    'cocinar.button': 'Search dishes',
    'cocinar.clear': 'clear',
    'cocinar.query': 'I want to cook something with: {ingredients}. What Peruvian dishes can I make?',

    // Pregunta scene
    'pregunta.sceneLabel': 'Scene 08',
    'pregunta.placeholder': 'What should I eat if I have a cold?',
    'pregunta.sugerencia1': 'What should I eat if I have a cold?',
    'pregunta.sugerencia2': 'I want something spicy with seafood, what do I order?',
    'pregunta.sugerencia3': 'A creamy dessert for a celebration',
    'pregunta.sugerencia4': 'What dish warms you up on a cold mountain day?',
    'pregunta.step1': 'Question',
    'pregunta.step2': 'Vector 1536-d',
    'pregunta.step3': 'Context · k=4',
    'pregunta.step4': 'Gemini 3.8 Flash',
    'pregunta.step5': 'Answer',
    'pregunta.error': 'I didn\'t find dishes for that question. Try another.',

    // Patron scene
    'patron.sceneLabel': 'Scene 09',
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
    'debajo.sceneLabel': 'Scene 10',
    'debajo.stack': 'The stack',
    'debajo.costs': 'Costs',
    'debajo.codeTitle': 'The complete diff to add multimodal to a Firebase stack',

    // Gracias scene
    'gracias.sceneLabel': 'Thank You',
    'gracias.message': 'What comes next is built by you.',

    // Added: remaining UI text
    'ui.processing': 'Processing…',
    'ui.orClick': 'or click',
    'ui.recordLive': 'Record live',
    'ui.clickToStop': 'Click to stop',
    'ui.error': 'Error',
    'ui.loading': 'loading',
    'ui.notesClose': 'Cmd+. to close',
    'ui.camera': 'Camera',
    'ui.capture': 'Capture',
    'indexing.reading': 'Reading the PDF',
    'indexing.chunking': 'Splitting into chunks',
    'indexing.embedding': 'Generating the embedding',
    'indexing.storing': 'Writing to Firestore',
    'indexing.computing': 'computing 1536 numbers…',
    'busqueda.noResults': 'no results',
    'vivo.searchButton': 'Search',
    'vivo.dragDrop': 'Drag a PDF here',
    'reconoce.recipe': 'Recipe',
    'reconoce.captureAlt': 'capture',
    'pregunta.retrieval': 'Retrieval',
    'pregunta.generation': 'generation',
    'pregunta.answerSource': 'The answer comes only from the retrieved dishes.',
    'pregunta.button': 'Ask',
    'pregunta.clear': 'clear',
    'pregunta.contextTitle': 'Retrieved context',
    'pregunta.emptyContext': 'Ask a question to retrieve dishes.',
    'pregunta.answerTitle': 'Grounded answer',
    'pregunta.retrieving': 'Retrieving context…',
    'pregunta.thinking': 'Thinking…',
    'pregunta.answerPlaceholder': 'Gemini\'s answer will appear here, citing the retrieved dishes.',
    'pregunta.groundedIn': 'Grounded in {count} dishes · model',
    'pregunta.codeRetrieve': 'Retrieve: the question becomes a multimodal vector',
    'pregunta.codeGenerate': 'Generate: Gemini answers grounded ONLY in what was retrieved',
    'pregunta.codeSystem': 'Use only the dishes in the context…',
    'patron.subtitle': 'Peruvian music. The same embedding approach applies.',
    'patron.modeMood': 'Search by mood',
    'patron.modeLive': 'Record live (instrument)',
    'patron.modeUpload': 'Upload song',
    'patron.genre': 'Genre *',
    'patron.uploading': 'Uploading…',
    'patron.ready': 'Done!',
    'patron.waitingAnalysis': 'Waiting for analysis…',
    'patron.uploadButton': 'Upload and embed',
    'patron.saved': 'Embedded and saved!',
    'patron.savedTextOnly': '(audio too long, used text only)',
    'patron.savedAudioText': '(audio + text)',
    'patron.tryMood': 'Try "Search by mood" whenever you like.',
    'patron.analyzing': 'Gemini is analyzing the clip…',
    'patron.analyzed': 'Metadata suggested by Gemini, edit if you like',
    'patron.uploadingStorage': 'Uploading to Firebase Storage…',
    'patron.readyToUpload': 'Ready to upload',
    'patron.changeFile': 'Change file',
    'debajo.stack.stack.label': 'Stack',
    'debajo.stack.stack.value': 'Next.js 16, React 19, strict TypeScript, Tailwind v4, Framer Motion',
    'debajo.stack.sdk.label': 'AI SDK',
    'debajo.stack.sdk.value': 'Vercel AI SDK (@ai-sdk/google 3.0.x on ai 6.x)',
    'debajo.stack.models.label': 'Models',
    'debajo.stack.models.value': 'gemini-embedding-001 (text, 768d) · gemini-embedding-2 (multimodal, 1536d)',
    'debajo.stack.vectorDb.label': 'Vector DB',
    'debajo.stack.vectorDb.value': 'Firestore vectorField + findNearest, 100% on Firebase',
    'debajo.stack.new.label': 'What\'s new',
    'debajo.stack.new.value': 'Just the new model and one new providerOption. No new SDK.',
    'debajo.cost.mm': '$0.0001 / request (order of magnitude)',
    'debajo.cost.firestore': 'Standard reads × k',
    'debajo.cost.totalLabel': 'Estimated total per query',
    'debajo.cost.total': '~$0.0001 to $0.0002',
    'debajo.codeComment': 'for multimodal:',
    'gracias.headline': 'The embedding has already learned the taste of ceviche.',
    'gracias.cta': 'Build something · Ask me · Let\'s talk',
    'cocinar.codeQuery': 'I want to cook something with',
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
    'como.sceneLabel': 'Scena 03',
    'como.description': 'Ogni piatto è un punto. Quelli simili si raggruppano insieme.',
    'como.where': 'Dove li usi già',
    'como.use1': 'consigli musicali per gusto',
    'como.use2': 'ricerca semantica',
    'como.use3': 'memoria per conversazioni lunghe',
    'como.use4': 'prodotti simili e consigli',

    // Busqueda scene
    'busqueda.sceneLabel': 'Scena 04',
    'busqueda.keyword': 'Ricerca per parola chiave',
    'busqueda.semantic': 'Ricerca semantica',
    'busqueda.placeholder': 'cibo confortante in un giorno di pioggia…',
    'busqueda.button': 'Cerca',
    'busqueda.sugerencia1': 'ceviche',
    'busqueda.sugerencia2': 'cibo confortante in un giorno di pioggia',
    'busqueda.sugerencia3': 'qualcosa di dolce e cremoso',
    'busqueda.sugerencia4': 'piatto tipico della montagna',

    // Vivo scene
    'vivo.sceneLabel': 'Scena 05',
    'vivo.placeholder': 'prova una nuova ricerca…',
    'vivo.instruction': 'Trascina un PDF di ricetta sul pannello. Lo dividiamo, lo incorporiamo e lo salviamo su Firestore qui.',

    // Reconoce scene
    'reconoce.sceneLabel': 'Scena 06',
    'reconoce.button': '↻ un\'altra foto',
    'reconoce.results': 'Risultati',

    // Cocinar scene
    'cocinar.sceneLabel': 'Scena 07',
    'cocinar.instruction': 'Scegli ingredienti (il pubblico può anche aggiungerne gridando).',
    'cocinar.button': 'Cerca piatti',
    'cocinar.clear': 'ripulisci',
    'cocinar.query': 'Voglio cucinare qualcosa con: {ingredients}. Quali piatti peruviani posso fare?',

    // Pregunta scene
    'pregunta.sceneLabel': 'Scena 08',
    'pregunta.placeholder': 'Cosa dovrei mangiare se ho il raffreddore?',
    'pregunta.sugerencia1': 'Cosa dovrei mangiare se ho il raffreddore?',
    'pregunta.sugerencia2': 'Voglio qualcosa di piccante con frutti di mare, cosa ordino?',
    'pregunta.sugerencia3': 'Un dolce cremoso per una celebrazione',
    'pregunta.sugerencia4': 'Quale piatto ti riscalda in una fredda giornata di montagna?',
    'pregunta.step1': 'Domanda',
    'pregunta.step2': 'Vettore 1536-d',
    'pregunta.step3': 'Contesto · k=4',
    'pregunta.step4': 'Gemini 3.8 Flash',
    'pregunta.step5': 'Risposta',
    'pregunta.error': 'Non ho trovato piatti per quella domanda. Prova un\'altra.',

    // Patron scene
    'patron.sceneLabel': 'Scena 09',
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
    'debajo.sceneLabel': 'Scena 10',
    'debajo.stack': 'Lo stack',
    'debajo.costs': 'Costi',
    'debajo.codeTitle': 'Il diff completo per aggiungere multimodale a uno stack Firebase',

    // Gracias scene
    'gracias.sceneLabel': 'Grazie',
    'gracias.message': 'Quello che viene dopo lo costruisci tu.',

    // Added: remaining UI text
    'ui.processing': 'Elaborazione…',
    'ui.orClick': 'o fai clic',
    'ui.recordLive': 'Registra dal vivo',
    'ui.clickToStop': 'Clicca per fermare',
    'ui.error': 'Errore',
    'ui.loading': 'caricamento',
    'ui.notesClose': 'Cmd+. per chiudere',
    'ui.camera': 'Fotocamera',
    'ui.capture': 'Scatta',
    'indexing.reading': 'Lettura del PDF',
    'indexing.chunking': 'Divisione in frammenti',
    'indexing.embedding': 'Generazione dell\'embedding',
    'indexing.storing': 'Scrittura su Firestore',
    'indexing.computing': 'calcolo di 1536 numeri…',
    'busqueda.noResults': 'nessun risultato',
    'vivo.searchButton': 'Cerca',
    'vivo.dragDrop': 'Trascina qui un PDF',
    'reconoce.recipe': 'Ricetta',
    'reconoce.captureAlt': 'foto scattata',
    'pregunta.retrieval': 'Recupero',
    'pregunta.generation': 'generazione',
    'pregunta.answerSource': 'La risposta viene solo dai piatti recuperati.',
    'pregunta.button': 'Chiedi',
    'pregunta.clear': 'cancella',
    'pregunta.contextTitle': 'Contesto recuperato',
    'pregunta.emptyContext': 'Fai una domanda per recuperare i piatti.',
    'pregunta.answerTitle': 'Risposta fondata',
    'pregunta.retrieving': 'Recupero del contesto…',
    'pregunta.thinking': 'Sto pensando…',
    'pregunta.answerPlaceholder': 'La risposta di Gemini apparirà qui, citando i piatti recuperati.',
    'pregunta.groundedIn': 'Basata su {count} piatti · modello',
    'pregunta.codeRetrieve': 'Recupero: la domanda diventa un vettore multimodale',
    'pregunta.codeGenerate': 'Generazione: Gemini risponde basandosi SOLO su ciò che è stato recuperato',
    'pregunta.codeSystem': 'Usa solo i piatti nel contesto…',
    'patron.subtitle': 'Musica peruviana. Vale lo stesso approccio di embedding.',
    'patron.modeMood': 'Cerca per mood',
    'patron.modeLive': 'Registra dal vivo (strumento)',
    'patron.modeUpload': 'Carica canzone',
    'patron.genre': 'Genere *',
    'patron.uploading': 'Caricamento…',
    'patron.ready': 'Fatto!',
    'patron.waitingAnalysis': 'In attesa dell\'analisi…',
    'patron.uploadButton': 'Carica e incorpora',
    'patron.saved': 'Incorporata e salvata!',
    'patron.savedTextOnly': '(audio troppo lungo, usato solo il testo)',
    'patron.savedAudioText': '(audio + testo)',
    'patron.tryMood': 'Prova "Cerca per mood" quando vuoi.',
    'patron.analyzing': 'Gemini sta analizzando la clip…',
    'patron.analyzed': 'Metadati suggeriti da Gemini, modificali se vuoi',
    'patron.uploadingStorage': 'Caricamento su Firebase Storage…',
    'patron.readyToUpload': 'Pronto per il caricamento',
    'patron.changeFile': 'Cambia file',
    'debajo.stack.stack.label': 'Stack',
    'debajo.stack.stack.value': 'Next.js 16, React 19, TypeScript strict, Tailwind v4, Framer Motion',
    'debajo.stack.sdk.label': 'SDK di IA',
    'debajo.stack.sdk.value': 'Vercel AI SDK (@ai-sdk/google 3.0.x su ai 6.x)',
    'debajo.stack.models.label': 'Modelli',
    'debajo.stack.models.value': 'gemini-embedding-001 (testo, 768d) · gemini-embedding-2 (multimodale, 1536d)',
    'debajo.stack.vectorDb.label': 'Vector DB',
    'debajo.stack.vectorDb.value': 'Firestore vectorField + findNearest, 100% su Firebase',
    'debajo.stack.new.label': 'La novità',
    'debajo.stack.new.value': 'Solo il nuovo modello e una nuova providerOption. Nessun nuovo SDK.',
    'debajo.cost.mm': '$0.0001 / richiesta (ordine di grandezza)',
    'debajo.cost.firestore': 'Letture standard × k',
    'debajo.cost.totalLabel': 'Totale stimato per query',
    'debajo.cost.total': '~$0.0001 – $0.0002',
    'debajo.codeComment': 'per il multimodale:',
    'gracias.headline': 'L\'embedding ha già imparato il sapore del ceviche.',
    'gracias.cta': 'Costruite qualcosa · Chiedetemi · Parliamone',
    'cocinar.codeQuery': 'Voglio cucinare qualcosa con',
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
