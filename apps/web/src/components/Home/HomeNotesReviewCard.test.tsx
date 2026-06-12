import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, test, vi } from "vitest"

import { HomeNotesReviewCard } from "./HomeNotesReviewCard"

const useQueriesMock = vi.fn()

vi.mock("../../hooks/useIsRead/useIsRead", () => ({
  fetchIsRead: vi.fn(),
}))

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>()
  return { ...actual, useQueries: () => useQueriesMock() }
})

const renderCard = (noteIds: string[]) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter>
        <HomeNotesReviewCard
          view={{
            component: "NotesReview",
            count: noteIds.length,
            id: "to-review",
            name: "To Review",
            noteIds,
          }}
        />
      </MemoryRouter>
    </ChakraProvider>,
  )

describe("HomeNotesReviewCard", () => {
  afterEach(() => {
    cleanup()
  })

  test("shows the count of unread notes out of the total", () => {
    useQueriesMock.mockReturnValue([
      { data: false, status: "success" },
      { data: false, status: "success" },
    ])

    renderCard(["a", "b"])

    expect(screen.getByText("To Review")).toBeTruthy()
    expect(screen.getByText("0/2")).toBeTruthy()
    expect(screen.queryByLabelText("review complete")).toBeNull()
  })

  test("shows progress as notes are read", () => {
    useQueriesMock.mockReturnValue([
      { data: true, status: "success" },
      { data: false, status: "success" },
    ])

    renderCard(["a", "b"])

    expect(screen.getByText("1/2")).toBeTruthy()
    expect(screen.queryByLabelText("review complete")).toBeNull()
  })

  test("shows a completion check when all notes are read", () => {
    useQueriesMock.mockReturnValue([
      { data: true, status: "success" },
      { data: true, status: "success" },
    ])

    renderCard(["a", "b"])

    expect(screen.getByText("2/2")).toBeTruthy()
    expect(screen.getByLabelText("review complete")).toBeTruthy()
  })

  test("links to the view's notes page", () => {
    useQueriesMock.mockReturnValue([{ data: false, status: "success" }])

    renderCard(["a"])

    expect(
      screen.getByRole("link", { name: /to review/i }).getAttribute("href"),
    ).toBe("/notes/to-review")
  })
})
