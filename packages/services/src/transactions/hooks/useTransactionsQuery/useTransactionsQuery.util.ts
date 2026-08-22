import { getMonthEnd, getMonthStart } from "mdm-util"

import type { TransactionOccurrence, TransactionsResponse, TransactionTotals } from "../../transactions.types"

const sumAmounts = (
  occurrences: readonly TransactionOccurrence[],
  predicate: (occurrence: TransactionOccurrence) => boolean,
): number =>
  occurrences.reduce((total, occurrence) => (predicate(occurrence) ? total + occurrence.amount : total), 0)

const toCurrencyPrecision = (value: number): number => Math.round(value * 100) / 100

/**
 * Recomputes the window totals for a narrowed set of occurrences. Demo mode
 * slices a fixed snapshot down to one month, so the snapshot's own totals —
 * which cover its whole window — no longer describe what is shown.
 */
export const buildTransactionTotals = (
  occurrences: readonly TransactionOccurrence[],
): TransactionTotals => ({
  expense: toCurrencyPrecision(sumAmounts(occurrences, ({ amount }) => amount < 0)),
  income: toCurrencyPrecision(sumAmounts(occurrences, ({ amount }) => amount > 0)),
  logged: toCurrencyPrecision(sumAmounts(occurrences, ({ status }) => status === "logged")),
  net: toCurrencyPrecision(sumAmounts(occurrences, () => true)),
  scheduled: toCurrencyPrecision(sumAmounts(occurrences, ({ status }) => status === "scheduled")),
})

/**
 * Narrows a snapshot covering many months down to the requested one. Months
 * outside the snapshot's window simply come back empty — the static demo
 * has no way to project recurrences the way the live service does.
 */
export const filterTransactionsToMonth = (
  snapshot: TransactionsResponse,
  month: string,
): TransactionsResponse => {
  const transactions = snapshot.transactions.filter(({ date }) => date.startsWith(`${month}-`))

  return {
    currency: snapshot.currency,
    from: getMonthStart(month),
    to: getMonthEnd(month),
    totals: buildTransactionTotals(transactions),
    transactions,
  }
}
