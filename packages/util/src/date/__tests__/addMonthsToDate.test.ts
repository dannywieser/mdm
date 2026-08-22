import { addMonthsToDate } from "../addMonthsToDate"

describe("addMonthsToDate", () => {
  test("adds positive months within the same year", () => {
    expect(addMonthsToDate("2026-01-15", 3)).toBe("2026-04-15")
  })

  test("subtracts negative months within the same year", () => {
    expect(addMonthsToDate("2026-07-15", -3)).toBe("2026-04-15")
  })

  test("crosses a year boundary going forward", () => {
    expect(addMonthsToDate("2025-11-05", 3)).toBe("2026-02-05")
  })

  test("crosses a year boundary going backward", () => {
    expect(addMonthsToDate("2026-02-05", -3)).toBe("2025-11-05")
  })

  test("clamps the day to the last day of a shorter target month", () => {
    expect(addMonthsToDate("2026-01-31", 1)).toBe("2026-02-28")
  })

  test("clamps to a leap-year February", () => {
    expect(addMonthsToDate("2024-01-31", 1)).toBe("2024-02-29")
  })

  test("clamps a 31st to a 30-day month", () => {
    expect(addMonthsToDate("2026-03-31", 1)).toBe("2026-04-30")
  })

  test("returns the same date for zero months", () => {
    expect(addMonthsToDate("2026-06-09", 0)).toBe("2026-06-09")
  })
})
