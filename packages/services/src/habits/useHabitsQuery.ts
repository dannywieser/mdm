import { useSuspenseQuery } from "@tanstack/react-query"

import { getHabitsBaseUrl } from "../config"

import type { HabitSummary } from "./habits.types"

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
