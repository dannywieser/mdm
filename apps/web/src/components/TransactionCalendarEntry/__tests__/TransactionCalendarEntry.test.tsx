import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, test, vi } from "vitest"

import type { TransactionOccurrence } from "services"

import { TransactionCalendarEntry } from "../TransactionCalendarEntry"

vi.mock("../../../i18n", () => ({
  useI18n: () => ({
    t: (key: string, values?: Record<string, string | number>) =>
      values ? `${key} ${JSON.stringify(values)}` : key,
  }),
}))

vi.mock("../../TransactionAmount", () => ({
  TransactionAmount: ({ amount }: { amount: number }) => <span>amount:{amount}</span>,
}))

afterEach(cleanup)

const occurrence = (overrides: Partial<TransactionOccurrence> = {}): TransactionOccurrence => ({
  amount: -42.5,
  category: "food",
  date: "2026-03-04",
  description: "Groceries",
  id: "note-1:2026-03-04",
  noteId: "note-1",
  obsidianUrl: "obsidian://note-1",
  recurrence: null,
  status: "logged",
  ...overrides,
})

const renderEntry = (transaction = occurrence()) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter>
        <TransactionCalendarEntry currency="USD" transaction={transaction} />
      </MemoryRouter>
    </ChakraProvider>,
  )

describe("TransactionCalendarEntry", () => {
  test("renders the transaction description", () => {
    renderEntry()

    expect(screen.getByText("Groceries")).toBeTruthy()
  })

  test("renders the amount", () => {
    renderEntry()

    expect(screen.getByText("amount:-42.5")).toBeTruthy()
  })

  test("links to the note the transaction came from", () => {
    renderEntry()

    expect(screen.getByRole("link").getAttribute("href")).toBe("/source/note-1")
  })

  test("labels a logged entry with its status key", () => {
    renderEntry()

    expect(
      screen.getByRole("link").getAttribute("aria-label"),
    ).toContain("calendar.status.logged")
  })

  test("labels a scheduled entry with its status key", () => {
    renderEntry(occurrence({ recurrence: "monthly", status: "scheduled" }))

    expect(
      screen.getByRole("link").getAttribute("aria-label"),
    ).toContain("calendar.status.scheduled")
  })
})
