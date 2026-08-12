import type { MarkdownNode } from "markdown"
import { describe, expect, test } from "vitest"

import { noteContentStartsWithH1 } from "../NotesReviewContent.util"

const buildContent = (children: MarkdownNode[]): MarkdownNode => ({
  children,
  type: "root",
})

describe("noteContentStartsWithH1", () => {
  test("returns true when the first child is a depth-1 heading", () => {
    const content = buildContent([
      { children: [{ type: "text", value: "Title" }], depth: 1, type: "heading" },
      { children: [{ type: "text", value: "Body" }], type: "paragraph" },
    ])

    expect(noteContentStartsWithH1(content)).toBe(true)
  })

  test("returns false when the first child is a heading of a different depth", () => {
    const content = buildContent([
      { children: [{ type: "text", value: "Subtitle" }], depth: 2, type: "heading" },
    ])

    expect(noteContentStartsWithH1(content)).toBe(false)
  })

  test("returns false when the first child is not a heading", () => {
    const content = buildContent([
      { children: [{ type: "text", value: "Body" }], type: "paragraph" },
    ])

    expect(noteContentStartsWithH1(content)).toBe(false)
  })

  test("returns false when content has no children", () => {
    const content = buildContent([])

    expect(noteContentStartsWithH1(content)).toBe(false)
  })

  test("returns false when content is undefined", () => {
    expect(noteContentStartsWithH1(undefined)).toBe(false)
  })
})
