import { describe, expect, test } from "vitest"

import type { HabitHistoryEntry } from "services"

import { buildHabitCalendarMonths, formatCalendarDate } from "../HabitCalendar.util"
import type { HabitCalendarMonth } from "../HabitCalendar.types"

const buildEntry = (date: string, value: number): HabitHistoryEntry => ({
  date,
  habitScore: 0,
  streak: 0,
  value,
  windowEntries: 0,
  windowStart: date,
  rawScore: value,
  scoreBeforeMultipliers: value,
  streakMultiplier: 1,
  dayMultiplier: 1,
  recentEntryAdditions: 0,
})

const findDay = (month: HabitCalendarMonth, date: string) =>
  month.weeks.flatMap((week) => week.days).find((day) => day?.date === date)

describe("buildHabitCalendarMonths", () => {
  test("returns one month per calendar month in the last 6 months, most recent first", () => {
    const history = [
      buildEntry("2026-02-01", 1),
      buildEntry("2026-03-01", 1),
      buildEntry("2026-04-01", 1),
      buildEntry("2026-05-01", 1),
      buildEntry("2026-06-01", 1),
      buildEntry("2026-07-01", 1),
    ]

    const months = buildHabitCalendarMonths(history, "2026-07-11")

    expect(months.map((month) => month.monthKey)).toEqual([
      "2026-07",
      "2026-06",
      "2026-05",
      "2026-04",
      "2026-03",
      "2026-02",
    ])
  })

  test("drops a month within the last 6 that has no tracked entries", () => {
    const history = [
      buildEntry("2026-02-01", 1),
      buildEntry("2026-04-01", 1),
      buildEntry("2026-06-01", 1),
      buildEntry("2026-07-01", 1),
    ]

    const months = buildHabitCalendarMonths(history, "2026-07-11")

    expect(months.map((month) => month.monthKey)).toEqual(["2026-07", "2026-06", "2026-04", "2026-02"])
  })

  test("excludes a month older than 6 months back even if it has tracked entries", () => {
    const history = [buildEntry("2026-01-01", 100), buildEntry("2026-07-01", 5)]

    const months = buildHabitCalendarMonths(history, "2026-07-11")

    expect(months.map((month) => month.monthKey)).toEqual(["2026-07"])
  })

  test("pads each month's first week with blanks up to the month's starting weekday", () => {
    const months = buildHabitCalendarMonths([buildEntry("2026-07-01", 5)], "2026-07-11")
    const july = months.find((month) => month.monthKey === "2026-07")!

    expect(july.weeks[0].days.slice(0, 3)).toEqual([null, null, null])
    expect(july.weeks[0].days[3]).toMatchObject({ date: "2026-07-01" })
  })

  test("marks days after the reference date as future with no intensity level", () => {
    const history = [buildEntry("2026-07-01", 5), buildEntry("2026-07-12", 9)]
    const months = buildHabitCalendarMonths(history, "2026-07-11")
    const july = months.find((month) => month.monthKey === "2026-07")!

    expect(findDay(july, "2026-07-11")).toMatchObject({ isFuture: false })
    expect(findDay(july, "2026-07-12")).toMatchObject({ isFuture: true, level: 0, value: 9 })
  })

  test("defaults a day's value to 0 when it has no matching history entry", () => {
    const months = buildHabitCalendarMonths([buildEntry("2026-07-01", 5)], "2026-07-11")
    const july = months.find((month) => month.monthKey === "2026-07")!

    expect(findDay(july, "2026-07-03")).toMatchObject({ value: 0, level: 0 })
  })

  test("scales intensity level relative to the highest value shown anywhere in the visualization", () => {
    const history = [
      buildEntry("2026-07-01", 2),
      buildEntry("2026-07-02", 4),
      buildEntry("2026-07-03", 6),
      buildEntry("2026-07-04", 8),
    ]
    const months = buildHabitCalendarMonths(history, "2026-07-11")
    const july = months.find((month) => month.monthKey === "2026-07")!

    expect(findDay(july, "2026-07-01")).toMatchObject({ level: 1 })
    expect(findDay(july, "2026-07-02")).toMatchObject({ level: 2 })
    expect(findDay(july, "2026-07-03")).toMatchObject({ level: 3 })
    expect(findDay(july, "2026-07-04")).toMatchObject({ level: 4 })
  })

  test("scales off the max value across every displayed month, not just the current one, so the busiest day is always the most intense", () => {
    const history = [buildEntry("2026-06-15", 10), buildEntry("2026-07-01", 5)]
    const months = buildHabitCalendarMonths(history, "2026-07-11")
    const july = months.find((month) => month.monthKey === "2026-07")!
    const june = months.find((month) => month.monthKey === "2026-06")!

    expect(findDay(july, "2026-07-01")).toMatchObject({ level: 2 })
    expect(findDay(june, "2026-06-15")).toMatchObject({ level: 4 })
  })

  test("ignores values outside the displayed window when scaling intensity", () => {
    const history = [buildEntry("2026-01-01", 100), buildEntry("2026-07-01", 5)]
    const months = buildHabitCalendarMonths(history, "2026-07-11")
    const july = months.find((month) => month.monthKey === "2026-07")!

    expect(findDay(july, "2026-07-01")).toMatchObject({ level: 4 })
  })

  test("pads the final week with trailing blanks up to a full 7-day row", () => {
    const months = buildHabitCalendarMonths([buildEntry("2026-07-01", 5)], "2026-07-11")
    const july = months.find((month) => month.monthKey === "2026-07")!

    for (const week of july.weeks) {
      expect(week.days).toHaveLength(7)
    }
  })

  test("returns no months when nothing in the last 6 months has a tracked entry", () => {
    const months = buildHabitCalendarMonths([buildEntry("2026-01-01", 5)], "2026-07-11")

    expect(months).toEqual([])
  })
})

describe("formatCalendarDate", () => {
  test("formats a date as a readable short month/day/year string", () => {
    expect(formatCalendarDate("2026-07-01")).toBe("Jul 1, 2026")
  })
})
