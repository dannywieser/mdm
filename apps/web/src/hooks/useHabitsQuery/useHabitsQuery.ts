import { useSuspenseQuery } from "@tanstack/react-query"

import { translate } from "../../i18n"
import type { HabitSummary } from "../../types/habits"

const HABIT_API_BASE_URL = import.meta.env.VITE_HABIT_API_BASE_URL ?? ""

const fetchHabits = async (): Promise<HabitSummary[]> => {
  const response = await fetch(`${HABIT_API_BASE_URL}/habits`)

  if (!response.ok) {
    throw new Error(translate("errors.unableToLoadHabits"))
  }

  return (await response.json()) as HabitSummary[]
}

export const useHabitsQuery = () =>
  useSuspenseQuery({
    queryKey: ["habits"],
    queryFn: fetchHabits,
  })
