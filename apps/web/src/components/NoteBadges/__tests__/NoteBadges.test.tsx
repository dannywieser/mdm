import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import type { Note } from "markdown"
import { describe, expect, test } from "vitest"

import { NoteBadges } from "../NoteBadges"

const noteFixture: Note = {
  basename: "My Note",
  dates: [],
  content: { children: [], type: "root" },
  createdDate: "2026-01-01",
  folder: "daily",
  frontmatter: {
    genre: ["thriller", "classic"],
    type: "book",
  },
  fullPath: "/daily/my-note.md",
  fullText: "",
  id: "my-note",
  linkedNotes: [],
  modifiedDate: "2026-01-01",
  obsidianUrl: "obsidian://open?vault=dgw&file=daily%2Fmy-note",
  title: "My Note Title",
}

describe("NoteBadges", () => {
  test("renders note property badges when configured", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NoteBadges badges={["folder"]} note={noteFixture} />
      </ChakraProvider>,
    )

    expect(screen.getByText("daily")).toBeTruthy()
  })

  test("renders frontmatter property badges when configured", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NoteBadges badges={["frontmatter.type"]} note={noteFixture} />
      </ChakraProvider>,
    )

    expect(screen.getByText("book")).toBeTruthy()
  })

  test("renders one badge per frontmatter array value", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NoteBadges badges={["frontmatter.genre"]} note={noteFixture} />
      </ChakraProvider>,
    )

    expect(screen.getByText("thriller")).toBeTruthy()
    expect(screen.getByText("classic")).toBeTruthy()
  })

  test("does not render badges that do not exist", () => {
    const { container } = render(
      <ChakraProvider value={defaultSystem}>
        <NoteBadges badges={["frontmatter.author"]} note={noteFixture} />
      </ChakraProvider>,
    )

    expect(container.textContent).toBe("")
  })
})
