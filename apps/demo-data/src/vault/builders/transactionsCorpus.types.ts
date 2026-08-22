export interface ScheduledTransactionSeed {
  /** Signed amount: negative is money out, positive is money in. */
  amount: number
  category: string
  /** Day of month the first occurrence is anchored to. */
  dayOfMonth: number
  description: string
  /** Rule the transaction service parses, e.g. "monthly". */
  recurrence: string
}

export interface LoggedTransactionSeed {
  amount: number
  category: string
  description: string
}
