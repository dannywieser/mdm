export interface TransactionAmountProps {
  amount: number
  /** ISO 4217 code, e.g. "USD". */
  currency: string
  /** Renders the sign explicitly, for running totals where direction matters. */
  showSign?: boolean
  size?: "md" | "sm" | "xs"
}
