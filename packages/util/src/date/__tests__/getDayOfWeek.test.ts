import { getDayOfWeek } from "../getDayOfWeek"

describe("getDayOfWeek", () => {
  test("returns 0 for a Sunday", () => {
    expect(getDayOfWeek("2026-07-05")).toBe(0)
  })

  test("returns 6 for a Saturday", () => {
    expect(getDayOfWeek("2026-07-11")).toBe(6)
  })

  test("returns 3 for a Wednesday", () => {
    expect(getDayOfWeek("2026-07-01")).toBe(3)
  })
})
