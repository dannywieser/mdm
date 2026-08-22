import { describe, expect, test } from "vitest"

import type { TransactionOccurrence } from "services"

import {
  buildCalendarWeeks,
  formatMonthLabel,
  resolveMonthKey,
  shiftMonth,
} from "../TransactionCalendar.util"

const occurrence = (overrides: Partial<TransactionOccurrence>): TransactionOccurrence => ({
  amount: -10,
  category: null,
  date: "2026-03-04",
  description: "Coffee",
  id: "note:2026-03-04",
  noteId: "note",
  obsidianUrl: "obsidian://note",
  recurrence: null,
  status: "logged",
  ...overrides,
})

describe("resolveMonthKey", () => {
  test("uses a valid month from the route", () => {
    expect(resolveMonthKey("2026-03", "2026-07-11")).toBe("2026-03")
  })

  test("falls back to today's month when the route has none", () => {
    expect(resolveMonthKey(undefined, "2026-07-11")).toBe("2026-07")
  })

  test("falls back to today's month for a malformed value", () => {
    expect(resolveMonthKey("march", "2026-07-11")).toBe("2026-07")
  })

  test("falls back to today's month for an out-of-range month number", () => {
    expect(resolveMonthKey("2026-13", "2026-07-11")).toBe("2026-07")
  })

  test("accepts a far-future month", () => {
    expect(resolveMonthKey("2099-07", "2026-07-11")).toBe("2099-07")
  })
})

describe("shiftMonth", () => {
  test("steps forward across a year boundary", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01")
  })

  test("steps backward across a year boundary", () => {
    expect(shiftMonth("2026-01", -1)).toBe("2025-12")
  })
})

describe("formatMonthLabel", () => {
  test("renders the month and year", () => {
    expect(formatMonthLabel("2026-03")).toBe("March 2026")
  })
})

describe("buildCalendarWeeks", () => {
  test("pads the grid so every week holds seven days", () => {
    const weeks = buildCalendarWeeks("2026-03", [], "2026-03-17")

    expect(weeks.every(({ days }) => days.length === 7)).toBe(true)
  })

  test("starts the grid on the Sunday on or before the first of the month", () => {
    const weeks = buildCalendarWeeks("2026-03", [], "2026-03-17")

    expect(weeks[0].days[0].date).toBe("2026-03-01")
  })

  test("pads a month that does not start on a Sunday with the previous month's days", () => {
    const weeks = buildCalendarWeeks("2026-04", [], "2026-04-17")

    expect(weeks[0].days[0].date).toBe("2026-03-29")
    expect(weeks[0].days[0].isCurrentMonth).toBe(false)
  })

  test("pads the final week with the next month's days", () => {
    const weeks = buildCalendarWeeks("2026-04", [], "2026-04-17")
    const lastDay = weeks.at(-1)?.days.at(-1)

    expect(lastDay?.date).toBe("2026-05-02")
    expect(lastDay?.isCurrentMonth).toBe(false)
  })

  test("covers every day of the month", () => {
    const dates = buildCalendarWeeks("2026-03", [], "2026-03-17")
      .flatMap(({ days }) => days)
      .filter(({ isCurrentMonth }) => isCurrentMonth)
      .map(({ date }) => date)

    expect(dates).toHaveLength(31)
    expect(dates[0]).toBe("2026-03-01")
    expect(dates.at(-1)).toBe("2026-03-31")
  })

  test("places each transaction on its own day", () => {
    const weeks = buildCalendarWeeks("2026-03", [occurrence({})], "2026-03-17")
    const day = weeks.flatMap(({ days }) => days).find(({ date }) => date === "2026-03-04")

    expect(day?.transactions).toHaveLength(1)
  })

  test("groups multiple transactions falling on the same day", () => {
    const weeks = buildCalendarWeeks(
      "2026-03",
      [occurrence({}), occurrence({ description: "Rent", id: "rent:2026-03-04" })],
      "2026-03-17",
    )
    const day = weeks.flatMap(({ days }) => days).find(({ date }) => date === "2026-03-04")

    expect(day?.transactions).toHaveLength(2)
  })

  test("nets each day's amounts into a day total", () => {
    const weeks = buildCalendarWeeks(
      "2026-03",
      [occurrence({ amount: -10 }), occurrence({ amount: 2500, id: "pay:2026-03-04" })],
      "2026-03-17",
    )
    const day = weeks.flatMap(({ days }) => days).find(({ date }) => date === "2026-03-04")

    expect(day?.total).toBe(2490)
  })

  test("rounds away floating point drift in a day total", () => {
    const weeks = buildCalendarWeeks(
      "2026-03",
      [occurrence({ amount: -0.1 }), occurrence({ amount: -0.2, id: "b:2026-03-04" })],
      "2026-03-17",
    )
    const day = weeks.flatMap(({ days }) => days).find(({ date }) => date === "2026-03-04")

    expect(day?.total).toBe(-0.3)
  })

  test("marks only today's cell as today", () => {
    const today = buildCalendarWeeks("2026-03", [], "2026-03-17")
      .flatMap(({ days }) => days)
      .filter(({ isToday }) => isToday)

    expect(today.map(({ date }) => date)).toEqual(["2026-03-17"])
  })

  test("marks no cell as today when viewing another month", () => {
    const today = buildCalendarWeeks("2026-09", [], "2026-03-17")
      .flatMap(({ days }) => days)
      .filter(({ isToday }) => isToday)

    expect(today).toEqual([])
  })

  test("gives each week a stable key taken from its first day", () => {
    const weeks = buildCalendarWeeks("2026-04", [], "2026-04-17")

    expect(weeks.map(({ key }) => key)).toEqual([
      "2026-03-29",
      "2026-04-05",
      "2026-04-12",
      "2026-04-19",
      "2026-04-26",
    ])
  })

  test("builds a far-future month the same way as a current one", () => {
    const weeks = buildCalendarWeeks("2099-07", [], "2026-03-17")

    expect(weeks.every(({ days }) => days.length === 7)).toBe(true)
    expect(weeks.flatMap(({ days }) => days).filter(({ isCurrentMonth }) => isCurrentMonth)).toHaveLength(31)
  })
})
