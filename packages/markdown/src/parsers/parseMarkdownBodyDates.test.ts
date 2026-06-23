import { parseMarkdownBodyDates } from "./parseMarkdownBodyDates"

describe("parseMarkdownBodyDates", () => {
  test("extracts dates that match the configured formats", () => {
    expect(
      parseMarkdownBodyDates(
        "Met on 2026.05.26 and again on 26/05/27.\nIgnored 2026-05-26.",
        ["YYYY.MM.DD", "YY/MM/DD"]
      )
    ).toEqual(["2026.05.26", "26/05/27"])
  })

  test("returns dates in chronological order across configured formats", () => {
    expect(
      parseMarkdownBodyDates(
        "26/05/28, 2026.05.26, and 2026.05.27.",
        ["YYYY.MM.DD", "YY/MM/DD"]
      )
    ).toEqual(["2026.05.26", "2026.05.27", "26/05/28"])
  })

  test("ignores matches embedded inside longer numbers", () => {
    expect(
      parseMarkdownBodyDates("12026.05.260 and 2026.05.26", ["YYYY.MM.DD"])
    ).toEqual(["2026.05.26"])
  })

  test("returns an empty array when no formats are configured", () => {
    expect(parseMarkdownBodyDates("2026.05.26", [])).toEqual([])
  })
})
