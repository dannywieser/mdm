import { describe, expect, test } from "vitest"

import { generateCoverSvg } from "./coverSvg"

describe("generateCoverSvg", () => {
  test("renders a deterministic SVG for the same options", () => {
    const first = generateCoverSvg({ kind: "book", seed: 5, title: "Dune" })
    const second = generateCoverSvg({ kind: "book", seed: 5, title: "Dune" })

    expect(first).toBe(second)
    expect(first).toContain("<svg")
    expect(first).toContain("Dune")
  })

  test("uses portrait dimensions for books and square for photos", () => {
    const book = generateCoverSvg({ kind: "book", seed: 1, title: "A" })
    const photo = generateCoverSvg({ kind: "photo", seed: 1, title: "A" })

    expect(book).toContain('width="400" height="600"')
    expect(photo).toContain('width="600" height="600"')
  })

  test("escapes XML-sensitive characters in titles", () => {
    const svg = generateCoverSvg({ kind: "movie", seed: 2, title: "Fast & <Furious>" })

    expect(svg).toContain("Fast &amp;")
    expect(svg).toContain("&lt;Furious&gt;")
    expect(svg).not.toContain("<Furious>")
  })

  test("varies output across seeds", () => {
    const first = generateCoverSvg({ kind: "photo", seed: 1, title: "Hike" })
    const second = generateCoverSvg({ kind: "photo", seed: 99, title: "Hike" })

    expect(first).not.toBe(second)
  })
})
