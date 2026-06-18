const TOKEN_PATTERNS: Record<string, string> = {
  YYYY: "\\d{4}",
  YY: "\\d{2}",
  MM: "(?:0[1-9]|1[0-2])",
  DD: "(?:0[1-9]|[12]\\d|3[01])"
}

const DATE_TOKENS = Object.keys(TOKEN_PATTERNS).sort(
  (tokenA, tokenB) => tokenB.length - tokenA.length
)

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const formatToRegexSource = (format: string): string => {
  let source = ""
  let index = 0

  while (index < format.length) {
    const token = DATE_TOKENS.find((candidate) =>
      format.startsWith(candidate, index)
    )

    if (token) {
      source += TOKEN_PATTERNS[token]
      index += token.length
      continue
    }

    source += escapeRegex(format[index] ?? "")
    index += 1
  }

  return source
}

export const parseMarkdownBodyDates = (
  body: string,
  dateFormats: readonly string[]
): string[] => {
  if (!body || dateFormats.length === 0) {
    return []
  }

  const matches: { index: number; value: string }[] = []

  for (const dateFormat of dateFormats) {
    if (!dateFormat) {
      continue
    }

    const expression = new RegExp(
      `(?:^|[^0-9])(${formatToRegexSource(dateFormat)})(?=$|[^0-9])`,
      "g"
    )

    for (const match of body.matchAll(expression)) {
      const date = match[1]
      if (!date) continue
      const startIndex = match.index + match[0].indexOf(date)
      if (startIndex >= 0) {
        matches.push({ index: startIndex, value: date })
      }
    }
  }

  return matches
    .toSorted((matchA, matchB) => matchA.index - matchB.index)
    .filter(
      (match, index, values) =>
        index === 0 ||
        match.index !== values[index - 1]?.index ||
        match.value !== values[index - 1]?.value
    )
    .map(({ value }) => value)
}
