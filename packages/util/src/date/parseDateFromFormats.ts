import type { ParsedDate } from "./parseDateFromFormats.types"

import { buildCapturingPattern } from "../regex/buildCapturingPattern"

/**
 * Parses a date string by trying each configured format in order.
 *
 * @param dateStr Raw date string to parse.
 * @param formats Ordered date formats to evaluate.
 * @returns Parsed date components when a format matches, otherwise null.
 */
export const parseDateFromFormats = (
  dateStr: string,
  formats: readonly string[],
): ParsedDate | null => {
  for (const format of formats) {
    const { regex, tokens } = buildCapturingPattern(format)
    const match = regex.exec(dateStr)

    if (!match) {
      continue
    }

    let year: number | undefined
    let month: number | undefined
    let day: number | undefined

    tokens.forEach((token, index) => {
      const value = parseInt(match[index + 1], 10)

      if (token === "YYYY") {
        year = value
      } else if (token === "YY") {
        year = 2000 + value
      } else if (token === "MM") {
        month = value
      } else if (token === "DD") {
        day = value
      }
    })

    if (year !== undefined && month !== undefined && day !== undefined) {
      return { day, month, year }
    }
  }

  return null
}
