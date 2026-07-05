import { addDays } from "mdm-util"

import type { CoverKind } from "../covers/coverSvg.types"
import type { RandomGenerator } from "../random/random.types"
import type { CoverResult } from "./builderShared.types"

import { generateCoverSvg } from "../covers/coverSvg"
import { randomInt } from "../random/random"

/** Number of days of history the demo vault spans (roughly 3.5 years). */
export const TIMELINE_DAYS = 1275

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

/** Creates an SVG cover attachment plus the frontmatter path pointing at it. */
export const buildCover = (
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
  }
}
