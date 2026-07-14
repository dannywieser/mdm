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
  "Midnight",
  "Static",
  "The Seventh",
  "Paper",
  "Neon",
  "Silent",
  "The Last",
  "Iron",
] as const

const TITLE_SUBJECTS = [
  "Harbor",
  "Signal",
  "Summer",
  "Protocol",
  "Orchard",
  "Divide",
  "Reel",
  "Country",
  "Verdict",
  "Mile",
] as const

const DIRECTORS = [
  "R. Okonkwo",
  "J. Marchand",
  "S. Whitfield",
  "A. Kobayashi",
  "M. Espinoza",
  "L. Toivonen",
  "D. Falkner",
  "P. Iyer",
] as const

const GENRES = [
  "drama",
  "thriller",
  "documentary",
  "comedy",
  "science-fiction",
  "animation",
] as const

const REVIEW_SENTENCES = [
  "The first act promises less than the film delivers.",
  "Beautifully shot, even when nothing much is happening.",
  "The ending divides every room it plays in.",
  "A tight script with no wasted scenes.",
  "Worth it for the score alone.",
  "The rare sequel-bait that earns the sequel.",
] as const

export const buildMovieNotes = ({ endDate, random }: VaultBuilderOptions): GeneratedVault => {
  const notes: VaultNote[] = []
  const attachments: VaultAttachment[] = []
  const titles = TITLE_OPENINGS.flatMap((opening) =>
    TITLE_SUBJECTS.map((subject) => `${opening} ${subject}`),
  )

  for (const title of titles) {
    const created = randomDateBefore(endDate, TIMELINE_DAYS, random)
    const modifiedDate = toModifiedTimestamp(created, random)
    const watched = chance(random, 0.7)
    const cover = buildCover("movie", title, modifiedDate, random)
    const frontmatter: VaultNote["frontmatter"] = {
      created,
      type: "movie",
      director: pickOne(random, DIRECTORS),
      genre: pickOne(random, GENRES),
      status: watched ? "watched" : "watchlist",
    }
    if (watched) {
      frontmatter.rating = `${String(randomInt(random, 2, 5))}/5`
    }

    notes.push({
      body: `![](${cover.coverPath})\n\n${pickOne(random, REVIEW_SENTENCES)} ${pickOne(random, REVIEW_SENTENCES)}`,
      folder: "library/movies",
      frontmatter,
      modifiedDate,
      title,
    })
    attachments.push(cover.attachment)
  }

  return { attachments, notes }
}
