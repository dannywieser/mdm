import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import type { TransactionOccurrence } from "services"

import type { TransactionCalendarDay as CalendarDay } from "../../TransactionCalendar/TransactionCalendar.types"

import { TransactionCalendarDay } from "../TransactionCalendarDay"

vi.mock("../../../i18n", () => ({
  useI18n: () => ({
    t: (key: string, values?: Record<string, string | number>) =>
      values ? `${key} ${JSON.stringify(values)}` : key,
  }),
}))

vi.mock("../../TransactionAmount", () => ({
  TransactionAmount: ({ amount }: { amount: number }) => <span>total:{amount}</span>,
}))

vi.mock("../../TransactionCalendarEntry", () => ({
  TransactionCalendarEntry: ({ transaction }: { transaction: TransactionOccurrence }) => (
    <span>entry:{transaction.description}</span>
  ),
}))

afterEach(cleanup)

const occurrence = (overrides: Partial<TransactionOccurrence> = {}): TransactionOccurrence => ({
  amount: -42.5,
  category: null,
  date: "2026-03-04",
  description: "Groceries",
  id: "note-1:2026-03-04",
  noteId: "note-1",
  obsidianUrl: "obsidian://note-1",
  recurrence: null,
  status: "logged",
  ...overrides,
})

const day = (overrides: Partial<CalendarDay> = {}): CalendarDay => ({
  date: "2026-03-04",
  dayOfMonth: 4,
  isCurrentMonth: true,
  isToday: false,
  total: -42.5,
  transactions: [occurrence()],
  ...overrides,
})

const renderDay = (value = day()) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <ul>
        <TransactionCalendarDay currency="USD" day={value} />
      </ul>
    </ChakraProvider>,
  )

describe("TransactionCalendarDay", () => {
  test("renders the day of the month", () => {
    renderDay()

    expect(screen.getByText("4")).toBeTruthy()
  })

  test("renders one entry per transaction", () => {
    renderDay(
      day({
        transactions: [occurrence(), occurrence({ description: "Rent", id: "rent:2026-03-04" })],
      }),
    )

    expect(screen.getByText("entry:Groceries")).toBeTruthy()
    expect(screen.getByText("entry:Rent")).toBeTruthy()
  })

  test("renders the day total when the day has transactions", () => {
    renderDay()

    expect(screen.getByText("total:-42.5")).toBeTruthy()
  })

  test("omits the day total on an empty day", () => {
    renderDay(day({ total: 0, transactions: [] }))

    expect(screen.queryByText(/^total:/)).toBeNull()
  })

  test("marks today's cell with the today label", () => {
    renderDay(day({ isToday: true }))

    expect(screen.getByText('calendar.today {"day":4}')).toBeTruthy()
  })
})
