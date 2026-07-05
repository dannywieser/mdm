import type { RandomGenerator } from "../random/random.types"

export type CoverKind = "book" | "movie" | "photo" | "recipe"

export interface CoverSvgOptions {
  kind: CoverKind
  /** Seed controlling colors, dimensions, and decoration; keep stable per note. */
  seed: number
  /** Title rendered onto the cover. */
  title: string
}

export interface CoverDimensions {
  height: number
  width: number
}

export interface DecorationContext {
  /** Light accent color from the palette. */
  accent: string
  /** Dark base color from the palette. */
  dark: string
  height: number
  /** Mid-tone color from the palette. */
  mid: string
  random: RandomGenerator
  width: number
}

/** Renders one decoration motif as an SVG fragment. */
export type CoverDecoration = (context: DecorationContext) => string
