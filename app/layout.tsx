import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RAG · Embeddings · Multimodal',
  description: 'Una exploración con comida peruana',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource-variable/inter@5/index.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource-variable/jetbrains-mono@5/index.min.css" />
      </head>
      <body>{children}</body>
    </html>
  )
}
