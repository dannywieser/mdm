import { parseFrontMatter, resolveObsidianFrontmatterValue } from "./parseFrontMatter"

describe("resolveObsidianFrontmatterValue", () => {
  test("returns plain values unchanged", () => {
    expect(resolveObsidianFrontmatterValue("2026.05.26")).toBe("2026.05.26")
  })

  test("resolves an unquoted wikilink", () => {
    expect(resolveObsidianFrontmatterValue("[[attachments/cover.jpg]]")).toBe("attachments/cover.jpg")
  })

  test("resolves a quoted wikilink", () => {
    expect(resolveObsidianFrontmatterValue('"[[attachments/cover.jpg]]"')).toBe("attachments/cover.jpg")
  })

  test("resolves a wikilink with an alias, discarding the alias", () => {
    expect(resolveObsidianFrontmatterValue("[[attachments/cover.jpg|My Image]]")).toBe("attachments/cover.jpg")
  })

  test("resolves a wikilink with spaces in the path", () => {
    expect(resolveObsidianFrontmatterValue('"[[attachments/The Faith of Beasts/cover.jpg]]"')).toBe(
      "attachments/The Faith of Beasts/cover.jpg"
    )
  })
})

describe("parseFrontMatter", () => {
  test("returns null frontmatter when no leading block exists", () => {
    expect(parseFrontMatter("# Welcome\n\nBody.")).toEqual({
      body: "# Welcome\n\nBody.",
      frontmatter: null
    })
  })

  test("parses scalar and list values from frontmatter", () => {
    expect(
      parseFrontMatter(`---
topic:
  - AI
  - Notes
created: 2026.05.26
---
# Welcome

Body.`)
    ).toEqual({
      body: "# Welcome\n\nBody.",
      frontmatter: {
        created: "2026.05.26",
        topic: ["AI", "Notes"]
      }
    })
  })

  test("supports frontmatter with crlf line endings", () => {
    expect(
      parseFrontMatter("---\r\ntopic:\r\n  - AI\r\n---\r\n# Welcome\r\n\r\nBody.")
    ).toEqual({
      body: "# Welcome\n\nBody.",
      frontmatter: {
        topic: ["AI"]
      }
    })
  })

  test("resolves obsidian wikilink values in frontmatter", () => {
    expect(
      parseFrontMatter(`---
cover: "[[attachments/downtime/The Faith of Beasts/cover.jpg]]"
---
Body.`)
    ).toEqual({
      body: "Body.",
      frontmatter: {
        cover: "attachments/downtime/The Faith of Beasts/cover.jpg"
      }
    })
  })

  test("returns null frontmatter when the closing delimiter is missing", () => {
    expect(
      parseFrontMatter(`---
topic:
  - AI`)
    ).toEqual({
      body: "---\ntopic:\n  - AI",
      frontmatter: null
    })
  })
})
