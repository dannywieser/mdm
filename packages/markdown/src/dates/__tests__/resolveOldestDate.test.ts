import { resolveOldestDate } from "../resolveOldestDate"

describe("resolveOldestDate", () => {
  test("returns the oldest date parsed by the configured format", () => {
    expect(
      resolveOldestDate(["2026.06.01", "2025.06.15", "2026.01.01"], ["YYYY.MM.DD"]),
    ).toEqual(new Date(Date.UTC(2025, 5, 15)))
  })

  test("falls back to ISO parse for values that don't match a configured format", () => {
    expect(
      resolveOldestDate(["2026-06-01T01:00:00.000Z", "2025-06-15T00:00:00.000Z"], []),
    ).toEqual(new Date("2025-06-15T00:00:00.000Z"))
  })

  test("compares format-matched dates against ISO dates", () => {
    expect(
      resolveOldestDate(["2026.06.01", "2025-06-15T00:00:00.000Z"], ["YYYY.MM.DD"]),
    ).toEqual(new Date("2025-06-15T00:00:00.000Z"))
  })

  test("ignores unparseable values", () => {
    expect(
      resolveOldestDate(["not-a-date", "2026.06.01"], ["YYYY.MM.DD"]),
    ).toEqual(new Date(Date.UTC(2026, 5, 1)))
  })

  test("ignores non-ISO-8601 values that Date would otherwise parse loosely", () => {
    expect(
      resolveOldestDate(["June 15, 2025", "2026.06.01"], ["YYYY.MM.DD"]),
    ).toEqual(new Date(Date.UTC(2026, 5, 1)))
  })

  test("returns null when no values are parseable", () => {
    expect(resolveOldestDate(["not-a-date"], ["YYYY.MM.DD"])).toBeNull()
  })

  test("returns null for an empty list", () => {
    expect(resolveOldestDate([], ["YYYY.MM.DD"])).toBeNull()
  })
})
