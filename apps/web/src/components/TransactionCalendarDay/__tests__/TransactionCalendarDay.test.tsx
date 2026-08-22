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
  TransactionAmount: ({ amount }: { amount: number }) => <span>amount:{amount}</span>,
}))

vi.mock("../../TransactionDayDetail", () => ({
  TransactionDayDetail: ({ day }: { day: CalendarDay }) => <div>detail:{day.date}</div>,
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
  expenseCount: 1,
  incomeCount: 0,
  isCurrentMonth: true,
  isToday: false,
  loggedTotal: -42.5,
  scheduledTotal: 0,
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

  test("renders the logged total", () => {
    renderDay()

    expect(screen.getByText("amount:-42.5")).toBeTruthy()
  })

  test("renders the scheduled total alongside the logged one", () => {
    renderDay(day({ loggedTotal: -42.5, scheduledTotal: -1650 }))

    expect(screen.getByText("amount:-42.5")).toBeTruthy()
    expect(screen.getByText("amount:-1650")).toBeTruthy()
  })

  test("omits a total for a status the day has none of", () => {
    renderDay(day({ loggedTotal: 0, scheduledTotal: -1650 }))

    expect(screen.getByText("amount:-1650")).toBeTruthy()
    expect(screen.queryByText("amount:0")).toBeNull()
  })

  test("summarises transactions as counts rather than listing them in the cell", () => {
    renderDay(
      day({
        expenseCount: 3,
        incomeCount: 1,
        transactions: [occurrence(), occurrence({ id: "b" }), occurrence({ id: "c" })],
      }),
    )

    expect(screen.getByLabelText('calendar.expenseCount {"count":3}')).toBeTruthy()
    expect(screen.getByLabelText('calendar.incomeCount {"count":1}')).toBeTruthy()
    expect(screen.queryByText("Groceries")).toBeNull()
  })

  test("omits the money-out count when the day has no expenses", () => {
    renderDay(day({ expenseCount: 0, incomeCount: 2 }))

    expect(screen.queryByLabelText(/calendar\.expenseCount/)).toBeNull()
    expect(screen.getByLabelText('calendar.incomeCount {"count":2}')).toBeTruthy()
  })

  test("omits the money-in count when the day has no income", () => {
    renderDay()

    expect(screen.queryByLabelText(/calendar\.incomeCount/)).toBeNull()
  })

  test("renders the detail panel for a day with transactions", () => {
    renderDay()

    expect(screen.getByText("detail:2026-03-04")).toBeTruthy()
  })

  test("renders no counts or detail panel on an empty day", () => {
    renderDay(day({ expenseCount: 0, incomeCount: 0, loggedTotal: 0, transactions: [] }))

    expect(screen.queryByText(/^detail:/)).toBeNull()
    expect(screen.queryByLabelText(/calendar\.expenseCount/)).toBeNull()
  })

  test("marks today's cell with the today label", () => {
    renderDay(day({ isToday: true }))

    expect(screen.getByText('calendar.today {"day":4}')).toBeTruthy()
  })

  test("gives every cell the same fixed height regardless of how much is on it", () => {
    const { container: busy } = renderDay(
      day({ expenseCount: 9, transactions: Array.from({ length: 9 }, (_, i) => occurrence({ id: `t${i}` })) }),
    )
    const busyHeight = busy.querySelector("li")?.getAttribute("class")

    cleanup()

    const { container: empty } = renderDay(
      day({ expenseCount: 0, incomeCount: 0, loggedTotal: 0, transactions: [] }),
    )
    const emptyHeight = empty.querySelector("li")?.getAttribute("class")

    expect(busyHeight).toBe(emptyHeight)
  })
})
