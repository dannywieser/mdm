import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, describe, expect, test, vi } from "vitest"

import type { HabitResult } from "services"

import { HabitDetail } from "./HabitDetail"

afterEach(cleanup)

const useHabitQueryMock = vi.fn()

vi.mock("services", async (importOriginal) => {
  const actual = await importOriginal<typeof import("services")>()

  return {
    ...actual,
    useHabitQuery: (params: { habitId: string }) => useHabitQueryMock(params),
  }
})

vi.mock("../../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

const HABIT: HabitResult = {
  allTimeHighScore: 600,
  allTimeHighStreak: 6,
  allTimeHighWindowEntries: 7,
  habitId: "exercise",
  habitName: "Daily Exercise",
  habitScore: 525,
  history: [
    {
      date: "2026-01-01",
      habitScore: 100,
      streak: 1,
      value: 8,
      windowEntries: 1,
      windowStart: "2025-12-03",
      rawScore: 8,
      scoreBeforeMultipliers: 8,
      streakMultiplier: 1,
      dayMultiplier: 1,
      recentEntryAdditions: 0,
    },
    {
      date: "2026-01-02",
      habitScore: 200,
      streak: 2,
      value: 7,
      windowEntries: 2,
      windowStart: "2025-12-04",
      rawScore: 7,
      scoreBeforeMultipliers: 7,
      streakMultiplier: 1,
      dayMultiplier: 1,
      recentEntryAdditions: 0,
    },
  ],
  mode: "do-more",
  scoreEntries: [
    {
      date: "2026-01-02",
      value: 9,
      recentMultiplier: 10,
      obsidianUrl: "obsidian://open?vault=v&file=2026.01.02",
    },
    {
      date: "2026-01-01",
      value: 4,
      obsidianUrl: "obsidian://open?vault=v&file=2026.01.01",
    },
  ],
  streak: 5,
  streaks: [{ start: "2026-01-01", end: "2026-01-05", length: 5 }],
  trackingWindowDays: 30,
  windowEntries: 5,
  windowStart: "2025-12-29",
  rawScore: 5,
  scoreBeforeMultipliers: 5,
  streakMultiplier: 1,
  dayMultiplier: 1,
  recentEntryAdditions: 0,
}

const renderDetail = (data: HabitResult = HABIT) => {
  useHabitQueryMock.mockReturnValue({ data })
  return render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter initialEntries={["/tracking/exercise"]}>
        <Routes>
          <Route path="/tracking/:habitId" element={<HabitDetail />} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  )
}

describe("HabitDetail", () => {
  test("renders the habit name prefixed with its mode", () => {
    renderDetail()

    expect(screen.getByText("habit.do-more")).toBeTruthy()
  })

  test("renders the do-less mode label for do-less habits", () => {
    renderDetail({ ...HABIT, mode: "do-less" })

    expect(screen.getByText("habit.do-less")).toBeTruthy()
  })

  test("renders the habit name, score, days logged, and streak", () => {
    renderDetail()

    expect(screen.getByText("habit.do-more")).toBeTruthy()
    expect(screen.getByText("525")).toBeTruthy()
    expect(screen.getAllByText("5")).toHaveLength(2)
    expect(screen.getByText("habit.daysLogged")).toBeTruthy()
    expect(screen.getByText("habit.do-more-streak")).toBeTruthy()
  })

  test("renders the tracking window fill percentage as a badge next to days logged", () => {
    renderDetail()

    // windowEntries = 5, trackingWindowDays = 30 → round(5 / 30 * 100) = 17
    expect(screen.getByText("habit.windowFillPercentage")).toBeTruthy()
  })

  test("fetches the habit by the route's habitId param", () => {
    renderDetail()

    expect(useHabitQueryMock).toHaveBeenCalledWith({ habitId: "exercise" })
  })

  test("renders the score-over-time chart heading when history is present", () => {
    renderDetail()

    expect(screen.getByText("habit.scoreOverTime")).toBeTruthy()
  })

  test("omits the chart heading when there is no history", () => {
    renderDetail({ ...HABIT, history: [] })

    expect(screen.queryByText("habit.scoreOverTime")).toBeNull()
  })

  test("displays the current tracking window and all-time highs", () => {
    renderDetail()

    expect(screen.getByText("habit.currentTrackingWindow")).toBeTruthy()
    expect(screen.getByText("habit.highestScore")).toBeTruthy()
    expect(screen.getByText("600")).toBeTruthy()
    expect(screen.getByText("habit.bestStreak")).toBeTruthy()
    expect(screen.getByText("6")).toBeTruthy()
    expect(screen.getByText("habit.mostDaysLogged")).toBeTruthy()
    expect(screen.getByText("7")).toBeTruthy()
  })

  test("renders a table of score entries with their values and recency multipliers inline", () => {
    renderDetail()

    expect(screen.getByText("habit.scoreEntries")).toBeTruthy()
    fireEvent.click(screen.getByText("habit.scoreEntries"))
    expect(screen.getByText("Jan 2")).toBeTruthy()
    expect(screen.getByText("9 (x10)")).toBeTruthy()
    expect(screen.getByText("Jan 1")).toBeTruthy()
    expect(screen.getByText("4")).toBeTruthy()
  })

  test("collapses the score entries table by default and expands it on click", async () => {
    const { container } = renderDetail()
    const content = container.querySelector("[data-collapsible]")

    expect(content?.hasAttribute("hidden")).toBe(true)

    fireEvent.click(screen.getByText("habit.scoreEntries"))

    await waitFor(() => expect(content?.hasAttribute("hidden")).toBe(false))
  })

  test("omits the score entries table when there are no entries", () => {
    renderDetail({ ...HABIT, scoreEntries: [] })

    expect(screen.queryByText("habit.scoreEntries")).toBeNull()
  })

  test("links score entry dates to their notes via the obsidian url", () => {
    renderDetail()

    fireEvent.click(screen.getByText("habit.scoreEntries"))
    expect(screen.getByText("Jan 2").closest("a")).toHaveProperty(
      "href",
      "obsidian://open?vault=v&file=2026.01.02",
    )
    expect(screen.getByText("Jan 1").closest("a")).toHaveProperty(
      "href",
      "obsidian://open?vault=v&file=2026.01.01",
    )
  })

  test("shows an info popover describing the target and how the score is interpreted", () => {
    renderDetail({ ...HABIT, mode: "do-less", targetScore: 100 })

    fireEvent.click(
      screen.getByRole("button", { name: "habit.scoreInfoLabel" }),
    )

    expect(screen.getByText("habit.scoreInfoTarget")).toBeTruthy()
    expect(screen.getByText("habit.scoreInfoDoLess")).toBeTruthy()
  })

  test("omits the target line from the info popover when no target is configured", () => {
    renderDetail({ ...HABIT, mode: "do-more", targetScore: undefined })

    fireEvent.click(
      screen.getByRole("button", { name: "habit.scoreInfoLabel" }),
    )

    expect(screen.queryByText("habit.scoreInfoTarget")).toBeNull()
    expect(screen.getByText("habit.scoreInfoDoMore")).toBeTruthy()
  })

  test("renders heat dots for do-less habits scoring well above their target", () => {
    renderDetail({
      ...HABIT,
      mode: "do-less",
      habitScore: 125,
      targetScore: 100,
    })

    expect(screen.getByLabelText("habit.heatLevel")).toBeTruthy()
  })

  test("omits heat dots when the score is at or below the target", () => {
    renderDetail({
      ...HABIT,
      mode: "do-less",
      habitScore: 100,
      targetScore: 100,
    })

    expect(screen.queryByLabelText("habit.heatLevel")).toBeNull()
  })

  test("omits heat dots for do-more habits", () => {
    renderDetail({
      ...HABIT,
      mode: "do-more",
      habitScore: 200,
      targetScore: 100,
    })

    expect(screen.queryByLabelText("habit.heatLevel")).toBeNull()
  })
})
