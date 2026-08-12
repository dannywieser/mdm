import type { MarkdownNode } from "markdown"

import { resolveNotesConfig } from "app-config"
import { createMockNotesConfig } from "app-config/testing"

import type { ScannedNote } from "../notes.types"

import { parseMarkdownFile } from "../notes.parse"

vi.mock("app-config", () => ({
  resolveNotesConfig: vi.fn(),
}))

const resolveNotesConfigMock = vi.mocked(resolveNotesConfig)

const defaultConfig = createMockNotesConfig()

describe("notes parse helpers", () => {
  beforeEach(() => {
    resolveNotesConfigMock.mockResolvedValue(defaultConfig)
  })

  test("parseMarkdownFile preserves task list state in markdown node tree", async () => {
    const note = await parseMarkdownFile(
      createScannedNote({ fullText: "- [x] Done\n- [ ] Todo\n" }),
    )

    const taskItems = findNodesByType(note.content, "listItem")
    expect(taskItems).toHaveLength(2)
    expect(taskItems.map((item) => item.checked).toSorted((a, b) => Number(a) - Number(b))).toEqual([false, true])
  })

  test("parseMarkdownFile returns a markdown node tree with scanned note metadata", async () => {
    const note = await parseMarkdownFile(
      createScannedNote({
        basename: "welcome.md",
        fullPath: "/notes/topic/welcome.md",
        fullText: "# Welcome\n\nThis is a note.",
        title: "welcome",
      }),
    )

    expect(note).toMatchObject({
      basename: "welcome.md",
      title: "welcome",
      fullPath: "/notes/topic/welcome.md",
    })

    const heading = findNodesByType(note.content, "heading")[0]
    const paragraph = findNodesByType(note.content, "paragraph")[0]

    expect(extractNodeText(heading)).toBe("Welcome")
    expect(extractNodeText(paragraph)).toBe("This is a note.")
    expect(note.linkedNotes).toEqual([])
  })

  test("parseMarkdownFile rewrites bare-filename images to obsidian attachment path in subfolder note", async () => {
    const note = await parseMarkdownFile(
      createScannedNote({
        basename: "file-name.md",
        folder: "folder",
        fullPath: "/notes/folder/file-name.md",
        fullText: "![](attach-20260525090751252.jpg)",
        title: "file-name",
      }),
    )

    const image = findNodesByType(note.content, "image")[0]
    expect(image.url).toBe(
      "/images?path=folder%2Ffile-name%2Fattach-20260525090751252.jpg",
    )
  })

  test("parseMarkdownFile rewrites bare-filename images to obsidian attachment path in root note", async () => {
    const note = await parseMarkdownFile(
      createScannedNote({
        basename: "root-note.md",
        folder: "notes",
        fullPath: "/notes/root-note.md",
        fullText: "![](attach-123.jpg)",
        title: "root-note",
      }),
    )

    const image = findNodesByType(note.content, "image")[0]
    expect(image.url).toBe("/images?path=root-note%2Fattach-123.jpg")
  })

  test("parseMarkdownFile rewrites obsidian wikilink image embeds to attachment path", async () => {
    const note = await parseMarkdownFile(
      createScannedNote({
        basename: "file-name.md",
        folder: "folder",
        fullPath: "/notes/folder/file-name.md",
        fullText: "![[attach-20260523155741791.jpg]]",
        title: "file-name",
      }),
    )

    const image = findNodesByType(note.content, "image")[0]
    expect(image.url).toBe(
      "/images?path=folder%2Ffile-name%2Fattach-20260523155741791.jpg",
    )
  })

  test("parseMarkdownFile strips pipe alias from obsidian wikilink image embeds", async () => {
    const note = await parseMarkdownFile(
      createScannedNote({
        basename: "root-note.md",
        folder: "notes",
        fullPath: "/notes/root-note.md",
        fullText: "![[attach-20260523155741791.jpg|200]]",
        title: "root-note",
      }),
    )

    const image = findNodesByType(note.content, "image")[0]
    expect(image.url).toBe(
      "/images?path=root-note%2Fattach-20260523155741791.jpg",
    )
  })

  test("parseMarkdownFile rewrites multiple obsidian wikilink image embeds in a single note", async () => {
    const note = await parseMarkdownFile(
      createScannedNote({
        fullPath: "/notes/folder/note.md",
        fullText: "First ![[photo-a.jpg]] and second ![[photo-b.jpg|300]]",
      }),
    )

    const images = findNodesByType(note.content, "image")
    expect(images.map((image) => image.url ?? "").toSorted((a, b) => a.localeCompare(b))).toEqual([
      "/images?path=folder%2Fnote%2Fphoto-a.jpg",
      "/images?path=folder%2Fnote%2Fphoto-b.jpg",
    ])
  })

  test("parseMarkdownFile prepends attachmentsDirectory to bare-filename images", async () => {
    resolveNotesConfigMock.mockResolvedValue({ ...defaultConfig, attachmentsDirectory: "attachments" })

    const note = await parseMarkdownFile(
      createScannedNote({
        basename: "file-name.md",
        folder: "folder",
        fullPath: "/notes/folder/file-name.md",
        fullText: "![](attach-20260525090751252.jpg)",
        title: "file-name",
      }),
    )

    const image = findNodesByType(note.content, "image")[0]
    expect(image.url).toBe(
      "/images?path=attachments%2Ffolder%2Ffile-name%2Fattach-20260525090751252.jpg",
    )
  })

  test("parseMarkdownFile rewrites relative markdown images to image server urls", async () => {
    const note = await parseMarkdownFile(
      createScannedNote({
        basename: "journal.md",
        folder: "daily",
        fullPath: "/notes/daily/journal.md",
        fullText: "![Screenshot](./assets/home%20page.png)",
        title: "journal",
      }),
    )

    const image = findNodesByType(note.content, "image")[0]
    expect(image.url).toBe("/images?path=daily%2Fassets%2Fhome%20page.png")
  })

  test("parseMarkdownFile passes through markdown image url that already has directory components", async () => {
    const note = await parseMarkdownFile(
      createScannedNote({
        basename: "journal.md",
        folder: "daily",
        fullPath: "/notes/daily/journal.md",
        fullText: "![Cover](attachments/daily/journal/cover.jpg)",
        title: "journal",
      }),
    )

    const image = findNodesByType(note.content, "image")[0]
    expect(image.url).toBe("/images?path=attachments%2Fdaily%2Fjournal%2Fcover.jpg")
  })

  test("parseMarkdownFile keeps external markdown image urls unchanged", async () => {
    const note = await parseMarkdownFile(
      createScannedNote({
        basename: "journal.md",
        folder: "daily",
        fullPath: "/notes/daily/journal.md",
        fullText: "![Screenshot](https://example.com/image.png)",
        title: "journal",
      }),
    )

    const image = findNodesByType(note.content, "image")[0]
    expect(image.url).toBe("https://example.com/image.png")
  })

  test("parseMarkdownFile replaces unmatched wikilink with unmatched wikilink text node", async () => {
    const note = await parseMarkdownFile(
      createScannedNote({
        fullPath: "/notes/topic/note.md",
        fullText: "See [[Missing Note]] for details.",
      }),
      [],
    )

    const unmatchedNode = findNodesByType(note.content, "text").find(
      (node) => node.wikilinkType === "unmatched",
    )
    expect(unmatchedNode?.value).toBe("Missing Note")
    expect(note.linkedNotes).toEqual([])
  })

  test("parseMarkdownFile replaces matched wikilink with link node and adds to linkedNotes", async () => {
    const linkedScannedNote = createScannedNote({
      basename: "other-note.md",
      fullPath: "/notes/topic/other-note.md",
      fullText: "# Other Note content",
      id: "other-note",
      obsidianUrl: "obsidian://open?vault=vault&file=topic%2Fother-note",
      title: "other-note",
    })

    const note = await parseMarkdownFile(
      createScannedNote({
        fullPath: "/notes/topic/note.md",
        fullText: "See [[other-note]] here.",
      }),
      [linkedScannedNote],
    )

    const linkNode = findNodesByType(note.content, "link")[0]
    expect(linkNode.url).toBe("obsidian://open?vault=vault&file=topic%2Fother-note")
    expect(extractNodeText(linkNode)).toBe("other-note")
    expect(note.linkedNotes).toHaveLength(1)
    expect(note.linkedNotes?.[0]).toMatchObject({
      id: "other-note",
      title: "other-note",
    })
    expect(extractNodeText(findNodesByType(note.linkedNotes?.[0]?.content, "heading")[0])).toBe(
      "Other Note content",
    )
  })

  test("parseMarkdownFile uses alias text for matched wikilink display", async () => {
    const linkedScannedNote = createScannedNote({
      basename: "other-note.md",
      fullPath: "/notes/topic/other-note.md",
      fullText: "# Other Note content",
      id: "other-note",
      obsidianUrl: "obsidian://open?vault=vault&file=topic%2Fother-note",
      title: "other-note",
    })

    const note = await parseMarkdownFile(
      createScannedNote({
        fullPath: "/notes/topic/note.md",
        fullText: "See [[other-note|the linked note]] here.",
      }),
      [linkedScannedNote],
    )

    const linkNode = findNodesByType(note.content, "link")[0]
    expect(extractNodeText(linkNode)).toBe("the linked note")
  })

  test("parseMarkdownFile does not add the same linked note twice for multiple wikilinks", async () => {
    const linkedScannedNote = createScannedNote({
      basename: "other-note.md",
      fullPath: "/notes/topic/other-note.md",
      fullText: "# Other Note content",
      id: "other-note",
      obsidianUrl: "obsidian://open?vault=vault&file=topic%2Fother-note",
      title: "other-note",
    })

    const note = await parseMarkdownFile(
      createScannedNote({
        fullPath: "/notes/topic/note.md",
        fullText: "See [[other-note]] and [[other-note]] again.",
      }),
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
      fullText: "Linked note body with [[deep-note]] inside.",
      id: "linked-note",
      obsidianUrl: "obsidian://open?vault=vault&file=topic%2Flinked-note",
      title: "linked-note",
    })

    const note = await parseMarkdownFile(
      createScannedNote({
        fullPath: "/notes/topic/note.md",
        fullText: "See [[linked-note]] here.",
      }),
      [linkedNote, deepNote],
    )

    expect(note.linkedNotes).toHaveLength(1)
    const linkedUnmatchedNode = findNodesByType(note.linkedNotes?.[0]?.content, "text").find(
      (node) => node.wikilinkType === "unmatched",
    )
    expect(linkedUnmatchedNode?.value).toBe("deep-note")
    expect(note.linkedNotes?.[0]?.linkedNotes).toEqual([])
  })

  test("parseMarkdownFile replaces an inline tag with a tag node", async () => {
    const note = await parseMarkdownFile(
      createScannedNote({ fullText: "Journal entry #personal/daily today." }),
    )

    const tagNode = findNodesByType(note.content, "tag")[0]
    expect(tagNode.value).toBe("personal/daily")
  })

  test("parseMarkdownFile replaces multiple inline tags with tag nodes", async () => {
    const note = await parseMarkdownFile(
      createScannedNote({ fullText: "#todo and #urgent" }),
    )

    const tagNodes = findNodesByType(note.content, "tag")
    expect(tagNodes.map((node) => node.value).toSorted((a, b) => (a ?? "").localeCompare(b ?? ""))).toEqual([
      "todo",
      "urgent",
    ])
  })

  test("parseMarkdownFile does not treat a heading as a tag", async () => {
    const note = await parseMarkdownFile(
      createScannedNote({ fullText: "# Heading\n\nBody text." }),
    )

    expect(findNodesByType(note.content, "tag")).toEqual([])
  })
})

const findNodesByType = (tree: MarkdownNode | undefined, type: string): MarkdownNode[] => {
  if (!tree) {
    return []
  }

  const result: MarkdownNode[] = []
  const stack: MarkdownNode[] = [tree]

  while (stack.length > 0) {
    const current = stack.pop()

    if (!current) {
      continue
    }

    if (current.type === type) {
      result.push(current)
    }

    if (Array.isArray(current.children)) {
      stack.push(...current.children)
    }
  }

  return result
}

const extractNodeText = (node: MarkdownNode | undefined): string => {
  if (!node) {
    return ""
  }

  if (typeof node.value === "string") {
    return node.value
  }

  if (!Array.isArray(node.children)) {
    return ""
  }

  return node.children.map((childNode) => extractNodeText(childNode)).join("")
}

const createScannedNote = (
  overrides: Partial<ScannedNote> = {},
): ScannedNote => ({
  basename: "note.md",
  dates: [],
  createdDate: "2026-05-26T00:00:00.000Z",
  folder: "topic",
  frontmatter: null,
  fullPath: "/notes/topic/note.md",
  fullText: "",
  id: "note",
  modifiedDate: "2026-05-26T01:00:00.000Z",
  obsidianUrl: "obsidian://open?vault=vault&file=topic%2Fnote",
  tags: [],
  title: "note",
  ...overrides,
})
