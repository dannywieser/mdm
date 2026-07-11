import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

afterEach(cleanup)

import type { HabitHistoryEntry } from "services"

import { HabitCalendar } from "../HabitCalendar"

vi.mock("../../../i18n", () => ({
  useI18n: () => ({
    t: (key: string, values?: Record<string, string | number>) =>
      values ? `${key} ${JSON.stringify(values)}` : key,
  }),
}))

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

const renderCalendar = (
  history: HabitHistoryEntry[] = [buildEntry("2026-07-01", 5)],
  referenceDate = "2026-07-11",
  trackingWindowDays = 10,
) => {
  render(
    <ChakraProvider value={defaultSystem}>
      <HabitCalendar
        history={history}
        referenceDate={referenceDate}
        trackingWindowDays={trackingWindowDays}
      />
    </ChakraProvider>,
  )
}

describe("HabitCalendar", () => {
  test("renders the calendar title, one heading per spanned month, and the legend", () => {
    renderCalendar()

    expect(screen.getByText("habit.calendarTitle")).toBeTruthy()
    expect(screen.getByText("July 2026")).toBeTruthy()
    expect(screen.getByText("June 2026")).toBeTruthy()
    expect(screen.getByText("stats.activityLess")).toBeTruthy()
    expect(screen.getByText("stats.activityMore")).toBeTruthy()
  })

  test("renders nothing when there is no history", () => {
    const { container } = render(
      <ChakraProvider value={defaultSystem}>
        <HabitCalendar history={[]} referenceDate="2026-07-11" trackingWindowDays={10} />
      </ChakraProvider>,
    )

    expect(container.firstChild).toBeNull()
  })

  test("labels a tracked day's cell with its date and frontmatter value, not a visible number", () => {
    renderCalendar([buildEntry("2026-07-01", 7)])

    expect(
      document.querySelector('[aria-label*="Jul 1, 2026"][aria-label*="habit.calendarDayValue"]'),
    ).toBeTruthy()
    expect(screen.queryByText("7")).toBeNull()
  })

  test("renders an on-hover card with the date and value on separate lines", () => {
    renderCalendar([buildEntry("2026-07-01", 7)])

    expect(screen.getByText("Jul 1, 2026")).toBeTruthy()
    expect(screen.getByText('habit.calendarDayValue {"value":7}')).toBeTruthy()
  })

  test("does not render an interactive cell for a day after the reference date", () => {
    renderCalendar([buildEntry("2026-07-12", 9)])

    expect(document.querySelector('[aria-label*="Jul 12, 2026"]')).toBeNull()
  })
})
