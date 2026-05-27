import { isNonEmptyString } from "./isNonEmptyString"

/**
 * Checks whether a value is a record of non-empty string keys and values.
 *
 * @param value Candidate value.
 * @returns True when the value is an object record of non-empty strings.
 */
export const isStringRecord = (
  value: unknown,
): value is Record<string, string> =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.entries(value as Record<string, unknown>).every(
    ([key, entryValue]) =>
      isNonEmptyString(key) && isNonEmptyString(entryValue),
  )
