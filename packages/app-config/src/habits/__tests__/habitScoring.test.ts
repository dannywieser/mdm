import { DEFAULT_HABIT_SCORING, isValidHabitScoringInput, resolveHabitScoring } from "../habitScoring"

describe("isValidHabitScoringInput", () => {
  test("accepts an empty object", () => {
    expect(isValidHabitScoringInput({})).toBe(true)
  })

  test("accepts a fully populated object", () => {
    expect(
      isValidHabitScoringInput({
        baseBonusRate: 0.01,
        bonusRateIncrement: 0.002,
        bonusTierSize: 7,
        minStreakDays: 3,
        recentMultiplier: 5,
        recentWindowDays: 10,
      }),
    ).toBe(true)
  })

  test("accepts 0 for every field", () => {
    expect(
      isValidHabitScoringInput({
        baseBonusRate: 0,
        bonusRateIncrement: 0,
        bonusTierSize: 0,
        minStreakDays: 0,
        recentMultiplier: 0,
        recentWindowDays: 0,
      }),
    ).toBe(true)
  })

  test("rejects a non-object value", () => {
    expect(isValidHabitScoringInput("not-an-object")).toBe(false)
  })

  test("rejects a negative integer field", () => {
    expect(isValidHabitScoringInput({ bonusTierSize: -1 })).toBe(false)
  })

  test("rejects a non-integer for an integer field", () => {
    expect(isValidHabitScoringInput({ minStreakDays: 1.5 })).toBe(false)
  })

  test("rejects a negative rate field", () => {
    expect(isValidHabitScoringInput({ baseBonusRate: -0.01 })).toBe(false)
  })

  test("accepts a non-integer rate field", () => {
    expect(isValidHabitScoringInput({ baseBonusRate: 0.0123 })).toBe(true)
  })
})

describe("resolveHabitScoring", () => {
  test("returns all defaults when value is undefined", () => {
    expect(resolveHabitScoring(undefined)).toEqual(DEFAULT_HABIT_SCORING)
  })

  test("returns all defaults when value is an empty object", () => {
    expect(resolveHabitScoring({})).toEqual(DEFAULT_HABIT_SCORING)
  })

  test("overrides only the provided fields", () => {
    expect(resolveHabitScoring({ bonusTierSize: 0, recentWindowDays: 0 })).toEqual({
      ...DEFAULT_HABIT_SCORING,
      bonusTierSize: 0,
      recentWindowDays: 0,
    })
  })
})
