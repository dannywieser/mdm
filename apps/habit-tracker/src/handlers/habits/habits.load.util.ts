import { collectMarkdownFiles, scanFile } from "markdown"
import { parseDateFromFormats } from "mdm-util"

import { HabitEntry } from "../../types"

const normalizeDate = (
  rawDate: string,
  dateFormats: readonly string[],
): string | null => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) return rawDate
  const parsed = parseDateFromFormats(rawDate, dateFormats)
  if (parsed) {
    return `${parsed.year}-${String(parsed.month).padStart(2, "0")}-${String(parsed.day).padStart(2, "0")}`
  }
  const iso = new Date(rawDate)
  return isNaN(iso.getTime()) ? null : iso.toISOString().slice(0, 10)
}

const cleanValue = (rawValue: unknown): number | null => {
  if (typeof rawValue !== "string") {
    return null
  }

  const cleanedValue = rawValue.replace(/^"(.*)"$/, "$1")
  if (!/^-?\d+(\.\d+)?$/.test(cleanedValue)) {
    return null
  }

  const numValue = parseFloat(cleanedValue)
  if (numValue < 1 || numValue > 10) {
    return null
  }
  return numValue
}

export async function loadHabitEntries(
  notesDirectory: string,
  frontmatterProperty: string,
  dateFormats: readonly string[],
): Promise<HabitEntry[]> {
  const allNotes = await collectMarkdownFiles(notesDirectory)
  const scannedNotes = await Promise.all(allNotes.map((file) => scanFile(file)))
  return scannedNotes.flatMap(
    ({ frontmatter, obsidianUrl, dates }): HabitEntry[] => {
      const rawDate = frontmatter?.created
      const rawDateStr = typeof rawDate === "string" ? rawDate : dates[0]
      const date = rawDateStr ? normalizeDate(rawDateStr, dateFormats) : null
      const value = cleanValue(frontmatter?.[frontmatterProperty])

      if (!date || !value) return []
      return [{ date, value, obsidianUrl }]
    },
  )
}
