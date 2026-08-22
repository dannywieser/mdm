import { describe, expect, test } from "vitest"

import type { TransactionOccurrence, TransactionsResponse } from "../../../transactions.types"

import { buildTransactionTotals, filterTransactionsToMonth } from "../useTransactionsQuery.util"

const occurrence = (overrides: Partial<TransactionOccurrence>): TransactionOccurrence => ({
  amount: -10,
  category: null,
  date: "2026-03-04",
  description: "Coffee",
  id: "note:2026-03-04",
  noteId: "note",
  obsidianUrl: "obsidian://note",
  recurrence: null,
  status: "logged",
  ...overrides,
})

const snapshot = (transactions: TransactionOccurrence[]): TransactionsResponse => ({
  currency: "USD",
  from: "2025-01-01",
  to: "2027-12-31",
  totals: { expense: 0, income: 0, logged: 0, net: 0, scheduled: 0 },
  transactions,
})

describe("buildTransactionTotals", () => {
  test("returns zeroes for an empty set", () => {
    expect(buildTransactionTotals([])).toEqual({
      expense: 0,
      income: 0,
      logged: 0,
      net: 0,
      scheduled: 0,
    })
  })

  test("splits income, expense and the status subtotals", () => {
    expect(
      buildTransactionTotals([
        occurrence({ amount: 2500, status: "scheduled" }),
        occurrence({ amount: -400 }),
      ]),
    ).toEqual({ expense: -400, income: 2500, logged: -400, net: 2100, scheduled: 2500 })
  })

  test("rounds away floating point drift", () => {
    expect(buildTransactionTotals([occurrence({ amount: -0.1 }), occurrence({ amount: -0.2 })]).net).toBe(
      -0.3,
    )
  })
})

describe("filterTransactionsToMonth", () => {
  test("keeps only the requested month's occurrences", () => {
    const result = filterTransactionsToMonth(
      snapshot([occurrence({}), occurrence({ date: "2026-04-04", id: "b" })]),
      "2026-03",
    )

    expect(result.transactions.map(({ date }) => date)).toEqual(["2026-03-04"])
  })

  test("does not match a month whose key is a prefix of another", () => {
    const result = filterTransactionsToMonth(snapshot([occurrence({ date: "2026-12-04" })]), "2026-1")

    expect(result.transactions).toEqual([])
  })

  test("reports the requested month as the window", () => {
    const result = filterTransactionsToMonth(snapshot([]), "2026-02")

    expect(result).toMatchObject({ from: "2026-02-01", to: "2026-02-28" })
  })

  test("recomputes totals for the narrowed set", () => {
    const result = filterTransactionsToMonth(
      snapshot([occurrence({ amount: -50 }), occurrence({ amount: -70, date: "2026-04-04", id: "b" })]),
      "2026-03",
    )

    expect(result.totals.net).toBe(-50)
  })

  test("carries the snapshot currency through", () => {
    expect(filterTransactionsToMonth(snapshot([]), "2026-03").currency).toBe("USD")
  })

  test("returns an empty month for one the snapshot does not cover", () => {
    const result = filterTransactionsToMonth(snapshot([occurrence({})]), "2099-07")

    expect(result.transactions).toEqual([])
    expect(result.totals.net).toBe(0)
  })
})
