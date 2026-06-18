import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import type { HabitScoreBreakdown } from "services"

import { ScoreBreakdown } from "./ScoreBreakdown"
import { formatContributionAmount, formatTierLabel } from "./ScoreBreakdown.util"

afterEach(cleanup)

vi.mock("../../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

const BREAKDOWN_5_DAYS: HabitScoreBreakdown = {
  entryScores: 500,
  daysTiers: [{ startDay: 1, endDay: 5, rate: 0.005, days: 5, amount: 12.5 }],
  streakTiers: [{ startDay: 1, endDay: 5, rate: 0.005, days: 5, amount: 12.6 }],
}

const renderBreakdown = (props: Partial<Parameters<typeof ScoreBreakdown>[0]> = {}) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <ScoreBreakdown
        mode="do-more"
        breakdown={BREAKDOWN_5_DAYS}
        habitScore={525}
        {...props}
      />
    </ChakraProvider>,
  )

describe("ScoreBreakdown", () => {
  test("renders section title and entry scores", () => {
    renderBreakdown()

    expect(screen.getByText("habit.scoreBreakdown")).toBeTruthy()
    expect(screen.getByText("habit.scoreBreakdownEntries")).toBeTruthy()
    expect(screen.getByText("500")).toBeTruthy()
  })

  test("renders one days tier and one streak tier", () => {
    renderBreakdown()

    expect(screen.getByText("days 1–5 × 0.5%")).toBeTruthy()
    expect(screen.getByText("streak 1–5 × 0.5%")).toBeTruthy()
  })

  test("renders multiple days tiers when breakdown includes them", () => {
    renderBreakdown({
      breakdown: {
        entryScores: 500,
        daysTiers: [
          { startDay: 1, endDay: 5, rate: 0.005, days: 5, amount: 12.5 },
          { startDay: 6, endDay: 10, rate: 0.006, days: 5, amount: 15.3 },
          { startDay: 11, endDay: 12, rate: 0.007, days: 2, amount: 4.3 },
        ],
        streakTiers: [],
      },
    })

    expect(screen.getByText("days 1–5 × 0.5%")).toBeTruthy()
    expect(screen.getByText("days 6–10 × 0.6%")).toBeTruthy()
    expect(screen.getByText("days 11–12 × 0.7%")).toBeTruthy()
  })

  test("renders multiple streak tiers when breakdown includes them", () => {
    renderBreakdown({
      breakdown: {
        entryScores: 500,
        daysTiers: [],
        streakTiers: [
          { startDay: 1, endDay: 5, rate: 0.005, days: 5, amount: 12.8 },
          { startDay: 6, endDay: 7, rate: 0.006, days: 2, amount: 5.1 },
        ],
      },
    })

    expect(screen.getByText("streak 1–5 × 0.5%")).toBeTruthy()
    expect(screen.getByText("streak 6–7 × 0.6%")).toBeTruthy()
  })

  test("renders final score", () => {
    renderBreakdown()

    expect(screen.getByText("habit.scoreBreakdownFinalScore")).toBeTruthy()
    expect(screen.getByText("525")).toBeTruthy()
  })

  test("omits streak rows when streakTiers is empty", () => {
    renderBreakdown({
      breakdown: { ...BREAKDOWN_5_DAYS, streakTiers: [] },
    })

    expect(screen.queryByText(/streak/)).toBeNull()
  })

  test("omits days rows when daysTiers is empty", () => {
    renderBreakdown({
      breakdown: { ...BREAKDOWN_5_DAYS, daysTiers: [] },
    })

    expect(screen.queryByText(/days \d/)).toBeNull()
  })

  test("uses days logged penalty label for do-less habits", () => {
    renderBreakdown({ mode: "do-less" })

    expect(screen.getByText("habit.scoreBreakdownDaysPenalty")).toBeTruthy()
  })

  test("uses days logged bonus label for do-more habits", () => {
    renderBreakdown()

    expect(screen.getByText("habit.scoreBreakdownDaysBonus")).toBeTruthy()
  })
})

describe("formatContributionAmount", () => {
  test("prefixes positive values with a plus sign", () => {
    expect(formatContributionAmount(7)).toBe("+7")
  })

  test("preserves the minus sign for negative values", () => {
    expect(formatContributionAmount(-3.745)).toBe("-3.7")
  })

  test("rounds to one decimal place when fractional", () => {
    expect(formatContributionAmount(3.745)).toBe("+3.7")
    expect(formatContributionAmount(3.75)).toBe("+3.8")
  })

  test("omits the decimal when the rounded value is a whole number", () => {
    expect(formatContributionAmount(7.0)).toBe("+7")
    expect(formatContributionAmount(7.04)).toBe("+7")
  })
})

describe("formatTierLabel", () => {
  test("formats a label with prefix, day range, and rate percentage", () => {
    expect(formatTierLabel("days", 1, 5, 0.005)).toBe("days 1–5 × 0.5%")
    expect(formatTierLabel("streak", 6, 10, 0.006)).toBe("streak 6–10 × 0.6%")
  })
})
