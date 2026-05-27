import type { CapturingPattern } from "./buildCapturingPattern.types"

const TOKEN_PATTERNS: Record<string, string> = {
  YYYY: "(\\d{4})",
  YY: "(\\d{2})",
  MM: "(0[1-9]|1[0-2])",
  DD: "(0[1-9]|[12]\\d|3[01])",
}

const DATE_TOKENS = Object.keys(TOKEN_PATTERNS).sort(
  (tokenA, tokenB) => tokenB.length - tokenA.length,
)

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * Builds a full-string regex and token list from a date format pattern.
 *
 * @param format Date format string using YYYY, YY, MM, and DD tokens.
 * @returns Regex metadata used to parse date values.
 */
export const buildCapturingPattern = (format: string): CapturingPattern => {
  let source = "^"
  const tokens: string[] = []
  let index = 0

  while (index < format.length) {
    const token = DATE_TOKENS.find((dateToken) => format.startsWith(dateToken, index))

    if (token) {
      source += TOKEN_PATTERNS[token]
      tokens.push(token)
      index += token.length
      continue
    }

    source += escapeRegex(format[index] ?? "")
    index += 1
  }

  source += "$"

  return { regex: new RegExp(source), tokens }
}
