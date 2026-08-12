import { describe, expect, test } from "vitest"

import { resolveFrontmatterImages } from "../resolveFrontmatterImages"

describe("resolveFrontmatterImages", () => {
  test("adds an images array derived from the body", () => {
    expect(
      resolveFrontmatterImages(null, "![alt](photo.jpg)", "folder/note.md", ""),
    ).toEqual({ images: ["folder/note/photo.jpg"] })
  })

  test("collects every image found in the body, in order", () => {
    expect(
      resolveFrontmatterImages(
        { topic: ["games"] },
        "![[first.png]]\n\nSome text\n\n![alt](second.png)",
        "games/note.md",
        "",
      ),
    ).toEqual({ topic: ["games"], images: ["games/note/first.png", "games/note/second.png"] })
  })

  test("includes a plain link pointing at an image url", () => {
    expect(
      resolveFrontmatterImages(null, "[3h6HmH](https://images.dgwlab.net/i/3h6HmH.jpg)", "note.md", ""),
    ).toEqual({ images: ["https://images.dgwlab.net/i/3h6HmH.jpg"] })
  })

  test("leaves an external image url unchanged", () => {
    expect(
      resolveFrontmatterImages(null, "![alt](https://example.com/cover.png)", "games/note.md", ""),
    ).toEqual({ images: ["https://example.com/cover.png"] })
  })

  test("ignores any pre-existing images value and derives it from the body", () => {
    expect(
      resolveFrontmatterImages(
        { images: ["manually-set.png"] },
        "![alt](body-image.png)",
        "games/note.md",
        "",
      ),
    ).toEqual({ images: ["games/note/body-image.png"] })
  })

  test("strips a stale images value from frontmatter when the body no longer has images", () => {
    expect(
      resolveFrontmatterImages({ images: ["stale.png"], topic: ["games"] }, "Just text.", "note.md", ""),
    ).toEqual({ topic: ["games"] })
  })

  test("returns null when only a stale images value remains and the body has no images", () => {
    expect(resolveFrontmatterImages({ images: ["stale.png"] }, "Just text.", "note.md", "")).toBeNull()
  })

  test("returns null when there is no frontmatter and no images", () => {
    expect(resolveFrontmatterImages(null, "Just text.", "note.md", "")).toBeNull()
  })
})
