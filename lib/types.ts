export type DishCategory = 'criollo' | 'marino' | 'sopa' | 'postre' | 'bebida' | 'andino'

export type Dish = {
  id: string
  name_es: string
  name_en: string
  category: DishCategory
  description: string
  recipe: string
  ingredients: string[]
  tags: string[]
  image_url: string
  source_url: string
  embedding_text: number[]
  embedding_mm: number[]
}

export type SongGenre =
  | 'huayno'
  | 'marinera'
  | 'criolla'
  | 'chicha'
  | 'yaravi'
  | 'festejo'

export type Song = {
  id: string
  title: string
  genre: SongGenre
  region: string
  description: string
  mood_tags: string[]
  audio_clip_url: string
  embedding_mm: number[]
}

export type SearchHit<T> = {
  doc: T
  distance: number
  similarity: number
}
