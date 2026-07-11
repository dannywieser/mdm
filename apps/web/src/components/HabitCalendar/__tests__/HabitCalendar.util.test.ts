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
  test("returns one month per calendar month spanning two tracking windows back, most recent first", () => {
    const months = buildHabitCalendarMonths([], "2026-07-11", 10)

    expect(months.map((month) => month.monthKey)).toEqual(["2026-07", "2026-06"])
  })

  test("pads each month's first week with blanks up to the month's starting weekday", () => {
    const months = buildHabitCalendarMonths([], "2026-07-11", 10)
    const july = months.find((month) => month.monthKey === "2026-07")!
    const june = months.find((month) => month.monthKey === "2026-06")!

    expect(july.weeks[0].days.slice(0, 3)).toEqual([null, null, null])
    expect(july.weeks[0].days[3]).toMatchObject({ date: "2026-07-01" })
    expect(june.weeks[0].days[0]).toBeNull()
    expect(june.weeks[0].days[1]).toMatchObject({ date: "2026-06-01" })
  })

  test("marks days after the reference date as future with no intensity level", () => {
    const months = buildHabitCalendarMonths(
      [buildEntry("2026-07-12", 9)],
      "2026-07-11",
      10,
    )
    const july = months.find((month) => month.monthKey === "2026-07")!

    expect(findDay(july, "2026-07-11")).toMatchObject({ isFuture: false })
    expect(findDay(july, "2026-07-12")).toMatchObject({ isFuture: true, level: 0, value: 9 })
  })

  test("defaults a day's value to 0 when it has no matching history entry", () => {
    const months = buildHabitCalendarMonths([], "2026-07-11", 10)
    const july = months.find((month) => month.monthKey === "2026-07")!

    expect(findDay(july, "2026-07-03")).toMatchObject({ value: 0, level: 0 })
  })

  test("scales intensity level from the day's value out of a 10-point max, capped at 4 levels", () => {
    const history = [
      buildEntry("2026-07-01", 1),
      buildEntry("2026-07-02", 3),
      buildEntry("2026-07-03", 6),
      buildEntry("2026-07-04", 8),
      buildEntry("2026-07-05", 10),
    ]
    const months = buildHabitCalendarMonths(history, "2026-07-11", 10)
    const july = months.find((month) => month.monthKey === "2026-07")!

    expect(findDay(july, "2026-07-01")).toMatchObject({ level: 1 })
    expect(findDay(july, "2026-07-02")).toMatchObject({ level: 2 })
    expect(findDay(july, "2026-07-03")).toMatchObject({ level: 3 })
    expect(findDay(july, "2026-07-04")).toMatchObject({ level: 4 })
    expect(findDay(july, "2026-07-05")).toMatchObject({ level: 4 })
  })

  test("pads the final week with trailing blanks up to a full 7-day row", () => {
    const months = buildHabitCalendarMonths([], "2026-07-11", 10)
    const june = months.find((month) => month.monthKey === "2026-06")!

    for (const week of june.weeks) {
      expect(week.days).toHaveLength(7)
    }
  })
})

describe("formatCalendarDate", () => {
  test("formats a date as a readable short month/day/year string", () => {
    expect(formatCalendarDate("2026-07-01")).toBe("Jul 1, 2026")
  })
})
