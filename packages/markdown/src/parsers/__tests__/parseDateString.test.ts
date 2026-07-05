import { describe, expect, test } from "vitest"

import { parseDateString } from "../parseDateString"

describe("parseDateString", () => {
  test("parses YYYY.MM.DD format", () => {
    expect(parseDateString("2026.06.05", ["YYYY.MM.DD"])?.toISOString()).toBe(
      "2026-06-05T00:00:00.000Z",
    )
  })

  test("parses YYYY-MM-DD format", () => {
    expect(parseDateString("2026-06-05", ["YYYY-MM-DD"])?.toISOString()).toBe(
      "2026-06-05T00:00:00.000Z",
    )
  })

  test("parses YY/MM/DD format", () => {
    expect(parseDateString("26/06/05", ["YY/MM/DD"])?.toISOString()).toBe(
      "2026-06-05T00:00:00.000Z",
    )
  })

  test("tries formats in order and returns first match", () => {
    expect(
      parseDateString("2026.06.05", ["YYYY-MM-DD", "YYYY.MM.DD"])?.toISOString(),
    ).toBe("2026-06-05T00:00:00.000Z")
  })

  test("returns null when no format matches", () => {
    expect(parseDateString("not-a-date", ["YYYY.MM.DD"])).toBeNull()
  })

  test("returns null for separator mismatch", () => {
    expect(parseDateString("2026/06/05", ["YYYY.MM.DD"])).toBeNull()
  })

  test("returns null for empty formats array", () => {
    expect(parseDateString("2026.06.05", [])).toBeNull()
  })

  test("returns null when string has trailing characters", () => {
    expect(parseDateString("2026.06.05 extra", ["YYYY.MM.DD"])).toBeNull()
  })

  test("returns null when day has fewer digits than expected", () => {
    expect(parseDateString("2026.06.5", ["YYYY.MM.DD"])).toBeNull()
  })

  test("returns null for out-of-range month", () => {
    expect(parseDateString("2026.13.01", ["YYYY.MM.DD"])).toBeNull()
  })

  test("returns null for out-of-range day", () => {
    expect(parseDateString("2026.06.32", ["YYYY.MM.DD"])).toBeNull()
  })

  test("returns null for rollover date (Feb 31)", () => {
    expect(parseDateString("2026.02.31", ["YYYY.MM.DD"])).toBeNull()
  })

  test("returns null for rollover date (Feb 29 in non-leap year)", () => {
    expect(parseDateString("2025.02.29", ["YYYY.MM.DD"])).toBeNull()
  })

  test("accepts Feb 29 in a leap year", () => {
    expect(parseDateString("2024.02.29", ["YYYY.MM.DD"])?.toISOString()).toBe(
      "2024-02-29T00:00:00.000Z",
    )
  })
})
