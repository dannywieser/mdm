import type { TransactionOccurrence } from "services"

export interface TransactionCalendarDay {
  /** "YYYY-MM-DD" date this cell represents. */
  date: string
  /** Day-of-month number shown in the cell. */
  dayOfMonth: number
  /** False for the padding cells that complete the first and last weeks. */
  isCurrentMonth: boolean
  isToday: boolean
  /** Net of every amount on this day. */
  total: number
  transactions: TransactionOccurrence[]
}

export interface TransactionCalendarWeek {
  days: TransactionCalendarDay[]
  /** Stable key for the row: the date of its first cell. */
  key: string
}
