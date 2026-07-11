import { getMonthKey } from "../getMonthKey"

describe("getMonthKey", () => {
  test("returns the year and month portion of a date string", () => {
    expect(getMonthKey("2026-07-11")).toBe("2026-07")
  })

  test("pads single-digit months", () => {
    expect(getMonthKey("2026-01-05")).toBe("2026-01")
  })
})
