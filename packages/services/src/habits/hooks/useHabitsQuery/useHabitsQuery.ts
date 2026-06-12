import { useSuspenseQuery } from "@tanstack/react-query"

import type { HabitSummary } from "../../habits.types"

import { getHabitsBaseUrl } from "../../../config"

const fetchHabits = async (): Promise<HabitSummary[]> => {
  const response = await fetch(`${getHabitsBaseUrl()}/habits`)

  if (!response.ok) {
    throw new Error("errors.unableToLoadHabits")
  }

  return (await response.json()) as HabitSummary[]
}

export const useHabitsQuery = () =>
  useSuspenseQuery({
    queryKey: ["habits"],
    queryFn: fetchHabits,
  })
