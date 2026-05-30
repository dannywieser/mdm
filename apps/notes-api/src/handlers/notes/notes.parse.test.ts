import { parseFrontMatter } from "markdown"
import { promises as fs } from "node:fs"

import type { ScannedNote } from "./notes.types"

import { parseMarkdownFile } from "./notes.parse"

jest.mock("node:fs", () => ({
  promises: {
    readFile: jest.fn(),
  },
}))

jest.mock("markdown", () => ({
  parseFrontMatter: jest.fn(),
}))

const readFileMock = fs.readFile as jest.Mock
const parseFrontMatterMock = jest.mocked(parseFrontMatter)

describe("notes parse helpers", () => {
  test("parseMarkdownFile renders html using the scanned note metadata", async () => {
    readFileMock.mockResolvedValue("# Welcome\n\nThis is a note.")
    parseFrontMatterMock.mockReturnValue({
      body: "# Welcome\n\nThis is a note.",
      frontmatter: null,
    })

    const note = await parseMarkdownFile(
      createScannedNote({
        basename: "welcome.md",
        fullPath: "/notes/topic/welcome.md",
        title: "welcome",
      }),
      "/notes",
      "attachments",
    )

    expect(note).toMatchObject({
      basename: "welcome.md",
      title: "welcome",
      fullPath: "/notes/topic/welcome.md",
    })
    expect(note.html).toContain("<h1>Welcome</h1>")
    expect(note.html).toContain("<p>This is a note.</p>")
    expect(note.linkedNotes).toEqual([])
    expect(readFileMock).toHaveBeenCalledWith("/notes/topic/welcome.md", "utf8")
  })

  test("parseMarkdownFile rewrites bare-filename images to obsidian attachment path in subfolder note", async () => {
    readFileMock.mockResolvedValue("![](attach-20260525090751252.jpg)")
    parseFrontMatterMock.mockReturnValue({
      body: "![](attach-20260525090751252.jpg)",
      frontmatter: null,
    })

    const note = await parseMarkdownFile(
      createScannedNote({
        basename: "file-name.md",
        folder: "folder",
        fullPath: "/notes/folder/file-name.md",
        title: "file-name",
      }),
      "/notes",
      "attachments",
    )

    expect(note.html).toContain(
      '<img src="/images?path=attachments%2Ffolder%2Ffile-name%2Fattach-20260525090751252.jpg"',
    )
  })

  test("parseMarkdownFile rewrites bare-filename images to obsidian attachment path in root note", async () => {
    readFileMock.mockResolvedValue("![](attach-123.jpg)")
    parseFrontMatterMock.mockReturnValue({
      body: "![](attach-123.jpg)",
      frontmatter: null,
    })

    const note = await parseMarkdownFile(
      createScannedNote({
        basename: "root-note.md",
        folder: "notes",
        fullPath: "/notes/root-note.md",
        title: "root-note",
      }),
      "/notes",
      "attachments",
    )

    expect(note.html).toContain(
      '<img src="/images?path=attachments%2Froot-note%2Fattach-123.jpg"',
    )
  })

  test("parseMarkdownFile uses configured attachmentsDirectory for bare-filename images", async () => {
    readFileMock.mockResolvedValue("![](photo.png)")
    parseFrontMatterMock.mockReturnValue({
      body: "![](photo.png)",
      frontmatter: null,
    })

    const note = await parseMarkdownFile(
      createScannedNote({
        fullPath: "/notes/topic/note.md",
      }),
      "/notes",
      "assets",
    )

    expect(note.html).toContain(
      '<img src="/images?path=assets%2Ftopic%2Fnote%2Fphoto.png"',
    )
  })

  test("parseMarkdownFile rewrites obsidian wikilink image embeds to attachment path", async () => {
    readFileMock.mockResolvedValue("![[attach-20260523155741791.jpg]]")
    parseFrontMatterMock.mockReturnValue({
      body: "![[attach-20260523155741791.jpg]]",
      frontmatter: null,
    })

    const note = await parseMarkdownFile(
      createScannedNote({
        basename: "file-name.md",
        folder: "folder",
        fullPath: "/notes/folder/file-name.md",
        title: "file-name",
      }),
      "/notes",
      "attachments",
    )

    expect(note.html).toContain(
      '<img src="/images?path=attachments%2Ffolder%2Ffile-name%2Fattach-20260523155741791.jpg"',
    )
  })

  test("parseMarkdownFile strips pipe alias from obsidian wikilink image embeds", async () => {
    readFileMock.mockResolvedValue("![[attach-20260523155741791.jpg|200]]")
    parseFrontMatterMock.mockReturnValue({
      body: "![[attach-20260523155741791.jpg|200]]",
      frontmatter: null,
    })

    const note = await parseMarkdownFile(
      createScannedNote({
        basename: "root-note.md",
        folder: "notes",
        fullPath: "/notes/root-note.md",
        title: "root-note",
      }),
      "/notes",
      "attachments",
    )

    expect(note.html).toContain(
      '<img src="/images?path=attachments%2Froot-note%2Fattach-20260523155741791.jpg"',
    )
  })

  test("parseMarkdownFile rewrites multiple obsidian wikilink image embeds in a single note", async () => {
    readFileMock.mockResolvedValue(
      "First ![[photo-a.jpg]] and second ![[photo-b.jpg|300]]",
    )
    parseFrontMatterMock.mockReturnValue({
      body: "First ![[photo-a.jpg]] and second ![[photo-b.jpg|300]]",
      frontmatter: null,
    })

    const note = await parseMarkdownFile(
      createScannedNote({
        fullPath: "/notes/folder/note.md",
      }),
      "/notes",
      "attachments",
    )

    expect(note.html).toContain(
      '<img src="/images?path=attachments%2Ffolder%2Fnote%2Fphoto-a.jpg"',
    )
    expect(note.html).toContain(
      '<img src="/images?path=attachments%2Ffolder%2Fnote%2Fphoto-b.jpg"',
    )
  })

  test("parseMarkdownFile rewrites relative markdown images to image server urls", async () => {
    readFileMock.mockResolvedValue("![Screenshot](./assets/home%20page.png)")
    parseFrontMatterMock.mockReturnValue({
      body: "![Screenshot](./assets/home%20page.png)",
      frontmatter: null,
    })

    const note = await parseMarkdownFile(
      createScannedNote({
        basename: "journal.md",
        folder: "daily",
        fullPath: "/notes/daily/journal.md",
        title: "journal",
      }),
      "/notes",
    )

    expect(note.html).toContain(
      '<img src="/images?path=daily%2Fassets%2Fhome%20page.png"',
    )
  })

  test("parseMarkdownFile keeps external markdown image urls unchanged", async () => {
    readFileMock.mockResolvedValue("![Screenshot](https://example.com/image.png)")
    parseFrontMatterMock.mockReturnValue({
      body: "![Screenshot](https://example.com/image.png)",
      frontmatter: null,
    })

    const note = await parseMarkdownFile(
      createScannedNote({
        basename: "journal.md",
        folder: "daily",
        fullPath: "/notes/daily/journal.md",
        title: "journal",
      }),
      "/notes",
    )

    expect(note.html).toContain('<img src="https://example.com/image.png"')
  })

  test("parseMarkdownFile replaces unmatched wikilink with dashed-underline span", async () => {
    readFileMock.mockResolvedValue("See [[Missing Note]] for details.")
    parseFrontMatterMock.mockReturnValue({
      body: "See [[Missing Note]] for details.",
      frontmatter: null,
    })

    const note = await parseMarkdownFile(
      createScannedNote({ fullPath: "/notes/topic/note.md" }),
      "/notes",
      "attachments",
      [],
    )

    expect(note.html).toContain('<span class="wikilink-unmatched">Missing Note</span>')
    expect(note.linkedNotes).toEqual([])
  })

  test("parseMarkdownFile replaces matched wikilink with obsidian link and adds to linkedNotes", async () => {
    const linkedScannedNote = createScannedNote({
      basename: "other-note.md",
      fullPath: "/notes/topic/other-note.md",
      id: "other-note",
      obsidianUrl: "obsidian://open?vault=vault&file=topic%2Fother-note",
      title: "other-note",
    })
    readFileMock
      .mockResolvedValueOnce("See [[other-note]] here.")
      .mockResolvedValueOnce("# Other Note content")
    parseFrontMatterMock
      .mockReturnValueOnce({ body: "See [[other-note]] here.", frontmatter: null })
      .mockReturnValueOnce({ body: "# Other Note content", frontmatter: null })

    const note = await parseMarkdownFile(
      createScannedNote({ fullPath: "/notes/topic/note.md" }),
      "/notes",
      "attachments",
      [linkedScannedNote],
    )

    expect(note.html).toContain(
      '<a href="obsidian://open?vault=vault&file=topic%2Fother-note">other-note</a>',
    )
    expect(note.linkedNotes).toHaveLength(1)
    expect(note.linkedNotes?.[0]).toMatchObject({
      id: "other-note",
      title: "other-note",
    })
    expect(note.linkedNotes?.[0]?.html).toContain("<h1>Other Note content</h1>")
  })

  test("parseMarkdownFile uses alias text for matched wikilink display", async () => {
    const linkedScannedNote = createScannedNote({
      basename: "other-note.md",
      fullPath: "/notes/topic/other-note.md",
      id: "other-note",
      obsidianUrl: "obsidian://open?vault=vault&file=topic%2Fother-note",
      title: "other-note",
    })
    readFileMock
      .mockResolvedValueOnce("See [[other-note|the linked note]] here.")
      .mockResolvedValueOnce("# Other Note content")
    parseFrontMatterMock
      .mockReturnValueOnce({
        body: "See [[other-note|the linked note]] here.",
        frontmatter: null,
      })
      .mockReturnValueOnce({ body: "# Other Note content", frontmatter: null })

    const note = await parseMarkdownFile(
      createScannedNote({ fullPath: "/notes/topic/note.md" }),
      "/notes",
      "attachments",
      [linkedScannedNote],
    )

    expect(note.html).toContain(
      '<a href="obsidian://open?vault=vault&file=topic%2Fother-note">the linked note</a>',
    )
  })

  test("parseMarkdownFile does not add the same linked note twice for multiple wikilinks", async () => {
    const linkedScannedNote = createScannedNote({
      basename: "other-note.md",
      fullPath: "/notes/topic/other-note.md",
      id: "other-note",
      obsidianUrl: "obsidian://open?vault=vault&file=topic%2Fother-note",
      title: "other-note",
    })
    readFileMock
      .mockResolvedValueOnce("See [[other-note]] and [[other-note]] again.")
      .mockResolvedValueOnce("# Other Note content")
    parseFrontMatterMock
      .mockReturnValueOnce({
        body: "See [[other-note]] and [[other-note]] again.",
        frontmatter: null,
      })
      .mockReturnValueOnce({ body: "# Other Note content", frontmatter: null })

    const note = await parseMarkdownFile(
      createScannedNote({ fullPath: "/notes/topic/note.md" }),
      "/notes",
      "attachments",
      [linkedScannedNote],
    )

    expect(note.linkedNotes).toHaveLength(1)
  })

  test("parseMarkdownFile does not resolve wikilinks in linked notes (one level deep)", async () => {
    const deepNote = createScannedNote({
      basename: "deep-note.md",
      fullPath: "/notes/topic/deep-note.md",
      id: "deep-note",
      obsidianUrl: "obsidian://open?vault=vault&file=topic%2Fdeep-note",
      title: "deep-note",
    })
    const linkedNote = createScannedNote({
      basename: "linked-note.md",
      fullPath: "/notes/topic/linked-note.md",
      id: "linked-note",
      obsidianUrl: "obsidian://open?vault=vault&file=topic%2Flinked-note",
      title: "linked-note",
    })
    readFileMock
      .mockResolvedValueOnce("See [[linked-note]] here.")
      .mockResolvedValueOnce("Linked note body with [[deep-note]] inside.")
    parseFrontMatterMock
      .mockReturnValueOnce({ body: "See [[linked-note]] here.", frontmatter: null })
      .mockReturnValueOnce({
        body: "Linked note body with [[deep-note]] inside.",
        frontmatter: null,
      })

    const note = await parseMarkdownFile(
      createScannedNote({ fullPath: "/notes/topic/note.md" }),
      "/notes",
      "attachments",
      [linkedNote, deepNote],
    )

    expect(note.linkedNotes).toHaveLength(1)
    // wikilink in linked note is rendered as unmatched span (no allNotes passed)
    expect(note.linkedNotes?.[0]?.html).toContain(
      '<span class="wikilink-unmatched">deep-note</span>',
    )
    expect(note.linkedNotes?.[0]?.linkedNotes).toEqual([])
  })
})

const createScannedNote = (
  overrides: Partial<ScannedNote> = {},
): ScannedNote => ({
  basename: "note.md",
  titleOrBodyDates: [],
  createdDate: "2026-05-26T00:00:00.000Z",
  folder: "topic",
  frontmatter: null,
  fullPath: "/notes/topic/note.md",
  id: "note",
  modifiedDate: "2026-05-26T01:00:00.000Z",
  obsidianUrl: "obsidian://open?vault=vault&file=topic%2Fnote",
  title: "note",
  ...overrides,
})
