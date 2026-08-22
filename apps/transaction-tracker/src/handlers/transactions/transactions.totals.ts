import type { TransactionOccurrence, TransactionTotals } from "services"

const sumAmounts = (
  occurrences: readonly TransactionOccurrence[],
  predicate: (occurrence: TransactionOccurrence) => boolean,
): number =>
  occurrences.reduce((total, occurrence) => (predicate(occurrence) ? total + occurrence.amount : total), 0)

/** Guards against floating-point drift when summing decimal amounts. */
const toCurrencyPrecision = (value: number): number => Math.round(value * 100) / 100

/**
 * Summarises the occurrences in a window: money in and out regardless of
 * status, the logged and scheduled subtotals, and the resulting net.
 */
export const buildTotals = (occurrences: readonly TransactionOccurrence[]): TransactionTotals => ({
  expense: toCurrencyPrecision(sumAmounts(occurrences, ({ amount }) => amount < 0)),
  income: toCurrencyPrecision(sumAmounts(occurrences, ({ amount }) => amount > 0)),
  logged: toCurrencyPrecision(sumAmounts(occurrences, ({ status }) => status === "logged")),
  net: toCurrencyPrecision(sumAmounts(occurrences, () => true)),
  scheduled: toCurrencyPrecision(sumAmounts(occurrences, ({ status }) => status === "scheduled")),
})
