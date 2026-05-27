import { isNonEmptyString } from "./isNonEmptyString"

/**
 * Checks whether a value is an array of non-empty strings.
 *
 * @param value Candidate value.
 * @returns True when every array element is a non-empty string.
 */
export const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isNonEmptyString)
