// Tokens sorted longest-first so YYYY is matched before YY
const DATE_TOKENS = ["YYYY", "YY", "MM", "DD"]

const TOKEN_LENGTHS: Record<string, number> = {
  DD: 2,
  MM: 2,
  YY: 2,
  YYYY: 4,
}

const parseSingleFormat = (dateStr: string, format: string): Date | null => {
  // Length must match exactly — rejects trailing/leading characters
  if (dateStr.length !== format.length) return null

  let year: number | null = null
  let month: number | null = null
  let day: number | null = null
  let index = 0

  while (index < format.length) {
    const token = DATE_TOKENS.find((t) => format.startsWith(t, index))

    if (token) {
      const len = TOKEN_LENGTHS[token] ?? 0
      const slice = dateStr.slice(index, index + len)
      // Slice must be the full expected length — rejects short strings
      if (slice.length !== len) return null
      const value = parseInt(slice, 10)
      if (isNaN(value)) return null

      if (token === "YYYY") year = value
      else if (token === "YY") year = 2000 + value
      else if (token === "MM") month = value
      else if (token === "DD") day = value

      index += len
    } else {
      if (dateStr[index] !== format[index]) return null
      index++
    }
  }

  if (year === null || month === null || day === null) return null

  // Validate ranges before constructing to catch obvious invalids
  if (month < 1 || month > 12 || day < 1 || day > 31) return null

  const date = new Date(Date.UTC(year, month - 1, day))

  // Round-trip verify to reject rollover cases (e.g. Feb 31 → Mar 3)
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return date
}

export const parseDateString = (
  dateStr: string,
  formats: readonly string[],
): Date | null => {
  for (const format of formats) {
    const result = parseSingleFormat(dateStr, format)
    if (result !== null) return result
  }
  return null
}
