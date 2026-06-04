import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { NotesGallery } from "./NotesGallery"

const useNotesQueryMock = vi.fn()

vi.mock("../../hooks/useNotesQuery/useNotesQuery", () => ({
  useNotesQuery: () => useNotesQueryMock(),
}))

vi.mock("../LoadingScreen/LoadingScreen", () => ({
  LoadingScreen: () => <div data-testid="loading-screen" />,
}))

describe("NotesGallery", () => {
  test("renders the loading screen while fetching", () => {
    useNotesQueryMock.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    })

    render(
      <ChakraProvider value={defaultSystem}>
        <NotesGallery />
      </ChakraProvider>,
    )

    expect(screen.getByTestId("loading-screen")).toBeTruthy()
  })

  test("renders an error state", () => {
    useNotesQueryMock.mockReturnValue({
      data: undefined,
      error: new Error("Request failed"),
      isLoading: false,
    })

    render(
      <ChakraProvider value={defaultSystem}>
        <NotesGallery />
      </ChakraProvider>,
    )

    expect(screen.getByText("notes.errorTitle")).toBeTruthy()
    expect(screen.getByText("Request failed")).toBeTruthy()
  })

  test("renders only notes that have a cover image", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          {
            id: "1",
            title: "With Cover",
            obsidianUrl: "obsidian://open?vault=v&file=1",
            frontmatter: { cover: "https://example.com/cover.jpg" },
          },
          {
            id: "2",
            title: "No Cover",
            obsidianUrl: "obsidian://open?vault=v&file=2",
            frontmatter: {},
          },
        ],
      },
      error: undefined,
      isLoading: false,
    })

    render(
      <ChakraProvider value={defaultSystem}>
        <NotesGallery />
      </ChakraProvider>,
    )

    expect(screen.getByText("With Cover")).toBeTruthy()
    expect(screen.queryByText("No Cover")).toBeNull()
  })

  test("uses the first element when cover is an array", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          {
            id: "1",
            title: "Array Cover",
            obsidianUrl: "obsidian://open?vault=v&file=1",
            frontmatter: {
              cover: ["https://example.com/first.jpg", "https://example.com/second.jpg"],
            },
          },
        ],
      },
      error: undefined,
      isLoading: false,
    })

    render(
      <ChakraProvider value={defaultSystem}>
        <NotesGallery />
      </ChakraProvider>,
    )

    const img = screen.getByRole("img", { name: "Array Cover" })
    expect(img.getAttribute("src")).toBe("https://example.com/first.jpg")
  })
})
