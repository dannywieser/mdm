/**
 * Validates whether a string is a valid IANA timezone identifier.
 *
 * @param value Candidate timezone value.
 * @returns True when the value is accepted by Intl.DateTimeFormat.
 */
export const isValidTimezone = (value: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value })
    return true
  } catch {
    return false
  }
}
