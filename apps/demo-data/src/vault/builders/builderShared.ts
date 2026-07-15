import { addDays } from "mdm-util"

import type { CoverKind } from "../covers/coverSvg.types"
import type { PexelsCategory } from "../images/pexelsPhoto.types"
import type { RandomGenerator } from "../random/random.types"
import type { CoverResult } from "./builderShared.types"

import { generateCoverSvg } from "../covers/coverSvg"
import { downloadImage } from "../images/downloadImage"
import { findPhotoByKey } from "../images/pexelsPhotoLibrary"
import { randomInt } from "../random/random"

/**
 * Number of days of history the demo vault spans (a little over 3 years) —
 * long enough to guarantee 3 anniversary hits for the "On This Day" review
 * view (see `journal.ts`'s `isAnniversary`) regardless of leap-year
 * alignment (3 consecutive years span at most 366 + 365 + 365 = 1096 days),
 * short enough to keep the vault feeling like a real, occasionally-kept
 * notebook rather than a daily-for-years log.
 */
export const TIMELINE_DAYS = 1100

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    // eslint-disable-next-line sonarjs/slow-regex -- input is a short generated title, not user-controlled input
    .replace(/^-+|-+$/g, "")

const padTwo = (value: number): string => String(value).padStart(2, "0")

/** Builds an ISO mtime on the given day at a plausible daytime hour. */
export const toModifiedTimestamp = (
  date: string,
  random: RandomGenerator,
): string =>
  `${date}T${padTwo(randomInt(random, 8, 21))}:${padTwo(randomInt(random, 0, 59))}:00.000Z`

/** Picks a "YYYY-MM-DD" date within the trailing `spanDays` window. */
export const randomDateBefore = (
  endDate: string,
  spanDays: number,
  random: RandomGenerator,
): string => addDays(endDate, -randomInt(random, 0, spanDays - 1))

const buildSvgCover = (
  kind: CoverKind,
  title: string,
  modifiedDate: string,
  random: RandomGenerator,
): CoverResult => {
  const coverPath = `attachments/covers/${kind}s/${slugify(title)}.svg`
  return {
    attachment: {
      contents: generateCoverSvg({
        kind,
        seed: randomInt(random, 0, 2_147_483_646),
        title,
      }),
      modifiedDate,
      relativePath: coverPath,
    },
    coverPath,
    isRealPhoto: false,
  }
}

/**
 * Builds a cover attachment for a note from its own curated, 1:1 Pexels
 * photo (`photoKey` looks it up in the lockfile) — every note gets a
 * distinct real photo, never a reused one. Falls back to the existing
 * generated SVG cover when the lockfile entry is missing or the download
 * fails, so generation never hard-fails and still works fully offline.
 */
export const buildCover = async (
  kind: CoverKind,
  title: string,
  modifiedDate: string,
  random: RandomGenerator,
  photoKey: string,
): Promise<CoverResult> => {
  const category = `${kind}s` as PexelsCategory
  const photo = findPhotoByKey(category, photoKey)
  const bytes = photo ? await downloadImage(photo.src) : null

  if (!photo || !bytes) return buildSvgCover(kind, title, modifiedDate, random)

  const coverPath = `attachments/covers/${kind}s/${slugify(title)}.jpg`
  return {
    attachment: { contents: bytes, modifiedDate, relativePath: coverPath },
    coverPath,
    isRealPhoto: true,
  }
}
