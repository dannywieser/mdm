import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import type { Note } from "markdown"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { NotesCard } from "./NotesCard"

const useIsReadMock = vi.fn()
const useToggleReadMock = vi.fn()
const mutateMock = vi.fn()

vi.mock("services", async (importOriginal) => {
  const actual = await importOriginal<typeof import("services")>()

  return {
    ...actual,
    useIsRead: ({ noteId }: { noteId: string }) => useIsReadMock(noteId),
    useToggleRead: ({ noteId }: { noteId: string }) =>
      useToggleReadMock(noteId),
  }
})

const noteFixture: Note = {
  basename: "My Note",
  titleOrBodyDates: [],
  content: {
    children: [
      {
        children: [{ type: "text", value: "Hello" }],
        type: "paragraph",
      },
    ],
    type: "root",
  },
  createdDate: "2026-01-01",
  folder: "daily",
  frontmatter: null,
  fullPath: "/daily/my-note.md",
  fullText: "",
  id: "my-note",
  linkedNotes: [],
  modifiedDate: "2026-01-01",
  obsidianUrl: "obsidian://open?vault=dgw&file=daily%2Fmy-note",
  title: "My Note Title",
}

const linkedNoteFixture: Note = {
  basename: "Linked Note",
  titleOrBodyDates: [],
  content: {
    children: [
      {
        children: [{ type: "text", value: "Linked content" }],
        type: "paragraph",
      },
    ],
    type: "root",
  },
  createdDate: "2026-01-01",
  folder: "daily",
  frontmatter: null,
  fullPath: "/daily/linked-note.md",
  fullText: "",
  id: "linked-note",
  linkedNotes: [],
  modifiedDate: "2026-01-01",
  obsidianUrl: "obsidian://open?vault=dgw&file=daily%2Flinked-note",
  title: "Linked Note Title",
}

const renderCard = (note: Note, badges: string[] = []) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <NotesCard badges={badges} note={note} />
    </ChakraProvider>,
  )

afterEach(() => {
  cleanup()
})

beforeEach(() => {
  mutateMock.mockReset()
  useIsReadMock.mockReturnValue({ data: false })
  useToggleReadMock.mockReturnValue({
    isPending: false,
    mutate: mutateMock,
  })
})

describe("NotesCard", () => {
  test("renders the note title and markdown content", () => {
    renderCard(noteFixture)

    expect(screen.getByText("My Note Title")).toBeTruthy()
    expect(screen.getByText("Hello")).toBeTruthy()
  })

  test("renders obsidian links from markdown tree", () => {
    renderCard({
      ...noteFixture,
      content: {
        children: [
          {
            children: [
              {
                children: [{ type: "text", value: "open in obsidian" }],
                type: "link",
                url: "obsidian://open?vault=v&file=note",
              },
            ],
            type: "paragraph",
          },
        ],
        type: "root",
      },
    })

    const link = screen.getByRole("link", { name: "open in obsidian" })
    expect(link).toBeTruthy()
    expect(link.getAttribute("href")).toBe("obsidian://open?vault=v&file=note")
  })

  test("renders note images with Chakra Image component", () => {
    renderCard({
      ...noteFixture,
      content: {
        children: [
          {
            alt: "Screenshot",
            type: "image",
            url: "/images?path=assets%2Fshot.png",
          },
        ],
        type: "root",
      },
    })

    const image = screen.getByRole("img", { name: "Screenshot" })
    expect(image).toBeTruthy()
    expect(image.getAttribute("src")).toContain(
      "/images?path=assets%2Fshot.png",
    )
  })

  test("does not render linked notes section when linkedNotes is empty", () => {
    renderCard({ ...noteFixture, linkedNotes: [] })

    expect(screen.queryByText(/notes\.linkedNotes/)).toBeNull()
  })

  test("does not render linked notes section when linkedNotes is undefined", () => {
    renderCard({ ...noteFixture, linkedNotes: undefined })

    expect(screen.queryByText(/notes\.linkedNotes/)).toBeNull()
  })

  test("renders collapsible linked notes trigger when linked notes are present", () => {
    renderCard({ ...noteFixture, linkedNotes: [linkedNoteFixture] })

    expect(screen.getByText("notes.linkedNotes (1)")).toBeTruthy()
  })

  test("renders markdown task list icons from tree", () => {
    const { container } = render(
      <ChakraProvider value={defaultSystem}>
        <NotesCard
          note={{
            ...noteFixture,
            content: {
              children: [
                {
                  children: [
                    {
                      checked: true,
                      children: [
                        {
                          children: [{ type: "text", value: "Done" }],
                          type: "paragraph",
                        },
                      ],
                      type: "listItem",
                    },
                    {
                      checked: false,
                      children: [
                        {
                          children: [{ type: "text", value: "Todo" }],
                          type: "paragraph",
                        },
                      ],
                      type: "listItem",
                    },
                  ],
                  ordered: false,
                  type: "list",
                },
              ],
              type: "root",
            },
          }}
        />
      </ChakraProvider>,
    )

    expect(screen.getByText("Done")).toBeTruthy()
    expect(screen.getByText("Todo")).toBeTruthy()
    expect(container.querySelector('input[type="checkbox"]')).toBeNull()
    expect(container.querySelector("svg")).toBeTruthy()
  })

  test("collapses the note body when the note is read", () => {
    useIsReadMock.mockReturnValue({ data: true })

    renderCard(noteFixture)

    expect(screen.getByText("My Note Title")).toBeTruthy()
    expect(screen.queryByText("Hello")).toBeNull()
    expect(
      screen.getByRole("button", { name: "notes.markAsUnread" }),
    ).toBeTruthy()
  })

  test("toggles the note read state from the header button", () => {
    renderCard(noteFixture)

    fireEvent.click(screen.getByRole("button", { name: "notes.markAsRead" }))

    expect(mutateMock).toHaveBeenCalledTimes(1)
  })

  test("renders configured badges for the note", () => {
    renderCard(
      {
        ...noteFixture,
        frontmatter: {
          genre: ["thriller", "classic"],
          type: "book",
        },
      },
      ["folder", "frontmatter.type", "frontmatter.genre"],
    )

    expect(screen.getByText("daily")).toBeTruthy()
    expect(screen.getByText("book")).toBeTruthy()
    expect(screen.getByText("thriller")).toBeTruthy()
    expect(screen.getByText("classic")).toBeTruthy()
  })
})
