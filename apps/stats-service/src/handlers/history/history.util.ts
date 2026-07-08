import { resolveOldestDate } from "markdown"
import { toISODateString } from "mdm-util"

import type { HistoryNoteDates, StatsHistoryEntry } from "./history.types"

interface DateBucket {
  entriesCreated: number
  entriesModified: number
  folders: Set<string>
}

export const resolveCreatedDate = (
  dates: readonly string[],
  dateFormats: readonly string[],
): string | null => {
  const date = resolveOldestDate(dates, dateFormats)
  return date ? date.toISOString() : null
}

const getOrCreateBucket = (buckets: Map<string, DateBucket>, date: string): DateBucket => {
  let bucket = buckets.get(date)
  if (!bucket) {
    bucket = { entriesCreated: 0, entriesModified: 0, folders: new Set() }
    buckets.set(date, bucket)
  }
  return bucket
}

/**
 * Buckets notes into a per-date history: how many notes were created and
 * modified on each date (in `timezone`), and how many distinct folders had
 * either kind of activity that date.
 */
export const buildHistoryEntries = (
  notes: readonly HistoryNoteDates[],
  timezone: string,
): StatsHistoryEntry[] => {
  const buckets = new Map<string, DateBucket>()

  for (const note of notes) {
    if (note.createdDate) {
      const bucket = getOrCreateBucket(buckets, toISODateString(new Date(note.createdDate), timezone))
      bucket.entriesCreated += 1
      bucket.folders.add(note.folder)
    }

    const modifiedBucket = getOrCreateBucket(
      buckets,
      toISODateString(new Date(note.modifiedDate), timezone),
    )
    modifiedBucket.entriesModified += 1
    modifiedBucket.folders.add(note.folder)
  }

  return Array.from(buckets.entries())
    .map(([date, bucket]) => ({
      date,
      entriesCreated: bucket.entriesCreated,
      entriesModified: bucket.entriesModified,
      foldersTouched: bucket.folders.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
