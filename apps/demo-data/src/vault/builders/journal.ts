import { addDays, buildDateRange } from "mdm-util"

import type { RandomGenerator } from "../random/random.types"
import type { VaultBuilderOptions, VaultNote } from "../vault.types"

import { chance, pickMany, pickOne, randomInt } from "../random/random"
import { BOOK_TITLES } from "./books"
import { TIMELINE_DAYS, toModifiedTimestamp } from "./builderShared"
import {
  HIGHLIGHTS,
  JOURNAL_TAGS,
  MOODS,
  OPENERS,
  REFLECTIONS,
  SENTENCES,
  TASKS,
} from "./journalCorpus"
import { PERSON_NAMES } from "./people"

/** Days at the end of the timeline that always have entries, so current habit streaks show up in the demo. */
const STREAK_TAIL_DAYS = 12

const buildParagraph = (random: RandomGenerator): string =>
  pickMany(random, SENTENCES, randomInt(random, 2, 3)).join(" ")

const buildHighlights = (random: RandomGenerator): string => {
  const bullets = pickMany(random, HIGHLIGHTS, randomInt(random, 2, 4))
  const list = bullets.map((bullet) => `- ${bullet}`).join("\n")
  return `## Highlights\n\n${list}`
}

const buildTaskList = (random: RandomGenerator): string => {
  const tasks = pickMany(random, TASKS, randomInt(random, 2, 4))
  const list = tasks
    .map((task) => `- [${chance(random, 0.4) ? "x" : " "}] ${task}`)
    .join("\n")
  return `## Tomorrow\n\n${list}`
}

const buildBody = (random: RandomGenerator): string => {
  const sections = [pickOne(random, OPENERS), buildParagraph(random)]

  if (chance(random, 0.5)) sections.push(buildParagraph(random))
  if (chance(random, 0.3))
    sections.push(`Coffee with [[${pickOne(random, PERSON_NAMES)}]] today.`)
  if (chance(random, 0.12))
    sections.push(`Started [[${pickOne(random, BOOK_TITLES)}]] before bed.`)
  if (chance(random, 0.4)) sections.push(buildHighlights(random))
  if (chance(random, 0.25)) sections.push(buildTaskList(random))
  if (chance(random, 0.2)) sections.push(`> ${pickOne(random, REFLECTIONS)}`)

  return sections.join("\n\n")
}

const buildHabitValues = (
  dayIndex: number,
  daysFromEnd: number,
  random: RandomGenerator,
): Record<string, string> => {
  const habits: Record<string, string> = {}
  const inStreakTail = daysFromEnd < STREAK_TAIL_DAYS

  // Exercise waxes and wanes in multi-week waves so the score history has shape.
  const exerciseProbability = 0.45 + 0.35 * Math.sin(dayIndex / 9)
  if (inStreakTail || chance(random, exerciseProbability)) {
    habits.exercise = String(randomInt(random, 3, 9))
  }

  if (daysFromEnd < 5 || chance(random, 0.55)) {
    habits.reading = String(randomInt(random, 2, 8))
  }

  // Screen time is a "do-less" habit: sparse entries and a clean recent gap.
  if (daysFromEnd >= 6 && chance(random, 0.3)) {
    habits.screentime = String(randomInt(random, 2, 8))
  }

  return habits
}

const buildJournalNote = (
  date: string,
  dayIndex: number,
  daysFromEnd: number,
  random: RandomGenerator,
): VaultNote => ({
  body: buildBody(random),
  folder: "journal",
  frontmatter: {
    created: date,
    mood: pickOne(random, MOODS),
    tags: pickMany(random, JOURNAL_TAGS, randomInt(random, 1, 3)),
    ...buildHabitValues(dayIndex, daysFromEnd, random),
  },
  modifiedDate: toModifiedTimestamp(date, random),
  title: date,
})

/**
 * Builds one journal note for most days of the timeline. The final day is
 * always present so the `$today` view has content on freshly generated data.
 */
export const buildJournalNotes = ({ endDate, random }: VaultBuilderOptions): VaultNote[] => {
  const dates = buildDateRange(addDays(endDate, -(TIMELINE_DAYS - 1)), endDate)

  return dates.flatMap((date, dayIndex) => {
    const daysFromEnd = dates.length - 1 - dayIndex
    const skipDay = daysFromEnd >= STREAK_TAIL_DAYS && !chance(random, 0.8)
    if (skipDay) return []
    return [buildJournalNote(date, dayIndex, daysFromEnd, random)]
  })
}
