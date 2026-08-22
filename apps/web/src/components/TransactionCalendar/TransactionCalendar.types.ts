import type { TransactionOccurrence } from "services"

export interface TransactionCalendarDay {
  /** "YYYY-MM-DD" date this cell represents. */
  date: string
  /** Day-of-month number shown in the cell. */
  dayOfMonth: number
  /** How many of the day's transactions are money out. */
  expenseCount: number
  /** How many of the day's transactions are money in. */
  incomeCount: number
  /** False for the padding cells that complete the first and last weeks. */
  isCurrentMonth: boolean
  isToday: boolean
  /** Net of the day's logged amounts; 0 when it has none. */
  loggedTotal: number
  /** Net of the day's scheduled amounts; 0 when it has none. */
  scheduledTotal: number
  transactions: TransactionOccurrence[]
}

export interface TransactionCalendarWeek {
  days: TransactionCalendarDay[]
  /** Stable key for the row: the date of its first cell. */
  key: string
}
