export interface TransactionRange {
  /** Inclusive first day of the window, "YYYY-MM-DD". */
  from: string
  /** Inclusive last day of the window, "YYYY-MM-DD". */
  to: string
}
