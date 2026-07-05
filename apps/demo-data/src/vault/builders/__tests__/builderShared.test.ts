import { describe, expect, test } from "vitest"

import { createRandom } from "../../random/random"
import {
  buildCover,
  randomDateBefore,
  slugify,
  toModifiedTimestamp,
} from "../builderShared"

describe("slugify", () => {
  test("lowercases and replaces non-alphanumeric runs with hyphens", () => {
    expect(slugify("The Glass Cartographer!")).toBe("the-glass-cartographer")
  })

  test("trims leading and trailing hyphens", () => {
    expect(slugify("  Hello  ")).toBe("hello")
  })
})

describe("toModifiedTimestamp", () => {
  test("builds an ISO timestamp on the given day", () => {
    const timestamp = toModifiedTimestamp("2024-03-15", createRandom(1))

    expect(timestamp).toMatch(/^2024-03-15T(0[89]|1\d|2[01]):[0-5]\d:00\.000Z$/)
  })
})

describe("randomDateBefore", () => {
  test("stays within the trailing window", () => {
    const random = createRandom(2)

    for (let index = 0; index < 50; index += 1) {
      const date = randomDateBefore("2024-03-15", 10, random)
      expect(date >= "2024-03-06").toBe(true)
      expect(date <= "2024-03-15").toBe(true)
    }
  })
})

describe("buildCover", () => {
  test("returns an attachment whose path matches the cover frontmatter", () => {
    const { attachment, coverPath } = buildCover(
      "book",
      "The Glass Cartographer",
      "2024-03-15T10:00:00.000Z",
      createRandom(3),
    )

    expect(coverPath).toBe("attachments/covers/books/the-glass-cartographer.svg")
    expect(attachment.relativePath).toBe(coverPath)
    expect(attachment.contents).toContain("<svg")
    expect(attachment.modifiedDate).toBe("2024-03-15T10:00:00.000Z")
  })
})
