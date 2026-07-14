import type {
  GeneratedVault,
  VaultAttachment,
  VaultBuilderOptions,
  VaultNote,
} from "../vault.types"

import { chance, pickOne, randomInt } from "../random/random"
import {
  buildCover,
  randomDateBefore,
  TIMELINE_DAYS,
  toModifiedTimestamp,
} from "./builderShared"

const TITLE_OPENINGS = [
  "The Silent",
  "The Glass",
  "A Field Guide to",
  "The Last",
  "Beneath the",
  "The Paper",
  "Letters from the",
  "The Winter",
  "A Theory of",
  "The Long",
  "Notes on the",
  "The Hidden",
] as const

const TITLE_SUBJECTS = [
  "Horizon",
  "Cartographer",
  "Orchard",
  "Archipelago",
  "Meridian",
  "Lighthouse",
  "Harvest",
  "Machines",
  "Rivers",
  "Constellations",
] as const

const AUTHORS = [
  "Ines Wickham",
  "Theo Braganza",
  "Maren Holt",
  "Silas Odum",
  "Petra Villanueva",
  "Callum Frost",
  "Amara Deng",
  "Ronan Ashby",
  "Lucia Ferrante",
  "Edwin Sorrell",
  "Noor Haddad",
  "Greta Lindell",
] as const

const GENRES = [
  "fiction",
  "science-fiction",
  "history",
  "biography",
  "essays",
  "mystery",
  "nature",
  "design",
] as const

const SUMMARY_SENTENCES = [
  "A patient, quietly confident book that trusts its reader.",
  "Starts slow, then refuses to be put down for the final third.",
  "The kind of writing that makes ordinary details feel urgent.",
  "Dense in places, but every detour pays off by the end.",
  "An unexpected structure that turns out to be the whole point.",
  "Full of ideas worth stealing for everyday life.",
] as const

const NOTE_BULLETS = [
  "The middle chapters would make a great standalone essay",
  "Re-read the opening once you know how it ends",
  "Pairs well with a long train ride",
  "The bibliography alone is worth the price",
  "Recommend to the book club for next season",
] as const

export const BOOK_TITLES: readonly string[] = TITLE_OPENINGS.flatMap((opening) =>
  TITLE_SUBJECTS.map((subject) => `${opening} ${subject}`),
)

const READ_STATUS = "read"

const pickStatus = (random: VaultBuilderOptions["random"]): string => {
  if (chance(random, 0.6)) return READ_STATUS
  return chance(random, 0.2) ? "reading" : "to-read"
}

export const buildBookNotes = ({ endDate, random }: VaultBuilderOptions): GeneratedVault => {
  const notes: VaultNote[] = []
  const attachments: VaultAttachment[] = []

  for (const title of BOOK_TITLES) {
    const created = randomDateBefore(endDate, TIMELINE_DAYS, random)
    const modifiedDate = toModifiedTimestamp(created, random)
    const status = pickStatus(random)
    const cover = buildCover("book", title, modifiedDate, random)
    const frontmatter: VaultNote["frontmatter"] = {
      created,
      type: "book",
      author: pickOne(random, AUTHORS),
      genre: pickOne(random, GENRES),
      status,
    }
    if (status === READ_STATUS) {
      frontmatter.rating = `${String(randomInt(random, 2, 5))}/5`
    }

    notes.push({
      body: `![](${cover.coverPath})\n\n## Summary\n\n${pickOne(random, SUMMARY_SENTENCES)} ${pickOne(random, SUMMARY_SENTENCES)}\n\n## Notes\n\n- ${pickOne(random, NOTE_BULLETS)}\n- ${pickOne(random, NOTE_BULLETS)}\n`,
      folder: "library/books",
      frontmatter,
      modifiedDate,
      title,
    })
    attachments.push(cover.attachment)
  }

  return { attachments, notes }
}
