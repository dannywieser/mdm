import type { HabitMode } from "../../types/habits"

export type HabitScoreStatus = "green" | "yellow" | "red" | "neutral"

// "do-less" status bands scale with targetScore: green below 50% of target,
// yellow below 75%, red from 75% upward (a target of 100 means green 0-50,
// yellow 50-75, red 75+). Habits without a configured targetScore render neutral.
export const getDoLessScoreStatus = (score: number, targetScore?: number): HabitScoreStatus => {
  if (targetScore === undefined) return "neutral"
  if (score < targetScore * 0.5) return "green"
  if (score < targetScore * 0.75) return "yellow"
  return "red"
}

export const getHabitScoreColor = (mode: HabitMode, score: number, targetScore?: number): string => {
  if (mode === "do-more") return "app.accent"

  switch (getDoLessScoreStatus(score, targetScore)) {
    case "green":
      return "green.500"
    case "yellow":
      return "yellow.500"
    case "red":
      return "red.500"
    default:
      return "app.text"
  }
}
