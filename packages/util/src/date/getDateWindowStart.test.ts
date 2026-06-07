import { getDateWindowStart } from "./getDateWindowStart"

describe("getDateWindowStart", () => {
  test("returns the date windowDays before the reference date", () => {
    expect(getDateWindowStart("2025-01-31", 30)).toBe("2025-01-01")
  })

  test("crosses a year boundary", () => {
    expect(getDateWindowStart("2025-01-05", 10)).toBe("2024-12-26")
  })

  test("returns the reference date for a zero-day window", () => {
    expect(getDateWindowStart("2025-01-31", 0)).toBe("2025-01-31")
  })
})
