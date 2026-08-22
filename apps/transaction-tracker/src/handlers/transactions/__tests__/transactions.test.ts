import type { Request, Response } from "express"

import { DEFAULT_TRANSACTIONS_CONFIG, resolveNotesConfig } from "app-config"
import { createMockNotesConfig } from "app-config/testing"
import { collectMarkdownFiles } from "markdown"

import type { TransactionDefinition, TransactionsResponse } from "../transactions.types"

import { loadBearNotes } from "../../../redis/loadBearNotes"
import { transactionsHandler } from "../transactions"
import { scanTransactionDefinitionsFromNotes } from "../transactions.bear"
import { scanTransactionDefinitions } from "../transactions.files"

vi.mock("app-config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("app-config")>()
  return { ...actual, resolveNotesConfig: vi.fn() }
})

vi.mock("markdown", async (importOriginal) => {
  const actual = await importOriginal<typeof import("markdown")>()
  return { ...actual, collectMarkdownFiles: vi.fn() }
})

vi.mock("../transactions.files", () => ({ scanTransactionDefinitions: vi.fn() }))
vi.mock("../transactions.bear", () => ({ scanTransactionDefinitionsFromNotes: vi.fn() }))
vi.mock("../../../redis/loadBearNotes", () => ({ loadBearNotes: vi.fn() }))

const resolveNotesConfigMock = vi.mocked(resolveNotesConfig)
const collectMarkdownFilesMock = vi.mocked(collectMarkdownFiles)
const scanTransactionDefinitionsMock = vi.mocked(scanTransactionDefinitions)
const scanFromNotesMock = vi.mocked(scanTransactionDefinitionsFromNotes)
const loadBearNotesMock = vi.mocked(loadBearNotes)

const rent: TransactionDefinition = {
  amount: -1500,
  anchorDate: "2026-01-01",
  category: "housing",
  description: "Rent",
  noteId: "rent",
  obsidianUrl: "obsidian://rent",
  recurrence: "monthly",
  until: null,
}

const groceries: TransactionDefinition = {
  amount: -82.4,
  anchorDate: "2026-03-04",
  category: "food",
  description: "Groceries",
  noteId: "groceries",
  obsidianUrl: "obsidian://groceries",
  recurrence: null,
  until: null,
}

const createResponse = () => {
  const json = vi.fn()
  const status = vi.fn().mockReturnValue({ json })
  return { json, response: { json, status } as unknown as Response, status }
}

const runHandler = async (query: Record<string, string> = {}) => {
  const { json, response, status } = createResponse()
  await transactionsHandler({ query } as unknown as Request, response, vi.fn())
  return { json, status }
}

const body = (json: ReturnType<typeof vi.fn>): TransactionsResponse =>
  json.mock.calls[0][0] as TransactionsResponse

beforeEach(() => {
  resolveNotesConfigMock.mockResolvedValue(createMockNotesConfig())
  collectMarkdownFilesMock.mockResolvedValue(["/notes/rent.md"])
  scanTransactionDefinitionsMock.mockResolvedValue([rent, groceries])
  vi.useFakeTimers().setSystemTime(new Date("2026-03-17T12:00:00Z"))
})

afterEach(() => {
  vi.useRealTimers()
})

describe("transactionsHandler", () => {
  test("returns the requested month's logged and scheduled occurrences", async () => {
    const { json, status } = await runHandler({ month: "2026-03" })

    expect(status).toHaveBeenCalledWith(200)
    expect(body(json).transactions.map(({ date, status: entryStatus }) => [date, entryStatus])).toEqual([
      ["2026-03-01", "scheduled"],
      ["2026-03-04", "logged"],
    ])
  })

  test("echoes the resolved window and configured currency", async () => {
    const { json } = await runHandler({ month: "2026-03" })

    expect(body(json)).toMatchObject({
      currency: DEFAULT_TRANSACTIONS_CONFIG.currency,
      from: "2026-03-01",
      to: "2026-03-31",
    })
  })

  test("summarises the window totals", async () => {
    const { json } = await runHandler({ month: "2026-03" })

    expect(body(json).totals).toEqual({
      expense: -1582.4,
      income: 0,
      logged: -82.4,
      net: -1582.4,
      scheduled: -1500,
    })
  })

  test("defaults to the month containing today", async () => {
    const { json } = await runHandler()

    expect(body(json)).toMatchObject({ from: "2026-03-01", to: "2026-03-31" })
  })

  test("projects a schedule into a far-future month with no stored horizon", async () => {
    const { json } = await runHandler({ month: "2099-07" })

    expect(body(json).transactions).toEqual([
      expect.objectContaining({ date: "2099-07-01", status: "scheduled" }),
    ])
  })

  test("returns only the schedule for a month with no logged entries", async () => {
    const { json } = await runHandler({ month: "2026-04" })

    expect(body(json).transactions.map(({ description }) => description)).toEqual(["Rent"])
  })

  test("loads notes from redis when the source is bear", async () => {
    resolveNotesConfigMock.mockResolvedValue(createMockNotesConfig({ notesSource: "bear" }))
    loadBearNotesMock.mockResolvedValue([])
    scanFromNotesMock.mockReturnValue([groceries])

    const { json } = await runHandler({ month: "2026-03" })

    expect(loadBearNotesMock).toHaveBeenCalled()
    expect(collectMarkdownFilesMock).not.toHaveBeenCalled()
    expect(body(json).transactions).toHaveLength(1)
  })

  test("rejects a malformed month with a 400", async () => {
    const { json, status } = await runHandler({ month: "March" })

    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ error: "month must be a YYYY-MM value" })
  })

  test("rejects a reversed date range with a 400", async () => {
    const { status } = await runHandler({ from: "2026-03-09", to: "2026-03-05" })

    expect(status).toHaveBeenCalledWith(400)
  })

  test("returns a 500 when the vault scan fails", async () => {
    scanTransactionDefinitionsMock.mockRejectedValue(new Error("boom"))

    const { json, status } = await runHandler({ month: "2026-03" })

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({ error: "Unable to load transactions" })
  })
})
