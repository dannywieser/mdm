import { daysBetween } from "./daysBetween"

describe("daysBetween", () => {
  test("returns a positive count when toDate is after fromDate", () => {
    expect(daysBetween("2025-01-01", "2025-01-11")).toBe(10)
  })

  test("returns a negative count when toDate is before fromDate", () => {
    expect(daysBetween("2025-01-11", "2025-01-01")).toBe(-10)
  })

  test("returns zero for the same date", () => {
    expect(daysBetween("2025-01-01", "2025-01-01")).toBe(0)
  })

  test("crosses a month boundary", () => {
    expect(daysBetween("2025-01-31", "2025-02-01")).toBe(1)
  })

  test("crosses a year boundary", () => {
    expect(daysBetween("2024-12-31", "2025-01-01")).toBe(1)
  })
})
