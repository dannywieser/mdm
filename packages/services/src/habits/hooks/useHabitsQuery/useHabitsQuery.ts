import { useSuspenseQuery } from "@tanstack/react-query"

import type { HabitSummary } from "../../habits.types"

import { getHabitsBaseUrl } from "../../../config"
import { isDemoMode } from "../../../demo/demoMode"
import { buildDemoHabitsUrl } from "../../../demo/demoUrls"

const fetchHabits = async (): Promise<HabitSummary[]> => {
  const url = isDemoMode() ? buildDemoHabitsUrl() : `${getHabitsBaseUrl()}/habits`
  const response = await fetch(url)

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
