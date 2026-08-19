import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, test, vi } from "vitest"

afterEach(cleanup)

import { HomeViewGroupSection } from "../HomeViewGroupSection"

vi.mock("../../Home/Home.util", () => ({
  getViewGridColumns: vi.fn(() => 1),
}))

vi.mock("../../HomeViewPreviewCard", () => ({
  HomeViewPreviewCard: ({ view }: { view: { name: string } }) => (
    <div data-testid="preview-card">preview card: {view.name}</div>
  ),
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
    const section = heading.parentElement!

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

  test("renders preview cards for gallery views with dashboardPreview enabled", async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter>
          <HomeViewGroupSection
            group="Downtime"
            views={[
              {
                component: "NotesList",
                count: 4,
                group: "Downtime",
                id: "books",
                name: "Books",
                noteIds: ["a"],
              },
              {
                component: "NotesGallery",
                count: 9,
                dashboardPreview: true,
                group: "Downtime",
                id: "watching",
                name: "Watching",
                noteIds: ["b"],
              },
            ]}
          />
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(
      await screen.findByText("preview card: Watching"),
    ).toBeDefined()
    expect(screen.getByRole("link", { name: /books/i })).toBeDefined()
  })
})
