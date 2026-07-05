export type CoverKind = "book" | "movie" | "photo" | "recipe"

export interface CoverSvgOptions {
  kind: CoverKind
  /** Seed controlling colors and decoration, keep stable per note. */
  seed: number
  /** Title rendered onto the cover. */
  title: string
}
