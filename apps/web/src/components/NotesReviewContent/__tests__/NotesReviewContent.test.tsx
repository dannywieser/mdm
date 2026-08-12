import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import type { Note } from "markdown"
import { afterEach, describe, expect, test, vi } from "vitest"

import { NotesReviewContent } from "../NotesReviewContent"

const noteContentStartsWithH1Mock = vi.fn()

vi.mock("../NotesReviewContent.util", () => ({
  noteContentStartsWithH1: (...args: unknown[]) => noteContentStartsWithH1Mock(...args),
}))

vi.mock("../../../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock("../../MarkdownTree", () => ({ MarkdownTree: () => <div /> }))
vi.mock("../../NoteBadges", () => ({ NoteBadges: () => <div /> }))
vi.mock("../../LinkedNotesList", () => ({ LinkedNotesList: () => <div /> }))
vi.mock("../../OpenInObsidianButton", () => ({ OpenInObsidianButton: () => <div /> }))
vi.mock("../../NotesReviewTableOfContentsMobileTrigger", () => ({
  NotesReviewTableOfContentsMobileTrigger: () => <div />,
}))
vi.mock("../../NotesReviewTableOfContentsSidebar", () => ({
  NotesReviewTableOfContentsSidebar: () => <div />,
}))

afterEach(cleanup)

const noteFixture: Note = {
  basename: "my-note.md",
  content: { children: [], type: "root" },
  createdDate: "2026-01-01",
  dates: [],
  folder: "daily",
  frontmatter: null,
  fullPath: "/daily/my-note.md",
  fullText: "",
  id: "my-note",
  linkedNotes: [],
  modifiedDate: "2026-01-01",
  obsidianUrl: "obsidian://open?vault=dgw&file=daily%2Fmy-note",
  tags: [],
  title: "My Note",
}

const renderContent = () =>
  render(
    <ChakraProvider value={defaultSystem}>
      <NotesReviewContent
        badges={[]}
        currentIndex={0}
        currentNote={noteFixture}
        isPending={false}
        onMarkAsRead={vi.fn()}
        tocNotes={[]}
      />
    </ChakraProvider>,
  )

describe("NotesReviewContent", () => {
  test("renders the note title when its content does not start with an H1", () => {
    noteContentStartsWithH1Mock.mockReturnValue(false)

    renderContent()

    expect(screen.getByText("My Note")).toBeTruthy()
  })

  test("hides the note title when its content already starts with an H1", () => {
    noteContentStartsWithH1Mock.mockReturnValue(true)

    renderContent()

    expect(screen.queryByText("My Note")).toBeNull()
  })
})
