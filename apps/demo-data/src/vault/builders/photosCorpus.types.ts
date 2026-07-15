export interface PhotoCorpusEntry {
  place: string
  caption: string
  /** Key into the "photos" Pexels photo pool — a 1:1 match, not a rotation. */
  photoKey: string
  tags: readonly string[]
}
