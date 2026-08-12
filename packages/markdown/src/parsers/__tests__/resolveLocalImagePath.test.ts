import { describe, expect, test } from "vitest"

import { resolveLocalImagePath } from "../resolveLocalImagePath"

describe("resolveLocalImagePath", () => {
  test("resolves a bare filename into the note's attachment folder", () => {
    expect(resolveLocalImagePath("photo.jpg", "folder/file-name.md")).toBe(
      "folder/file-name/photo.jpg",
    )
  })

  test("resolves a bare filename at the vault root", () => {
    expect(resolveLocalImagePath("photo.jpg", "root-note.md")).toBe("root-note/photo.jpg")
  })

  test("prepends attachmentsDirectory to a bare filename", () => {
    expect(resolveLocalImagePath("photo.jpg", "folder/file-name.md", "attachments")).toBe(
      "attachments/folder/file-name/photo.jpg",
    )
  })

  test("resolves a relative path against the note's directory", () => {
    expect(resolveLocalImagePath("./assets/photo.png", "daily/journal.md")).toBe(
      "daily/assets/photo.png",
    )
  })

  test("passes through a path that already has directory components", () => {
    expect(resolveLocalImagePath("attachments/daily/journal/cover.jpg", "daily/journal.md")).toBe(
      "attachments/daily/journal/cover.jpg",
    )
  })

  test("strips leading slashes from an absolute-looking path", () => {
    expect(resolveLocalImagePath("/attachments/cover.jpg", "daily/journal.md")).toBe(
      "attachments/cover.jpg",
    )
  })

  test("returns null for an external url", () => {
    expect(resolveLocalImagePath("https://example.com/image.png", "note.md")).toBeNull()
  })

  test("returns null for a path that would traverse outside the vault", () => {
    expect(resolveLocalImagePath("../../outside.png", "note.md")).toBeNull()
  })

  test("returns null for an empty path", () => {
    expect(resolveLocalImagePath("", "note.md")).toBeNull()
  })

  test("strips a query string or fragment before resolving", () => {
    expect(resolveLocalImagePath("photo.jpg?w=800", "note.md")).toBe("note/photo.jpg")
  })
})
