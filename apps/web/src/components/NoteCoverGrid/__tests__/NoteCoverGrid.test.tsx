import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

afterEach(cleanup)

vi.mock("../../NoteBadges", () => ({
  NoteBadges: ({ badges }: { badges: string[] }) => (
    <div data-testid="note-badges">{badges.join(",")}</div>
  ),
}))

import { NoteCoverGrid } from "../NoteCoverGrid"
import { filterNotesWithCovers, getCoverSrc } from "../NoteCoverGrid.util"

const noteWithCover = {
  id: "1",
  title: "With Cover",
  obsidianUrl: "obsidian://open?vault=v&file=1",
  frontmatter: { cover: "https://example.com/cover.jpg" },
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

  test("uses the first element when cover is an array", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NoteCoverGrid
          notes={[
            {
              id: "1",
              title: "Array Cover",
              obsidianUrl: "obsidian://open?vault=v&file=1",
              frontmatter: {
                cover: ["https://example.com/first.jpg", "https://example.com/second.jpg"],
              },
            } as never,
          ]}
        />
      </ChakraProvider>,
    )

    const img = screen.getByRole("img", { name: "Array Cover" })
    expect(img.getAttribute("src")).toBe(
      `/images?path=${encodeURIComponent("https://example.com/first.jpg")}`,
    )
  })

  test("applies a default aspect ratio to the image placeholder when none is configured", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NoteCoverGrid notes={[noteWithCover]} />
      </ChakraProvider>,
    )

    const skeleton = screen.getByTestId("fade-image-skeleton")
    expect(getComputedStyle(skeleton.parentElement!).aspectRatio).toBe("3/4")
  })

  test("uses a configured aspect ratio for the image placeholder", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NoteCoverGrid aspectRatio="16/9" notes={[noteWithCover]} />
      </ChakraProvider>,
    )

    const skeleton = screen.getByTestId("fade-image-skeleton")
    expect(getComputedStyle(skeleton.parentElement!).aspectRatio).toBe("16/9")
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
})

describe("getCoverSrc", () => {
  test("builds a proxy URL from a string cover", () => {
    expect(getCoverSrc("attachments/cover.jpg")).toBe(
      `/images?path=${encodeURIComponent("attachments/cover.jpg")}`,
    )
  })

  test("uses the first element of an array cover", () => {
    expect(getCoverSrc(["attachments/first.jpg", "attachments/second.jpg"])).toBe(
      `/images?path=${encodeURIComponent("attachments/first.jpg")}`,
    )
  })

  test("strips surrounding quotes from the cover path", () => {
    expect(getCoverSrc('"attachments/cover.jpg"')).toBe(
      `/images?path=${encodeURIComponent("attachments/cover.jpg")}`,
    )
  })
})

describe("filterNotesWithCovers", () => {
  const note = (cover: unknown) => ({ id: "1", frontmatter: cover !== undefined ? { cover } : {} }) as never

  test("includes notes with a string cover", () => {
    expect(filterNotesWithCovers([note("attachments/cover.jpg")])).toHaveLength(1)
  })

  test("includes notes with a non-empty array cover", () => {
    expect(filterNotesWithCovers([note(["attachments/cover.jpg"])])).toHaveLength(1)
  })

  test("excludes notes with no cover field", () => {
    expect(filterNotesWithCovers([note(undefined)])).toHaveLength(0)
  })

  test("excludes notes with an empty string cover", () => {
    expect(filterNotesWithCovers([note("")])).toHaveLength(0)
  })

  test("excludes notes with an empty array cover", () => {
    expect(filterNotesWithCovers([note([])])).toHaveLength(0)
  })

  test("excludes notes with an array whose first element is empty", () => {
    expect(filterNotesWithCovers([note([""])])).toHaveLength(0)
  })
})
