import type { TransactionOccurrence } from "../transactions.types"

import { buildTotals } from "../transactions.totals"

const occurrence = (overrides: Partial<TransactionOccurrence>): TransactionOccurrence => ({
  amount: -10,
  category: null,
  date: "2026-03-01",
  description: "Something",
  id: "note:2026-03-01",
  noteId: "note",
  obsidianUrl: "obsidian://note",
  recurrence: null,
  status: "logged",
  ...overrides,
})

describe("buildTotals", () => {
  test("returns zeroes for an empty window", () => {
    expect(buildTotals([])).toEqual({ expense: 0, income: 0, logged: 0, net: 0, scheduled: 0 })
  })

  test("separates income from expense regardless of status", () => {
    const totals = buildTotals([
      occurrence({ amount: 2000, status: "scheduled" }),
      occurrence({ amount: -500 }),
    ])
    expect(totals.income).toBe(2000)
    expect(totals.expense).toBe(-500)
  })

  test("separates logged from scheduled subtotals", () => {
    const totals = buildTotals([
      occurrence({ amount: -100 }),
      occurrence({ amount: -250, status: "scheduled" }),
    ])
    expect(totals.logged).toBe(-100)
    expect(totals.scheduled).toBe(-250)
  })

  test("nets income against expense", () => {
    expect(buildTotals([occurrence({ amount: 1000 }), occurrence({ amount: -250 })]).net).toBe(750)
  })

  test("rounds away floating point drift when summing decimals", () => {
    expect(buildTotals([occurrence({ amount: -0.1 }), occurrence({ amount: -0.2 })]).net).toBe(-0.3)
  })
})
