import { isNonEmptyString } from "mdm-util"

import type { TransactionsConfig } from "../types"

export const DEFAULT_TRANSACTIONS_CONFIG: TransactionsConfig = {
  amountProperty: "amount",
  categoryProperty: "category",
  currency: "USD",
  dateProperty: "date",
  descriptionProperty: "description",
  folder: "",
  recurrenceEndProperty: "recurrenceEnd",
  recurrenceProperty: "recurrence",
}

const STRING_FIELDS = [
  "amountProperty",
  "categoryProperty",
  "currency",
  "dateProperty",
  "descriptionProperty",
  "recurrenceEndProperty",
  "recurrenceProperty",
] as const

const TRANSACTIONS_ERROR =
  "app.config.json transactions must be an object whose amountProperty, categoryProperty, currency, dateProperty, descriptionProperty, recurrenceProperty and recurrenceEndProperty (all optional) are non-empty strings, and whose optional folder is a string"

const isTransactionsConfigShape = (value: Record<string, unknown>): boolean =>
  STRING_FIELDS.every((field) => value[field] === undefined || isNonEmptyString(value[field])) &&
  (value.folder === undefined || typeof value.folder === "string")

/**
 * Validates the optional `transactions` block and fills every unset field
 * from `DEFAULT_TRANSACTIONS_CONFIG`, so a vault that already uses the
 * conventional `amount`/`date`/`recurrence` frontmatter names needs no
 * configuration at all.
 */
export const resolveTransactions = (value: unknown): TransactionsConfig => {
  if (value === undefined) return { ...DEFAULT_TRANSACTIONS_CONFIG }

  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(TRANSACTIONS_ERROR)
  }

  const config = value as Record<string, unknown>
  if (!isTransactionsConfigShape(config)) {
    throw new Error(TRANSACTIONS_ERROR)
  }

  const overrides = Object.fromEntries(
    STRING_FIELDS.filter((field) => config[field] !== undefined).map((field) => [field, config[field]]),
  ) as Partial<TransactionsConfig>

  return {
    ...DEFAULT_TRANSACTIONS_CONFIG,
    ...overrides,
    ...(typeof config.folder === "string" ? { folder: config.folder } : {}),
  }
}
