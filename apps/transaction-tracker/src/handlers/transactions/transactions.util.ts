import type { TransactionsConfig } from "app-config"
import type { NoteFrontmatter } from "markdown"

import { resolveDateFromFrontmatterOrTitle } from "markdown"

import type { TransactionDefinition, TransactionOccurrence } from "./transactions.types"

import { expandRecurrence } from "../../recurrence/expandRecurrence"
import { parseRecurrence } from "../../recurrence/parseRecurrence"

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const unquote = (value: string): string => value.replace(/^"(.*)"$/, "$1").trim()

const readString = (frontmatter: NoteFrontmatter, property: string): string | null => {
  const raw = frontmatter[property]
  if (typeof raw !== "string") return null
  const cleaned = unquote(raw)
  return cleaned === "" ? null : cleaned
}

/**
 * Parses a signed amount, tolerating the currency symbols, thousands
 * separators and parenthesised negatives people naturally type into a note
 * (`$1,200.50`, `(45)`, `-45`). Returns `null` when nothing numeric is left,
 * which excludes the note from the results rather than failing the scan.
 */
export const parseAmount = (value: unknown): number | null => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value !== "string") return null

  const cleaned = unquote(value)
  const isParenthesised = /^\(.*\)$/.test(cleaned)
  const stripped = cleaned.replace(/[()]/g, "").replace(/[$£€¥]/g, "").replace(/,/g, "").trim()

  if (!/^[+-]?\d+(\.\d+)?$/.test(stripped)) return null

  const amount = Number(stripped)
  return isParenthesised ? -Math.abs(amount) : amount
}

/**
 * Resolves the date a transaction is anchored to: the configured
 * `dateProperty` when present, otherwise the note's own date (frontmatter
 * created property, then a date parsed out of the title) so a daily-note
 * style vault works without every note repeating its date.
 */
export const resolveTransactionDate = (
  frontmatter: NoteFrontmatter,
  title: string,
  dateProperty: string,
  createdDateProperty: string,
  dateFormats: readonly string[],
): string | null => {
  const explicit = readString(frontmatter, dateProperty)
  if (explicit && ISO_DATE_PATTERN.test(explicit)) return explicit

  const resolved = resolveDateFromFrontmatterOrTitle(
    frontmatter,
    title,
    createdDateProperty,
    dateFormats,
  )
  return resolved ? resolved.toISOString().slice(0, 10) : null
}

/**
 * Builds a transaction definition from a note's frontmatter, or `null` when
 * the note isn't a transaction (no numeric amount) or has no resolvable date.
 */
export const buildTransactionDefinition = (
  frontmatter: NoteFrontmatter | null,
  note: { noteId: string; obsidianUrl: string; title: string },
  config: TransactionsConfig,
  createdDateProperty: string,
  dateFormats: readonly string[],
): TransactionDefinition | null => {
  if (!frontmatter) return null

  const amount = parseAmount(frontmatter[config.amountProperty])
  if (amount === null) return null

  const anchorDate = resolveTransactionDate(
    frontmatter,
    note.title,
    config.dateProperty,
    createdDateProperty,
    dateFormats,
  )
  if (!anchorDate) return null

  const until = readString(frontmatter, config.recurrenceEndProperty)

  return {
    amount,
    anchorDate,
    category: readString(frontmatter, config.categoryProperty),
    description: readString(frontmatter, config.descriptionProperty) ?? note.title,
    noteId: note.noteId,
    obsidianUrl: note.obsidianUrl,
    recurrence: readString(frontmatter, config.recurrenceProperty),
    until: until && ISO_DATE_PATTERN.test(until) ? until : null,
  }
}

const toOccurrence = (
  definition: TransactionDefinition,
  date: string,
  status: TransactionOccurrence["status"],
): TransactionOccurrence => ({
  amount: definition.amount,
  category: definition.category,
  date,
  description: definition.description,
  id: `${definition.noteId}:${date}`,
  noteId: definition.noteId,
  obsidianUrl: definition.obsidianUrl,
  recurrence: definition.recurrence,
  status,
})

/**
 * Turns one definition into the dated occurrences that fall inside the
 * window. A note with a recognised recurrence yields `scheduled`
 * occurrences projected forward from its anchor with no end horizon; every
 * other note yields at most one `logged` occurrence on its own date.
 */
export const expandDefinition = (
  definition: TransactionDefinition,
  from: string,
  to: string,
): TransactionOccurrence[] => {
  const rule = parseRecurrence(definition.recurrence)

  if (!rule) {
    const { anchorDate } = definition
    return anchorDate >= from && anchorDate <= to ? [toOccurrence(definition, anchorDate, "logged")] : []
  }

  return expandRecurrence({
    anchorDate: definition.anchorDate,
    from,
    rule,
    to,
    until: definition.until ?? undefined,
  }).map((date) => toOccurrence(definition, date, "scheduled"))
}

/** Ascending by date, then by description so equal-dated rows are stable. */
const compareOccurrences = (a: TransactionOccurrence, b: TransactionOccurrence): number =>
  a.date === b.date ? a.description.localeCompare(b.description) : a.date.localeCompare(b.date)

/**
 * Expands every definition into the requested window and returns the
 * occurrences in a stable ascending order.
 */
export const buildOccurrences = (
  definitions: readonly TransactionDefinition[],
  from: string,
  to: string,
): TransactionOccurrence[] =>
  definitions.flatMap((definition) => expandDefinition(definition, from, to)).sort(compareOccurrences)
