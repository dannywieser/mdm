import { describe, expect, test } from "vitest"

import { extractImagePaths } from "../extractImagePaths"

describe("extractImagePaths", () => {
  test("returns an empty array when there is no image", () => {
    expect(extractImagePaths("# Title\n\nJust some text and a [link](https://example.com).")).toEqual([])
  })

  test("extracts a standard markdown image path", () => {
    expect(extractImagePaths("# Title\n\n![alt text](attachments/photo.png)\n")).toEqual([
      "attachments/photo.png",
    ])
  })

  test("extracts an Obsidian wikilink embed path", () => {
    expect(extractImagePaths("# Title\n\n![[photo.png]]\n")).toEqual(["photo.png"])
  })

  test("strips the alias from a wikilink embed", () => {
    expect(extractImagePaths("![[photo.png|200]]")).toEqual(["photo.png"])
  })

  test("strips an optional title from a markdown image", () => {
    expect(extractImagePaths('![alt](attachments/photo.png "a title")')).toEqual([
      "attachments/photo.png",
    ])
  })

  test("strips angle brackets around a markdown image path", () => {
    expect(extractImagePaths("![alt](<attachments/my photo.png>)")).toEqual([
      "attachments/my photo.png",
    ])
  })

  test("handles an angle-bracketed path containing parentheses", () => {
    expect(extractImagePaths("![alt](<attachments/image_(1).png>)")).toEqual([
      "attachments/image_(1).png",
    ])
  })

  test("handles a bare (non-bracketed) path containing parentheses", () => {
    expect(extractImagePaths("![alt](attachments/image_(1).png)")).toEqual([
      "attachments/image_(1).png",
    ])
  })

  test("strips a title from an angle-bracketed path that contains spaces", () => {
    expect(extractImagePaths('![alt](<attachments/my photo.png> "a title")')).toEqual([
      "attachments/my photo.png",
    ])
  })

  test("returns every image in document order across both markdown and wikilink syntax", () => {
    expect(
      extractImagePaths("![alt](markdown-first.png)\n\n![[wikilink-second.png]]\n\n![alt](markdown-third.png)"),
    ).toEqual(["markdown-first.png", "wikilink-second.png", "markdown-third.png"])
  })

  test("deduplicates repeated images, keeping the first occurrence", () => {
    expect(
      extractImagePaths("![[photo.png]]\n\nSome text\n\n![alt](photo.png)"),
    ).toEqual(["photo.png"])
  })

  test("ignores non-image links", () => {
    expect(extractImagePaths("[not an image](file.png)\n\n![alt](actual-image.png)")).toEqual([
      "actual-image.png",
    ])
  })

  test("returns an empty array for an empty string", () => {
    expect(extractImagePaths("")).toEqual([])
  })
})
