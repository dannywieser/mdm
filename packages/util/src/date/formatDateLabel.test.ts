import { formatDateLabel } from "./formatDateLabel"

describe("formatDateLabel", () => {
  test("formats a date string as short month and day", () => {
    expect(formatDateLabel("2026-06-01", "UTC")).toBe("Jun 1")
  })

  test("uses the provided timezone when formatting", () => {
    // 2026-06-01T00:00:00Z is still May 31 in UTC-12
    expect(formatDateLabel("2026-06-01", "Etc/GMT+12")).toBe("May 31")
  })

  test("formats a single-digit day without zero-padding", () => {
    expect(formatDateLabel("2026-01-05", "UTC")).toBe("Jan 5")
  })

  test("formats end-of-year date correctly", () => {
    expect(formatDateLabel("2025-12-31", "UTC")).toBe("Dec 31")
  })
})
