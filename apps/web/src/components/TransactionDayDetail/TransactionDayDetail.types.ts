import type { TransactionCalendarDay } from "../TransactionCalendar/TransactionCalendar.types"

/**
 * Which edge the panel hangs from. A centred panel is wider than the cell it
 * belongs to, so the first and last columns anchor to their own edge instead
 * of overflowing the page.
 */
export type TransactionDayDetailAlign = "center" | "end" | "start"

export interface TransactionDayDetailProps {
  align: TransactionDayDetailAlign
  currency: string
  day: TransactionCalendarDay
}
