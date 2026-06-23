import { collectMarkdownFiles, scanFile } from "markdown"

import { HabitEntry } from "../types"

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
): Promise<HabitEntry[]> {
  const allNotes = await collectMarkdownFiles(notesDirectory)
  const scannedNotes = await Promise.all(allNotes.map((file) => scanFile(file)))
  return scannedNotes.flatMap(
    ({ frontmatter, obsidianUrl, dates }): HabitEntry[] => {
      const rawDate = frontmatter?.created
      const date = typeof rawDate === "string" ? rawDate : dates[0]
      const value = cleanValue(frontmatter?.[frontmatterProperty])

      if (!date || !value) return []
      return [
        {
          date,
          value,
          obsidianUrl,
        },
      ]
    },
  )
}
