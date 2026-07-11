import { getMonthEnd } from "../getMonthEnd"

describe("getMonthEnd", () => {
  test("returns the last day of a 31-day month", () => {
    expect(getMonthEnd("2026-07")).toBe("2026-07-31")
  })

  test("returns the last day of a 30-day month", () => {
    expect(getMonthEnd("2026-06")).toBe("2026-06-30")
  })

  test("returns the last day of February in a leap year", () => {
    expect(getMonthEnd("2028-02")).toBe("2028-02-29")
  })

  test("returns the last day of February in a non-leap year", () => {
    expect(getMonthEnd("2026-02")).toBe("2026-02-28")
  })
})
