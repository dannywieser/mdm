import type { VaultBuilderOptions, VaultNote } from "../vault.types"

import { chance, pickMany, pickOne, randomInt } from "../random/random"
import { randomDateBefore, TIMELINE_DAYS, toModifiedTimestamp } from "./builderShared"

const PROJECT_NAMES = [
  "Kitchen Shelf Build",
  "Family Cookbook",
  "Backyard Irrigation",
  "Photo Backup Overhaul",
  "Trail Half Marathon",
  "Home Network Cleanup",
  "Basement Workshop",
  "Annual Letter",
  "Bike Restoration",
  "Language Refresh",
  "Garden Expansion",
  "Archive Digitization",
  "Neighborhood Book Swap",
  "Winter Emergency Kit",
  "Personal Site Rebuild",
  "Sourdough Program",
  "Closet Declutter",
  "Camping Gear Audit",
  "Budget Automation",
  "Sleep Routine Reset",
] as const

const PROJECT_TAGS = ["home", "health", "family", "tech", "outdoors", "finance"] as const

const STATUSES = ["active", "active", "paused", "done"] as const

const GOALS = [
  "Done means shipped, not perfect.",
  "Small sessions, twice a week, no heroics.",
  "The deadline is soft; the momentum is not.",
  "Finish before the season changes.",
] as const

const TASK_ITEMS = [
  "Sketch the plan on one page",
  "Order the remaining materials",
  "Block two evenings next week",
  "Measure twice, then commit",
  "Write up what worked so far",
  "Ask for help on the hard part",
] as const

const LOG_ITEMS = [
  "Slow week, but the plan survived it",
  "Big session on Saturday moved things forward",
  "Hit a snag and found a simpler approach",
  "Halfway checkpoint reached",
] as const

const buildBody = (random: VaultBuilderOptions["random"]): string => {
  const tasks = pickMany(random, TASK_ITEMS, randomInt(random, 3, 5))
    .map((task) => `- [${chance(random, 0.5) ? "x" : " "}] ${task}`)
    .join("\n")
  const log = pickMany(random, LOG_ITEMS, randomInt(random, 2, 3))
    .map((entry) => `- ${entry}`)
    .join("\n")

  return `${pickOne(random, GOALS)}\n\n## Tasks\n\n${tasks}\n\n## Log\n\n${log}`
}

export const buildProjectNotes = ({ endDate, random }: VaultBuilderOptions): VaultNote[] =>
  PROJECT_NAMES.map((name) => {
    const created = randomDateBefore(endDate, TIMELINE_DAYS, random)

    return {
      body: buildBody(random),
      folder: "projects",
      frontmatter: {
        created,
        status: pickOne(random, STATUSES),
        tags: pickMany(random, PROJECT_TAGS, 2),
      },
      modifiedDate: toModifiedTimestamp(created, random),
      title: name,
    }
  })
