import { getMonthStart } from "../getMonthStart"

describe("getMonthStart", () => {
  test("returns the first day of the given month", () => {
    expect(getMonthStart("2026-07")).toBe("2026-07-01")
  })
})
