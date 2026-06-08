import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, test, vi } from "vitest"

import type { HabitSummary } from "../../types/habits"

import { HabitCard } from "./HabitCard"

vi.mock("../../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

afterEach(cleanup)

const HABIT: HabitSummary = {
  habitId: "exercise",
  habitName: "Daily Exercise",
  habitScore: 525,
  mode: "do-more",
  streak: 5,
  windowEntries: 12,
}

const renderCard = (habit: HabitSummary) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter>
        <HabitCard habit={habit} />
      </MemoryRouter>
    </ChakraProvider>,
  )

describe("HabitCard", () => {
  test("renders the title prefixed with its mode", () => {
    renderCard(HABIT)

    expect(screen.getByText("habit.modeDoMore: Daily Exercise")).toBeTruthy()
  })

  test("renders the do-less mode label for do-less habits", () => {
    renderCard({ ...HABIT, mode: "do-less" })

    expect(screen.getByText("habit.modeDoLess: Daily Exercise")).toBeTruthy()
  })

  test("renders the habit score, streak, and total days stats", () => {
    renderCard(HABIT)

    expect(screen.getByText("habit.score")).toBeTruthy()
    expect(screen.getByText("525")).toBeTruthy()
    expect(screen.getByText("habit.currentStreak")).toBeTruthy()
    expect(screen.getByText("habit.totalDays")).toBeTruthy()
    expect(screen.getAllByText("5")).toHaveLength(1)
    expect(screen.getByText("12")).toBeTruthy()
  })

  test("links to the habit detail route", () => {
    renderCard(HABIT)

    const link = screen.getByRole("link", { name: /daily exercise/i })

    expect(link.getAttribute("href")).toBe("/tracking/exercise")
    expect(link.getAttribute("style")).toContain("display: block")
    expect(link.getAttribute("style")).toContain("width: 100%")
  })
})
