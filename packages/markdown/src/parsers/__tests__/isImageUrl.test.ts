import { describe, expect, test } from "vitest"

import { isImageUrl } from "../isImageUrl"

describe("isImageUrl", () => {
  test.each([
    "photo.jpg",
    "photo.jpeg",
    "photo.png",
    "photo.gif",
    "photo.webp",
    "photo.svg",
    "photo.bmp",
    "photo.avif",
    "photo.ico",
    "photo.tif",
    "photo.tiff",
  ])("returns true for a %s path", (path) => {
    expect(isImageUrl(path)).toBe(true)
  })

  test("returns true for an absolute image URL", () => {
    expect(isImageUrl("https://images.dgwlab.net/i/3h6HmH.jpg")).toBe(true)
  })

  test("returns true when a query string follows the extension", () => {
    expect(isImageUrl("https://example.com/photo.png?w=800")).toBe(true)
  })

  test("returns true when a fragment follows the extension", () => {
    expect(isImageUrl("photo.png#preview")).toBe(true)
  })

  test("is case-insensitive", () => {
    expect(isImageUrl("PHOTO.JPG")).toBe(true)
  })

  test("returns false for a non-image extension", () => {
    expect(isImageUrl("https://example.com/page.html")).toBe(false)
  })

  test("returns false for a URL with no extension", () => {
    expect(isImageUrl("https://example.com/article")).toBe(false)
  })

  test("returns false for an empty string", () => {
    expect(isImageUrl("")).toBe(false)
  })
})
