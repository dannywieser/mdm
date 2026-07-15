export interface BookCorpusEntry {
  title: string
  author: string
  genre: string
  status: "read" | "reading" | "to-read"
  /** Only set when `status` is "read". */
  rating?: number
  body: string
  /** Key into the "books" Pexels photo pool — a 1:1 match, not a rotation. */
  photoKey: string
}
