export interface MovieCorpusEntry {
  title: string
  director: string
  genre: string
  status: "watched" | "watchlist"
  /** Only set when `status` is "watched". */
  rating?: number
  body: string
  /** Key into the "movies" Pexels photo pool — a 1:1 match, not a rotation. */
  photoKey: string
}
