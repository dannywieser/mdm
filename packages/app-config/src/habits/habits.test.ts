import { validateHabits } from "./habits"

const VALID_HABIT = {
  frontmatterProperty: "exercise",
  id: "exercise",
  mode: "do-more" as const,
  name: "Exercise",
  trackingWindowDays: 90,
}

const ERROR =
  "app.config.json habits must be an array of objects with non-empty id, name, frontmatterProperty, mode (\"do-more\" or \"do-less\"), a positive integer trackingWindowDays, and an optional positive targetScore"

describe("validateHabits", () => {
  test("returns empty array when value is undefined", () => {
    expect(validateHabits(undefined)).toEqual([])
  })

  test("returns validated habits for a valid do-more habit", () => {
    expect(validateHabits([VALID_HABIT])).toEqual([VALID_HABIT])
  })

  test("returns validated habits for a valid do-less habit", () => {
    const habit = { ...VALID_HABIT, mode: "do-less" as const }
    expect(validateHabits([habit])).toEqual([habit])
  })

  test("accepts an optional positive targetScore", () => {
    const habit = { ...VALID_HABIT, targetScore: 100 }
    expect(validateHabits([habit])).toEqual([habit])
  })

  test("throws when value is not an array", () => {
    expect(() => validateHabits("not-an-array")).toThrow(ERROR)
  })

  test("throws when habit is missing id", () => {
    expect(() => validateHabits([{ frontmatterProperty: "exercise", mode: "do-more", name: "Exercise", trackingWindowDays: 90 }])).toThrow(ERROR)
  })

  test("throws when habit is missing name", () => {
    expect(() => validateHabits([{ frontmatterProperty: "exercise", id: "exercise", mode: "do-more", trackingWindowDays: 90 }])).toThrow(ERROR)
  })

  test("throws when habit is missing frontmatterProperty", () => {
    expect(() => validateHabits([{ id: "exercise", mode: "do-more", name: "Exercise", trackingWindowDays: 90 }])).toThrow(ERROR)
  })

  test("throws when mode is not do-more or do-less", () => {
    expect(() => validateHabits([{ ...VALID_HABIT, mode: "sometimes" }])).toThrow(ERROR)
  })

  test("throws when trackingWindowDays is zero", () => {
    expect(() => validateHabits([{ ...VALID_HABIT, trackingWindowDays: 0 }])).toThrow(ERROR)
  })

  test("throws when trackingWindowDays is negative", () => {
    expect(() => validateHabits([{ ...VALID_HABIT, trackingWindowDays: -1 }])).toThrow(ERROR)
  })

  test("throws when trackingWindowDays is a float", () => {
    expect(() => validateHabits([{ ...VALID_HABIT, trackingWindowDays: 30.5 }])).toThrow(ERROR)
  })

  test("throws when targetScore is zero", () => {
    expect(() => validateHabits([{ ...VALID_HABIT, targetScore: 0 }])).toThrow(ERROR)
  })

  test("throws when targetScore is negative", () => {
    expect(() => validateHabits([{ ...VALID_HABIT, targetScore: -10 }])).toThrow(ERROR)
  })
})
