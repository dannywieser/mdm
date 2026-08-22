import type { TransactionOccurrence } from "services"

export interface TransactionCalendarEntryProps {
  currency: string
  transaction: TransactionOccurrence
}
