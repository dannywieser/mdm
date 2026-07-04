import { extractNoteDates } from "./extractNoteDates"

describe("extractNoteDates", () => {
  test("extracts a date found in the title", () => {
    expect(extractNoteDates("2026.05.27 Weekly Review", "", ["YYYY.MM.DD"])).toEqual([
      "2026.05.27",
    ])
  })

  test("extracts a date found in the body", () => {
    expect(extractNoteDates("", "Seen on 2026.06.01.", ["YYYY.MM.DD"])).toEqual(["2026.06.01"])
  })

  test("extracts dates found in a raw frontmatter block, including list items", () => {
    const source = `---
created: 2026.06.01
tags:
  - reading
  - 2025.12.31
---
Body text.`
    expect(extractNoteDates("", source, ["YYYY.MM.DD"])).toEqual(["2026.06.01", "2025.12.31"])
  })

  test("returns dates in the order found: title, then frontmatter, then body", () => {
    const source = `---
created: 2025.12.31
---
Body mentions 2026.06.01 only.`
    expect(extractNoteDates("2026.05.27", source, ["YYYY.MM.DD"])).toEqual([
      "2026.05.27",
      "2025.12.31",
      "2026.06.01",
    ])
  })

  test("does not bleed a date match across the title/source boundary", () => {
    expect(extractNoteDates("2026.05.27", "2026.05.28 more text", ["YYYY.MM.DD"])).toEqual([
      "2026.05.27",
      "2026.05.28",
    ])
  })

  test("deduplicates identical dates found across the title and source", () => {
    expect(
      extractNoteDates("2026.06.01", "Mentioned 2026.06.01 again.", ["YYYY.MM.DD"]),
    ).toEqual(["2026.06.01"])
  })

  test("returns an empty array when no dates are found", () => {
    expect(extractNoteDates("Untitled", "No dates here.", ["YYYY.MM.DD"])).toEqual([])
  })
})
