import { describe, expect, test } from "vitest"

import { extractFirstImagePath } from "../extractFirstImagePath"

describe("extractFirstImagePath", () => {
  test("returns null when there is no image", () => {
    expect(extractFirstImagePath("# Title\n\nJust some text and a [link](https://example.com).")).toBeNull()
  })

  test("extracts a standard markdown image path", () => {
    expect(extractFirstImagePath("# Title\n\n![alt text](attachments/photo.png)\n")).toBe(
      "attachments/photo.png",
    )
  })

  test("extracts an Obsidian wikilink embed path", () => {
    expect(extractFirstImagePath("# Title\n\n![[photo.png]]\n")).toBe("photo.png")
  })

  test("strips the alias from a wikilink embed", () => {
    expect(extractFirstImagePath("![[photo.png|200]]")).toBe("photo.png")
  })

  test("strips an optional title from a markdown image", () => {
    expect(extractFirstImagePath('![alt](attachments/photo.png "a title")')).toBe(
      "attachments/photo.png",
    )
  })

  test("strips angle brackets around a markdown image path", () => {
    expect(extractFirstImagePath("![alt](<attachments/my photo.png>)")).toBe(
      "attachments/my photo.png",
    )
  })

  test("returns the first image when multiple images are present", () => {
    expect(
      extractFirstImagePath("![[first.png]]\n\nSome text\n\n![alt](second.png)"),
    ).toBe("first.png")
  })

  test("returns the earliest image across both markdown and wikilink syntax", () => {
    expect(
      extractFirstImagePath("![alt](markdown-first.png)\n\n![[wikilink-second.png]]"),
    ).toBe("markdown-first.png")
  })

  test("ignores non-image links", () => {
    expect(extractFirstImagePath("[not an image](file.png)\n\n![alt](actual-image.png)")).toBe(
      "actual-image.png",
    )
  })

  test("returns null for an empty string", () => {
    expect(extractFirstImagePath("")).toBeNull()
  })
})
