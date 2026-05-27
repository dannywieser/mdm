/**
 * Checks whether a value is a non-empty string after trimming.
 *
 * @param value Candidate value.
 * @returns True when the value is a non-empty string.
 */
export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0
