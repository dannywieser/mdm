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
import { filterNotesWithImages, getImageSrc } from "../NoteCoverGrid.util"

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
    expect(img.getAttribute("src")).toBe("https://example.com/first.jpg")
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
      expect(img.getAttribute("src")).toBe("https://example.com/second.jpg")
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
      expect(img.getAttribute("src")).toBe("https://example.com/cover.jpg")
    })

    test("uses a single shared timer no matter how many cards are rendered", () => {
      const setIntervalSpy = vi.spyOn(global, "setInterval")

      render(
        <ChakraProvider value={defaultSystem}>
          <NoteCoverGrid
            notes={[
              {
                id: "1",
                title: "First",
                obsidianUrl: "obsidian://open?vault=v&file=1",
                frontmatter: { images: ["https://example.com/a1.jpg", "https://example.com/a2.jpg"] },
              },
              {
                id: "2",
                title: "Second",
                obsidianUrl: "obsidian://open?vault=v&file=2",
                frontmatter: { images: ["https://example.com/b1.jpg", "https://example.com/b2.jpg"] },
              },
              {
                id: "3",
                title: "Third",
                obsidianUrl: "obsidian://open?vault=v&file=3",
                frontmatter: { images: ["https://example.com/c1.jpg", "https://example.com/c2.jpg"] },
              },
            ] as never}
          />
        </ChakraProvider>,
      )

      expect(setIntervalSpy).toHaveBeenCalledTimes(1)
      setIntervalSpy.mockRestore()
    })

    test("rotates cards with different image counts from the same shared tick", () => {
      render(
        <ChakraProvider value={defaultSystem}>
          <NoteCoverGrid
            notes={[
              {
                id: "1",
                title: "Two Images",
                obsidianUrl: "obsidian://open?vault=v&file=1",
                frontmatter: { images: ["https://example.com/a1.jpg", "https://example.com/a2.jpg"] },
              },
              {
                id: "2",
                title: "Three Images",
                obsidianUrl: "obsidian://open?vault=v&file=2",
                frontmatter: {
                  images: [
                    "https://example.com/b1.jpg",
                    "https://example.com/b2.jpg",
                    "https://example.com/b3.jpg",
                  ],
                },
              },
            ] as never}
          />
        </ChakraProvider>,
      )

      act(() => {
        vi.advanceTimersByTime(20000)
      })

      // Shared tick is 2: card with 2 images shows index 2 % 2 = 0 (back to first);
      // card with 3 images shows index 2 % 3 = 2 (third).
      expect(screen.getByRole("img", { name: "Two Images" }).getAttribute("src")).toBe(
        "https://example.com/a1.jpg",
      )
      expect(screen.getByRole("img", { name: "Three Images" }).getAttribute("src")).toBe(
        "https://example.com/b3.jpg",
      )
    })
  })
})

describe("getImageSrc", () => {
  test("builds a proxy URL from a local image path", () => {
    expect(getImageSrc("attachments/cover.jpg")).toBe(
      `/images?path=${encodeURIComponent("attachments/cover.jpg")}`,
    )
  })

  test("returns an external image URL unchanged, bypassing the proxy", () => {
    expect(getImageSrc("https://example.com/cover.jpg")).toBe("https://example.com/cover.jpg")
  })
})

describe("filterNotesWithImages", () => {
  const note = (images: unknown) => ({ id: "1", frontmatter: images !== undefined ? { images } : {} }) as never

  test("includes notes with a non-empty images array", () => {
    expect(filterNotesWithImages([note(["attachments/cover.jpg"])])).toHaveLength(1)
  })

  test("includes notes with a single string image value", () => {
    expect(filterNotesWithImages([note("attachments/cover.jpg")])).toHaveLength(1)
  })

  test("excludes notes with no images field", () => {
    expect(filterNotesWithImages([note(undefined)])).toHaveLength(0)
  })

  test("excludes notes with an empty images array", () => {
    expect(filterNotesWithImages([note([])])).toHaveLength(0)
  })

  test("excludes notes with an empty string image value", () => {
    expect(filterNotesWithImages([note("")])).toHaveLength(0)
  })
})
