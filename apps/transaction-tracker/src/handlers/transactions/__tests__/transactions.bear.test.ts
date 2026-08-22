import type { ScannedNote } from "markdown"

import { DEFAULT_TRANSACTIONS_CONFIG } from "app-config"

import { scanTransactionDefinitionsFromNotes } from "../transactions.bear"

const note = (overrides: Partial<ScannedNote> = {}): ScannedNote =>
  ({
    basename: "coffee.md",
    createdDate: null,
    dates: [],
    folder: "finance",
    frontmatter: { amount: "-4.5", date: "2026-03-04" },
    fullPath: "/notes/finance/coffee.md",
    fullText: "",
    id: "note-1",
    modifiedDate: "2026-03-04T00:00:00.000Z",
    obsidianUrl: "obsidian://coffee",
    tags: [],
    title: "Coffee",
    ...overrides,
  })

describe("scanTransactionDefinitionsFromNotes", () => {
  test("builds definitions from bear-sourced notes", () => {
    const definitions = scanTransactionDefinitionsFromNotes(
      [note()],
      DEFAULT_TRANSACTIONS_CONFIG,
      "created",
      [],
    )

    expect(definitions).toHaveLength(1)
    expect(definitions[0]).toMatchObject({ amount: -4.5, anchorDate: "2026-03-04", noteId: "note-1" })
  })

  test("skips notes with no amount", () => {
    expect(
      scanTransactionDefinitionsFromNotes(
        [note({ frontmatter: { title: "hello" } })],
        DEFAULT_TRANSACTIONS_CONFIG,
        "created",
        [],
      ),
    ).toEqual([])
  })

  test("keeps every folder when none is configured", () => {
    expect(
      scanTransactionDefinitionsFromNotes(
        [note({ folder: "journal" })],
        DEFAULT_TRANSACTIONS_CONFIG,
        "created",
        [],
      ),
    ).toHaveLength(1)
  })

  test("restricts to the configured folder", () => {
    expect(
      scanTransactionDefinitionsFromNotes(
        [note({ folder: "journal" })],
        { ...DEFAULT_TRANSACTIONS_CONFIG, folder: "finance" },
        "created",
        [],
      ),
    ).toEqual([])
  })

  test("includes notes nested inside the configured folder", () => {
    expect(
      scanTransactionDefinitionsFromNotes(
        [note({ folder: "finance/2026" })],
        { ...DEFAULT_TRANSACTIONS_CONFIG, folder: "finance" },
        "created",
        [],
      ),
    ).toHaveLength(1)
  })
})
