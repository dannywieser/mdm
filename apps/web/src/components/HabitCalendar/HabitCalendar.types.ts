import type { HabitHistoryEntry } from "services"

export interface HabitCalendarProps {
  history: HabitHistoryEntry[]
  referenceDate: string
}

export interface HabitCalendarDay {
  date: string
  value: number
  level: number
  isFuture: boolean
}

export interface HabitCalendarWeek {
  days: (HabitCalendarDay | null)[]
}

export interface HabitCalendarMonth {
  monthKey: string
  label: string
  weeks: HabitCalendarWeek[]
}
