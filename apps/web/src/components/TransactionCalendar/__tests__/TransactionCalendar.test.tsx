import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { useTransactionsQuery } from "services"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import type { TransactionsResponse } from "services"

import type { TransactionCalendarDay as CalendarDay } from "../TransactionCalendar.types"

import { TransactionCalendar } from "../TransactionCalendar"
import { buildCalendarWeeks, resolveMonthKey, shiftMonth } from "../TransactionCalendar.util"

vi.mock("../../../i18n", () => ({
  useI18n: () => ({
    t: (key: string, values?: Record<string, string | number>) =>
      values ? `${key} ${JSON.stringify(values)}` : key,
  }),
}))

vi.mock("services", () => ({ useTransactionsQuery: vi.fn() }))

vi.mock("../TransactionCalendar.util", () => ({
  buildCalendarWeeks: vi.fn(),
  formatMonthLabel: vi.fn(() => "MONTH LABEL"),
  resolveMonthKey: vi.fn(() => "2026-03"),
  shiftMonth: vi.fn((monthKey: string, offset: number) => `shifted:${monthKey}:${offset}`),
}))

vi.mock("../../TransactionAmount", () => ({
  TransactionAmount: ({ amount }: { amount: number }) => <span>amount:{amount}</span>,
}))

vi.mock("../../TransactionCalendarDay", () => ({
  TransactionCalendarDay: ({ day }: { day: CalendarDay }) => <li>day:{day.date}</li>,
}))

afterEach(cleanup)

const day = (date: string): CalendarDay => ({
  date,
  dayOfMonth: Number(date.slice(8, 10)),
  expenseCount: 0,
  incomeCount: 0,
  isCurrentMonth: true,
  isToday: false,
  loggedTotal: 0,
  scheduledTotal: 0,
  transactions: [],
})

const response: TransactionsResponse = {
  currency: "USD",
  from: "2026-03-01",
  to: "2026-03-31",
  totals: { expense: -1582.4, income: 2500, logged: -82.4, net: 917.6, scheduled: 1000 },
  transactions: [],
}

beforeEach(() => {
  vi.mocked(useTransactionsQuery).mockReturnValue({
    data: response,
  } as ReturnType<typeof useTransactionsQuery>)
  vi.mocked(buildCalendarWeeks).mockReturnValue([
    { days: [day("2026-03-01"), day("2026-03-02")], key: "2026-03-01" },
  ])
})

const renderCalendar = (path = "/calendar/2026-03") =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/calendar" element={<TransactionCalendar />} />
          <Route path="/calendar/:month" element={<TransactionCalendar />} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  )

describe("TransactionCalendar", () => {
  test("loads the month the util resolved", () => {
    renderCalendar()

    expect(vi.mocked(useTransactionsQuery)).toHaveBeenCalledWith({ month: "2026-03" })
  })

  test("resolves the month from the route param", () => {
    renderCalendar()

    expect(vi.mocked(resolveMonthKey).mock.calls[0][0]).toBe("2026-03")
  })

  test("resolves the month with no route param on the bare calendar path", () => {
    renderCalendar("/calendar")

    expect(vi.mocked(resolveMonthKey).mock.calls[0][0]).toBeUndefined()
  })

  test("renders the month label from the util", () => {
    renderCalendar()

    expect(screen.getByText("MONTH LABEL")).toBeTruthy()
  })

  test("renders a cell for every day the util produced", () => {
    renderCalendar()

    expect(screen.getByText("day:2026-03-01")).toBeTruthy()
    expect(screen.getByText("day:2026-03-02")).toBeTruthy()
  })

  test("passes today as an ISO date so the today cell resolves", () => {
    renderCalendar()

    expect(vi.mocked(buildCalendarWeeks).mock.calls[0][2]).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(vi.mocked(resolveMonthKey).mock.calls[0][1]).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  test("builds the grid from the loaded transactions", () => {
    renderCalendar()

    expect(vi.mocked(buildCalendarWeeks).mock.calls[0][0]).toBe("2026-03")
    expect(vi.mocked(buildCalendarWeeks).mock.calls[0][1]).toBe(response.transactions)
  })

  test("links the previous control to the preceding month", () => {
    renderCalendar()

    expect(
      screen.getByLabelText("calendar.previousMonth").getAttribute("href"),
    ).toBe("/calendar/shifted:2026-03:-1")
  })

  test("links the next control to the following month", () => {
    renderCalendar()

    expect(
      screen.getByLabelText("calendar.nextMonth").getAttribute("href"),
    ).toBe("/calendar/shifted:2026-03:1")
  })

  test("shifts by one month in each direction", () => {
    renderCalendar()

    expect(vi.mocked(shiftMonth)).toHaveBeenCalledWith("2026-03", -1)
    expect(vi.mocked(shiftMonth)).toHaveBeenCalledWith("2026-03", 1)
  })

  test("links the today control back to the bare calendar path", () => {
    renderCalendar()

    expect(screen.getByText("calendar.thisMonth").getAttribute("href")).toBe("/calendar")
  })

  test("renders the window totals", () => {
    renderCalendar()

    expect(screen.getByText("amount:2500")).toBeTruthy()
    expect(screen.getByText("amount:-1582.4")).toBeTruthy()
    expect(screen.getByText("amount:917.6")).toBeTruthy()
  })
})
