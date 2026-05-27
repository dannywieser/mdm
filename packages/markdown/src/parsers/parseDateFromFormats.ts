import type { ParsedDate } from "../types"

const TOKEN_PATTERNS: Record<string, string> = {
  YYYY: "(\\d{4})",
  YY: "(\\d{2})",
  MM: "(0[1-9]|1[0-2])",
  DD: "(0[1-9]|[12]\\d|3[01])"
}

const DATE_TOKENS = Object.keys(TOKEN_PATTERNS).sort(
  (tokenA, tokenB) => tokenB.length - tokenA.length
)

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const buildCapturingPattern = (
  format: string
): { regex: RegExp; tokens: string[] } => {
  let source = "^"
  const tokens: string[] = []
  let index = 0

  while (index < format.length) {
    const token = DATE_TOKENS.find((t) => format.startsWith(t, index))
    if (token) {
      source += TOKEN_PATTERNS[token]
      tokens.push(token)
      index += token.length
    } else {
      source += escapeRegex(format[index] ?? "")
      index++
    }
  }

  source += "$"
  return { regex: new RegExp(source), tokens }
}

export const parseDateFromFormats = (
  dateStr: string,
  formats: readonly string[]
): ParsedDate | null => {
  for (const format of formats) {
    const { regex, tokens } = buildCapturingPattern(format)
    const match = regex.exec(dateStr)
    if (!match) continue

    let year: number | undefined
    let month: number | undefined
    let day: number | undefined

    tokens.forEach((token, i) => {
      const value = parseInt(match[i + 1]!, 10)
      if (token === "YYYY") year = value
      else if (token === "YY") year = 2000 + value
      else if (token === "MM") month = value
      else if (token === "DD") day = value
    })

    if (year !== undefined && month !== undefined && day !== undefined) {
      return { day, month, year }
    }
  }

  return null
}
