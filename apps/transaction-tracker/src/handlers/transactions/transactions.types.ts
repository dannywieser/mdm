export type { TransactionOccurrence, TransactionsResponse, TransactionStatus } from "services"

/**
 * A transaction as it is defined by a single note, before recurrence is
 * expanded into dated occurrences.
 */
export interface TransactionDefinition {
  /** Signed amount: negative is money out, positive is money in. */
  amount: number
  /** Date of the transaction, or of a schedule's first occurrence. */
  anchorDate: string
  category: string | null
  description: string
  noteId: string
  obsidianUrl: string
  /** Raw recurrence value from frontmatter; `null` for a one-off. */
  recurrence: string | null
  /** Inclusive last date a recurrence may occur on. */
  until: string | null
}
