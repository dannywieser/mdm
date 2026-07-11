import { buildMonthRange } from "../buildMonthRange"

describe("buildMonthRange", () => {
  test("returns a single month when from and to match", () => {
    expect(buildMonthRange("2026-07", "2026-07")).toEqual(["2026-07"])
  })

  test("returns every month in ascending order across a year boundary", () => {
    expect(buildMonthRange("2025-11", "2026-02")).toEqual([
      "2025-11",
      "2025-12",
      "2026-01",
      "2026-02",
    ])
  })
})
