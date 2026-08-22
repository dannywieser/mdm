import type { RecurrenceRule, RecurrenceUnit } from "./recurrence.types"

/**
 * Recurrence rules a note can name directly, without the `every N <unit>`
 * form. Keys are matched case-insensitively against the trimmed frontmatter
 * value.
 */
const NAMED_RULES: Record<string, RecurrenceRule | undefined> = {
  annual: { interval: 1, unit: "year" },
  annually: { interval: 1, unit: "year" },
  biweekly: { interval: 2, unit: "week" },
  daily: { interval: 1, unit: "day" },
  fortnightly: { interval: 2, unit: "week" },
  monthly: { interval: 1, unit: "month" },
  quarterly: { interval: 3, unit: "month" },
  semiannually: { interval: 6, unit: "month" },
  weekly: { interval: 1, unit: "week" },
  yearly: { interval: 1, unit: "year" },
}

const UNIT_ALIASES: Record<string, RecurrenceUnit | undefined> = {
  day: "day",
  days: "day",
  month: "month",
  months: "month",
  week: "week",
  weeks: "week",
  year: "year",
  years: "year",
}

/** `every 2 weeks`, `every week`, `every 18 months` — the interval is optional. */
const EVERY_PATTERN = /^every\s+(?:(\d+)\s+)?([a-z]+)$/

/**
 * Parses a recurrence rule from a note's frontmatter value. Returns `null`
 * for anything unrecognised (including an empty value), which callers treat
 * as "this transaction is a one-off", so a typo degrades to a single logged
 * entry rather than failing the whole scan.
 *
 * @param value Raw frontmatter value, e.g. `monthly` or `every 2 weeks`.
 * @returns The parsed rule, or `null` when the value names no valid rule.
 */
export const parseRecurrence = (value: unknown): RecurrenceRule | null => {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^"(.*)"$/, "$1").trim()
  if (normalized === "") return null

  const named = NAMED_RULES[normalized]
  if (named) return { ...named }

  const match = EVERY_PATTERN.exec(normalized)
  if (!match) return null

  // `.at()` rather than indexing: the interval group is optional, so it is
  // genuinely absent for `every week` even though indexing types it string.
  const rawUnit = match.at(2)
  const unit = rawUnit === undefined ? undefined : UNIT_ALIASES[rawUnit]
  if (!unit) return null

  const rawInterval = match.at(1)
  const interval = rawInterval === undefined ? 1 : Number(rawInterval)
  if (!Number.isInteger(interval) || interval < 1) return null

  return { interval, unit }
}
