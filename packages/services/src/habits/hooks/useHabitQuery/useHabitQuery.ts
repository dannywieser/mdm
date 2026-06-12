import { useSuspenseQuery } from "@tanstack/react-query"

import type { HabitResult } from "../../habits.types"
import type { UseHabitQueryParams } from "./useHabitQuery.types"

import { getHabitsBaseUrl } from "../../../config"

const fetchHabit = async (habitId: string): Promise<HabitResult> => {
  const response = await fetch(`${getHabitsBaseUrl()}/habits/${encodeURIComponent(habitId)}`)

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
