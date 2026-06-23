import type { ScannedNote } from "../types"

import { applyWikilinkReplacements, resolveWikilinks } from "./wikilinks"

describe("resolveWikilinks", () => {
  test("returns body unchanged when there are no wikilinks", () => {
    const { processedBody, linkedNoteRefs, replacements } = resolveWikilinks(
      "Some plain text.",
      [],
    )

    expect(processedBody).toBe("Some plain text.")
    expect(linkedNoteRefs).toEqual([])
    expect(replacements).toEqual([])
  })

  test("replaces unmatched wikilink with placeholder and records replacement", () => {
    const { processedBody, linkedNoteRefs, replacements } = resolveWikilinks(
      "See [[Missing Note]] here.",
      [],
    )

    expect(processedBody).toBe("See WLPH0ENDWL here.")
    expect(linkedNoteRefs).toEqual([])
    expect(replacements).toHaveLength(1)
    expect(replacements[0]).toMatchObject({ displayText: "Missing Note", matchedNote: null })
  })

  test("replaces matched wikilink with placeholder and adds note to linkedNoteRefs", () => {
    const targetNote = createScannedNote({ id: "target", title: "target-note" })
    const { processedBody, linkedNoteRefs, replacements } = resolveWikilinks(
      "See [[target-note]] here.",
      [targetNote],
    )

    expect(processedBody).toBe("See WLPH0ENDWL here.")
    expect(linkedNoteRefs).toHaveLength(1)
    expect(linkedNoteRefs[0]).toBe(targetNote)
    expect(replacements[0]).toMatchObject({ displayText: "target-note", matchedNote: targetNote })
  })

  test("uses alias as display text when pipe alias is present", () => {
    const targetNote = createScannedNote({ id: "target", title: "target-note" })
    const { replacements } = resolveWikilinks("See [[target-note|the alias]] here.", [targetNote])

    expect(replacements[0]).toMatchObject({ displayText: "the alias", matchedNote: targetNote })
  })

  test("does not add the same note to linkedNoteRefs twice", () => {
    const targetNote = createScannedNote({ id: "target", title: "target-note" })
    const { linkedNoteRefs, replacements } = resolveWikilinks(
      "[[target-note]] and [[target-note]] again.",
      [targetNote],
    )

    expect(linkedNoteRefs).toHaveLength(1)
    expect(replacements).toHaveLength(2)
  })

  test("handles multiple different wikilinks in one body", () => {
    const noteA = createScannedNote({ id: "a", title: "note-a" })
    const noteB = createScannedNote({ id: "b", title: "note-b" })
    const { processedBody, linkedNoteRefs, replacements } = resolveWikilinks(
      "[[note-a]] and [[note-b]] and [[missing]].",
      [noteA, noteB],
    )

    expect(processedBody).toBe("WLPH0ENDWL and WLPH1ENDWL and WLPH2ENDWL.")
    expect(linkedNoteRefs).toHaveLength(2)
    expect(replacements).toHaveLength(3)
    expect(replacements[2]).toMatchObject({ displayText: "missing", matchedNote: null })
  })

  test("matching is case-insensitive", () => {
    const targetNote = createScannedNote({ id: "target", title: "My Note" })
    const { linkedNoteRefs } = resolveWikilinks("[[my note]]", [targetNote])

    expect(linkedNoteRefs).toHaveLength(1)
  })

  test("does not match obsidian image embeds (![[...]])", () => {
    const { processedBody, replacements } = resolveWikilinks("![[image.png]]", [])

    expect(processedBody).toBe("![[image.png]]")
    expect(replacements).toHaveLength(0)
  })
})

describe("applyWikilinkReplacements", () => {
  test("replaces unmatched placeholder with wikilink-unmatched span", () => {
    const result = applyWikilinkReplacements("See WLPH0ENDWL here.", [
      { displayText: "Missing Note", matchedNote: null },
    ])

    expect(result).toBe('See <span class="wikilink-unmatched">Missing Note</span> here.')
  })

  test("replaces matched placeholder with obsidian anchor link", () => {
    const matchedNote = createScannedNote({
      obsidianUrl: "obsidian://open?vault=v&file=note",
      title: "note",
    })
    const result = applyWikilinkReplacements("See WLPH0ENDWL here.", [
      { displayText: "note", matchedNote },
    ])

    expect(result).toBe('See <a href="obsidian://open?vault=v&file=note">note</a> here.')
  })

  test("HTML-escapes display text in unmatched span", () => {
    const result = applyWikilinkReplacements("WLPH0ENDWL", [
      { displayText: "<script>alert('xss')</script>", matchedNote: null },
    ])

    expect(result).toBe(
      '<span class="wikilink-unmatched">&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;</span>',
    )
  })

  test("HTML-escapes display text in matched anchor", () => {
    const matchedNote = createScannedNote({ obsidianUrl: "obsidian://open?vault=v&file=note" })
    const result = applyWikilinkReplacements("WLPH0ENDWL", [
      { displayText: 'A & B "quoted"', matchedNote },
    ])

    expect(result).toContain("A &amp; B &quot;quoted&quot;")
  })

  test("replaces multiple placeholders in one pass", () => {
    const matchedNote = createScannedNote({ obsidianUrl: "obsidian://open?vault=v&file=n" })
    const result = applyWikilinkReplacements("WLPH0ENDWL and WLPH1ENDWL", [
      { displayText: "matched", matchedNote },
      { displayText: "unmatched", matchedNote: null },
    ])

    expect(result).toContain('<a href="obsidian://open?vault=v&file=n">matched</a>')
    expect(result).toContain('<span class="wikilink-unmatched">unmatched</span>')
  })

  test("returns empty string for out-of-range placeholder index", () => {
    const result = applyWikilinkReplacements("WLPH5ENDWL", [
      { displayText: "only one", matchedNote: null },
    ])

    expect(result).toBe("")
  })
})

const createScannedNote = (overrides: Partial<ScannedNote> = {}): ScannedNote => ({
  basename: "note.md",
  dates: [],
  createdDate: null,
  folder: "topic",
  frontmatter: null,
  fullText: "",
  id: "note",
  modifiedDate: "2026-05-26",
  obsidianUrl: "obsidian://open?vault=vault&file=topic%2Fnote",
  title: "note",
  ...overrides,
})
