import { describe, expect, test } from "vitest"

import { parseDateString } from "./parseDateString"

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
})
