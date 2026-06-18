// Tokens sorted longest-first so YYYY is matched before YY
const DATE_TOKENS = ["YYYY", "YY", "MM", "DD"]

const TOKEN_LENGTHS: Record<string, number> = {
  DD: 2,
  MM: 2,
  YY: 2,
  YYYY: 4,
}

interface DateComponents {
  year: number | null
  month: number | null
  day: number | null
}

const applyToken = (token: string, value: number, components: DateComponents): void => {
  if (token === "YYYY") components.year = value
  else if (token === "YY") components.year = 2000 + value
  else if (token === "MM") components.month = value
  else if (token === "DD") components.day = value
}

const consumeToken = (
  dateStr: string,
  format: string,
  index: number,
  components: DateComponents,
): number | null => {
  const token = DATE_TOKENS.find((t) => format.startsWith(t, index))
  if (!token) return null

  const len = TOKEN_LENGTHS[token] ?? 0
  const slice = dateStr.slice(index, index + len)
  if (slice.length !== len) return null

  const value = parseInt(slice, 10)
  if (isNaN(value)) return null

  applyToken(token, value, components)
  return len
}

const isValidDateComponents = (year: number, month: number, day: number): boolean => {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  )
}

const parseSingleFormat = (dateStr: string, format: string): Date | null => {
  // Length must match exactly — rejects trailing/leading characters
  if (dateStr.length !== format.length) return null

  const components: DateComponents = { year: null, month: null, day: null }
  let index = 0

  while (index < format.length) {
    const tokenLen = consumeToken(dateStr, format, index, components)
    if (tokenLen !== null) {
      index += tokenLen
    } else {
      if (dateStr[index] !== format[index]) return null
      index++
    }
  }

  const { year, month, day } = components
  if (year === null || month === null || day === null) return null
  if (!isValidDateComponents(year, month, day)) return null

  return new Date(Date.UTC(year, month - 1, day))
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
