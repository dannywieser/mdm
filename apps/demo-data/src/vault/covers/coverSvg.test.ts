import { describe, expect, test } from "vitest"

import { generateCoverSvg } from "./coverSvg"

const extractDimensions = (svg: string): string =>
  /width="(\d+)" height="(\d+)"/.exec(svg)?.slice(1).join("x") ?? ""

describe("generateCoverSvg", () => {
  test("renders a deterministic SVG for the same options", () => {
    const first = generateCoverSvg({ kind: "book", seed: 5, title: "Dune" })
    const second = generateCoverSvg({ kind: "book", seed: 5, title: "Dune" })

    expect(first).toBe(second)
    expect(first).toContain("<svg")
    expect(first).toContain("Dune")
  })

  test("books and movies always use portrait cover dimensions", () => {
    for (let seed = 0; seed < 20; seed += 1) {
      expect(extractDimensions(generateCoverSvg({ kind: "book", seed, title: "A" }))).toBe("400x600")
      expect(extractDimensions(generateCoverSvg({ kind: "movie", seed, title: "A" }))).toBe("400x600")
    }
  })

  test("photos mix multiple aspect ratios across seeds", () => {
    const allowed = new Set(["600x600", "800x450", "600x750", "900x400", "800x600"])
    const seen = new Set<string>()

    for (let seed = 0; seed < 40; seed += 1) {
      const dimensions = extractDimensions(generateCoverSvg({ kind: "photo", seed, title: "Hike" }))
      expect(allowed.has(dimensions)).toBe(true)
      seen.add(dimensions)
    }

    expect(seen.size).toBeGreaterThanOrEqual(3)
  })

  test("recipes mix multiple aspect ratios across seeds", () => {
    const seen = new Set<string>()

    for (let seed = 0; seed < 40; seed += 1) {
      seen.add(extractDimensions(generateCoverSvg({ kind: "recipe", seed, title: "Stew" })))
    }

    expect(seen.size).toBeGreaterThanOrEqual(2)
  })

  test("varies decoration motifs across seeds for the same kind", () => {
    const bodies = new Set<string>()

    for (let seed = 0; seed < 30; seed += 1) {
      // Strip the title text so only background + decoration vary.
      bodies.add(
        generateCoverSvg({ kind: "photo", seed, title: "Hike" }).replace(/<text.*<\/text>/, ""),
      )
    }

    expect(bodies.size).toBeGreaterThan(10)
  })

  test("escapes XML-sensitive characters in titles", () => {
    const svg = generateCoverSvg({ kind: "movie", seed: 2, title: "Fast & <Furious>" })

    expect(svg).toContain("Fast &amp;")
    expect(svg).toContain("&lt;Furious&gt;")
    expect(svg).not.toContain("<Furious>")
  })
})
