import { addDays } from "mdm-util"

import type { RandomGenerator } from "../random/random.types"
import type {
  GeneratedVault,
  VaultAttachment,
  VaultBuilderOptions,
  VaultNote,
} from "../vault.types"
import type { PhotoCorpusEntry } from "./photosCorpus.types"

import { randomInt } from "../random/random"
import { buildCover, TIMELINE_DAYS, toModifiedTimestamp } from "./builderShared"
import { PHOTOS_CORPUS } from "./photosCorpus"

const shuffle = <T,>(random: RandomGenerator, values: readonly T[]): T[] => {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(random, 0, index)
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

/** Spreads entries roughly evenly across the timeline, with light jitter so the spacing isn't robotic. */
const buildEntryDate = (
  endDate: string,
  startDate: string,
  index: number,
  spacing: number,
  random: RandomGenerator,
): string => {
  const jitter = randomInt(random, -Math.floor(spacing / 3), Math.floor(spacing / 3))
  const offset = Math.min(TIMELINE_DAYS - 1, Math.max(0, Math.round(index * spacing + jitter)))
  return addDays(startDate, offset) > endDate ? endDate : addDays(startDate, offset)
}

/**
 * Builds one photo-journal note per curated place, each with its own
 * distinct real photo — no image or caption repeats. Dates are spread across
 * the timeline rather than looping every few days, since there are far fewer
 * curated photos than the old high-frequency cadence assumed.
 */
export const buildPhotoNotes = async ({
  endDate,
  random,
}: VaultBuilderOptions): Promise<GeneratedVault> => {
  const notes: VaultNote[] = []
  const attachments: VaultAttachment[] = []
  const startDate = addDays(endDate, -(TIMELINE_DAYS - 1))
  const entries: readonly PhotoCorpusEntry[] = shuffle(random, PHOTOS_CORPUS)
  const spacing = TIMELINE_DAYS / entries.length

  for (const [index, entry] of entries.entries()) {
    const date = buildEntryDate(endDate, startDate, index, spacing, random)
    const modifiedDate = toModifiedTimestamp(date, random)
    const cover = await buildCover(
      "photo",
      `${date} ${entry.place}`,
      modifiedDate,
      random,
      entry.photoKey,
    )

    const frontmatter: VaultNote["frontmatter"] = {
      created: date,
      location: entry.place,
      tags: [...entry.tags],
    }
    if (cover.isRealPhoto) {
      frontmatter.source = "pexels"
    }

    notes.push({
      body: `![](${cover.coverPath})\n\n${entry.caption}`,
      folder: "photos",
      frontmatter,
      modifiedDate,
      title: `${date} ${entry.place}`,
    })
    attachments.push(cover.attachment)
  }

  return { attachments, notes }
}
