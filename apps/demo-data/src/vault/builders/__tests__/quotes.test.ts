import { describe, expect, test } from "vitest"

import { buildQuoteNotes } from "../quotes"
import { QUOTES_CORPUS } from "../quotesCorpus"

describe("buildQuoteNotes", () => {
  test("builds one note per curated quote with its attribution and reflection", () => {
    const notes = buildQuoteNotes({ endDate: "2026-07-01", random: () => 0.5 })

    expect(notes).toHaveLength(QUOTES_CORPUS.length)
    for (const [index, note] of notes.entries()) {
      const quote = QUOTES_CORPUS[index]
      expect(note.body).toContain(quote.text)
      expect(note.body).toContain(quote.reflection)
      expect(note.frontmatter.author).toBe(quote.author)
      expect(note.frontmatter.source).toBe(quote.source)
    }
  })
})
