import { monthsBetween } from "../monthsBetween"

describe("monthsBetween", () => {
  test("counts months forward within the same year", () => {
    expect(monthsBetween("2026-01-10", "2026-04-10")).toBe(3)
  })

  test("returns a negative count when the end month is earlier", () => {
    expect(monthsBetween("2026-04-10", "2026-01-10")).toBe(-3)
  })

  test("crosses a year boundary", () => {
    expect(monthsBetween("2025-11-01", "2026-02-01")).toBe(3)
  })

  test("ignores the day component", () => {
    expect(monthsBetween("2026-01-31", "2026-02-01")).toBe(1)
  })

  test("returns zero within the same month", () => {
    expect(monthsBetween("2026-06-01", "2026-06-30")).toBe(0)
  })
})
