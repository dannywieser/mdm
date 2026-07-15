import { describe, expect, test } from "vitest"

import { createRandom } from "../../random/random"
import { TIMELINE_DAYS } from "../builderShared"
import { buildJournalNotes } from "../journal"

const END_DATE = "2026-07-01"

describe("buildJournalNotes", () => {
  test("fills the most recent third of the timeline more densely than the oldest third", () => {
    const notes = buildJournalNotes({ endDate: END_DATE, random: createRandom(11) })
    const dates = new Set(notes.map((note) => note.title))

    const thirdOfTimeline = Math.floor(TIMELINE_DAYS / 3)
    let recentDays = 0
    let recentFilled = 0
    let oldestDays = 0
    let oldestFilled = 0

    for (let offset = 0; offset < TIMELINE_DAYS; offset += 1) {
      const isRecent = offset < thirdOfTimeline
      const isOldest = offset >= TIMELINE_DAYS - thirdOfTimeline
      if (!isRecent && !isOldest) continue

      const date = new Date(`${END_DATE}T00:00:00.000Z`)
      date.setUTCDate(date.getUTCDate() - offset)
      const iso = date.toISOString().slice(0, 10)
      const filled = dates.has(iso) ? 1 : 0

      if (isRecent) {
        recentDays += 1
        recentFilled += filled
      } else {
        oldestDays += 1
        oldestFilled += filled
      }
    }

    expect(recentFilled / recentDays).toBeGreaterThan(oldestFilled / oldestDays)
  })

  test("always writes an entry for the end date and for its month/day in every earlier year", () => {
    const notes = buildJournalNotes({ endDate: END_DATE, random: createRandom(11) })
    const titles = new Set(notes.map((note) => note.title))

    for (const year of ["2023", "2024", "2025", "2026"]) {
      expect(titles.has(`${year}-07-01`)).toBe(true)
    }
  })
})
