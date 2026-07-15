import { describe, expect, test } from "vitest"

import { buildIdeaNotes } from "../ideas"
import { IDEAS_CORPUS } from "../ideasCorpus"

describe("buildIdeaNotes", () => {
  test("builds one note per curated idea, marking archived ones", () => {
    const notes = buildIdeaNotes({ endDate: "2026-07-01", random: () => 0.5 })

    expect(notes).toHaveLength(IDEAS_CORPUS.length)
    for (const [index, note] of notes.entries()) {
      const idea = IDEAS_CORPUS[index]
      expect(note.title).toBe(idea.title)
      expect(note.body).toContain(idea.pitch)
      if (idea.archived) {
        expect(note.frontmatter.archived).toBe("true")
      } else {
        expect(note.frontmatter.archived).toBeUndefined()
      }
    }
  })
})
