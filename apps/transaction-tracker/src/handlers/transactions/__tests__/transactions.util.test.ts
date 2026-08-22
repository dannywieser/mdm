import { DEFAULT_TRANSACTIONS_CONFIG } from "app-config"

import {
  buildOccurrences,
  buildTransactionDefinition,
  expandDefinition,
  parseAmount,
  resolveTransactionDate,
} from "../transactions.util"

const config = DEFAULT_TRANSACTIONS_CONFIG
const note = { noteId: "note-1", obsidianUrl: "obsidian://note-1", title: "Rent" }

const definition = (overrides = {}) => ({
  amount: -1500,
  anchorDate: "2026-03-01",
  category: "housing",
  description: "Rent",
  noteId: "note-1",
  obsidianUrl: "obsidian://note-1",
  recurrence: null,
  until: null,
  ...overrides,
})

describe("parseAmount", () => {
  test("reads a plain negative number string", () => {
    expect(parseAmount("-42.5")).toBe(-42.5)
  })

  test("reads a numeric value", () => {
    expect(parseAmount(1200)).toBe(1200)
  })

  test("strips a currency symbol and thousands separators", () => {
    expect(parseAmount("$1,200.50")).toBe(1200.5)
  })

  test("treats a parenthesised amount as negative", () => {
    expect(parseAmount("(45)")).toBe(-45)
  })

  test("strips the quotes a yaml value can arrive wrapped in", () => {
    expect(parseAmount('"-42"')).toBe(-42)
  })

  test("returns null for a non-numeric value", () => {
    expect(parseAmount("groceries")).toBeNull()
  })

  test("returns null for a missing value", () => {
    expect(parseAmount(undefined)).toBeNull()
  })
})

describe("resolveTransactionDate", () => {
  test("prefers an ISO date in the configured date property", () => {
    expect(resolveTransactionDate({ date: "2026-03-04" }, "Rent", "date", "created", [])).toBe(
      "2026-03-04",
    )
  })

  test("falls back to the note's own date when the date property is absent", () => {
    expect(
      resolveTransactionDate({ created: "2026-03-09" }, "Rent", "date", "created", []),
    ).toBe("2026-03-09")
  })

  test("returns null when no date can be resolved", () => {
    expect(resolveTransactionDate({}, "Rent", "date", "created", [])).toBeNull()
  })
})

describe("buildTransactionDefinition", () => {
  test("builds a definition from transaction frontmatter", () => {
    expect(
      buildTransactionDefinition(
        {
          amount: "-1500",
          category: "housing",
          date: "2026-03-01",
          description: "March rent",
          recurrence: "monthly",
        },
        note,
        config,
        "created",
        [],
      ),
    ).toEqual({
      amount: -1500,
      anchorDate: "2026-03-01",
      category: "housing",
      description: "March rent",
      noteId: "note-1",
      obsidianUrl: "obsidian://note-1",
      recurrence: "monthly",
      until: null,
    })
  })

  test("falls back to the note title when no description is set", () => {
    const result = buildTransactionDefinition(
      { amount: "-10", date: "2026-03-01" },
      note,
      config,
      "created",
      [],
    )
    expect(result?.description).toBe("Rent")
  })

  test("keeps a valid recurrence end date", () => {
    const result = buildTransactionDefinition(
      { amount: "-10", date: "2026-03-01", recurrence: "monthly", recurrenceEnd: "2026-09-01" },
      note,
      config,
      "created",
      [],
    )
    expect(result?.until).toBe("2026-09-01")
  })

  test("ignores a malformed recurrence end date", () => {
    const result = buildTransactionDefinition(
      { amount: "-10", date: "2026-03-01", recurrence: "monthly", recurrenceEnd: "soon" },
      note,
      config,
      "created",
      [],
    )
    expect(result?.until).toBeNull()
  })

  test("returns null for a note with no amount", () => {
    expect(
      buildTransactionDefinition({ date: "2026-03-01" }, note, config, "created", []),
    ).toBeNull()
  })

  test("returns null for a note with no resolvable date", () => {
    expect(buildTransactionDefinition({ amount: "-10" }, note, config, "created", [])).toBeNull()
  })

  test("returns null when the note has no frontmatter at all", () => {
    expect(buildTransactionDefinition(null, note, config, "created", [])).toBeNull()
  })
})

describe("expandDefinition", () => {
  test("yields a single logged occurrence for a one-off inside the window", () => {
    expect(expandDefinition(definition(), "2026-03-01", "2026-03-31")).toEqual([
      {
        amount: -1500,
        category: "housing",
        date: "2026-03-01",
        description: "Rent",
        id: "note-1:2026-03-01",
        noteId: "note-1",
        obsidianUrl: "obsidian://note-1",
        recurrence: null,
        status: "logged",
      },
    ])
  })

  test("drops a one-off that falls outside the window", () => {
    expect(expandDefinition(definition(), "2026-04-01", "2026-04-30")).toEqual([])
  })

  test("yields scheduled occurrences for a recurring definition", () => {
    const occurrences = expandDefinition(
      definition({ recurrence: "monthly" }),
      "2026-03-01",
      "2026-06-30",
    )
    expect(occurrences.map(({ date }) => date)).toEqual([
      "2026-03-01",
      "2026-04-01",
      "2026-05-01",
      "2026-06-01",
    ])
    expect(occurrences.every(({ status }) => status === "scheduled")).toBe(true)
  })

  test("gives each occurrence of one note a distinct id", () => {
    const ids = expandDefinition(
      definition({ recurrence: "monthly" }),
      "2026-03-01",
      "2026-05-31",
    ).map(({ id }) => id)
    expect(new Set(ids).size).toBe(3)
  })

  test("treats an unrecognised recurrence as a one-off rather than failing", () => {
    const occurrences = expandDefinition(
      definition({ recurrence: "whenever" }),
      "2026-03-01",
      "2026-06-30",
    )
    expect(occurrences).toHaveLength(1)
    expect(occurrences[0].status).toBe("logged")
  })
})

describe("buildOccurrences", () => {
  test("sorts occurrences by date across definitions", () => {
    const occurrences = buildOccurrences(
      [
        definition({ anchorDate: "2026-03-20", noteId: "b" }),
        definition({ anchorDate: "2026-03-05", noteId: "a" }),
      ],
      "2026-03-01",
      "2026-03-31",
    )
    expect(occurrences.map(({ date }) => date)).toEqual(["2026-03-05", "2026-03-20"])
  })

  test("orders same-day occurrences by description", () => {
    const occurrences = buildOccurrences(
      [
        definition({ description: "Water", noteId: "b" }),
        definition({ description: "Electric", noteId: "a" }),
      ],
      "2026-03-01",
      "2026-03-31",
    )
    expect(occurrences.map(({ description }) => description)).toEqual(["Electric", "Water"])
  })

  test("combines logged and scheduled entries in one window", () => {
    const occurrences = buildOccurrences(
      [
        definition({ anchorDate: "2026-03-02", description: "Groceries", noteId: "a" }),
        definition({ anchorDate: "2026-03-01", noteId: "b", recurrence: "monthly" }),
      ],
      "2026-03-01",
      "2026-03-31",
    )
    expect(occurrences.map(({ status }) => status)).toEqual(["scheduled", "logged"])
  })
})
