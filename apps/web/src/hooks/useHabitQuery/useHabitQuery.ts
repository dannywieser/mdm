import { useSuspenseQuery } from "@tanstack/react-query"

import { translate } from "../../i18n"
import type { HabitResult } from "../../types/habits"

import type { UseHabitQueryParams } from "./useHabitQuery.types"

const HABIT_API_BASE_URL = import.meta.env.VITE_HABIT_API_BASE_URL ?? ""

const fetchHabit = async (habitId: string): Promise<HabitResult> => {
  const response = await fetch(`${HABIT_API_BASE_URL}/habits/${encodeURIComponent(habitId)}`)

  if (!response.ok) {
    throw new Error(translate("errors.unableToLoadHabit"))
  }

  return (await response.json()) as HabitResult
}

export const useHabitQuery = ({ habitId }: UseHabitQueryParams) =>
  useSuspenseQuery({
    queryKey: ["habit", habitId],
    queryFn: () => fetchHabit(habitId),
  })
