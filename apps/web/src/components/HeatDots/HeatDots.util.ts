import type { HabitMode } from "services"

const HEAT_DOT_POINTS = 10

// "do-less" habits run hotter the further their score climbs above the
// target — render one heat dot per HEAT_DOT_POINTS the score sits above it.
export const calculateHeatDotCount = (
  mode: HabitMode,
  score: number,
  targetScore: number | undefined,
): number => {
  if (mode !== "do-less" || targetScore === undefined || score <= targetScore) return 0
  return Math.floor((score - targetScore) / HEAT_DOT_POINTS)
}

export const DOTS_PER_ROW = 5

export const splitDotsIntoRows = (count: number): number[] => {
  const rows: number[] = []
  for (let remaining = count; remaining > 0; remaining -= DOTS_PER_ROW) {
    rows.push(Math.min(remaining, DOTS_PER_ROW))
  }
  return rows
}
