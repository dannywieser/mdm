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
      },
    ])
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
