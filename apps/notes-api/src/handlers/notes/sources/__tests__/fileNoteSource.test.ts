import { createMockNotesConfig } from "app-config/testing"
import { collectMarkdownFiles } from "markdown"

import type { ScannedNote } from "../../notes.types"

import { scanMarkdownFile } from "../../notes.scan"
import { createFileNoteSource } from "../fileNoteSource"

vi.mock("markdown", async (importOriginal) => {
  const actual = await importOriginal<typeof import("markdown")>()
  return {
    ...actual,
    collectMarkdownFiles: vi.fn(),
  }
})

vi.mock("../../notes.scan", () => ({
  scanMarkdownFile: vi.fn(),
}))

vi.mock("../../../../logger", () => ({
  logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

const collectMarkdownFilesMock = vi.mocked(collectMarkdownFiles)
const scanMarkdownFileMock = vi.mocked(scanMarkdownFile)

const createScannedNote = (overrides: Partial<ScannedNote> = {}): ScannedNote => ({
  basename: "note.md",
  dates: [],
  createdDate: null,
  folder: "",
  frontmatter: null,
  fullPath: "/notes/note.md",
  fullText: "",
  id: "note",
  modifiedDate: "2026-01-01T00:00:00.000Z",
  obsidianUrl: "obsidian://open?vault=vault&file=note",
  title: "note",
  ...overrides,
})

describe("createFileNoteSource", () => {
  test("scans every collected markdown file in sorted order", async () => {
    const notesConfig = createMockNotesConfig({ notesDirectory: "/notes" })
    const noteA = createScannedNote({ id: "a", fullPath: "/notes/a.md" })
    const noteB = createScannedNote({ id: "b", fullPath: "/notes/b.md" })

    collectMarkdownFilesMock.mockResolvedValue(["/notes/b.md", "/notes/a.md"])
    scanMarkdownFileMock
      .mockResolvedValueOnce(noteA)
      .mockResolvedValueOnce(noteB)

    const notes = await createFileNoteSource(notesConfig).listNotes()

    expect(collectMarkdownFilesMock).toHaveBeenCalledWith("/notes")
    expect(scanMarkdownFileMock.mock.calls).toEqual([["/notes/a.md"], ["/notes/b.md"]])
    expect(notes).toEqual([noteA, noteB])
  })
})
