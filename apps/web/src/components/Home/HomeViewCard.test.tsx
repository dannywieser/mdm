import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, test, vi } from "vitest"

import { HomeViewCard } from "./HomeViewCard"

vi.mock("./HomeNotesReviewCard", () => ({
  HomeNotesReviewCard: ({ view }: { view: { name: string } }) => (
    <div>notes review card: {view.name}</div>
  ),
}))

describe("HomeViewCard", () => {
  test("renders a link with the view name and count", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter>
          <HomeViewCard
            view={{ component: "NotesList", count: 4, id: "books", name: "Books", noteIds: ["a"] }}
          />
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(screen.getByText("Books")).toBeTruthy()
    expect(screen.getByText("4")).toBeTruthy()
    expect(
      screen.getByRole("link", { name: /books/i }).getAttribute("href"),
    ).toBe("/notes/books")
  })

  test("renders HomeNotesReviewCard for views with the NotesReview component", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter>
          <HomeViewCard
            view={{ component: "NotesReview", count: 4, id: "to-review", name: "To Review", noteIds: ["a"] }}
          />
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(screen.getByText("notes review card: To Review")).toBeTruthy()
  })

  test("renders nothing when the view count is zero", () => {
    const { container } = render(
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter>
          <HomeViewCard
            view={{ component: "NotesList", count: 0, id: "books", name: "Books", noteIds: [] }}
          />
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(container.firstChild).toBeNull()
  })
})
