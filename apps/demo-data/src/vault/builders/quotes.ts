import type { VaultBuilderOptions, VaultNote } from "../vault.types"

import { pickMany, pickOne } from "../random/random"
import { randomDateBefore, TIMELINE_DAYS, toModifiedTimestamp } from "./builderShared"

const SUBJECTS = [
  "Discipline",
  "A good question",
  "Attention",
  "Craft",
  "Curiosity",
  "A slow morning",
  "Honest feedback",
  "A finished draft",
] as const

const PREDICATES = [
  "outlasts motivation.",
  "is worth a hundred clever answers.",
  "compounds faster than talent.",
  "hides in the boring parts of the work.",
  "beats a perfect plan you never start.",
  "is the shortest path to a better week.",
  "costs little and repays everything.",
  "teaches more than the applause ever will.",
] as const

const QUOTE_AUTHORS = [
  "Ines Wickham",
  "Theo Braganza",
  "Maren Holt",
  "Silas Odum",
  "Petra Villanueva",
  "Noor Haddad",
] as const

const SOURCES = [
  "The Long Meridian",
  "Field Notes lecture series",
  "Notes on the Harvest",
  "commencement address",
  "studio interview",
] as const

const QUOTE_TAGS = ["craft", "focus", "habits", "writing", "perspective"] as const

const REFLECTIONS = [
  "Found this while cleaning out old notebooks and it still holds up.",
  "Pinned above the desk for the slow weeks.",
  "Disagreed with this for years; now it runs the morning routine.",
  "Shared this in the team retro and it landed well.",
] as const

const QUOTE_COUNT = 45

/** Builds short quote notes for the NotesReview reading flow. */
export const buildQuoteNotes = ({ endDate, random }: VaultBuilderOptions): VaultNote[] =>
  Array.from({ length: QUOTE_COUNT }, (_, index) => {
    const subject = SUBJECTS[index % SUBJECTS.length]
    const predicate = PREDICATES[Math.floor(index / SUBJECTS.length) % PREDICATES.length]
    const author = pickOne(random, QUOTE_AUTHORS)
    const created = randomDateBefore(endDate, TIMELINE_DAYS, random)

    return {
      body: `> ${subject} ${predicate}\n\n${pickOne(random, REFLECTIONS)}`,
      folder: "quotes",
      frontmatter: {
        created,
        author,
        source: pickOne(random, SOURCES),
        tags: pickMany(random, QUOTE_TAGS, 2),
      },
      modifiedDate: toModifiedTimestamp(created, random),
      title: `Quote ${String(index + 1).padStart(3, "0")}`,
    }
  })
