import { addDays } from "mdm-util"

import type {
  GeneratedVault,
  VaultAttachment,
  VaultBuilderOptions,
  VaultNote,
} from "../vault.types"

import { generateCoverSvg } from "../covers/coverSvg"
import { pickMany, pickOne, randomInt } from "../random/random"
import { slugify, TIMELINE_DAYS, toModifiedTimestamp } from "./builderShared"

const PLACES = [
  "Ravine Trail",
  "Lakeshore",
  "Old Town",
  "Harbor Market",
  "Botanical Garden",
  "Mountain Pass",
  "Riverside Path",
  "City Rooftop",
  "Winter Forest",
  "Farmers Market",
  "Lighthouse Point",
  "Meadow Loop",
  "Canyon Overlook",
  "Backyard",
  "Museum District",
  "Prairie Road",
] as const

const PHOTO_TAGS = [
  "landscape",
  "family",
  "golden-hour",
  "hiking",
  "architecture",
  "weekend",
  "wildlife",
  "snow",
] as const

const CAPTIONS = [
  "The light lasted about four minutes and this was minute three.",
  "Stopped mid-stride for this one and it was worth it.",
  "Almost didn't bring the camera. Lesson learned again.",
  "The kind of view that makes the detour feel planned.",
  "Quiet morning, empty path, perfect timing.",
  "Everyone kept walking; this deserved a pause.",
] as const

/** Builds a photo-journal note (with SVG cover) every few days of the timeline. */
export const buildPhotoNotes = ({ endDate, random }: VaultBuilderOptions): GeneratedVault => {
  const notes: VaultNote[] = []
  const attachments: VaultAttachment[] = []
  const startDate = addDays(endDate, -(TIMELINE_DAYS - 1))

  for (
    let date = startDate;
    date <= endDate;
    date = addDays(date, randomInt(random, 2, 5))
  ) {
    const place = pickOne(random, PLACES)
    const modifiedDate = toModifiedTimestamp(date, random)
    // Dates make cover filenames unique even when a place repeats.
    const coverPath = `attachments/covers/photos/${date}-${slugify(place)}.svg`

    notes.push({
      body: pickOne(random, CAPTIONS),
      folder: "photos",
      frontmatter: {
        created: date,
        location: place,
        tags: pickMany(random, PHOTO_TAGS, randomInt(random, 1, 2)),
        cover: coverPath,
      },
      modifiedDate,
      title: `${date} ${place}`,
    })
    attachments.push({
      contents: generateCoverSvg({
        kind: "photo",
        seed: randomInt(random, 0, 2_147_483_646),
        title: place,
      }),
      modifiedDate,
      relativePath: coverPath,
    })
  }

  return { attachments, notes }
}
