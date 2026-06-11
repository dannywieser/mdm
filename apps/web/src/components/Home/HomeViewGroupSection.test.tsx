import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, test, vi } from "vitest"

import { HomeViewGroupSection } from "./HomeViewGroupSection"

vi.mock("./Home.util", () => ({
  getViewGridColumns: vi.fn(() => 1),
}))

describe("HomeViewGroupSection", () => {
  test("renders heading, divider, and links for grouped views", () => {
    const { container } = render(
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter>
          <HomeViewGroupSection
            group="Library"
            views={[
              {
                component: "NotesList",
                count: 4,
                group: "Library",
                id: "books",
                name: "Books",
                noteIds: ["a", "b", "c", "d"],
              },
              {
                component: "NotesList",
                count: 3,
                group: "Library",
                id: "movies",
                name: "Movies",
                noteIds: ["e", "f", "g"],
              },
            ]}
          />
        </MemoryRouter>
      </ChakraProvider>,
    )

    const heading = screen.getByRole("heading", { name: "Library" })
    const section = heading.parentElement as HTMLElement

    expect(heading).toBeDefined()
    expect(within(section).getByRole("separator")).toBeDefined()
    expect(
      screen.getByRole("link", { name: /books/i }).getAttribute("href"),
    ).toBe("/notes/books")
    expect(
      within(container)
        .getByRole("link", { name: /movies/i })
        .getAttribute("href"),
    ).toBe("/notes/movies")
  })
})
