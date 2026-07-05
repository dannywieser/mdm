import { describe, expect, test } from "vitest"

import { serializeFrontmatter, serializeNote } from "./serializeNote"

describe("serializeFrontmatter", () => {
  test("serializes string values as key-value lines", () => {
    expect(serializeFrontmatter({ created: "2024-01-01", mood: "calm" })).toBe(
      "---\ncreated: 2024-01-01\nmood: calm\n---",
    )
  })

  test("serializes array values as YAML list items", () => {
    expect(serializeFrontmatter({ tags: ["work", "focus"] })).toBe(
      "---\ntags:\n  - work\n  - focus\n---",
    )
  })
})

describe("serializeNote", () => {
  test("joins the frontmatter block and body with a blank line", () => {
    const contents = serializeNote({
      body: "Hello world.",
      folder: "journal",
      frontmatter: { created: "2024-01-01" },
      modifiedDate: "2024-01-01T12:00:00.000Z",
      title: "2024-01-01",
    })

    expect(contents).toBe("---\ncreated: 2024-01-01\n---\n\nHello world.\n")
  })
})
