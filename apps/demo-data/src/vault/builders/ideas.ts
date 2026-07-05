import type { DemoFrontmatter, VaultBuilderOptions, VaultNote } from "../vault.types"

import { chance, pickMany, pickOne, randomInt } from "../random/random"
import { randomDateBefore, TIMELINE_DAYS, toModifiedTimestamp } from "./builderShared"

const IDEA_QUALIFIERS = [
  "Offline-first",
  "Seasonal",
  "Automated",
  "Minimal",
  "Shared",
  "Ambient",
  "Modular",
  "Weekly",
  "Local",
  "Open",
] as const

const IDEA_SUBJECTS = [
  "Recipe Planner",
  "Reading Tracker",
  "Garden Journal",
  "Budget Board",
  "Photo Archive",
  "Habit Coach",
] as const

const IDEA_TAGS = ["app", "home", "writing", "automation", "someday", "research"] as const

const PITCH_SENTENCES = [
  "The core loop should take under a minute a day or it will not survive contact with real life.",
  "Everything syncs later; the first version works entirely on paper.",
  "The trick is making the default action the right one.",
  "Start with the smallest slice that would still be useful alone.",
  "If it needs a manual, it is already too complicated.",
] as const

const OPEN_QUESTIONS = [
  "What does week two look like, after the novelty wears off?",
  "Is this a tool or a habit wearing a tool costume?",
  "Could a spreadsheet do 80% of this?",
  "Who else would actually use it?",
] as const

/** Builds idea notes; roughly a quarter are archived to exercise `$missing` filters. */
export const buildIdeaNotes = ({ endDate, random }: VaultBuilderOptions): VaultNote[] =>
  IDEA_QUALIFIERS.flatMap((qualifier) =>
    IDEA_SUBJECTS.map((subject): VaultNote => {
      const created = randomDateBefore(endDate, TIMELINE_DAYS, random)
      const frontmatter: DemoFrontmatter = {
        created,
        tags: pickMany(random, IDEA_TAGS, randomInt(random, 1, 3)),
      }
      if (chance(random, 0.25)) {
        frontmatter.archived = "true"
      }

      return {
        body: `${pickOne(random, PITCH_SENTENCES)} ${pickOne(random, PITCH_SENTENCES)}\n\n## Open questions\n\n- ${pickOne(random, OPEN_QUESTIONS)}\n- ${pickOne(random, OPEN_QUESTIONS)}`,
        folder: "ideas",
        frontmatter,
        modifiedDate: toModifiedTimestamp(created, random),
        title: `${qualifier} ${subject}`,
      }
    }),
  )
