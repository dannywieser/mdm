import { formatDate } from "./formatDate"

describe("formatDate", () => {
  test("formats a date as YYYY.MM.DD (ddd)", () => {
    expect(formatDate(new Date("2026-06-01T00:00:00Z"))).toBe("2026.06.01 (Mon)")
  })

  test("zero-pads single-digit month and day", () => {
    expect(formatDate(new Date("2026-01-05T00:00:00Z"))).toBe("2026.01.05 (Mon)")
  })

  test("uses UTC date, not local time", () => {
    // 2026-06-01T00:00:00Z is still May 31 in UTC-12; must return June 1
    const date = new Date("2026-06-01T00:00:00Z")
    expect(formatDate(date)).toMatch(/^2026\.06\.01/)
  })

  test("formats end of year correctly", () => {
    expect(formatDate(new Date("2025-12-31T00:00:00Z"))).toBe("2025.12.31 (Wed)")
  })

  test("formats a Sunday correctly", () => {
    expect(formatDate(new Date("2026-06-07T00:00:00Z"))).toBe("2026.06.07 (Sun)")
  })
})
