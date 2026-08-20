import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import type { Note } from "markdown"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, test, vi } from "vitest"

vi.mock("../NotePhotoPile.util", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../NotePhotoPile.util")>()

  return {
    ...actual,
    buildPhotoTransform: vi.fn(() => "translate(1px, 2px) rotate(3deg)"),
    getPileMaxWidthPx: vi.fn(() => 360),
    getPhotoPlacement: vi.fn(() => ({
      left: "42px",
      offsetX: 1,
      offsetY: 2,
      rotation: 3,
      zIndex: 7,
    })),
  }
})

import { NotePhotoPile } from "../NotePhotoPile"
import {
  buildPhotoTransform,
  getPhotoPlacement,
  getPileMaxWidthPx,
} from "../NotePhotoPile.util"

afterEach(cleanup)

const note = (id: string, title: string): Note =>
  ({
    id,
    title,
    obsidianUrl: `obsidian://open?vault=v&file=${id}`,
    frontmatter: { images: [`https://example.com/${id}.jpg`] },
  }) as never

const renderPile = (notes: Note[]) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter>
        <NotePhotoPile notes={notes} />
      </MemoryRouter>
    </ChakraProvider>,
  )

describe("NotePhotoPile", () => {
  test("renders a print for every note", () => {
    renderPile([note("1", "First"), note("2", "Second")])

    expect(screen.getByTestId("photo-pile")).toBeTruthy()
    expect(screen.getAllByRole("link")).toHaveLength(2)
  })

  test("caps the pile at the width its print count needs", () => {
    renderPile([note("1", "First"), note("2", "Second")])

    expect(vi.mocked(getPileMaxWidthPx)).toHaveBeenCalledWith(2)
    expect(getComputedStyle(screen.getByTestId("photo-pile")).maxWidth).toBe("360px")
  })

  test("places each print with the placement returned for its note", () => {
    renderPile([note("1", "First"), note("2", "Second")])

    expect(vi.mocked(getPhotoPlacement).mock.calls).toEqual([
      [{ count: 2, index: 0, noteId: "1" }],
      [{ count: 2, index: 1, noteId: "2" }],
    ])
  })

  test("applies the placement's left, stacking order and transform to the print", () => {
    renderPile([note("1", "First")])

    const print = screen.getByRole("link")
    const style = getComputedStyle(print)
    expect(style.left).toBe("42px")
    expect(style.zIndex).toBe("7")
    expect(style.transform).toBe("translate(1px, 2px) rotate(3deg)")
    expect(vi.mocked(buildPhotoTransform)).toHaveBeenCalled()
  })

  test("gives each print square corners and a white border", () => {
    renderPile([note("1", "First")])

    const style = getComputedStyle(screen.getByRole("link"))
    expect(style.borderRadius).toBe("0")
    expect(style.borderColor).toBe("rgb(255, 255, 255)")
    expect(style.borderWidth).toBe("4px")
  })

  test("renders the note's first image with its title as alt text", () => {
    renderPile([note("1", "First")])

    const img = screen.getByRole("img", { name: "First" })
    expect(img.getAttribute("src")).toBe("https://example.com/1.jpg")
  })

  test("renders an empty pile when there are no notes", () => {
    renderPile([])

    expect(screen.getByTestId("photo-pile")).toBeTruthy()
    expect(screen.queryAllByRole("link")).toHaveLength(0)
  })
})
