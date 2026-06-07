import { buildDateRange } from "./buildDateRange"

describe("buildDateRange", () => {
  test("returns every date from fromDate to toDate, inclusive, in ascending order", () => {
    expect(buildDateRange("2025-01-01", "2025-01-05")).toEqual([
      "2025-01-01",
      "2025-01-02",
      "2025-01-03",
      "2025-01-04",
      "2025-01-05",
    ])
  })

  test("returns a single-element array when fromDate equals toDate", () => {
    expect(buildDateRange("2025-01-01", "2025-01-01")).toEqual(["2025-01-01"])
  })

  test("returns an empty array when fromDate is after toDate", () => {
    expect(buildDateRange("2025-01-05", "2025-01-01")).toEqual([])
  })

  test("crosses a month boundary", () => {
    expect(buildDateRange("2025-01-30", "2025-02-02")).toEqual([
      "2025-01-30",
      "2025-01-31",
      "2025-02-01",
      "2025-02-02",
    ])
  })
})
