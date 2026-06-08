import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, describe, expect, test, vi } from "vitest"

import type { HabitResult } from "../../types/habits"

import { HabitDetail } from "./HabitDetail"

afterEach(cleanup)

const useHabitQueryMock = vi.fn()

vi.mock("../../hooks/useHabitQuery/useHabitQuery", () => ({
  useHabitQuery: (params: { habitId: string }) => useHabitQueryMock(params),
}))

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
    { date: "2026-01-01", habitScore: 100, streak: 1, value: 8 },
    { date: "2026-01-02", habitScore: 200, streak: 2, value: 7 },
  ],
  mode: "do-more",
  scoreEntries: [
    { date: "2026-01-02", value: 9, recentMultiplier: 10, obsidianUrl: "obsidian://open?vault=v&file=2026.01.02" },
    { date: "2026-01-01", value: 4, obsidianUrl: "obsidian://open?vault=v&file=2026.01.01" },
  ],
  streak: 5,
  streaks: [{ start: "2026-01-01", end: "2026-01-05", length: 5 }],
  windowEntries: 5,
  windowStart: "2025-12-29",
}

const renderDetail = (data: HabitResult = HABIT) => {
  useHabitQueryMock.mockReturnValue({ data })
  render(
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

    expect(screen.getByText("habit.modeDoMore: Daily Exercise")).toBeTruthy()
  })

  test("renders the do-less mode label for do-less habits", () => {
    renderDetail({ ...HABIT, mode: "do-less" })

    expect(screen.getByText("habit.modeDoLess: Daily Exercise")).toBeTruthy()
  })

  test("renders the habit name, score, days logged, and streak", () => {
    renderDetail()

    expect(screen.getByText("habit.modeDoMore: Daily Exercise")).toBeTruthy()
    expect(screen.getByText("525")).toBeTruthy()
    expect(screen.getAllByText("5")).toHaveLength(2)
    expect(screen.getByText("habit.daysLogged")).toBeTruthy()
    expect(screen.getByText("habit.currentStreak")).toBeTruthy()
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

  test("displays the window start and all-time highs", () => {
    renderDetail()

    expect(screen.getByText("habit.windowStart")).toBeTruthy()
    expect(screen.getByText("Dec 29")).toBeTruthy()
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
    expect(screen.getByText("Jan 2")).toBeTruthy()
    expect(screen.getByText("9 (x10)")).toBeTruthy()
    expect(screen.getByText("Jan 1")).toBeTruthy()
    expect(screen.getByText("4")).toBeTruthy()
  })

  test("omits the score entries table when there are no entries", () => {
    renderDetail({ ...HABIT, scoreEntries: [] })

    expect(screen.queryByText("habit.scoreEntries")).toBeNull()
  })

  test("links score entry dates to their notes via the obsidian url", () => {
    renderDetail()

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

    fireEvent.click(screen.getByRole("button", { name: "habit.scoreInfoLabel" }))

    expect(screen.getByText("habit.scoreInfoTarget")).toBeTruthy()
    expect(screen.getByText("habit.scoreInfoDoLess")).toBeTruthy()
  })

  test("omits the target line from the info popover when no target is configured", () => {
    renderDetail({ ...HABIT, mode: "do-more", targetScore: undefined })

    fireEvent.click(screen.getByRole("button", { name: "habit.scoreInfoLabel" }))

    expect(screen.queryByText("habit.scoreInfoTarget")).toBeNull()
    expect(screen.getByText("habit.scoreInfoDoMore")).toBeTruthy()
  })

  test("renders heat dots for do-less habits scoring well above their target", () => {
    renderDetail({ ...HABIT, mode: "do-less", habitScore: 125, targetScore: 100 })

    expect(screen.getByLabelText("habit.heatLevel")).toBeTruthy()
  })

  test("omits heat dots when the score is at or below the target", () => {
    renderDetail({ ...HABIT, mode: "do-less", habitScore: 100, targetScore: 100 })

    expect(screen.queryByLabelText("habit.heatLevel")).toBeNull()
  })

  test("omits heat dots for do-more habits", () => {
    renderDetail({ ...HABIT, mode: "do-more", habitScore: 200, targetScore: 100 })

    expect(screen.queryByLabelText("habit.heatLevel")).toBeNull()
  })
})
