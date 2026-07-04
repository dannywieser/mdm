import { extractNoteDates } from "./extractNoteDates"

describe("extractNoteDates", () => {
  test("extracts a date found in the title", () => {
    expect(extractNoteDates("2026.05.27 Weekly Review", "", null, ["YYYY.MM.DD"])).toEqual([
      "2026.05.27",
    ])
  })

  test("extracts a date found in the body", () => {
    expect(extractNoteDates("", "Seen on 2026.06.01.", null, ["YYYY.MM.DD"])).toEqual([
      "2026.06.01",
    ])
  })

  test("extracts dates found in frontmatter values, including arrays", () => {
    expect(
      extractNoteDates(
        "",
        "",
        { created: "2026.06.01", tags: ["reading", "2025.12.31"] },
        ["YYYY.MM.DD"],
      ),
    ).toEqual(["2026.06.01", "2025.12.31"])
  })

  test("returns dates in title, then body, then frontmatter order", () => {
    expect(
      extractNoteDates(
        "2026.05.27",
        "Body mentions 2026.06.01.",
        { created: "2025.12.31" },
        ["YYYY.MM.DD"],
      ),
    ).toEqual(["2026.05.27", "2026.06.01", "2025.12.31"])
  })

  test("does not bleed a date match across the title/body boundary", () => {
    expect(extractNoteDates("2026.05.27", "2026.05.28 more text", null, ["YYYY.MM.DD"])).toEqual([
      "2026.05.27",
      "2026.05.28",
    ])
  })

  test("deduplicates identical dates found across sources", () => {
    expect(
      extractNoteDates(
        "",
        "Mentioned 2026.06.01 here.",
        { created: "2026.06.01" },
        ["YYYY.MM.DD"],
      ),
    ).toEqual(["2026.06.01"])
  })

  test("returns an empty array when frontmatter is null and no dates are found", () => {
    expect(extractNoteDates("Untitled", "No dates here.", null, ["YYYY.MM.DD"])).toEqual([])
  })
})
