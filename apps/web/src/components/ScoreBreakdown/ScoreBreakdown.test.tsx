import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { ScoreBreakdown } from "./ScoreBreakdown"
import {
  calculateScoreContributions,
  calculateTieredBreakdown,
  formatContributionAmount,
  formatTierLabel,
} from "./ScoreBreakdown.util"

afterEach(cleanup)

vi.mock("../../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

const renderBreakdown = (props = {}) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <ScoreBreakdown
        mode="do-more"
        scoreBeforeMultipliers={500}
        dayMultiplier={0.025}
        streakMultiplier={0.025}
        windowEntries={5}
        streak={5}
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

  test("renders one days tier and one streak tier for a 5-day window", () => {
    renderBreakdown()

    expect(screen.getByText("days 1–5 × 0.5%")).toBeTruthy()
    expect(screen.getByText("streak 1–5 × 0.5%")).toBeTruthy()
  })

  test("renders multiple days tiers when windowEntries spans more than 5 days", () => {
    renderBreakdown({ windowEntries: 12, dayMultiplier: 0.083 })

    expect(screen.getByText("days 1–5 × 0.5%")).toBeTruthy()
    expect(screen.getByText("days 6–10 × 0.6%")).toBeTruthy()
    expect(screen.getByText("days 11–12 × 0.7%")).toBeTruthy()
  })

  test("renders multiple streak tiers when streak spans more than 5 days", () => {
    renderBreakdown({ streak: 7, streakMultiplier: 0.037 })

    expect(screen.getByText("streak 1–5 × 0.5%")).toBeTruthy()
    expect(screen.getByText("streak 6–7 × 0.6%")).toBeTruthy()
  })

  test("renders final score", () => {
    renderBreakdown()

    expect(screen.getByText("habit.scoreBreakdownFinalScore")).toBeTruthy()
    expect(screen.getByText("525")).toBeTruthy()
  })

  test("omits streak rows when streak is 0", () => {
    renderBreakdown({ streak: 0, streakMultiplier: 0 })

    expect(screen.queryByText(/streak/)).toBeNull()
  })

  test("omits days rows when windowEntries is 0", () => {
    renderBreakdown({ windowEntries: 0, dayMultiplier: 0 })

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

describe("calculateTieredBreakdown", () => {
  test("returns empty array for count 0", () => {
    expect(calculateTieredBreakdown(0, 100)).toEqual([])
  })

  test("returns one tier covering days 1–5 for count 5", () => {
    const tiers = calculateTieredBreakdown(5, 100)

    expect(tiers).toHaveLength(1)
    expect(tiers[0]).toMatchObject({ startDay: 1, endDay: 5, rate: 0.005, days: 5 })
    expect(tiers[0]?.amount).toBeCloseTo(100 * 5 * 0.005)
  })

  test("returns two tiers with escalating rates for count 10", () => {
    const tiers = calculateTieredBreakdown(10, 100)

    expect(tiers).toHaveLength(2)
    expect(tiers[0]).toMatchObject({ startDay: 1, endDay: 5, rate: 0.005, days: 5 })
    expect(tiers[1]).toMatchObject({ startDay: 6, endDay: 10, rate: 0.006, days: 5 })
  })

  test("last tier is partial when count is not a multiple of 5", () => {
    const tiers = calculateTieredBreakdown(12, 100)

    expect(tiers).toHaveLength(3)
    expect(tiers[2]).toMatchObject({ startDay: 11, endDay: 12, rate: 0.007, days: 2 })
    expect(tiers[2]?.amount).toBeCloseTo(100 * 2 * 0.007)
  })

  test("scales amounts proportionally to the base amount", () => {
    const at100 = calculateTieredBreakdown(5, 100)
    const at200 = calculateTieredBreakdown(5, 200)

    const at100Amount = at100[0]?.amount ?? 0
    expect(at200[0]?.amount).toBeCloseTo(at100Amount * 2)
  })
})

describe("calculateScoreContributions", () => {
  test("returns empty tiers when count is zero", () => {
    const result = calculateScoreContributions(500, 0, 0, 0, 0)

    expect(result.daysTiers).toHaveLength(0)
    expect(result.streakTiers).toHaveLength(0)
  })

  test("streak tier amounts are negated for do-less (negative streakMultiplier)", () => {
    const result = calculateScoreContributions(500, 0.025, -0.025, 5, 5)

    for (const tier of result.streakTiers) {
      expect(tier.amount).toBeLessThan(0)
    }
  })

  test("streak tier amounts are positive for do-more (positive streakMultiplier)", () => {
    const result = calculateScoreContributions(500, 0.025, 0.025, 5, 5)

    for (const tier of result.streakTiers) {
      expect(tier.amount).toBeGreaterThan(0)
    }
  })

  test("streak tiers are computed on the post-day-bonus base", () => {
    const base = 100
    const dayMult = 0.025
    const result = calculateScoreContributions(base, dayMult, 0.025, 5, 5)
    const afterDay = base * (1 + dayMult)

    expect(result.streakTiers[0]?.amount).toBeCloseTo(afterDay * 5 * 0.005)
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
