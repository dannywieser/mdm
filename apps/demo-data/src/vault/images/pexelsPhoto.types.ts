export interface PexelsPhoto {
  /** Stable lookup key, e.g. a recipe slug or a thematic pool label. */
  key: string
  photoId: number
  /** Direct CDN URL for the "large" rendition. */
  src: string
  width: number
  height: number
}

export type PexelsCategory = "books" | "movies" | "photos" | "recipes"

export type PexelsPhotoLibrary = Record<PexelsCategory, PexelsPhoto[]>
