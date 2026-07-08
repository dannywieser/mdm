import { toISODateString } from "../toISODateString"

describe("toISODateString", () => {
  test("formats a date as YYYY-MM-DD in UTC", () => {
    const date = new Date("2026-05-27T12:00:00Z")

    expect(toISODateString(date, "UTC")).toBe("2026-05-27")
  })

  test("pads single-digit month and day", () => {
    const date = new Date("2026-01-05T12:00:00Z")

    expect(toISODateString(date, "UTC")).toBe("2026-01-05")
  })

  test("uses the calendar date in a timezone behind UTC", () => {
    // 2026-05-27T01:00:00Z is still May 26 in America/New_York (UTC-4 in EDT)
    const date = new Date("2026-05-27T01:00:00Z")

    expect(toISODateString(date, "America/New_York")).toBe("2026-05-26")
  })

  test("uses the calendar date in a timezone ahead of UTC", () => {
    // 2026-05-26T23:00:00Z is May 27 in Asia/Tokyo (UTC+9)
    const date = new Date("2026-05-26T23:00:00Z")

    expect(toISODateString(date, "Asia/Tokyo")).toBe("2026-05-27")
  })
})
