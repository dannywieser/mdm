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
  test("renders the habit name, score, and streak", () => {
    renderCard(HABIT)

    expect(screen.getByText("Daily Exercise")).toBeTruthy()
    expect(screen.getByText("525")).toBeTruthy()
    expect(screen.getByText("habit.currentStreak: 5")).toBeTruthy()
  })

  test("links to the habit detail route", () => {
    renderCard(HABIT)

    expect(
      screen.getByRole("link", { name: /daily exercise/i }).getAttribute("href"),
    ).toBe("/tracking/exercise")
  })
})
