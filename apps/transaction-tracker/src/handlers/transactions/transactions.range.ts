import { getMonthEnd, getMonthKey, getMonthStart } from "mdm-util"

import type { TransactionRange } from "./transactions.range.types"

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const MONTH_KEY_PATTERN = /^\d{4}-\d{2}$/

const isIsoDate = (value: unknown): value is string =>
  typeof value === "string" && ISO_DATE_PATTERN.test(value) && !Number.isNaN(Date.parse(value))

/**
 * Resolves the window a request asks for. Callers can pass an explicit
 * `from`/`to` pair, or a `month` shorthand (`YYYY-MM`) that expands to that
 * whole calendar month; with neither, the window is the month containing
 * `today`. Any future month resolves the same way, which is what lets the
 * calendar page forward indefinitely without the API needing a horizon.
 *
 * @throws Error when the supplied values aren't valid dates, or `to` precedes `from`.
 */
export const resolveTransactionRange = (
  query: Record<string, unknown>,
  today: string,
): TransactionRange => {
  const { from, month, to } = query

  if (month !== undefined) {
    if (typeof month !== "string" || !MONTH_KEY_PATTERN.test(month)) {
      throw new Error("month must be a YYYY-MM value")
    }
    return { from: getMonthStart(month), to: getMonthEnd(month) }
  }

  if (from === undefined && to === undefined) {
    const monthKey = getMonthKey(today)
    return { from: getMonthStart(monthKey), to: getMonthEnd(monthKey) }
  }

  if (!isIsoDate(from) || !isIsoDate(to)) {
    throw new Error("from and to must both be YYYY-MM-DD values")
  }

  if (to < from) {
    throw new Error("to must not be earlier than from")
  }

  return { from, to }
}
