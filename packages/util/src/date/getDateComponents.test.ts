import { getDateComponents } from "./getDateComponents"

describe("getDateComponents", () => {
  test("returns day, month, and year for a date in UTC", () => {
    const date = new Date("2026-05-27T12:00:00Z")

    expect(getDateComponents(date, "UTC")).toEqual({ day: 27, month: 5, year: 2026 })
  })

  test("returns the calendar date in a timezone behind UTC", () => {
    // 2026-05-27T01:00:00Z is still May 26 in America/New_York (UTC-4 in EDT)
    const date = new Date("2026-05-27T01:00:00Z")

    expect(getDateComponents(date, "America/New_York")).toEqual({ day: 26, month: 5, year: 2026 })
  })

  test("returns the calendar date in a timezone ahead of UTC", () => {
    // 2026-05-26T23:00:00Z is May 27 in Asia/Tokyo (UTC+9)
    const date = new Date("2026-05-26T23:00:00Z")

    expect(getDateComponents(date, "Asia/Tokyo")).toEqual({ day: 27, month: 5, year: 2026 })
  })

  test("handles year boundaries correctly", () => {
    // 2025-12-31T23:00:00Z is Jan 1, 2026 in Asia/Tokyo (UTC+9)
    const date = new Date("2025-12-31T23:00:00Z")

    expect(getDateComponents(date, "Asia/Tokyo")).toEqual({ day: 1, month: 1, year: 2026 })
  })
})
