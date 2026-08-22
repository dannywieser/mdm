import { addDays, addMonths, buildMonthRange, getMonthEnd, getMonthKey, getMonthStart } from "mdm-util"

import type { RandomGenerator } from "../random/random.types"
import type { VaultBuilderOptions, VaultNote } from "../vault.types"
import type { LoggedTransactionSeed } from "./transactionsCorpus.types"

import { randomInt, pickOne } from "../random/random"
import { slugify, toModifiedTimestamp } from "./builderShared"
import { LOGGED_TRANSACTIONS, SCHEDULED_TRANSACTIONS } from "./transactionsCorpus"

const TRANSACTIONS_FOLDER = "finance/transactions"

/** Months of one-off spending to generate, ending with the current month. */
const LOGGED_MONTHS = 14

/** One-off transactions generated per month. */
const LOGGED_PER_MONTH_MIN = 6
const LOGGED_PER_MONTH_MAX = 11

/**
 * Schedules are anchored well before the demo's end date so their recurrences
 * already cover the months the calendar opens on, and keep projecting past it.
 */
const SCHEDULE_ANCHOR_MONTHS_BACK = 13

const toAmountString = (amount: number): string => amount.toFixed(2)

const buildScheduledNote = (anchorMonthKey: string, random: RandomGenerator) =>
  (seed: (typeof SCHEDULED_TRANSACTIONS)[number]): VaultNote => {
    const monthEnd = getMonthEnd(anchorMonthKey)
    const candidate = `${anchorMonthKey}-${String(seed.dayOfMonth).padStart(2, "0")}`
    const date = candidate > monthEnd ? monthEnd : candidate

    return {
      body: `Recurring ${seed.recurrence} ${seed.category} entry.`,
      folder: TRANSACTIONS_FOLDER,
      frontmatter: {
        created: date,
        amount: toAmountString(seed.amount),
        category: seed.category,
        date,
        description: seed.description,
        recurrence: seed.recurrence,
      },
      modifiedDate: toModifiedTimestamp(date, random),
      title: `Scheduled ${slugify(seed.description)}`,
    }
  }

const buildLoggedNote = (
  seed: LoggedTransactionSeed,
  date: string,
  index: number,
  random: RandomGenerator,
): VaultNote => ({
  body: `${seed.description} — ${seed.category}.`,
  folder: TRANSACTIONS_FOLDER,
  frontmatter: {
    created: date,
    amount: toAmountString(seed.amount),
    category: seed.category,
    date,
    description: seed.description,
  },
  modifiedDate: toModifiedTimestamp(date, random),
  title: `${date} ${slugify(seed.description)} ${String(index).padStart(2, "0")}`,
})

const buildLoggedNotesForMonth = (monthKey: string, random: RandomGenerator): VaultNote[] => {
  const monthStart = getMonthStart(monthKey)
  const dayCount = Number(getMonthEnd(monthKey).slice(8, 10))
  const count = randomInt(random, LOGGED_PER_MONTH_MIN, LOGGED_PER_MONTH_MAX)

  return Array.from({ length: count }, (_, index) => {
    const date = addDays(monthStart, randomInt(random, 0, dayCount - 1))
    return buildLoggedNote(pickOne(random, LOGGED_TRANSACTIONS), date, index, random)
  })
}

/**
 * Builds the demo vault's finance notes: one note per recurring commitment
 * (anchored in the past so its projection covers both the months before the
 * demo's end date and every month after it), plus a spread of one-off
 * transactions across the recent months.
 */
export const buildTransactionNotes = ({ endDate, random }: VaultBuilderOptions): VaultNote[] => {
  const endMonthKey = getMonthKey(endDate)
  const anchorMonthKey = addMonths(endMonthKey, -SCHEDULE_ANCHOR_MONTHS_BACK)

  const scheduled = SCHEDULED_TRANSACTIONS.map(buildScheduledNote(anchorMonthKey, random))

  const logged = buildMonthRange(addMonths(endMonthKey, -(LOGGED_MONTHS - 1)), endMonthKey).flatMap(
    (monthKey) => buildLoggedNotesForMonth(monthKey, random),
  )

  return [...scheduled, ...logged]
}
