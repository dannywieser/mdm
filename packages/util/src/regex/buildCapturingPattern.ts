import type { CapturingPattern } from "./buildCapturingPattern.types"

const DATE_TOKEN_PATTERNS: Record<string, string> = {
  YYYY: "(\\d{4})",
  YY: "(\\d{2})",
  MM: "(0[1-9]|1[0-2])",
  DD: "(0[1-9]|[12]\\d|3[01])",
}

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * Builds a full-string regex and token list from a tokenized format pattern.
 *
 * @param format Format string containing token placeholders.
 * @param tokenPatterns Map of token placeholders to capturing regex snippets.
 * @returns Regex metadata used to parse values by token order.
 */
export const buildCapturingPattern = (
  format: string,
  tokenPatterns: Record<string, string> = DATE_TOKEN_PATTERNS,
): CapturingPattern => {
  const tokensByLength = Object.keys(tokenPatterns).sort(
    (tokenA, tokenB) => tokenB.length - tokenA.length,
  )
  let source = "^"
  const tokens: string[] = []
  let index = 0

  while (index < format.length) {
    const token = tokensByLength.find((formatToken) =>
      format.startsWith(formatToken, index),
    )

    if (token) {
      source += tokenPatterns[token]
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
