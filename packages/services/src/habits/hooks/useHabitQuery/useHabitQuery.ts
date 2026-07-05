import { useSuspenseQuery } from "@tanstack/react-query"

import type { HabitResult } from "../../habits.types"
import type { UseHabitQueryParams } from "./useHabitQuery.types"

import { getHabitsBaseUrl } from "../../../config"
import { isDemoMode } from "../../../demo/demoMode"
import { buildDemoHabitUrl } from "../../../demo/demoUrls"

const fetchHabit = async (habitId: string): Promise<HabitResult> => {
  const url = isDemoMode()
    ? buildDemoHabitUrl(habitId)
    : `${getHabitsBaseUrl()}/habits/${encodeURIComponent(habitId)}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("errors.unableToLoadHabit")
  }

  return (await response.json()) as HabitResult
}

export const useHabitQuery = ({ habitId }: UseHabitQueryParams) =>
  useSuspenseQuery({
    queryKey: ["habit", habitId],
    queryFn: () => fetchHabit(habitId),
  })
