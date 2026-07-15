import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { configureDemoMode, resetDemoMode } from "services"
import { afterEach, describe, expect, test, vi } from "vitest"

afterEach(() => {
  cleanup()
  resetDemoMode()
})

vi.mock("../../NoteBadges", () => ({
  NoteBadges: ({ badges }: { badges: string[] }) => (
    <div data-testid="note-badges">{badges.join(",")}</div>
  ),
}))

import { NoteCoverGrid } from "../NoteCoverGrid"
import { filterNotesWithImages, getImageSrc, getNoteImagePaths } from "../NoteCoverGrid.util"

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

  test("omits the src attribute instead of rendering a disallowed image scheme", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NoteCoverGrid
          notes={[
            {
              id: "1",
              title: "Bad Scheme",
              obsidianUrl: "obsidian://open?vault=v&file=1",
              frontmatter: { images: ["javascript:alert(1)"] },
            } as never,
          ]}
        />
      </ChakraProvider>,
    )

    const img = screen.getByRole("img", { name: "Bad Scheme" })
    expect(img.hasAttribute("src")).toBe(false)
  })

  test("links the card to the note's obsidianUrl outside of demo mode", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter>
          <NoteCoverGrid notes={[noteWithCover]} />
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(screen.getByRole("link").getAttribute("href")).toBe("obsidian://open?vault=v&file=1")
  })

  test("links the card to the in-app note source route in demo mode", () => {
    configureDemoMode({ dataBasePath: "/demo-data" })
    render(
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter>
          <NoteCoverGrid notes={[noteWithCover]} />
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(screen.getByRole("link").getAttribute("href")).toBe("/source/1")
  })
})

describe("getNoteImagePaths", () => {
  const note = (images: unknown) => ({ id: "1", frontmatter: { images } }) as never

  test("strips surrounding whitespace around a quoted value", () => {
    expect(getNoteImagePaths(note([' "https://example.com/cover.jpg" ']))).toEqual([
      "https://example.com/cover.jpg",
    ])
  })

  test("strips surrounding whitespace inside quotes", () => {
    expect(getNoteImagePaths(note(['" https://example.com/cover.jpg "']))).toEqual([
      "https://example.com/cover.jpg",
    ])
  })

  test("strips surrounding whitespace around an unquoted value", () => {
    expect(getNoteImagePaths(note(["  attachments/cover.jpg  "]))).toEqual([
      "attachments/cover.jpg",
    ])
  })
})

describe("getImageSrc", () => {
  test("builds a proxy URL from a local image path", () => {
    expect(getImageSrc("attachments/cover.jpg")).toBe(
      `/images?path=${encodeURIComponent("attachments/cover.jpg")}`,
    )
  })

  test("returns an https image URL unchanged, bypassing the proxy", () => {
    expect(getImageSrc("https://example.com/cover.jpg")).toBe("https://example.com/cover.jpg")
  })

  test("returns an http image URL unchanged, bypassing the proxy", () => {
    expect(getImageSrc("http://example.com/cover.jpg")).toBe("http://example.com/cover.jpg")
  })

  test("returns a protocol-relative image URL unchanged, bypassing the proxy", () => {
    expect(getImageSrc("//example.com/cover.jpg")).toBe("//example.com/cover.jpg")
  })

  test("returns an empty string for a javascript: URL instead of rendering it", () => {
    expect(getImageSrc("javascript:alert(1)")).toBe("")
  })

  test("returns an empty string for a data: URL instead of rendering it", () => {
    expect(getImageSrc("data:image/png;base64,abc123")).toBe("")
  })

  test("returns an empty string for an obsidian: URL instead of rendering it", () => {
    expect(getImageSrc("obsidian://open?vault=v&file=note")).toBe("")
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
