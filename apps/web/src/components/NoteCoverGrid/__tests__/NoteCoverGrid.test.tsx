import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { act, cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

afterEach(cleanup)

vi.mock("../../NoteBadges", () => ({
  NoteBadges: ({ badges }: { badges: string[] }) => (
    <div data-testid="note-badges">{badges.join(",")}</div>
  ),
}))

import { NoteCoverGrid } from "../NoteCoverGrid"
import { filterNotesWithCovers, getImageSrc } from "../NoteCoverGrid.util"

const noteWithCover = {
  id: "1",
  title: "With Cover",
  obsidianUrl: "obsidian://open?vault=v&file=1",
  frontmatter: { images: ["https://example.com/cover.jpg"] },
} as never

describe("NoteCoverGrid", () => {
  test("renders a card for each note in a masonry grid", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NoteCoverGrid notes={[noteWithCover]} />
      </ChakraProvider>,
    )

    expect(screen.getByTestId("gallery-grid")).toBeTruthy()
    expect(screen.getByText("With Cover")).toBeTruthy()
  })

  test("uses the first image when a note has multiple images", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NoteCoverGrid
          notes={[
            {
              id: "1",
              title: "Multiple Images",
              obsidianUrl: "obsidian://open?vault=v&file=1",
              frontmatter: {
                images: ["https://example.com/first.jpg", "https://example.com/second.jpg"],
              },
            } as never,
          ]}
        />
      </ChakraProvider>,
    )

    const img = screen.getByRole("img", { name: "Multiple Images" })
    expect(img.getAttribute("src")).toBe(
      `/images?path=${encodeURIComponent("https://example.com/first.jpg")}`,
    )
  })

  test("applies a fixed aspect ratio to the image placeholder", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NoteCoverGrid notes={[noteWithCover]} />
      </ChakraProvider>,
    )

    const skeleton = screen.getByTestId("fade-image-skeleton")
    expect(getComputedStyle(skeleton.parentElement!).aspectRatio).toBe("3/4")
  })

  test("renders NoteBadges with configured badges", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NoteCoverGrid badges={["frontmatter.genre", "frontmatter.status"]} notes={[noteWithCover]} />
      </ChakraProvider>,
    )

    expect(screen.getAllByTestId("note-badges").length).toBeGreaterThan(0)
    expect(screen.getAllByText("frontmatter.genre,frontmatter.status").length).toBeGreaterThan(0)
  })

  describe("image rotation", () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    test("rotates to the next image every 10 seconds", () => {
      render(
        <ChakraProvider value={defaultSystem}>
          <NoteCoverGrid
            notes={[
              {
                id: "1",
                title: "Multiple Images",
                obsidianUrl: "obsidian://open?vault=v&file=1",
                frontmatter: {
                  images: ["https://example.com/first.jpg", "https://example.com/second.jpg"],
                },
              } as never,
            ]}
          />
        </ChakraProvider>,
      )

      act(() => {
        vi.advanceTimersByTime(10000)
      })

      const img = screen.getByRole("img", { name: "Multiple Images" })
      expect(img.getAttribute("src")).toBe(
        `/images?path=${encodeURIComponent("https://example.com/second.jpg")}`,
      )
    })

    test("does not rotate when there is only one image", () => {
      render(
        <ChakraProvider value={defaultSystem}>
          <NoteCoverGrid notes={[noteWithCover]} />
        </ChakraProvider>,
      )

      act(() => {
        vi.advanceTimersByTime(30000)
      })

      const img = screen.getByRole("img", { name: "With Cover" })
      expect(img.getAttribute("src")).toBe(
        `/images?path=${encodeURIComponent("https://example.com/cover.jpg")}`,
      )
    })
  })
})

describe("getImageSrc", () => {
  test("builds a proxy URL from an image path", () => {
    expect(getImageSrc("attachments/cover.jpg")).toBe(
      `/images?path=${encodeURIComponent("attachments/cover.jpg")}`,
    )
  })
})

describe("filterNotesWithCovers", () => {
  const note = (images: unknown) => ({ id: "1", frontmatter: images !== undefined ? { images } : {} }) as never

  test("includes notes with a non-empty images array", () => {
    expect(filterNotesWithCovers([note(["attachments/cover.jpg"])])).toHaveLength(1)
  })

  test("includes notes with a single string image value", () => {
    expect(filterNotesWithCovers([note("attachments/cover.jpg")])).toHaveLength(1)
  })

  test("excludes notes with no images field", () => {
    expect(filterNotesWithCovers([note(undefined)])).toHaveLength(0)
  })

  test("excludes notes with an empty images array", () => {
    expect(filterNotesWithCovers([note([])])).toHaveLength(0)
  })

  test("excludes notes with an empty string image value", () => {
    expect(filterNotesWithCovers([note("")])).toHaveLength(0)
  })
})
