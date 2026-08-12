import type { BearNoteRow } from "../../db/db.types"

import { convertBearNoteToScannedNote } from "../convertBearNoteToScannedNote"

const createBearNoteRow = (overrides: Partial<BearNoteRow> = {}): BearNoteRow => ({
  ZCREATIONDATE: 665979131,
  ZMODIFICATIONDATE: 665979131,
  ZTEXT: "# Why\nBody text.",
  ZTITLE: "Why",
  ZUNIQUEIDENTIFIER: "81C0CD56-B6B9-4DDF-8BC1-3FE4A675B126",
  ...overrides,
})

describe("convertBearNoteToScannedNote", () => {
  test("uses ZTITLE and ZUNIQUEIDENTIFIER directly", () => {
    const note = convertBearNoteToScannedNote(createBearNoteRow(), [])

    expect(note.title).toBe("Why")
    expect(note.basename).toBe("Why")
    expect(note.id).toBe("81C0CD56-B6B9-4DDF-8BC1-3FE4A675B126")
    expect(note.fullPath).toBe("81C0CD56-B6B9-4DDF-8BC1-3FE4A675B126")
    expect(note.folder).toBe("")
  })

  test("parses literal frontmatter out of ZTEXT and strips it from fullText", () => {
    const row = createBearNoteRow({
      ZTEXT: "---\ntags:\n  - dgw\n---\n# Why\nBody text.",
    })

    const note = convertBearNoteToScannedNote(row, [])

    expect(note.frontmatter).toEqual({ tags: ["dgw"] })
    expect(note.fullText).toBe("# Why\nBody text.")
  })

  test("returns null frontmatter when ZTEXT has no frontmatter block", () => {
    const note = convertBearNoteToScannedNote(createBearNoteRow(), [])

    expect(note.frontmatter).toBeNull()
    expect(note.fullText).toBe("# Why\nBody text.")
  })

  test("builds a bear deep link as obsidianUrl", () => {
    const note = convertBearNoteToScannedNote(createBearNoteRow(), [])

    expect(note.obsidianUrl).toBe(
      "bear://x-callback-url/open-note?id=81C0CD56-B6B9-4DDF-8BC1-3FE4A675B126",
    )
  })

  test("converts ZCREATIONDATE/ZMODIFICATIONDATE and folds both into dates", () => {
    const row = createBearNoteRow({ ZCREATIONDATE: 0, ZMODIFICATIONDATE: 100 })

    const note = convertBearNoteToScannedNote(row, [])

    expect(note.modifiedDate).toBe("2001-01-01T00:01:40.000Z")
    expect(note.dates).toEqual(
      expect.arrayContaining(["2001-01-01T00:00:00.000Z", "2001-01-01T00:01:40.000Z"]),
    )
  })

  test("resolves createdDate as the oldest of the folded-in dates", () => {
    const row = createBearNoteRow({ ZCREATIONDATE: 0, ZMODIFICATIONDATE: 100 })

    const note = convertBearNoteToScannedNote(row, [])

    expect(note.createdDate).toBe("2001-01-01T00:00:00.000Z")
  })

  test("extracts dates found in the note body using the configured formats", () => {
    const row = createBearNoteRow({
      ZTEXT: "# w.2026.02.24 (Tue)\n**c** 2026.02.20",
      ZTITLE: "w.2026.02.24 (Tue)",
    })

    const note = convertBearNoteToScannedNote(row, ["YYYY.MM.DD"])

    expect(note.dates).toEqual(expect.arrayContaining(["2026.02.24", "2026.02.20"]))
  })
})
