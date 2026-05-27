/**
 * Reads a property from an unknown object value.
 *
 * @param value Candidate object value.
 * @param key Property key to read.
 * @returns Property value when available; otherwise undefined.
 */
export const getObjectValue = (value: unknown, key: string): unknown => {
  if (!value || typeof value !== "object") {
    return undefined
  }

  return (value as Record<string, unknown>)[key]
}
