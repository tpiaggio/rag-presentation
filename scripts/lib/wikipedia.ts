export type WikipediaSummary = {
  title: string
  extract: string
  image_url: string | null
  source_url: string
}

export async function fetchWikipediaSummary(slug: string): Promise<WikipediaSummary> {
  const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${slug}`
  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) {
    throw new Error(`Wikipedia ${slug}: ${res.status} ${res.statusText}`)
  }
  const data = (await res.json()) as {
    title: string
    extract: string
    originalimage?: { source: string }
    thumbnail?: { source: string }
    content_urls?: { desktop: { page: string } }
  }
  return {
    title: data.title,
    extract: data.extract,
    image_url: data.originalimage?.source ?? data.thumbnail?.source ?? null,
    source_url: data.content_urls?.desktop?.page ?? `https://es.wikipedia.org/wiki/${slug}`,
  }
}

export async function fetchImageBytes(imageUrl: string): Promise<{ data: Buffer; mimeType: string }> {
  const res = await fetch(imageUrl, {
    headers: {
      'user-agent': 'rag-presentation/0.0.0 (educational talk; https://github.com/tpiaggio; tpiaggio7@gmail.com)',
      'accept': 'image/*',
    },
  })
  if (!res.ok) throw new Error(`Image fetch ${imageUrl}: ${res.status}`)
  const mimeType = res.headers.get('content-type') ?? 'image/jpeg'
  const buf = Buffer.from(await res.arrayBuffer())
  return { data: buf, mimeType }
}
