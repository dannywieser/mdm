import { describe, expect, test } from "vitest"

import type { StatsHistoryResponse } from "services"

import {
  buildContributionDays,
  buildContributionYears,
  formatContributionDate,
} from "../ContributionGraph.util"

describe("buildContributionDays", () => {
  test("returns an empty array when history is empty", () => {
    expect(buildContributionDays([])).toEqual([])
  })

  test("fills gaps between the first and last date with zero-activity days", () => {
    const history: StatsHistoryResponse = [
      { date: "2026-05-01", entriesCreated: 4, entriesModified: 0, foldersTouched: 2 },
      { date: "2026-05-03", entriesCreated: 0, entriesModified: 2, foldersTouched: 1 },
    ]

    const days = buildContributionDays(history)

    expect(days.map((day) => day.date)).toEqual(["2026-05-01", "2026-05-02", "2026-05-03"])
    expect(days[1]).toMatchObject({
      entriesCreated: 0,
      entriesModified: 0,
      foldersTouched: 0,
      totalActivity: 0,
      level: 0,
    })
  })

  test("carries foldersTouched through from the matching history entry", () => {
    const history: StatsHistoryResponse = [
      { date: "2026-05-01", entriesCreated: 1, entriesModified: 0, foldersTouched: 3 },
    ]

    const days = buildContributionDays(history)

    expect(days[0]).toMatchObject({ foldersTouched: 3 })
  })

  test("scales levels relative to the busiest day", () => {
    const history: StatsHistoryResponse = [
      { date: "2026-05-01", entriesCreated: 1, entriesModified: 0, foldersTouched: 1 },
      { date: "2026-05-02", entriesCreated: 2, entriesModified: 0, foldersTouched: 1 },
      { date: "2026-05-03", entriesCreated: 4, entriesModified: 0, foldersTouched: 1 },
    ]

    const days = buildContributionDays(history)

    expect(days.map((day) => day.level)).toEqual([1, 2, 4])
  })

  test("treats a single-day history as its own max without dividing by zero", () => {
    const history: StatsHistoryResponse = [
      { date: "2026-05-01", entriesCreated: 0, entriesModified: 0, foldersTouched: 0 },
    ]

    const days = buildContributionDays(history)

    expect(days).toEqual([
      {
        date: "2026-05-01",
        entriesCreated: 0,
        entriesModified: 0,
        foldersTouched: 0,
        totalActivity: 0,
        level: 0,
        isOutlier: false,
        outlierLevel: 0,
      },
    ])
  })

  test("flags a day whose activity is a clear outlier and scales colors off the typical range instead", () => {
    const history: StatsHistoryResponse = [
      { date: "2026-05-01", entriesCreated: 0, entriesModified: 5, foldersTouched: 1 },
      { date: "2026-05-02", entriesCreated: 0, entriesModified: 10, foldersTouched: 1 },
      { date: "2026-05-03", entriesCreated: 0, entriesModified: 15, foldersTouched: 1 },
      { date: "2026-05-04", entriesCreated: 0, entriesModified: 20, foldersTouched: 1 },
      { date: "2026-05-05", entriesCreated: 0, entriesModified: 25, foldersTouched: 1 },
      { date: "2026-05-06", entriesCreated: 0, entriesModified: 900, foldersTouched: 1 },
    ]

    const days = buildContributionDays(history)

    expect(days.map((day) => day.isOutlier)).toEqual([false, false, false, false, false, true])
    expect(days.map((day) => day.level)).toEqual([1, 2, 3, 4, 4, 4])
    expect(days.map((day) => day.outlierLevel)).toEqual([0, 0, 0, 0, 0, 4])
  })

  test("gives outliers their own gradient so a mild outlier reads lighter than an extreme one", () => {
    const history: StatsHistoryResponse = [
      ...Array.from({ length: 10 }, (_, index) => ({
        date: `2026-04-${String(index + 1).padStart(2, "0")}`,
        entriesCreated: 1,
        entriesModified: 0,
        foldersTouched: 1,
      })),
      { date: "2026-04-11", entriesCreated: 50, entriesModified: 0, foldersTouched: 1 },
      { date: "2026-04-12", entriesCreated: 900, entriesModified: 0, foldersTouched: 1 },
    ]

    const days = buildContributionDays(history)
    const mildOutlier = days.find((day) => day.totalActivity === 50)
    const extremeOutlier = days.find((day) => day.totalActivity === 900)

    expect(mildOutlier).toMatchObject({ isOutlier: true, outlierLevel: 1 })
    expect(extremeOutlier).toMatchObject({ isOutlier: true, outlierLevel: 4 })
  })

  test("does not flag a ramp-up day as an outlier just because the historical baseline is low", () => {
    const history: StatsHistoryResponse = Array.from({ length: 10 }, (_, index) => ({
      date: `2026-04-${String(index + 1).padStart(2, "0")}`,
      entriesCreated: 1,
      entriesModified: 0,
      foldersTouched: 1,
    }))
    history.push({ date: "2026-04-11", entriesCreated: 12, entriesModified: 0, foldersTouched: 1 })

    const days = buildContributionDays(history)

    expect(days.map((day) => day.isOutlier)).toEqual(Array(11).fill(false))
  })

  test("does not flag a day that's only modestly busier than the rest as an outlier", () => {
    const history: StatsHistoryResponse = [
      { date: "2026-05-01", entriesCreated: 4, entriesModified: 0, foldersTouched: 1 },
      { date: "2026-05-02", entriesCreated: 5, entriesModified: 0, foldersTouched: 1 },
      { date: "2026-05-03", entriesCreated: 6, entriesModified: 0, foldersTouched: 1 },
      { date: "2026-05-04", entriesCreated: 7, entriesModified: 0, foldersTouched: 1 },
      { date: "2026-05-05", entriesCreated: 20, entriesModified: 0, foldersTouched: 1 },
    ]

    const days = buildContributionDays(history)

    expect(days.map((day) => day.isOutlier)).toEqual([false, false, false, false, false])
  })
})

describe("buildContributionYears", () => {
  test("returns an empty array for no days", () => {
    expect(buildContributionYears([])).toEqual([])
  })

  test("groups days into one entry per calendar year, most recent first", () => {
    const days = buildContributionDays([
      { date: "2025-12-30", entriesCreated: 1, entriesModified: 0, foldersTouched: 1 },
      { date: "2026-01-02", entriesCreated: 1, entriesModified: 0, foldersTouched: 1 },
    ])

    const years = buildContributionYears(days)

    expect(years.map((entry) => entry.year)).toEqual(["2026", "2025"])
  })

  test("keeps each year's days in chronological order without padding", () => {
    const days = buildContributionDays([
      { date: "2025-12-30", entriesCreated: 1, entriesModified: 0, foldersTouched: 1 },
      { date: "2025-12-31", entriesCreated: 1, entriesModified: 0, foldersTouched: 1 },
      { date: "2026-01-01", entriesCreated: 1, entriesModified: 0, foldersTouched: 1 },
    ])

    const years = buildContributionYears(days)
    const year2026 = years.find((entry) => entry.year === "2026")
    const year2025 = years.find((entry) => entry.year === "2025")

    expect(year2026?.days.map((day) => day.date)).toEqual(["2026-01-01"])
    expect(year2025?.days.map((day) => day.date)).toEqual(["2025-12-30", "2025-12-31"])
  })
})

describe("formatContributionDate", () => {
  test("formats a date as a readable short month/day/year string", () => {
    expect(formatContributionDate("2026-05-01")).toBe("May 1, 2026")
  })
})
