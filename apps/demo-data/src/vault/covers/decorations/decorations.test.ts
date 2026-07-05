import { describe, expect, test } from "vitest"

import type { CoverDecoration, DecorationContext } from "../coverSvg.types"

import { createRandom } from "../../random/random"
import { BOOK_DECORATIONS } from "./bookDecorations"
import { MOVIE_DECORATIONS } from "./movieDecorations"
import { PHOTO_DECORATIONS } from "./photoDecorations"
import { RECIPE_DECORATIONS } from "./recipeDecorations"

const buildContext = (seed: number): DecorationContext => ({
  accent: "#f1faee",
  dark: "#1d3557",
  height: 600,
  mid: "#457b9d",
  random: createRandom(seed),
  width: 800,
})

const KINDS: [string, readonly CoverDecoration[], number][] = [
  ["photo", PHOTO_DECORATIONS, 6],
  ["book", BOOK_DECORATIONS, 5],
  ["movie", MOVIE_DECORATIONS, 4],
  ["recipe", RECIPE_DECORATIONS, 4],
]

describe.each(KINDS)("%s decorations", (_kind, decorations, expectedCount) => {
  test("provides the expected number of distinct motifs", () => {
    const rendered = decorations.map((decoration) => decoration(buildContext(1)))

    expect(decorations).toHaveLength(expectedCount)
    expect(new Set(rendered).size).toBe(expectedCount)
  })

  test("every motif renders deterministic non-empty SVG markup", () => {
    for (const decoration of decorations) {
      const first = decoration(buildContext(7))
      const second = decoration(buildContext(7))

      expect(first.length).toBeGreaterThan(0)
      expect(first).toMatch(/<(rect|circle|polygon|ellipse|path|line)/)
      expect(first).toBe(second)
    }
  })
})
