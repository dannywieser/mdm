/**
 * `logged` is a transaction a note records as having happened; `scheduled`
 * is one projected from a note's recurrence rule. Past occurrences of a
 * recurring note stay `scheduled` — the status describes where the entry
 * came from, not whether its date has passed.
 */
export type TransactionStatus = "logged" | "scheduled"

export interface TransactionOccurrence {
  /** Signed amount: negative is money out, positive is money in. */
  amount: number
  category: string | null
  /** "YYYY-MM-DD" date this occurrence falls on. */
  date: string
  description: string
  /** Unique per occurrence, so repeats of one note don't collide. */
  id: string
  /** Id of the note this came from; matches the notes-api note id. */
  noteId: string
  obsidianUrl: string
  /** Raw recurrence rule for scheduled entries; `null` when logged. */
  recurrence: string | null
  status: TransactionStatus
}

export interface TransactionTotals {
  /** Sum of every negative amount in the window. */
  expense: number
  /** Sum of every positive amount in the window. */
  income: number
  logged: number
  /** Income plus expense across both statuses. */
  net: number
  scheduled: number
}

export interface TransactionsResponse {
  /** ISO 4217 code used to format amounts. */
  currency: string
  from: string
  to: string
  totals: TransactionTotals
  transactions: TransactionOccurrence[]
}
