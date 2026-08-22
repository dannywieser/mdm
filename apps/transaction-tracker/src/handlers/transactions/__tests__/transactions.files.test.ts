import { resolveNotesConfig } from "app-config"
import { createMockNotesConfig } from "app-config/testing"
import { parseFrontMatter } from "markdown"
import { promises as fs } from "node:fs"

import { isInTransactionsFolder, scanTransactionDefinitions } from "../transactions.files"

vi.mock("app-config", () => ({ resolveNotesConfig: vi.fn() }))

vi.mock("node:fs", () => ({ promises: { readFile: vi.fn() } }))

vi.mock("markdown", async (importOriginal) => {
  const actual = await importOriginal<typeof import("markdown")>()
  return { ...actual, parseFrontMatter: vi.fn() }
})

const resolveNotesConfigMock = vi.mocked(resolveNotesConfig)
const readFileMock = vi.mocked(fs.readFile)
const parseFrontMatterMock = vi.mocked(parseFrontMatter)

describe("isInTransactionsFolder", () => {
  test("accepts every note when no folder is configured", () => {
    expect(isInTransactionsFolder("/notes/journal/a.md", "/notes", "")).toBe(true)
  })

  test("accepts a note inside the configured folder", () => {
    expect(isInTransactionsFolder("/notes/finance/a.md", "/notes", "finance")).toBe(true)
  })

  test("accepts a note nested deeper in the configured folder", () => {
    expect(isInTransactionsFolder("/notes/finance/2026/a.md", "/notes", "finance")).toBe(true)
  })

  test("rejects a note outside the configured folder", () => {
    expect(isInTransactionsFolder("/notes/journal/a.md", "/notes", "finance")).toBe(false)
  })

  test("rejects a sibling folder sharing the configured folder's prefix", () => {
    expect(isInTransactionsFolder("/notes/financial/a.md", "/notes", "finance")).toBe(false)
  })

  test("tolerates surrounding slashes on the configured folder", () => {
    expect(isInTransactionsFolder("/notes/finance/a.md", "/notes", "/finance/")).toBe(true)
  })
})

describe("scanTransactionDefinitions", () => {
  beforeEach(() => {
    resolveNotesConfigMock.mockResolvedValue(createMockNotesConfig())
  })

  test("builds a definition from a note with transaction frontmatter", async () => {
    readFileMock.mockResolvedValue("---\namount: -20\n---\n")
    parseFrontMatterMock.mockReturnValue({
      body: "",
      frontmatter: { amount: "-20", date: "2026-03-04", description: "Coffee" },
    })

    const definitions = await scanTransactionDefinitions(["/notes/coffee.md"])

    expect(definitions).toHaveLength(1)
    expect(definitions[0]).toMatchObject({
      amount: -20,
      anchorDate: "2026-03-04",
      description: "Coffee",
    })
  })

  test("skips notes that carry no amount", async () => {
    readFileMock.mockResolvedValue("---\ntitle: hello\n---\n")
    parseFrontMatterMock.mockReturnValue({ body: "", frontmatter: { title: "hello" } })

    expect(await scanTransactionDefinitions(["/notes/hello.md"])).toEqual([])
  })

  test("skips notes outside the configured folder without reading them", async () => {
    resolveNotesConfigMock.mockResolvedValue(
      createMockNotesConfig({
        transactions: {
          ...createMockNotesConfig().transactions,
          folder: "finance",
        },
      }),
    )

    expect(await scanTransactionDefinitions(["/notes/journal/a.md"])).toEqual([])
    expect(readFileMock).not.toHaveBeenCalled()
  })

  test("uses the note filename as the title when no description is set", async () => {
    readFileMock.mockResolvedValue("---\namount: -20\n---\n")
    parseFrontMatterMock.mockReturnValue({
      body: "",
      frontmatter: { amount: "-20", date: "2026-03-04" },
    })

    const definitions = await scanTransactionDefinitions(["/notes/Coffee run.md"])

    expect(definitions[0].description).toBe("Coffee run")
  })
})
