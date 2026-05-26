import { parseFrontMatter } from "./parseFrontMatter"

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
