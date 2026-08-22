export type RecurrenceUnit = "day" | "month" | "week" | "year"

export interface RecurrenceRule {
  /** Number of `unit`s between consecutive occurrences; always >= 1. */
  interval: number
  unit: RecurrenceUnit
}
