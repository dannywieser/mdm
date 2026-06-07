import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
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
  habitId: "exercise",
  habitName: "Daily Exercise",
  habitScore: 525,
  history: [
    { date: "2026-01-01", habitScore: 100, streak: 1, value: 8 },
    { date: "2026-01-02", habitScore: 200, streak: 2, value: 7 },
  ],
  mode: "do-more",
  streak: 5,
  streaks: [{ start: "2026-01-01", end: "2026-01-05", length: 5 }],
  windowEntries: 5,
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
  test("renders the habit name, score, days logged, and streak", () => {
    renderDetail()

    expect(screen.getByText("Daily Exercise")).toBeTruthy()
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
})
