import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import type { TransactionOccurrence } from "services"

import type { TransactionCalendarDay as CalendarDay } from "../../TransactionCalendar/TransactionCalendar.types"

import { TransactionDayDetail } from "../TransactionDayDetail"
import { buildAlignProps } from "../TransactionDayDetail.util"

vi.mock("../../../i18n", () => ({
  useI18n: () => ({
    t: (key: string, values?: Record<string, string | number>) =>
      values ? `${key} ${JSON.stringify(values)}` : key,
  }),
}))

vi.mock("../TransactionDayDetail.util", () => ({
  buildAlignProps: vi.fn(() => ({ right: "0" })),
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
  expenseCount: 1,
  incomeCount: 0,
  isCurrentMonth: true,
  isToday: false,
  loggedTotal: -42.5,
  scheduledTotal: 0,
  transactions: [occurrence()],
  ...overrides,
})

const renderDetail = (value = day(), align: "center" | "end" | "start" = "center") =>
  render(
    <ChakraProvider value={defaultSystem}>
      <TransactionDayDetail align={align} currency="USD" day={value} />
    </ChakraProvider>,
  )

describe("TransactionDayDetail", () => {
  test("heads the panel with the day's date", () => {
    renderDetail()

    expect(screen.getByText('calendar.dayDetailTitle {"date":"2026-03-04"}')).toBeTruthy()
  })

  test("renders one entry per transaction", () => {
    renderDetail(
      day({
        transactions: [occurrence(), occurrence({ description: "Rent", id: "rent:2026-03-04" })],
      }),
    )

    expect(screen.getByText("entry:Groceries")).toBeTruthy()
    expect(screen.getByText("entry:Rent")).toBeTruthy()
  })

  test("keeps the entries mounted so they stay tabbable while the panel is hidden", () => {
    renderDetail()

    expect(screen.getByText("entry:Groceries")).toBeTruthy()
  })

  test("positions itself using the alignment it was given", () => {
    renderDetail(day(), "end")

    expect(vi.mocked(buildAlignProps)).toHaveBeenCalledWith("end")
  })
})
